
   import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
   import { PrismaClient } from '@prisma/client';

   @Injectable()
   export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
     constructor() {
       super({
         log: [
           { emit: 'stdout', level: 'query' },
           { emit: 'stdout', level: 'info' },
           { emit: 'stdout', level: 'warn' },
           { emit: 'stdout', level: 'error' },
         ],
         errorFormat: 'pretty',
       });
     }

     async onModuleInit() {
       try {
         await this.$connect();
         console.log('Prisma connected to database');
       } catch (error) {
         console.error('Prisma connection error:', error);
         throw error;
       }
     }

     async onModuleDestroy() {
       await this.$disconnect();
       console.log('Prisma disconnected from database');
     }
   }
