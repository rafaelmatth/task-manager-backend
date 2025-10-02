import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFiltersDto } from './dto/task-filters.dto';
import { TaskStatus } from './entities/task.entity';

interface TaskStatsRaw {
  status: TaskStatus;
  count: string;
}

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    private readonly redisService: RedisService,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: number): Promise<Task> {
    const task = this.tasksRepository.create({
      ...createTaskDto,
      userId,
    });

    const savedTask = await this.tasksRepository.save(task);
    
    // Invalidar cache no Redis
    await this.redisService.invalidateUserTasks(userId);
    this.logger.log(`✅ Task criada e cache invalidado para usuário ${userId}`);
    
    return savedTask;
  }

  async findAll(
    userId: number,
    filters: TaskFiltersDto,
  ): Promise<{ tasks: Task[]; total: number }> {
    // Tentar obter do Redis primeiro
    const cached = await this.redisService.getTasks(userId, filters);
    if (cached) {
      this.logger.log(`📦 Cache HIT para tasks do usuário ${userId}`);
      return cached;
    }

    this.logger.log(`🔄 Cache MISS, buscando tasks do usuário ${userId} no banco...`);
    
    // Buscar do banco
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

    const result = { tasks, total };
    
    // Armazenar no Redis (5 minutos)
    await this.redisService.setTasks(userId, filters, result, 300);
    this.logger.log(`💾 Cache SET para tasks do usuário ${userId}`);
    
    return result;
  }

  async findOne(id: number, userId: number): Promise<Task> {
    const cacheKey = `task:${id}:user:${userId}`;
    
    const cached = await this.redisService.getJson<Task>(cacheKey);
    if (cached) {
      return cached;
    }

    const task = await this.tasksRepository.findOne({ 
      where: { id, userId } 
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.redisService.setJson(cacheKey, task, 300);
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, userId: number): Promise<Task> {
    await this.findOne(id, userId);

    const taskToUpdate = await this.tasksRepository.preload({ id, userId, ...updateTaskDto });

    if (!taskToUpdate) {
      throw new NotFoundException('Task not found');
    }
    const savedTask = await this.tasksRepository.save(taskToUpdate);
    
    await this.redisService.del(`task:${id}:user:${userId}`);
    await this.redisService.invalidateUserTasks(userId);
    this.logger.log(`🔄 Task ${id} atualizada - cache invalidado`);
    
    return savedTask;
  }

  async remove(id: number, userId: number): Promise<void> {
    const result = await this.tasksRepository.delete({ id, userId });
    if (result.affected === 0) throw new NotFoundException('Task not found');
    
    await this.redisService.del(`task:${id}:user:${userId}`);
    await this.redisService.invalidateUserTasks(userId);
    this.logger.log(`🗑️ Task ${id} removida - cache invalidado`);
  }

  async getUserTaskStats(userId: number): Promise<{ [key in TaskStatus]: number }> {
    const cacheKey = `user:${userId}:tasks:stats`;
    
    const cached = await this.redisService.getJson<{ [key in TaskStatus]: number }>(cacheKey);
    if (cached) {
      return cached;
    }

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
      (result as any)[stat.status] = parseInt(stat.count, 10);
    });

    await this.redisService.setJson(cacheKey, result, 300);
    return result;
  }
}
