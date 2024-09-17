import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { SignupDto } from 'src/auth/dto/signup.dto';
import { Role } from '../entities/role.entity';
import { UpdateDto } from '../dto/update.dto';

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

  async createUser(userData: SignupDto, role: Role): Promise<User> {
    const user = this.create({ ...userData, role });
    return this.save(user);
  }

  async findAllUsers(): Promise<User[]> {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('role.role_name = :roleName', { roleName: 'USER' })
      .getMany();
  }

  async updateUser(id: number, updatedData: UpdateDto): Promise<void> {
    await this.update(id, updatedData);
  }

  async softDeleteUser(id: number): Promise<void> {
    await this.update(id, { deletedAt: new Date() });
  }

  async saveRefreshToken(
    userId: number,
    refreshToken: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.update(userId, {
      refreshToken,
      refreshTokenExpiresAt: expiresAt,
    });
  }
}

