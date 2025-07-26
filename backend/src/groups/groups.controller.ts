import { Controller, Get, Post, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateGroupDto } from './dto/create-groups.dto';
import { AddUserToGroupDto } from './dto/add-user-to-group.dto';

@ApiTags('groups')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os grupos' })
  @ApiResponse({ status: 200, description: 'Lista de grupos retornada com sucesso' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async findAll() {
    try {
      return await this.groupsService.findAll();
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao carregar grupos',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @ApiOperation({ summary: 'Criar um novo grupo' })
  @ApiResponse({ status: 201, description: 'Grupo criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async create(@Body() body: CreateGroupDto) {
    console.log('Corpo recebido em POST /api/groups:', body);
    try {
      return await this.groupsService.create(body.name, body.description);
    } catch (error) {
      console.error('Erro no controlador create:', error);
      throw new HttpException(
        error.message || 'Erro ao criar grupo',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('add-user')
  @ApiOperation({ summary: 'Adicionar usuário a um grupo' })
  @ApiResponse({ status: 200, description: 'Usuário adicionado ao grupo com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Grupo ou usuário não encontrado' })
  @ApiResponse({ status: 409, description: 'Usuário já está no grupo' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async addUserToGroup(@Body() body: AddUserToGroupDto) {
    try {
      return await this.groupsService.addUserToGroup(body.groupId, body.userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao adicionar usuário ao grupo',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}