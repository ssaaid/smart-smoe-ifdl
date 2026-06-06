/**
 * AppModule — Root Module
 * Registers all feature modules, global config, database, guards
 */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';

// Feature Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ProcessesModule } from './processes/processes.module';
import { DocumentsModule } from './documents/documents.module';
import { KpiModule } from './kpi/kpi.module';
import { RisksModule } from './risks/risks.module';
import { AuditsModule } from './audits/audits.module';
import { FindingsModule } from './findings/findings.module';
import { CorrectiveActionsModule } from './corrective-actions/corrective-actions.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { SatisfactionModule } from './satisfaction/satisfaction.module';
import { TrainingsModule } from './trainings/trainings.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';
import { IsoCenterModule } from './iso-center/iso-center.module';
import { CompetenciesModule } from './competencies/competencies.module';
import { HealthModule } from './health/health.module';

// Guards
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

// Entities
import { User } from './users/entities/user.entity';
import { Role } from './roles/entities/role.entity';
import { Process } from './processes/entities/process.entity';
import { Document } from './documents/entities/document.entity';
import { Kpi, KpiMesure } from './kpi/entities/kpi.entity';
import { Risk } from './risks/entities/risk.entity';
import { Audit } from './audits/entities/audit.entity';
import { Finding } from './findings/entities/finding.entity';
import { CorrectiveAction } from './corrective-actions/entities/corrective-action.entity';
import { Complaint } from './complaints/entities/complaint.entity';
import { SatisfactionSurvey, SurveyResponse } from './satisfaction/entities/survey.entity';
import { Training } from './trainings/entities/training.entity';
import { Competency, UserCompetency } from './competencies/entities/competency.entity';
import { Report } from './reports/entities/report.entity';
import { Notification } from './notifications/entities/notification.entity';
import { IsoClause, MaturityAssessment } from './iso-center/entities/iso.entity';
import { AuditTrail } from './common/entities/audit-trail.entity';

@Module({
  imports: [
    // ── Configuration ──────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // ── Rate Limiting (OWASP) ──────────────────────────────
    ThrottlerModule.forRoot([
      { name: 'short',  ttl: 1000,  limit: 20  },
      { name: 'medium', ttl: 10000, limit: 100 },
      { name: 'long',   ttl: 60000, limit: 300 },
    ]),

    // ── Cache ──────────────────────────────────────────────
    CacheModule.register({ isGlobal: true, ttl: 60000, max: 100 }),

    // ── Database ───────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        const databaseUrl = config.get<string>('DATABASE_URL');
        const isProd = config.get('NODE_ENV') === 'production';
        const shared = {
          entities: [
            User, Role, Process, Document,
            Kpi, KpiMesure, Risk, Audit, Finding,
            CorrectiveAction, Complaint,
            SatisfactionSurvey, SurveyResponse,
            Training, Competency, UserCompetency,
            Report, Notification,
            IsoClause, MaturityAssessment, AuditTrail,
          ],
          synchronize: !isProd,
          logging: !isProd,
          ssl: isProd ? { rejectUnauthorized: false } : false,
        };
        if (databaseUrl) {
          return { type: 'postgres', url: databaseUrl, ...shared };
        }
        return {
          type: 'postgres',
          host:     config.get<string>('DB_HOST', 'localhost'),
          port:     config.get<number>('DB_PORT', 5432),
          username: config.get<string>('DB_USER', 'smoe_user'),
          password: config.get<string>('DB_PASSWORD', 'smoe_password'),
          database: config.get<string>('DB_NAME', 'smoe_ifdl'),
          ...shared,
        };
      },
      inject: [ConfigService],
    }),

    // ── Feature Modules ────────────────────────────────────
    AuthModule,
    UsersModule,
    DashboardModule,
    ProcessesModule,
    DocumentsModule,
    KpiModule,
    RisksModule,
    AuditsModule,
    FindingsModule,
    CorrectiveActionsModule,
    ComplaintsModule,
    SatisfactionModule,
    TrainingsModule,
    CompetenciesModule,
    ReportsModule,
    NotificationsModule,
    IsoCenterModule,
    HealthModule,
  ],
  providers: [
    // Global JWT guard — all routes protected by default
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Global Roles guard
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
