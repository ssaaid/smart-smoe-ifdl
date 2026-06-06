/**
 * Auth Module — JWT Authentication + RBAC
 * Handles login, register, token refresh, password reset
 */

// ── auth.module.ts ────────────────────────────────────────────
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { User } from '../users/entities/user.entity';
import { AuditTrail } from '../common/entities/audit-trail.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, AuditTrail]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET', 'smoe-super-secret-key-2024'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', '8h') },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}

// ── auth.controller.ts ────────────────────────────────────────
// (inlined here for single file delivery)

// ── auth.service.ts ──────────────────────────────────────────
