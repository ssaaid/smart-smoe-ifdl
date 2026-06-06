import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SatisfactionSurvey, SurveyResponse } from './entities/survey.entity';
import { SatisfactionService } from './satisfaction.service';
import { SatisfactionController } from './satisfaction.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SatisfactionSurvey, SurveyResponse])],
  controllers: [SatisfactionController],
  providers: [SatisfactionService],
  exports: [SatisfactionService],
})
export class SatisfactionModule {}
