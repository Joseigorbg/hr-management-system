import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova configuração' })
  @ApiResponse({ status: 201, description: 'Configuração criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Configuração já existe' })
  create(@Body() createSettingDto: CreateSettingDto) {
    return this.settingsService.create(createSettingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar configurações' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limite por página' })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Filtrar por categoria' })
  @ApiResponse({ status: 200, description: 'Lista de configurações retornada com sucesso' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
  ) {
    return this.settingsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      category,
    );
  }

  @Get('categories')
  @ApiOperation({ summary: 'Listar categorias de configurações' })
  @ApiResponse({ status: 200, description: 'Categorias retornadas com sucesso' })
  getCategories() {
    return this.settingsService.getCategories();
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Buscar configurações por categoria' })
  @ApiResponse({ status: 200, description: 'Configurações da categoria retornadas com sucesso' })
  getSettingsByCategory(@Param('category') category: string) {
    return this.settingsService.getSettingsByCategory(category);
  }

  @Post('backup')
  @ApiOperation({ summary: 'Criar backup das configurações' })
  @ApiResponse({ status: 201, description: 'Backup criado com sucesso' })
  @ApiResponse({ status: 500, description: 'Erro ao criar backup' })
  async backup() {
    return this.settingsService.backup();
  }

  @Post('restore')
  @UseInterceptors(FileInterceptor('backup'))
  @ApiOperation({ summary: 'Restaurar configurações de um backup' })
  @ApiResponse({ status: 201, description: 'Backup restaurado com sucesso' })
  @ApiResponse({ status: 500, description: 'Erro ao restaurar backup' })
  async restore(@UploadedFile() file: Express.Multer.File) {
    const data = JSON.parse(file.buffer.toString());
    return this.settingsService.restore(data);
  }

  @Get('permissions')
  @ApiOperation({ summary: 'Listar permissões disponíveis' })
  @ApiResponse({ status: 200, description: 'Permissões retornadas com sucesso' })
  getPermissions() {
    return [
      { id: '1', name: 'Gerenciar Usuários', key: 'user_management' },
      { id: '2', name: 'Editar Configurações', key: 'settings_edit' },
    ];
  }

  @Get('system')
  @ApiOperation({ summary: 'Buscar configurações do sistema' })
  @ApiResponse({ status: 200, description: 'Configurações do sistema retornadas com sucesso' })
  getSystemSettings() {
    return this.settingsService.getSystemSettings();
  }

  @Get('notification')
  @ApiOperation({ summary: 'Buscar configurações de notificação' })
  @ApiResponse({ status: 200, description: 'Configurações de notificação retornadas com sucesso' })
  getNotificationSettings() {
    return this.settingsService.getNotificationSettings();
  }

  @Get('security')
  @ApiOperation({ summary: 'Buscar configurações de segurança' })
  @ApiResponse({ status: 200, description: 'Configurações de segurança retornadas com sucesso' })
  getSecuritySettings() {
    return this.settingsService.getSecuritySettings();
  }

  @Post('initialize')
  @ApiOperation({ summary: 'Inicializar configurações padrão' })
  @ApiResponse({ status: 201, description: 'Configurações padrão inicializadas com sucesso' })
  initializeDefaultSettings() {
    return this.settingsService.initializeDefaultSettings();
  }

  @Post('bulk-update')
  @ApiOperation({ summary: 'Atualizar múltiplas configurações' })
  @ApiResponse({ status: 200, description: 'Configurações atualizadas com sucesso' })
  bulkUpdate(@Body() settings: { key: string; value: string }[]) {
    return this.settingsService.bulkUpdate(settings);
  }

  @Get('key/:key')
  @ApiOperation({ summary: 'Buscar configuração por chave' })
  @ApiResponse({ status: 200, description: 'Configuração retornada com sucesso' })
  @ApiResponse({ status: 404, description: 'Configuração não encontrada' })
  findByKey(@Param('key') key: string) {
    return this.settingsService.findByKey(key);
  }

  @Patch('key/:key')
  @ApiOperation({ summary: 'Atualizar configuração por chave' })
  @ApiResponse({ status: 200, description: 'Configuração atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Configuração não encontrada' })
  updateByKey(@Param('key') key: string, @Body() body: { value: string }) {
    return this.settingsService.updateByKey(key, body.value);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar configuração por ID' })
  @ApiResponse({ status: 200, description: 'Configuração retornada com sucesso' })
  @ApiResponse({ status: 404, description: 'Configuração não encontrada' })
  findOne(@Param('id') id: string) {
    return this.settingsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar configuração' })
  @ApiResponse({ status: 200, description: 'Configuração atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Configuração não encontrada' })
  @ApiResponse({ status: 409, description: 'Chave da configuração já existe' })
  update(@Param('id') id: string, @Body() updateSettingDto: UpdateSettingDto) {
    return this.settingsService.update(id, updateSettingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover configuração' })
  @ApiResponse({ status: 200, description: 'Configuração removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Configuração não encontrada' })
  remove(@Param('id') id: string) {
    return this.settingsService.remove(id);
  }
}