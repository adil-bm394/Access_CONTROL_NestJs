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

@WebSocketGateway({ cors: true, namespace: '/chat', port: 3000 })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatService: ChatService) {}
  @WebSocketServer()
  server: Server;
  // HANDLE USER CONNECTION AND BROADCAST ONLINE STATUS
  @UseGuards(WsAuthGuard)
  async handleConnection(
    client: Socket,
    @Req() req: Request,
  ): Promise<ErrorResponse> {
    try {
      //console.log(`[Chat.Gateway] New client connected: ${client.id}`);
      const userId = client.handshake;
      console.log('[Chate.Gateway] userId :', userId);
      // console.log('[Chate.Gateway] client.handshake :', client.handshake);

      if (!userId) {
        console.log('[ChatGateway] Missing userId, disconnecting client');
        client.emit('error', { message: errorMessages.MISSING_USERID });
        client.disconnect();
        return;
      }

      console.log(`[ChatGateway] User connected: ${userId}`);

      this.server.emit('userStatus', { userId, status: 'online' });

      // Update the user's status in the database
      await this.chatService.getUserStatus(+userId);
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
      const userId = client.handshake.query.userId as string;

      if (!userId) {
        return; // No need to broadcast if userId is not provided
      }

      console.log(`[ChatGateway] User disconnected: ${userId}`);

      this.server.emit('userStatus', { userId, status: 'offline' });

      // Update the user's status in the database
      await this.chatService.getUserStatus(+userId);
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
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    // @ConnectedSocket() client: Socket,
    @ConnectedSocket() client,
    @MessageBody() chatData: CreateChatDto,
  ): Promise<ChatResponse | BaseResponse | ErrorResponse> {
    const senderId = client.handshake.user._id.toString();

    console.log('[Chat.GateWat] senderId :', senderId);
    console.log('[ChatGateway] Incoming message data:', chatData);

    // Validate the incoming message data (ensure senderId and message content)
    // if (!data.senderId || !data.chatData) {
    //   console.error('[ChatGateway] Invalid message data');
    //   return {
    //     status: statusCodes.BAD_REQUEST,
    //     success: false,
    //     message: errorMessages.INVALID_CREDENTIAL,
    //   };
    // }

    try {
      const chatResponse = await this.chatService.sendMessage(
        senderId,
        chatData,
      );

      // Check if the response contains chat data before emitting
      if ('chat' in chatResponse && chatResponse.success) {
        this.server.emit('newMessage', chatResponse.chat);
        return chatResponse;
      } else {
        console.error(
          '[ChatGateway] Failed to send message:',
          chatResponse.message,
        );
        return {
          status: statusCodes.BAD_REQUEST,
          success: false,
          message: errorMessages.FAIL_TO_SEND_MSG,
        };
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
}
