import { Module } from '@nestjs/common';
import { PerformanceEvaluationsService } from './performance-evaluations.service';
import { PerformanceEvaluationsController } from './performance-evaluations.controller';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PerformanceEvaluationsController],
  providers: [PerformanceEvaluationsService],
  exports: [PerformanceEvaluationsService],
})
export class PerformanceEvaluationsModule {}

