import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kpi } from '../kpi/entities/kpi.entity';
import { Risk } from '../risks/entities/risk.entity';
import { Audit } from '../audits/entities/audit.entity';
import { Finding } from '../findings/entities/finding.entity';
import { CorrectiveAction } from '../corrective-actions/entities/corrective-action.entity';
import { Complaint } from '../complaints/entities/complaint.entity';
import { SatisfactionSurvey } from '../satisfaction/entities/survey.entity';
import { MaturityAssessment } from '../iso-center/entities/iso.entity';
import { User } from '../users/entities/user.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Kpi,
      Risk,
      Audit,
      Finding,
      CorrectiveAction,
      Complaint,
      SatisfactionSurvey,
      MaturityAssessment,
      User,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
