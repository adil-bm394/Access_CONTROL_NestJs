import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { Chat } from './entity/chat.entity';
import { Group } from './entity/group.entity';
import { ChatRepository } from './repository/chat.repository';
import { GroupRepository } from './repository/group.repository';
import {
  BaseResponse,
  ChatResponse,
  CreateGroupResponse,
  ErrorResponse,
  GroupChatResponse,
  UserResponse,
} from 'src/utils/interfaces/types';
import { statusCodes } from 'src/utils/statusCodes/statusCodes';
import { errorMessages, successMessages } from 'src/utils/messages/messages';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly groupRepository: GroupRepository,
    private readonly userService: UsersService,
  ) {}

  // Send message (private)
  async sendMessage(
    senderId: number,
    userData: CreateChatDto,
  ): Promise<ChatResponse | BaseResponse | ErrorResponse> {
    try {
      const recipient = await this.userService.userRepository.findById(
        userData.receiverId,
      );
      if (!recipient) {
        return {
          status: statusCodes.NOT_FOUND,
          success: false,
          message: errorMessages.USER_NOT_FOUND,
        };
      }

      const sender = await this.userService.userRepository.findById(senderId);
      const savedChat = await this.chatRepository.createMessage(
        userData,
        recipient,
        sender,
      );
      return {
        status: statusCodes.CREATED,
        success: true,
        message: successMessages.CHAT_MESSAGE,
        chat: {
          id: savedChat.id,
          message: userData.message,
          senderName: sender.username,
        },
      };
    } catch (error) {
      console.error(
        `[Chat.Service] Error Sending message: ${error.message}`,
        error,
      );
      return {
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: errorMessages.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  //SEND MESSAGE IN GROUP
  async sendGroupMessage(
    senderId: number,
    userData: CreateChatDto,
  ): Promise<ChatResponse | BaseResponse | ErrorResponse> {
    try {
      const group = await this.groupRepository.findById(userData.groupId);

      if (!group) {
        return {
          status: statusCodes.NOT_FOUND,
          success: false,
          message: errorMessages.GROUP_NOT_FOUND,
        };
      }

      const sender = await this.userService.userRepository.findById(senderId);

      // Save the message to the group
      const savedGroupChat = await this.chatRepository.createGroupMessage(
        userData,
        group,
        sender,
      );

      return {
        status: statusCodes.CREATED,
        success: true,
        message: successMessages.GROUP_CREATED,
        chat: {
          id: savedGroupChat.id,
          message: userData.message,
          senderName: sender.username,
        },
      };
    } catch (error) {
      console.error(
        `[Chat.Service] Error Sending group message: ${error.message}`,
        error,
      );
      return {
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: errorMessages.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  // Create Group
  async createGroup(
    createGroupDto: CreateGroupDto,
  ): Promise<CreateGroupResponse | ErrorResponse | BaseResponse> {
    try {
      const savedGroup = await this.groupRepository.createGroup(createGroupDto);
      return {
        status: statusCodes.CREATED,
        success: true,
        message: successMessages.GROUP_CREATED,
        group: savedGroup,
      };
    } catch (error) {
      console.error(
        `[Chat.Service] Error Creating Group: ${error.message}`,
        error,
      );
      return {
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: errorMessages.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  // Get Messages for Group
  async getMessagesForGroup(
    groupId: number,
  ): Promise<GroupChatResponse | BaseResponse | ErrorResponse> {
    try {
      const group = await this.chatRepository.getMessagesForGroup(groupId);
      if (!group) {
        return {
          status: statusCodes.NOT_FOUND,
          success: false,
          message: errorMessages.GROUP_NOT_FOUND,
        };
      }

      return {
        status: statusCodes.OK,
        success: true,
        message: successMessages.FETCH_GROUP_MESSAGE,
        chat: group,
      };
    } catch (error) {
      console.log(
        `[Chat.Service] Error fetching group messages for groupId ${groupId}:`,
        error,
      );
      return {
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: errorMessages.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  // Update Message Status (Read/Unread)
  async updateMessageStatus(
    id: number,
    status: string,
  ): Promise<void | ErrorResponse> {
    try {
      await this.chatRepository.updateMessageStatus(id, status);
    } catch (error) {
      console.error(
        `[Chat.Service] Error updating message status: ${error.message}`,
        error,
      );
      return {
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: errorMessages.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  // Update User Status Online | Ofline
  async updateUserStatus(
    userId: number,
    status: boolean,
  ): Promise<string | BaseResponse | ErrorResponse | UserResponse> {
    try {
      const user = await this.userService.userRepository.findById(userId);
      if (!user) {
        return {
          status: statusCodes.NOT_FOUND,
          success: false,
          message: errorMessages.USER_NOT_FOUND,
        };
      }
      user.isOnline = status;
      await this.userService.userRepository.save(user);
      user.password = undefined;
      return {
        status: statusCodes.OK,
        success: true,
        message: successMessages.UPDATE_USER_STATUS,
        user: user,
      };
    } catch (error) {
      console.log(
        `[Chat.Service] Error in while updateing user status: ${error}`,
      );
      return {
        status: statusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: errorMessages.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }
}
