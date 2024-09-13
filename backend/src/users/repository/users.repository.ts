import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { SignupDto } from 'src/auth/dto/signup.dto';
import { Role } from '../entities/role.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(dataSource: DataSource) {
    super(User, dataSource.manager);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.findOne({ where: { id } });
  }

  async createUser(userData: SignupDto,role:Role): Promise<User> {
    const user = this.create({ ...userData, role });
     return this.save(user);
  }

//   async findAllUsers(): Promise<User[]> {
//     return this.find();
//   }

//   async updateUser(id: number, updateDto: UpdateDto): Promise<void> {
//     await this.update(id, updateDto);
//   }

//   async softDeleteUser(id: number): Promise<void> {
//     await this.update(id, { deletedAt: new Date() });
//   }
}
