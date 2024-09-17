import { Column, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from './role.entity';


@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true, type: 'varchar', length: 255, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 60, nullable: false })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  address: string;

  @ManyToOne(() => Role, (role) => role.id, { eager: true })
  role: Role;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: string;

 

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
