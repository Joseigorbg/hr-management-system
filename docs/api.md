
# API Reference - Sistema de Gestão de Pessoas

## Introdução

Esta documentação apresenta a referência completa da API REST do Sistema de Gestão de Pessoas. A API segue os princípios RESTful e utiliza JSON para comunicação de dados. Todas as rotas protegidas requerem autenticação via JWT Bearer token.

## Base URL

```
Desenvolvimento: http://localhost:3000/api/v1
Produção: https://api.hrmanagement.com/v1
```

## Autenticação

### Visão Geral

O sistema utiliza JWT (JSON Web Tokens) para autenticação. Após o login bem-sucedido, um token é retornado e deve ser incluído no header `Authorization` de todas as requisições subsequentes.

### Headers Obrigatórios

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Endpoints de Autenticação

### POST /auth/login

Realiza login no sistema e retorna um token JWT.

**Request Body:**
```json
{
  "email": "admin@hrmanagement.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@hrmanagement.com",
    "name": "Administrador",
    "role": "admin"
  }
}
```

**Response (401):**
```json
{
  "statusCode": 401,
  "message": "Credenciais inválidas",
  "error": "Unauthorized"
}
```

### POST /auth/register

Registra um novo usuário no sistema (apenas para admins).

**Request Body:**
```json
{
  "email": "novo.usuario@empresa.com",
  "password": "senha123",
  "name": "Novo Usuário",
  "role": "employee",
  "positionId": "uuid",
  "departmentId": "uuid"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "email": "novo.usuario@empresa.com",
  "name": "Novo Usuário",
  "role": "employee",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### POST /auth/refresh

Renova o token JWT usando um refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response (200):**
```json
{
  "access_token": "new_jwt_token",
  "refresh_token": "new_refresh_token"
}
```

## Endpoints de Usuários

### GET /users

Lista todos os usuários do sistema (paginado).

**Query Parameters:**
- `page` (optional): Número da página (default: 1)
- `limit` (optional): Itens por página (default: 10)
- `search` (optional): Busca por nome ou email
- `department` (optional): Filtro por departamento
- `role` (optional): Filtro por role

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "joao.silva@empresa.com",
      "name": "João Silva",
      "role": "employee",
      "isActive": true,
      "position": {
        "id": "uuid",
        "name": "Desenvolvedor Full Stack",
        "salary": 8000.00
      },
      "department": {
        "id": "uuid",
        "name": "Tecnologia da Informação"
      },
      "createdAt": "2023-01-15T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### GET /users/:id

Obtém detalhes de um usuário específico.

**Response (200):**
```json
{
  "id": "uuid",
  "email": "joao.silva@empresa.com",
  "name": "João Silva",
  "role": "employee",
  "isActive": true,
  "position": {
    "id": "uuid",
    "name": "Desenvolvedor Full Stack",
    "salary": 8000.00
  },
  "department": {
    "id": "uuid",
    "name": "Tecnologia da Informação"
  },
  "profile": {
    "phone": "(11) 99999-9999",
    "address": "São Paulo, SP",
    "birthDate": "1990-05-15",
    "hireDate": "2023-01-15",
    "emergencyContactName": "Maria Silva",
    "emergencyContactPhone": "(11) 88888-8888"
  },
  "createdAt": "2023-01-15T00:00:00.000Z",
  "updatedAt": "2023-01-15T00:00:00.000Z"
}
```

### POST /users

Cria um novo usuário.

**Request Body:**
```json
{
  "email": "novo.funcionario@empresa.com",
  "password": "senha123",
  "name": "Novo Funcionário",
  "role": "employee",
  "positionId": "uuid",
  "departmentId": "uuid"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "email": "novo.funcionario@empresa.com",
  "name": "Novo Funcionário",
  "role": "employee",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### PUT /users/:id

Atualiza um usuário existente.

**Request Body:**
```json
{
  "name": "Nome Atualizado",
  "positionId": "uuid",
  "departmentId": "uuid",
  "isActive": true
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "usuario@empresa.com",
  "name": "Nome Atualizado",
  "role": "employee",
  "isActive": true,
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### DELETE /users/:id

Remove um usuário do sistema (soft delete).

**Response (200):**
```json
{
  "message": "Usuário removido com sucesso"
}
```

## Endpoints de Departamentos

### GET /departments

Lista todos os departamentos.

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Tecnologia da Informação",
      "description": "Departamento de desenvolvimento e infraestrutura",
      "manager": {
        "id": "uuid",
        "name": "João Manager",
        "email": "joao.manager@empresa.com"
      },
      "employeeCount": 15,
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /departments/:id

Obtém detalhes de um departamento específico.

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Tecnologia da Informação",
  "description": "Departamento de desenvolvimento e infraestrutura",
  "manager": {
    "id": "uuid",
    "name": "João Manager",
    "email": "joao.manager@empresa.com"
  },
  "employees": [
    {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao.silva@empresa.com",
      "position": {
        "name": "Desenvolvedor Full Stack"
      }
    }
  ],
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### POST /departments

Cria um novo departamento.

**Request Body:**
```json
{
  "name": "Novo Departamento",
  "description": "Descrição do departamento",
  "managerId": "uuid"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "Novo Departamento",
  "description": "Descrição do departamento",
  "managerId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### PUT /departments/:id

Atualiza um departamento existente.

**Request Body:**
```json
{
  "name": "Nome Atualizado",
  "description": "Nova descrição",
  "managerId": "uuid"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Nome Atualizado",
  "description": "Nova descrição",
  "managerId": "uuid",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### DELETE /departments/:id

Remove um departamento.

**Response (200):**
```json
{
  "message": "Departamento removido com sucesso"
}
```

## Endpoints de Cargos

### GET /positions

Lista todos os cargos disponíveis.

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Desenvolvedor Full Stack",
      "description": "Desenvolvedor com conhecimento em frontend e backend",
      "salary": 8000.00,
      "employeeCount": 5,
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /positions/:id

Obtém detalhes de um cargo específico.

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Desenvolvedor Full Stack",
  "description": "Desenvolvedor com conhecimento em frontend e backend",
  "salary": 8000.00,
  "employees": [
    {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao.silva@empresa.com",
      "department": {
        "name": "Tecnologia da Informação"
      }
    }
  ],
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### POST /positions

Cria um novo cargo.

**Request Body:**
```json
{
  "name": "Novo Cargo",
  "description": "Descrição do cargo",
  "salary": 7500.00
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "Novo Cargo",
  "description": "Descrição do cargo",
  "salary": 7500.00,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### PUT /positions/:id

Atualiza um cargo existente.

**Request Body:**
```json
{
  "name": "Nome Atualizado",
  "description": "Nova descrição",
  "salary": 8500.00
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Nome Atualizado",
  "description": "Nova descrição",
  "salary": 8500.00,
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### DELETE /positions/:id

Remove um cargo.

**Response (200):**
```json
{
  "message": "Cargo removido com sucesso"
}
```

## Endpoints de Avaliações de Desempenho

### GET /performance-evaluations

Lista avaliações de desempenho (com filtros).

**Query Parameters:**
- `userId` (optional): Filtro por usuário
- `evaluatorId` (optional): Filtro por avaliador
- `status` (optional): Filtro por status
- `period` (optional): Filtro por período

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "name": "João Silva",
        "email": "joao.silva@empresa.com"
      },
      "evaluator": {
        "id": "uuid",
        "name": "Maria Manager",
        "email": "maria.manager@empresa.com"
      },
      "periodStart": "2023-01-01",
      "periodEnd": "2023-06-30",
      "overallScore": 8.5,
      "goalsAchievement": 9.0,
      "technicalSkills": 8.0,
      "softSkills": 8.5,
      "status": "approved",
      "createdAt": "2023-07-01T00:00:00.000Z"
    }
  ]
}
```

### GET /performance-evaluations/:id

Obtém detalhes de uma avaliação específica.

**Response (200):**
```json
{
  "id": "uuid",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao.silva@empresa.com",
    "position": {
      "name": "Desenvolvedor Full Stack"
    },
    "department": {
      "name": "Tecnologia da Informação"
    }
  },
  "evaluator": {
    "id": "uuid",
    "name": "Maria Manager",
    "email": "maria.manager@empresa.com"
  },
  "periodStart": "2023-01-01",
  "periodEnd": "2023-06-30",
  "overallScore": 8.5,
  "goalsAchievement": 9.0,
  "technicalSkills": 8.0,
  "softSkills": 8.5,
  "comments": "Excelente desempenho técnico e boa colaboração em equipe.",
  "feedback": "Continue desenvolvendo suas habilidades de liderança.",
  "status": "approved",
  "createdAt": "2023-07-01T00:00:00.000Z",
  "updatedAt": "2023-07-01T00:00:00.000Z"
}
```

### POST /performance-evaluations

Cria uma nova avaliação de desempenho.

**Request Body:**
```json
{
  "userId": "uuid",
  "evaluatorId": "uuid",
  "periodStart": "2024-01-01",
  "periodEnd": "2024-06-30",
  "overallScore": 8.5,
  "goalsAchievement": 9.0,
  "technicalSkills": 8.0,
  "softSkills": 8.5,
  "comments": "Excelente desempenho no período.",
  "feedback": "Continue assim!"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "evaluatorId": "uuid",
  "periodStart": "2024-01-01",
  "periodEnd": "2024-06-30",
  "overallScore": 8.5,
  "status": "draft",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### PUT /performance-evaluations/:id

Atualiza uma avaliação existente.

**Request Body:**
```json
{
  "overallScore": 9.0,
  "comments": "Comentários atualizados",
  "status": "submitted"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "overallScore": 9.0,
  "comments": "Comentários atualizados",
  "status": "submitted",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### DELETE /performance-evaluations/:id

Remove uma avaliação.

**Response (200):**
```json
{
  "message": "Avaliação removida com sucesso"
}
```

## Endpoints de Chat

### GET /chat/messages

Obtém mensagens do usuário logado.

**Query Parameters:**
- `page` (optional): Número da página (default: 1)
- `limit` (optional): Itens por página (default: 50)

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "message": "Olá! Como posso ajudá-lo?",
      "messageType": "bot",
      "sender": null,
      "recipient": {
        "id": "uuid",
        "name": "João Silva"
      },
      "isRead": false,
      "createdAt": "2024-01-01T10:00:00.000Z"
    },
    {
      "id": "uuid",
      "message": "Gostaria de saber sobre meus benefícios",
      "messageType": "user",
      "sender": {
        "id": "uuid",
        "name": "João Silva"
      },
      "recipient": null,
      "isRead": true,
      "createdAt": "2024-01-01T10:01:00.000Z"
    }
  ]
}
```

### POST /chat/messages

Envia uma nova mensagem.

**Request Body:**
```json
{
  "message": "Gostaria de saber sobre férias",
  "messageType": "user",
  "recipientId": null
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "message": "Gostaria de saber sobre férias",
  "messageType": "user",
  "senderId": "uuid",
  "recipientId": null,
  "isRead": false,
  "createdAt": "2024-01-01T10:00:00.000Z"
}
```

### GET /chat/conversations

Obtém lista de conversas do usuário.

**Response (200):**
```json
{
  "data": [
    {
      "user": {
        "id": "uuid",
        "name": "Maria Manager",
        "email": "maria.manager@empresa.com"
      },
      "lastMessage": "Você pode revisar o relatório?",
      "lastMessageAt": "2024-01-01T15:30:00.000Z"
    }
  ]
}
```

### PATCH /chat/messages/:id/read

Marca uma mensagem como lida.

**Response (200):**
```json
{
  "message": "Mensagem marcada como lida"
}
```

### GET /chat/unread-count

Obtém contagem de mensagens não lidas.

**Response (200):**
```json
{
  "count": 5
}
```

## Endpoints de Férias

### GET /vacations

Lista solicitações de férias.

**Query Parameters:**
- `userId` (optional): Filtro por usuário
- `status` (optional): Filtro por status
- `year` (optional): Filtro por ano

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "name": "João Silva",
        "email": "joao.silva@empresa.com"
      },
      "startDate": "2024-07-01",
      "endDate": "2024-07-15",
      "daysRequested": 15,
      "type": "annual",
      "status": "approved",
      "approvedBy": {
        "id": "uuid",
        "name": "Maria Manager"
      },
      "approvedAt": "2024-06-15T10:00:00.000Z",
      "comments": "Férias aprovadas para período de verão",
      "createdAt": "2024-06-01T00:00:00.000Z"
    }
  ]
}
```

### POST /vacations

Solicita férias.

**Request Body:**
```json
{
  "startDate": "2024-08-01",
  "endDate": "2024-08-15",
  "daysRequested": 15,
  "type": "annual",
  "comments": "Férias de verão"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "startDate": "2024-08-01",
  "endDate": "2024-08-15",
  "daysRequested": 15,
  "type": "annual",
  "status": "pending",
  "comments": "Férias de verão",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### PATCH /vacations/:id/approve

Aprova uma solicitação de férias (apenas managers/admins).

**Request Body:**
```json
{
  "comments": "Aprovado conforme solicitado"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "approved",
  "approvedBy": "uuid",
  "approvedAt": "2024-01-01T10:00:00.000Z",
  "comments": "Aprovado conforme solicitado"
}
```

### PATCH /vacations/:id/reject

Rejeita uma solicitação de férias (apenas managers/admins).

**Request Body:**
```json
{
  "comments": "Período não disponível"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "rejected",
  "comments": "Período não disponível",
  "updatedAt": "2024-01-01T10:00:00.000Z"
}
```

## Endpoints de Benefícios

### GET /benefits

Lista todos os benefícios disponíveis.

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Plano de Saúde",
      "description": "Plano de saúde empresarial",
      "type": "health",
      "value": 350.00,
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /benefits/user/:userId

Lista benefícios de um usuário específico.

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "benefit": {
        "id": "uuid",
        "name": "Plano de Saúde",
        "description": "Plano de saúde empresarial",
        "type": "health",
        "value": 350.00
      },
      "startDate": "2023-01-15",
      "endDate": null,
      "isActive": true,
      "createdAt": "2023-01-15T00:00:00.000Z"
    }
  ]
}
```

### POST /benefits

Cria um novo benefício (apenas admins).

**Request Body:**
```json
{
  "name": "Novo Benefício",
  "description": "Descrição do benefício",
  "type": "other",
  "value": 200.00
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "Novo Benefício",
  "description": "Descrição do benefício",
  "type": "other",
  "value": 200.00,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### POST /benefits/:id/assign

Atribui um benefício a um usuário.

**Request Body:**
```json
{
  "userId": "uuid",
  "startDate": "2024-01-01"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "benefitId": "uuid",
  "startDate": "2024-01-01",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## Endpoints de Treinamentos

### GET /trainings

Lista todos os treinamentos.

**Query Parameters:**
- `status` (optional): Filtro por status
- `type` (optional): Filtro por tipo

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Segurança da Informação",
      "description": "Treinamento sobre boas práticas de segurança digital",
      "instructor": "Carlos Security",
      "durationHours": 8,
      "maxParticipants": 20,
      "startDate": "2024-01-15T09:00:00.000Z",
      "endDate": "2024-01-15T17:00:00.000Z",
      "location": "Sala de Treinamento A",
      "type": "internal",
      "status": "scheduled",
      "participantCount": 15,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /trainings/:id

Obtém detalhes de um treinamento específico.

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Segurança da Informação",
  "description": "Treinamento sobre boas práticas de segurança digital",
  "instructor": "Carlos Security",
  "durationHours": 8,
  "maxParticipants": 20,
  "startDate": "2024-01-15T09:00:00.000Z",
  "endDate": "2024-01-15T17:00:00.000Z",
  "location": "Sala de Treinamento A",
  "type": "internal",
  "status": "scheduled",
  "participants": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "name": "João Silva",
        "email": "joao.silva@empresa.com"
      },
      "status": "enrolled",
      "enrolledAt": "2024-01-05T00:00:00.000Z"
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### POST /trainings

Cria um novo treinamento.

**Request Body:**
```json
{
  "title": "Novo Treinamento",
  "description": "Descrição do treinamento",
  "instructor": "Instrutor Nome",
  "durationHours": 16,
  "maxParticipants": 25,
  "startDate": "2024-02-01T09:00:00.000Z",
  "endDate": "2024-02-02T17:00:00.000Z",
  "location": "Auditório Principal",
  "type": "internal"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "title": "Novo Treinamento",
  "description": "Descrição do treinamento",
  "instructor": "Instrutor Nome",
  "durationHours": 16,
  "maxParticipants": 25,
  "startDate": "2024-02-01T09:00:00.000Z",
  "endDate": "2024-02-02T17:00:00.000Z",
  "location": "Auditório Principal",
  "type": "internal",
  "status": "scheduled",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### POST /trainings/:id/enroll

Inscreve um usuário em um treinamento.

**Request Body:**
```json
{
  "userId": "uuid"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "trainingId": "uuid",
  "userId": "uuid",
  "status": "enrolled",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### PATCH /trainings/:trainingId/participants/:participationId/complete

Marca participação como concluída.

**Request Body:**
```json
{
  "score": 8.5,
  "certificateUrl": "https://certificates.com/cert123"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "completed",
  "completionDate": "2024-01-15",
  "score": 8.5,
  "certificateUrl": "https://certificates.com/cert123",
  "updatedAt": "2024-01-15T17:00:00.000Z"
}
```

## Códigos de Status HTTP

### Códigos de Sucesso
- `200 OK`: Requisição bem-sucedida
- `201 Created`: Recurso criado com sucesso
- `204 No Content`: Requisição bem-sucedida sem conteúdo de retorno

### Códigos de Erro do Cliente
- `400 Bad Request`: Dados inválidos na requisição
- `401 Unauthorized`: Não autenticado
- `403 Forbidden`: Não autorizado para a operação
- `404 Not Found`: Recurso não encontrado
- `409 Conflict`: Conflito com estado atual do recurso
- `422 Unprocessable Entity`: Dados válidos mas não processáveis

### Códigos de Erro do Servidor
- `500 Internal Server Error`: Erro interno do servidor
- `502 Bad Gateway`: Erro de gateway
- `503 Service Unavailable`: Serviço indisponível

## Tratamento de Erros

### Formato de Resposta de Erro

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Email deve ser um endereço válido"
    }
  ]
}
```

### Erros Comuns

#### Erro de Validação (400)
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "password",
      "message": "Password deve ter pelo menos 6 caracteres"
    }
  ]
}
```

#### Erro de Autenticação (401)
```json
{
  "statusCode": 401,
  "message": "Token inválido ou expirado",
  "error": "Unauthorized"
}
```

#### Erro de Autorização (403)
```json
{
  "statusCode": 403,
  "message": "Acesso negado para esta operação",
  "error": "Forbidden"
}
```

#### Recurso Não Encontrado (404)
```json
{
  "statusCode": 404,
  "message": "Usuário não encontrado",
  "error": "Not Found"
}
```

## Rate Limiting

A API implementa rate limiting para prevenir abuso:

- **Limite geral**: 100 requisições por minuto por IP
- **Limite de login**: 5 tentativas por minuto por IP
- **Limite de chat**: 30 mensagens por minuto por usuário

### Headers de Rate Limit

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Versionamento

A API utiliza versionamento via URL:
- Versão atual: `v1`
- Formato: `/api/v1/endpoint`

### Política de Versionamento

- **Major versions**: Mudanças incompatíveis
- **Minor versions**: Novas funcionalidades compatíveis
- **Patch versions**: Correções de bugs

## WebSocket Events

### Conexão

```javascript
// Conectar ao WebSocket
const socket = io('http://localhost:3000');

// Entrar em uma sala de usuário
socket.emit('join', { userId: 'user-uuid' });
```

### Eventos de Chat

#### Enviar Mensagem
```javascript
socket.emit('sendMessage', {
  message: 'Olá!',
  recipientId: 'recipient-uuid',
  messageType: 'user'
});
```

#### Receber Mensagem
```javascript
socket.on('newMessage', (message) => {
  console.log('Nova mensagem:', message);
});
```

#### Marcar como Lida
```javascript
socket.emit('markAsRead', {
  messageId: 'message-uuid',
  userId: 'user-uuid'
});
```

#### Confirmação de Leitura
```javascript
socket.on('messageRead', (data) => {
  console.log('Mensagem lida:', data.messageId);
});
```

## Exemplos de Uso

### Autenticação e Uso Básico

```javascript
// Login
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin@hrmanagement.com',
    password: 'admin123'
  })
});

const { access_token } = await loginResponse.json();

// Usar token em requisições subsequentes
const usersResponse = await fetch('/api/v1/users', {
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  }
});

const users = await usersResponse.json();
```

### Criação de Usuário Completa

```javascript
// Criar usuário
const createUserResponse = await fetch('/api/v1/users', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'novo.funcionario@empresa.com',
    password: 'senha123',
    name: 'Novo Funcionário',
    role: 'employee',
    positionId: 'position-uuid',
    departmentId: 'department-uuid'
  })
});

const newUser = await createUserResponse.json();

// Atualizar perfil do usuário
const updateProfileResponse = await fetch(`/api/v1/users/${newUser.id}/profile`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    phone: '(11) 99999-9999',
    address: 'São Paulo, SP',
    birthDate: '1990-01-01',
    hireDate: '2024-01-01'
  })
});
```

### Fluxo de Avaliação de Desempenho

```javascript
// Criar avaliação
const evaluationResponse = await fetch('/api/v1/performance-evaluations', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: 'employee-uuid',
    evaluatorId: 'manager-uuid',
    periodStart: '2024-01-01',
    periodEnd: '2024-06-30',
    overallScore: 8.5,
    goalsAchievement: 9.0,
    technicalSkills: 8.0,
    softSkills: 8.5,
    comments: 'Excelente desempenho no período.'
  })
});

const evaluation = await evaluationResponse.json();

// Submeter avaliação
const submitResponse = await fetch(`/api/v1/performance-evaluations/${evaluation.id}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'submitted'
  })
});
```

### Gestão de Férias

```javascript
// Solicitar férias
const vacationResponse = await fetch('/api/v1/vacations', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    startDate: '2024-07-01',
    endDate: '2024-07-15',
    daysRequested: 15,
    type: 'annual',
    comments: 'Férias de verão'
  })
});

const vacation = await vacationResponse.json();

// Aprovar férias (como manager)
const approveResponse = await fetch(`/api/v1/vacations/${vacation.id}/approve`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    comments: 'Aprovado conforme solicitado'
  })
});
```

## Considerações de Segurança

### Autenticação
- Tokens JWT com expiração configurável
- Refresh tokens para renovação segura
- Logout que invalida tokens

### Autorização
- Controle de acesso baseado em roles (RBAC)
- Verificação de permissões em cada endpoint
- Isolamento de dados por usuário/departamento

### Validação
- Validação rigorosa de todos os inputs
- Sanitização de dados
- Prevenção contra injection attacks

### Rate Limiting
- Limitação de requisições por IP/usuário
- Proteção contra ataques de força bruta
- Throttling de operações sensíveis

## Monitoramento e Logs

### Logs de API
- Todas as requisições são logadas
- Logs estruturados em formato JSON
- Correlation IDs para rastreamento

### Métricas
- Response time por endpoint
- Taxa de erro por endpoint
- Throughput da API
- Uso de recursos

### Health Checks
- Endpoint `/health` para verificação de status
- Verificação de conectividade com banco de dados
- Status de serviços externos

---

*API Reference - Sistema de Gestão de Pessoas*  
*Versão 1.0 - Desenvolvido por Manus AI*

