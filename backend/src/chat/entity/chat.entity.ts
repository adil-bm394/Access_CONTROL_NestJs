import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Group } from './group.entity';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.sentMessages, { eager: true })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedMessages, { nullable: true })
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @ManyToOne(() => Group, (group) => group.chats, { nullable: true })
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: ['sent', 'received', 'read'], default: 'sent' })
  status: string;

  @Column({ type: 'boolean', default: false })
  isGroupMessage: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}




























































// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   ManyToOne,
//   JoinColumn,
//   CreateDateColumn,
//   UpdateDateColumn,
// } from 'typeorm';
// import { User } from 'src/users/entities/user.entity';
// import { Group } from './group.entity';

// @Entity('chats')
// export class Chat {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @ManyToOne(() => User, (user) => user.id, { eager: true })
//   @JoinColumn({ name: 'senderId' })
//   sender: User;

//   @ManyToOne(() => Group, (group) => group.id, { nullable: true })
//   @JoinColumn({ name: 'groupId' })
//   group: Group;

//   @Column({ type: 'text' })
//   message: string;

//   @Column({ type: 'enum', enum: ['sent', 'received', 'read'], default: 'sent' })
//   status: string;

//   @CreateDateColumn()
//   createdAt: Date;

//   @UpdateDateColumn()
//   updatedAt: Date;
// }
