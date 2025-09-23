import { IsString, IsNotEmpty, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '../entities/task.entity';

export class CreateTaskDto {
  @ApiProperty({ 
    description: 'Task title', 
    example: 'Complete project documentation',
    maxLength: 100 
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({ 
    description: 'Task description', 
    example: 'Write comprehensive documentation for the task manager API',
    required: false 
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    description: 'Task status', 
    enum: TaskStatus,
    example: TaskStatus.PENDING,
    required: false 
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;
}
