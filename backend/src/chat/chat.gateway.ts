import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import {
  BaseResponse,
  ChatResponse,
  ErrorResponse,
} from 'src/utils/interfaces/types';
import { statusCodes } from 'src/utils/statusCodes/statusCodes';
import { errorMessages } from 'src/utils/messages/messages';
import { CreateChatDto } from './dto/create-chat.dto';
import { Req, UseGuards } from '@nestjs/common';
import { WsAuthGuard } from './guards/ws-AuthGuard';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { GroupRepository } from './repository/group.repository';

@UseGuards(WsAuthGuard)
@WebSocketGateway({ cors: true, namespace: 'api/v1/chat', port: 3000 })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatService: ChatService,
    private readonly groupRepository: GroupRepository,
    private jwtService: JwtService,
    private config: ConfigService,    
  ) {}

  @WebSocketServer()
  server: Server;  

  private userClientMap = new Map<string, string>();

  // HANDLE USER CONNECTION AND BROADCAST ONLINE STATUS
  async handleConnection(client: Socket): Promise<ErrorResponse> {
    try {
      const bearerHeader = client.handshake.headers['bearer'];

      if (!bearerHeader) {
        console.log(
          '[ChatGateway] Missing token, disconnecting client',
          client.id,
        );
        client.emit('error', { message: errorMessages.MISSING_TOKEN });
        client.disconnect();
        return;
      }

      const token = bearerHeader.toString();

      const user = await this.validateToken(token);
      if (!user) {
        console.log(
          '[ChatGateway] Invalid token, disconnecting client',
          client.id,
        );

        client.emit('error', { message: errorMessages.INVALID_TOKEN });
        client.disconnect();
        return;
      }
      client.user = user;
      console.log(`[ChatGateway] User connected: ${user.id}`);

      this.userClientMap.set(user.id.toString(), client.id);
      console.log(`User ${user.id} connected with client ID ${client.id}`);

      this.server.emit('userStatus', { userId: user.id, status: 'online' });

      // Update the user's status in the database
      await this.chatService.updateUserStatus(+user.id, true);
    } catch (error) {
      console.log('[ChatGateway] Error in handleConnection:', error);
      return {
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: errorMessages.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  // HANDLE USER DISCONNECTION AND BROADCAST OFFLINE STATUS
  async handleDisconnect(client: Socket): Promise<ErrorResponse | void> {
    try {
      const token = client.handshake.headers['bearer'].toString();
      //console.log(`[Chat.Gateway] New client connected: ${client.id}`);

      if (!token) {
        console.log(
          '[ChatGateway] Missing token, Can not disconnect client',
          client.id,
        );
        return;
      }
      const user = await this.validateToken(token);
      if (!user) {
        console.log(
          '[ChatGateway] Invalid token, disconnecting client',
          client.id,
        );

        client.emit('error', { message: errorMessages.INVALID_TOKEN });
        return;
      }
      console.log(`[ChatGateway] User disconnected: ${user.id}`);

      this.userClientMap.delete(user.id);
      console.log(`User ${user.id} disconnected from client ID ${client.id}`);

      this.server.emit('userStatus', { userId: user.id, status: 'offline' });

      // // Update the user's status in the database
      await this.chatService.updateUserStatus(+user.id, false);
    } catch (error) {
      console.log('[ChatGateway] Error in handleDisconnect:', error);
      return {
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: errorMessages.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  // HANDLE SENDMESSAGE EVENT
  @UseGuards(WsAuthGuard)
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() userData: CreateChatDto,
  ): Promise<ChatResponse | BaseResponse | ErrorResponse> {
    const senderId = client.user.id;
    const recipientId = userData.receiverId;
    const groupId = userData.groupId; 

    try {
      if (groupId) {
        console.log('[ChatGateway] Group Message:', groupId);

        // Retrieve group members
        const groupMembers =
          await this.groupRepository.getGroupMembers(groupId);

        if (!groupMembers || groupMembers.length === 0) {
          return {
            status: statusCodes.NOT_FOUND,
            success: false,
            message: errorMessages.GROUP_NOT_FOUND_OR_NO_MEMBERS,
          };
        }

        const groupMessageResponse = await this.chatService.sendGroupMessage(
          senderId,
          userData,
        );

        if ('chat' in groupMessageResponse && groupMessageResponse.success) {
          console.log(
            '[ChatGateway] Group message sent:',
            groupMessageResponse.chat,
          );

          // Send the message to all group members
          for (const member of groupMembers) {
            const memberClientId = this.userClientMap.get(member.id.toString());

            if (memberClientId) {
              this.server.to(memberClientId).emit('newGroupMessage', {
                groupId: groupId,
                senderName: groupMessageResponse.chat.senderName,
                message: groupMessageResponse.chat.message,
              });
            } else {
              console.log(`[ChatGateway] Member ${member.id} is not online.`);
            }
          }

          return groupMessageResponse;
        } else {
          console.error(
            '[ChatGateway] Failed to send group message:',
            groupMessageResponse.message,
          );
          return {
            status: statusCodes.BAD_REQUEST,
            success: false,
            message: errorMessages.FAIL_TO_SEND_GROUP_MSG,
          };
        } 
      } else {
        // If no groupId, handle as private message
        const chatResponse = await this.chatService.sendMessage(
          senderId,
          userData,
        );

        if ('chat' in chatResponse && chatResponse.success) {
          console.log('[ChatGateway] Private message sent:', chatResponse.chat);

          const recipientClientId = this.userClientMap.get(
            recipientId.toString(),
          );

          if (recipientClientId) {
            this.server
              .to(recipientClientId)
              .emit(
                'newMessage',
                chatResponse.chat.senderName,
                chatResponse.chat.message,
              );
            await this.chatService.updateMessageStatus(
              chatResponse.chat.id,
              'received',
            );
          } else {
            console.log(
              `[ChatGateway] Recipient with ID ${recipientId} is not online.`,
            );
          }

          return chatResponse;
        } else {
          console.error(
            '[ChatGateway] Failed to send private message:',
            chatResponse.message,
          );
          return {   
            status: statusCodes.BAD_REQUEST,
            success: false,
            message: errorMessages.FAIL_TO_SEND_MSG,
          };
        }
      }
    } catch (error) {
      console.error('[ChatGateway] Error in handleSendMessage:', error);
      return {
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: errorMessages.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  //VALIDATE THE TOKEN
  private async validateToken(token: string): Promise<any> {
    try {
      const secret = this.config.get<string>('JWT_SECRET');
      const user = await this.jwtService.verify(token, { secret });
      return user;
    } catch (error) {
      console.log(`[Chat.gateWay] error in validate Token: ${error}`);
      return null;
    }
  }
}
