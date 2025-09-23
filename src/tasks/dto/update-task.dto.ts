import { PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '../entities/task.entity';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiProperty({ 
    description: 'Task status', 
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
    required: false 
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;
}
