import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Une erreur interne est survenue';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'object' && 'message' in (exceptionResponse as object)
          ? (exceptionResponse as any).message
          : String(exceptionResponse);
    } else if (exception instanceof Error) {
      // TypeORM / DB errors — log full error, return sanitized message
      this.logger.error(`Unhandled error on ${request.method} ${request.url}: ${exception.message}`, exception.stack);
      if (exception.message?.includes('invalid input syntax for type uuid')) {
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Identifiant invalide — UUID attendu';
      } else if (exception.message?.includes('violates not-null constraint')) {
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Données manquantes obligatoires';
      }
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
