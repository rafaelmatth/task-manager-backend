import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Entity('tasks')
export class Task {
  @ApiProperty({ description: 'Task ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Task title', example: 'Complete project documentation' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Task description', example: 'Write comprehensive documentation' })
  @Column('text')
  description: string;

  @ApiProperty({ 
    description: 'Task status', 
    enum: TaskStatus,
    example: TaskStatus.PENDING 
  })
  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING
  })
  status: TaskStatus;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'User ID' })
  @Column()
  userId: number;

  @ManyToOne(() => User, user => user.tasks, { onDelete: 'CASCADE' })
  user: User;
}
