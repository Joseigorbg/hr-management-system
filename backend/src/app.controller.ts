// src/app.controller.ts
import { Controller, Get, Redirect } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Redirect('/api/docs', 302)
  getRoot() {
    return { url: '/api/docs' };
  }
}