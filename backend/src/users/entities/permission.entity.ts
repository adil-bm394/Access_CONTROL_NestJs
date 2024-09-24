// import {
//   Entity,
//   Column,
//   PrimaryGeneratedColumn,
//   ManyToMany,
// } from 'typeorm';
// import { User } from './user.entity';

// @Entity('permission')
// export class Permission {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column({ type: 'varchar', length: 50, unique: true })
//   permission_name: string;

//   @ManyToMany(() => User, (user) => user.permissions)
//   users: User[];
// }
