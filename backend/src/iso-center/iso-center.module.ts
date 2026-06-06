import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IsoClause, MaturityAssessment } from './entities/iso.entity';
import { IsoCenterService } from './iso-center.service';
import { IsoCenterController } from './iso-center.controller';

@Module({
  imports: [TypeOrmModule.forFeature([IsoClause, MaturityAssessment])],
  controllers: [IsoCenterController],
  providers: [IsoCenterService],
  exports: [IsoCenterService],
})
export class IsoCenterModule {}
