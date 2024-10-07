import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Chat } from '../entity/chat.entity';
import { CreateChatDto } from '../dto/create-chat.dto';
import { User } from 'src/users/entities/user.entity';
import { Group } from '../entity/group.entity';

@Injectable()
export class ChatRepository extends Repository<Chat> {
  constructor(dataSource: DataSource) {
    super(Chat, dataSource.manager);
  }

  async createMessage(
    chatData: CreateChatDto,
    sender: User,
    receiver: User,
  ): Promise<Chat> {
    const chat = this.create({ ...chatData, sender, receiver });
    return this.save(chat);
  }

  async getMessagesForGroup(groupId: number): Promise<Chat[]> {
    return this.find({
      where: { group: { id: groupId } },
      relations: ['sender', 'group'],
      order: { createdAt: 'ASC' },
    });
  }

  async updateMessageStatus(id: number, status: string): Promise<void> {
    await this.update(id, { status });
  }

  async createGroupMessage(
    userData: CreateChatDto,
    group: Group,
    sender: User,
  ): Promise<Chat> {
    const newChat = this.create({
      message: userData.message,
      group: group,
      sender: sender,
      isGroupMessage: true,
      status: 'sent',
    });
    return await this.save(newChat);
  }
}
