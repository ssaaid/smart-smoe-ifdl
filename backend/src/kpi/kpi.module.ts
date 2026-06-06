import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kpi, KpiMesure } from './entities/kpi.entity';
import { KpiService } from './kpi.service';
import { KpiController } from './kpi.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Kpi, KpiMesure])],
  controllers: [KpiController],
  providers: [KpiService],
  exports: [KpiService],
})
export class KpiModule {}
