import { Controller, Get, Post, Patch, Delete, Query, Body, Param, UseGuards, Req } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-tasks.dto';
import { UpdateTaskDto } from './dto/update-tasks.dto';
import { AssignTaskDto } from './dto/assign-task.dto'; // Novo import
import { AuthGuard } from '@nestjs/passport';

@Controller('api/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @UseGuards(AuthGuard('jwt'))
@Get()
async findAll(
  @Req() req, // Parâmetro obrigatório vem primeiro
  @Query('page') page: string = '1',
  @Query('limit') limit: string = '10',
  @Query('userId') userId?: string,
  @Query('startDate') startDate?: string,
  @Query('endDate') endDate?: string,
  @Query('isActive') isActive?: string,
) {
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const filters = {
    userId,
    startDate,
    endDate,
    isActive: isActive !== undefined ? isActive === 'true' : undefined,
    currentUserId: req.user.id, // Usa o ID do usuário logado
  };
  return this.tasksService.findAll(pageNum, limitNum, filters);
}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.tasksService.delete(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('assign')
  async assignTask(@Body() assignTaskDto: AssignTaskDto, @Req() req) {
    return this.tasksService.assignTask(assignTaskDto, req.user.role);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('assign/:type/:id/:taskId')
  async unassignTask(@Param('type') type: 'user' | 'group', @Param('id') id: string, @Param('taskId') taskId: string, @Req() req) {
    return this.tasksService.unassignTask(type, id, taskId, req.user.role);
  }
}