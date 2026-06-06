import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Competency, UserCompetency } from './entities/competency.entity';
import { CompetenciesService } from './competencies.service';
import { CompetenciesController } from './competencies.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Competency, UserCompetency])],
  controllers: [CompetenciesController],
  providers: [CompetenciesService],
  exports: [CompetenciesService],
})
export class CompetenciesModule {}
