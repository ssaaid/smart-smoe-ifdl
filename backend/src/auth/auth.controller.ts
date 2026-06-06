/**
 * AuthController — REST endpoints for authentication
 * POST /api/v1/auth/login
 * POST /api/v1/auth/register
 * POST /api/v1/auth/refresh
 * POST /api/v1/auth/logout
 * POST /api/v1/auth/change-password
 * GET  /api/v1/auth/me
 */
import {
  Controller, Post, Get, Body, Req, UseGuards,
  HttpCode, HttpStatus, Ip,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** ── Login ─────────────────────────────────────────── */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion utilisateur — retourne JWT' })
  @ApiResponse({ status: 200, description: 'Connexion réussie' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  async login(@Body() dto: LoginDto, @Ip() ip: string) {
    return this.authService.login(dto, ip);
  }

  /** ── Register (Admin only) ──────────────────────────── */
  @Post('register')
  @Roles('admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Créer un utilisateur (Admin seulement)' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /** ── Refresh Token ───────────────────────────────────── */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renouveler le JWT via refresh token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.user_id, dto.refresh_token);
  }

  /** ── Logout ─────────────────────────────────────────── */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Déconnexion — invalide le refresh token' })
  async logout(@CurrentUser() user: any) {
    return this.authService.logout(user.sub);
  }

  /** ── Current User ───────────────────────────────────── */
  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Profil de l\'utilisateur connecté' })
  async me(@CurrentUser() user: any) {
    return { user };
  }

  /** ── Change Password ────────────────────────────────── */
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Changer le mot de passe' })
  async changePassword(
    @CurrentUser() user: any,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.authService.changePassword(user.sub, dto);
    return { message: 'Mot de passe modifié avec succès' };
  }
}
