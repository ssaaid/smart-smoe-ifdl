/**
 * AuthService — Core authentication logic
 * JWT generation, validation, password hashing, refresh tokens
 */
import {
  Injectable, UnauthorizedException, BadRequestException,
  ConflictException, Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { AuditTrail } from '../common/entities/audit-trail.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  nom: string;
  prenom: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: Partial<User>;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SALT_ROUNDS = 12;

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(AuditTrail)
    private readonly auditRepo: Repository<AuditTrail>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  /** Validate user credentials (used by LocalStrategy) */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepo
      .createQueryBuilder('u')
      .addSelect('u.password_hash')
      .where('u.email = :email AND u.is_active = true', { email: email.toLowerCase() })
      .getOne();
    if (!user) return null;
    const isMatch = await bcrypt.compare(password, user.password_hash);
    return isMatch ? user : null;
  }

  /** Login — returns JWT access + refresh tokens */
  async login(dto: LoginDto, ip?: string): Promise<AuthTokens> {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const tokens = await this.generateTokens(user);

    // Store hashed refresh token
    const hashedRefresh = await bcrypt.hash(tokens.refresh_token, 10);
    await this.userRepo.update(user.id, {
      refresh_token: hashedRefresh,
      last_login: new Date(),
    });

    // Audit trail
    await this.logAudit(user.id, 'LOGIN', 'auth', null, ip);

    this.logger.log(`User ${user.email} logged in from ${ip}`);
    return tokens;
  }

  /** Register new user (admin only in production) */
  async register(dto: RegisterDto): Promise<AuthTokens> {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    const password_hash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
    const user = this.userRepo.create({
      ...dto,
      email: dto.email.toLowerCase(),
      password_hash,
    });
    const saved = await this.userRepo.save(user);
    return this.generateTokens(saved);
  }

  /** Refresh access token using refresh token */
  async refreshTokens(userId: string, refreshToken: string): Promise<AuthTokens> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || !user.refresh_token) {
      throw new UnauthorizedException('Accès refusé');
    }
    const isMatch = await bcrypt.compare(refreshToken, user.refresh_token);
    if (!isMatch) throw new UnauthorizedException('Refresh token invalide');

    const tokens = await this.generateTokens(user);
    const hashedRefresh = await bcrypt.hash(tokens.refresh_token, 10);
    await this.userRepo.update(userId, { refresh_token: hashedRefresh });
    return tokens;
  }

  /** Logout — invalidate refresh token */
  async logout(userId: string): Promise<void> {
    await this.userRepo.update(userId, { refresh_token: null });
    await this.logAudit(userId, 'LOGOUT', 'auth');
  }

  /** Change password */
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('Utilisateur non trouvé');

    const isMatch = await bcrypt.compare(dto.current_password, user.password_hash);
    if (!isMatch) throw new BadRequestException('Mot de passe actuel incorrect');

    const password_hash = await bcrypt.hash(dto.new_password, this.SALT_ROUNDS);
    await this.userRepo.update(userId, { password_hash });
    await this.logAudit(userId, 'PASSWORD_CHANGE', 'auth');
  }

  /** Generate access + refresh JWT tokens */
  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      nom: user.nom,
      prenom: user.prenom,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN', '8h'),
      }),
      this.jwtService.signAsync(
        { sub: user.id },
        {
          secret: this.config.get('JWT_REFRESH_SECRET', 'smoe-refresh-secret'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      access_token,
      refresh_token,
      expires_in: 8 * 3600, // 8 hours in seconds
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        departement: user.departement,
      },
    };
  }

  private async logAudit(
    userId: string,
    action: string,
    entityType: string,
    entityId?: string,
    ip?: string,
  ): Promise<void> {
    await this.auditRepo.save({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      ip_address: ip,
    });
  }
}
