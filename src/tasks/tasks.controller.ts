import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  HttpCode, 
  HttpStatus,
  ParseIntPipe 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiBearerAuth,
  ApiQuery 
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFiltersDto } from './dto/task-filters.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Task } from './entities/task.entity';

@ApiTags('Tasks')
@ApiBearerAuth('JWT-auth')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Task created successfully',
    type: Task 
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @GetUser() user: JwtPayload,
  ): Promise<Task> {
    return this.tasksService.create(createTaskDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks for the authenticated user' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'in_progress', 'completed'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ 
    status: 200, 
    description: 'Tasks retrieved successfully',
    schema: {
      example: {
        tasks: [
          {
            id: 1,
            title: 'Complete project',
            description: 'Finish the task manager API',
            status: 'pending',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        ],
        total: 1
      }
    }
  })
  async findAll(
    @Query() filters: TaskFiltersDto,
    @GetUser() user: JwtPayload,
  ): Promise<{ tasks: Task[]; total: number }> {
    return this.tasksService.findAll(user.userId, filters);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get task statistics for the authenticated user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistics retrieved successfully',
    schema: {
      example: {
        pending: 5,
        in_progress: 3,
        completed: 12
      }
    }
  })
  async getStats(@GetUser() user: JwtPayload) {
    return this.tasksService.getUserTaskStats(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific task by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Task retrieved successfully',
    type: Task 
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: JwtPayload,
  ): Promise<Task> {
    return this.tasksService.findOne(id, user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Task updated successfully',
    type: Task 
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @GetUser() user: JwtPayload,
  ): Promise<Task> {
    return this.tasksService.update(id, updateTaskDto, user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({ status: 204, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: JwtPayload,
  ): Promise<void> {
    return this.tasksService.remove(id, user.userId);
  }
}
