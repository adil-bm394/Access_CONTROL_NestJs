import { DataSource, Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { SignupDto } from 'src/auth/dto/signup.dto';
import { Role } from '../entities/role.entity';
import { UpdateDto } from '../dto/update.dto';
import { errorMessages } from 'src/utils/messages/messages';

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

  async createUser(
    userData: SignupDto,
    role: Role,
    verificationToken: string,
  ): Promise<User> {
    const user = this.create({ ...userData, role, verificationToken });
    return this.save(user);
  }

  async findAllUsers(): Promise<User[]> {
    return this.find({
      relations: ['role'],
      where: { role: { role_name: 'USER' } },
    });
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

  async saveResetToken(user: User, token: string): Promise<void> {
    user.resetToken = token;
    user.resetTokenExpiration = new Date(Date.now() + 3600000);
    await this.save(user);
  }

  async findUserByResetToken(resetToken: string): Promise<User | null> {
    return this.findOne({ where: { resetToken } });
  }

  async findUserByVerificationToken(
    verificationToken: string,
  ): Promise<User | null> {
    return this.findOne({ where: { verificationToken } });
  }
}
