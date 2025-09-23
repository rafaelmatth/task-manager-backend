import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @ApiProperty({ description: 'User ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'User full name', example: 'John Doe' })
  @Column()
  name: string;

  @Column()
  @Exclude()
  password: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Task, task => task.user)
  tasks: Task[];
}
