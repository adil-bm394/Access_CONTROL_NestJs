import { Exclude } from 'class-transformer';
import { Chat } from 'src/chat/entity/chat.entity';
import { Group } from 'src/chat/entity/group.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true, type: 'varchar', length: 255, nullable: false })
  email: string;

  @Exclude()
  @Column({ type: 'varchar', length: 60, nullable: false })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  address: string;

  //join role table
  @ManyToOne(() => Role, (role) => role.id, { eager: true })
  role: Role;

  //   //join permission table
  //   // @ManyToMany(() => Permission, (permission) => permission.users, {
  //   //   eager: true,
  //   // })
  //   // permissions: Permission[];

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @Exclude()
  @Column({ default: false })
  isVerified: boolean;

  @Exclude()
  @Column({ nullable: true })
  verificationToken: string;

  @Exclude()
  @Column({ type: 'timestamp', nullable: true })
  verificationTokenExpiresAt: Date;

  @Exclude()
  @Column({ nullable: true })
  resetToken: string;

  @Exclude()
  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpiration: Date;

  @Column({ type: 'text', nullable: true })
  refreshToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  refreshTokenExpiresAt?: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  //join group table
  @ManyToMany(() => Group, (group) => group.users)
  groups: Group[];

  @OneToMany(() => Chat, (chat) => chat.sender)
  sentMessages: Chat[];

  //join chat table
  @OneToMany(() => Chat, (chat) => chat.receiver)
  receivedMessages: Chat[];

  @Column({ type: 'timestamp', nullable: true })
  lastOnline: Date;

  @Column({ type: 'boolean', default: false })
  isOnline: boolean;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}

// import {
//   Column,
//   DeleteDateColumn,
//   Entity,
//   ManyToMany,
//   ManyToOne,
//   PrimaryGeneratedColumn,
// } from 'typeorm';
// import { Role } from './role.entity';
// import { Exclude } from 'class-transformer';
// //import { Permission } from './permission.entity';

// @Entity('users')
// export class User {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column({ unique: true })
//   username: string;

//   @Column({ unique: true, type: 'varchar', length: 255, nullable: false })
//   email: string;

//   @Column({ type: 'varchar', length: 60, nullable: false })
//   password: string;

//   @Column({ type: 'varchar', length: 255, nullable: false })
//   address: string;

//   //join role table
//   @ManyToOne(() => Role, (role) => role.id, { eager: true })
//   role: Role;

//   //join permission table
//   // @ManyToMany(() => Permission, (permission) => permission.users, {
//   //   eager: true,
//   // })
//   // permissions: Permission[];

//   @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
//   status: string;

//   @Exclude()
//   @Column({ default: false })
//   isVerified: boolean;

//   @Exclude()
//   @Column({ nullable: true })
//   verificationToken: string;

//   @Exclude()
//   @Column({ type: 'timestamp', nullable: true })
//   verificationTokenExpiresAt: Date;

//   @Exclude()
//   @Column({ nullable: true })
//   resetToken: string;

//   @Exclude()
//   @Column({ type: 'timestamp', nullable: true })
//   resetTokenExpiration: Date;

//   @Column({ type: 'text', nullable: true })
//   refreshToken?: string;

//   @Column({ type: 'timestamp', nullable: true })
//   refreshTokenExpiresAt?: Date;

//   @DeleteDateColumn({ nullable: true })
//   deletedAt?: Date;

//   constructor(partial: Partial<User>) {
//     Object.assign(this, partial);
//   }
// }
