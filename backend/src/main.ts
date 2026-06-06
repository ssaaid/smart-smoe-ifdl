/**
 * SMART SMOE IFDL — Backend Entry Point
 * NestJS Application Bootstrap
 * ISO 21001 · ESEF Berrechid · Université Hassan 1er
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as helmet from 'helmet';
import * as compression from 'compression';
import * as morgan from 'morgan';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  // ── Security Headers (OWASP) ──────────────────────────────
  app.use(helmet.default({
    contentSecurityPolicy: nodeEnv === 'production',
    crossOriginEmbedderPolicy: nodeEnv === 'production',
  }));

  // ── Compression ───────────────────────────────────────────
  app.use(compression());

  // ── HTTP Logging ──────────────────────────────────────────
  app.use(morgan(nodeEnv === 'production' ? 'combined' : 'dev'));

  // ── CORS ─────────────────────────────────────────────────
  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
  app.enableCors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origin === frontendUrl ||
        origin.endsWith('.onrender.com') ||
        origin.startsWith('http://localhost')
      ) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  });

  // ── Global Prefix ─────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ── Global Pipes (Validation) ─────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Global Filters ────────────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());

  // ── Global Interceptors ───────────────────────────────────
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // ── Swagger API Documentation ─────────────────────────────
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('SMART SMOE IFDL API')
      .setDescription(
        'API REST complète pour la plateforme de management ISO 21001\n' +
        'ESEF Berrechid · Université Hassan 1er · Master IFDL'
      )
      .setVersion('1.0.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'access-token',
      )
      .addTag('Auth', 'Authentification & Autorisation JWT/RBAC')
      .addTag('Dashboard', 'Tableaux de bord exécutifs')
      .addTag('Processes', 'Cartographie des processus SMOE')
      .addTag('Documents', 'Gestion documentaire GED')
      .addTag('KPIs', 'Indicateurs de performance')
      .addTag('Risks', 'Gestion des risques et opportunités')
      .addTag('Audits', 'Programme et gestion des audits')
      .addTag('Findings', 'Constats et non-conformités')
      .addTag('Actions', 'Actions correctives et préventives')
      .addTag('Complaints', 'Réclamations et recours')
      .addTag('Satisfaction', 'Enquêtes de satisfaction')
      .addTag('Trainings', 'Formations et compétences')
      .addTag('Reports', 'Rapports et revue de direction')
      .addTag('ISO Center', 'Centre d\'excellence ISO 21001')
      .addTag('Notifications', 'Système de notifications')
      .addTag('Users', 'Gestion des utilisateurs')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
      customSiteTitle: 'SMART SMOE IFDL — API Docs',
    });
  }

  await app.listen(port);
  logger.log(`🚀 SMART SMOE IFDL Backend running on http://localhost:${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  logger.log(`🌍 Environment: ${nodeEnv}`);
}

bootstrap();
