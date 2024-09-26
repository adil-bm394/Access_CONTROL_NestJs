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
  ErrorResponse,
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

  // Send message (private or group)
  async sendMessage(
    senderId: number,
    chatData: CreateChatDto,
  ): Promise<ChatResponse | BaseResponse | ErrorResponse> {
    console.log('[Chat.Service] senderId :', senderId);
    console.log('[ChatService] Processing message:', chatData);
    try {
      const user = await this.userService.userRepository.findOne({
        where: { id: senderId },
      });
      if (!user) {
        return {
          status: statusCodes.NOT_FOUND,
          success: false,
          message: errorMessages.USER_NOT_FOUND,
        };
      }
      const savedChat = await this.chatRepository.createMessage(chatData, user);
      return {
        status: statusCodes.CREATED,
        success: true,
        message: successMessages.CHAT_MESSAGE,
        chat: savedChat,
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

  // Create Group
  async createGroup(
    createGroupDto: CreateGroupDto,
  ): Promise<Group | ErrorResponse> {
    try {
      const group = await this.groupRepository.createGroup(createGroupDto);
      return group;
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
  async getMessagesForGroup(groupId: number): Promise<Chat[] | ErrorResponse> {
    try {
      return await this.chatRepository.getMessagesForGroup(groupId);
    } catch (error) {
      console.error(
        `[Chat.Service] Error fetching group messages: ${error.message}`,
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

  // Get User Online Status
  async getUserStatus(userId: number): Promise<string> {
    const user = await this.userService.userRepository.findOne({
      where: { id: userId },
    });
    return user && user.isOnline ? 'online' : 'offline';
  }
}
