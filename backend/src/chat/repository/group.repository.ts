import { Repository, DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Group } from '../entity/group.entity';
import { CreateGroupDto } from '../dto/create-group.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class GroupRepository extends Repository<Group> {
  constructor(dataSource: DataSource) {
    super(Group, dataSource.manager);
  }

  async createGroup(usersGroupData: CreateGroupDto): Promise<Group> {
    const group = this.create({
      ...usersGroupData,
      users: usersGroupData.userIds.map((id) => ({ id })),
    });
    return this.save(group);
  }

  async findById(groupId: number): Promise<Group> {
    return this.findOne({
      where: { id: groupId },
      relations: ['users', 'chats'],
    });
  }

  async getGroupMembers(groupId: number): Promise<User[]> {
    const group = await this.findOne({
      where: { id: groupId },
      relations: ['users'],
    });
    return group?.users || [];
  }
}
