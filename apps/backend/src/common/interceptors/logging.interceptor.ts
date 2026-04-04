import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

/**
 * Emits one JSON log line per successful HTTP response (stdout).
 * Errors are logged by HttpExceptionFilter; failed requests do not hit this tap.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - start;
        const statusCode = res.statusCode ?? 200;
        const payload = {
          level: 'info',
          type: 'http_request',
          timestamp: new Date().toISOString(),
          method: req.method,
          path: req.path,
          url: req.originalUrl,
          statusCode,
          durationMs,
        };
        this.logger.log(JSON.stringify(payload));
      }),
    );
  }
}
