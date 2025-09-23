import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, FindOptionsWhere } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFiltersDto } from './dto/task-filters.dto';
import { TaskStatus } from './entities/task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: number): Promise<Task> {
    const task = this.tasksRepository.create({
      ...createTaskDto,
      userId,
    });

    return await this.tasksRepository.save(task);
  }

  async findAll(
    userId: number,
    filters: TaskFiltersDto,
  ): Promise<{ tasks: Task[]; total: number }> {
    const { page = 1, limit = 10, status, search } = filters;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Task> = { userId };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.title = Like(`%${search}%`);
    }

    const [tasks, total] = await this.tasksRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { tasks, total };
  }

  async findOne(id: number, userId: number): Promise<Task> {
    const task = await this.tasksRepository.findOne({ 
      where: { id, userId } 
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, userId: number): Promise<Task> {
    const task = await this.findOne(id, userId);

    const updatedTask = this.tasksRepository.merge(task, updateTaskDto);
    return await this.tasksRepository.save(updatedTask);
  }

  async remove(id: number, userId: number): Promise<void> {
    const task = await this.findOne(id, userId);
    await this.tasksRepository.remove(task);
  }

  async getUserTaskStats(userId: number): Promise<{ [key in TaskStatus]: number }> {
    const stats = await this.tasksRepository
      .createQueryBuilder('task')
      .select('task.status', 'status')
      .addSelect('COUNT(task.id)', 'count')
      .where('task.userId = :userId', { userId })
      .groupBy('task.status')
      .getRawMany();

    const result = {
      [TaskStatus.PENDING]: 0,
      [TaskStatus.IN_PROGRESS]: 0,
      [TaskStatus.COMPLETED]: 0,
    };

    stats.forEach(stat => {
      result[stat.status] = parseInt(stat.count);
    });

    return result;
  }
}
