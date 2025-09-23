import { IsEnum, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TaskStatus } from '../entities/task.entity';

export class TaskFiltersDto {
  @ApiProperty({ 
    description: 'Filter by task status', 
    enum: TaskStatus,
    required: false 
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({ 
    description: 'Search in task titles', 
    example: 'urgent',
    required: false 
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ 
    description: 'Page number for pagination', 
    example: 1,
    default: 1,
    required: false 
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ 
    description: 'Number of tasks per page', 
    example: 10,
    default: 10,
    required: false 
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 10;
}
