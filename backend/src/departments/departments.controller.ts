import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Departments')
@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Criar novo departamento' })
  @ApiResponse({ status: 201, description: 'Departamento criado com sucesso' })
  @ApiResponse({ status: 409, description: 'Departamento com este nome já existe' })
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar departamentos' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'include', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de departamentos' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('include') include?: string,
  ) {
    return this.departmentsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      include,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter departamento por ID' })
  @ApiResponse({ status: 200, description: 'Dados do departamento' })
  @ApiResponse({ status: 404, description: 'Departamento não encontrado' })
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Atualizar departamento' })
  @ApiResponse({ status: 200, description: 'Departamento atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Departamento não encontrado' })
  update(@Param('id') id: string, @Body() updateDepartmentDto: UpdateDepartmentDto) {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Excluir departamento' })
  @ApiResponse({ status: 200, description: 'Departamento excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Departamento não encontrado' })
  @ApiResponse({ status: 409, description: 'Departamento possui usuários associados' })
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(id);
  }
}

