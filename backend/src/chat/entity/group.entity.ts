import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Chat } from './chat.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({unique:true})
  name: string;

  @ManyToMany(() => User, (user) => user.groups)
  @JoinTable({ name: 'group_users' })
  users: User[];

  @OneToMany(() => Chat, (chat) => chat.group)
  chats: Chat[];

  @Column({ type: 'boolean', default: false })
  isPrivate: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastMessageAt: Date;
}


























































































// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   ManyToMany,
//   JoinTable,
//   OneToMany,
// } from 'typeorm';
// import { User } from 'src/users/entities/user.entity';
// import { Chat } from './chat.entity';

// @Entity('groups')
// export class Group {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column()
//   name: string;

//   @ManyToMany(() => User, (user) => user.id)
//   @JoinTable({ name: 'group_users' })
//   users: User[];

//   @OneToMany(() => Chat, (chat) => chat.group)
//   chats: Chat[];
// }
