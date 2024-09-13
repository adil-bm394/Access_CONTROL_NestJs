import {  DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Role } from '../entities/role.entity';

@Injectable()
export class RoleRepository extends Repository<Role> {
  constructor(dataSource: DataSource) {
    super(Role, dataSource.manager);
  }

  async getRoleById(id: number): Promise<Role | null> {
    return this.findOne({ where: { id } });
  }
}
