import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

type ErrorBody = {
  statusCode: number;
  message: string | string[];
  error?: string;
};

function normalizeMessage(message: unknown): string | string[] {
  if (Array.isArray(message)) {
    return message.map((m) => (typeof m === 'string' ? m : String(m)));
  }
  if (typeof message === 'string') {
    return message;
  }
  if (message !== null && typeof message === 'object') {
    return JSON.stringify(message);
  }
  return 'Error';
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let body: ErrorBody;

    if (exception instanceof HttpException) {
      const raw = exception.getResponse();
      if (typeof raw === 'string') {
        body = {
          statusCode: status,
          message: raw,
          error: exception.name,
        };
      } else if (typeof raw === 'object' && raw !== null) {
        const o = raw as Record<string, unknown>;
        const msg = o.message !== undefined ? normalizeMessage(o.message) : exception.message;
        body = {
          statusCode: typeof o.statusCode === 'number' ? o.statusCode : status,
          message: msg,
          error: typeof o.error === 'string' ? o.error : exception.name,
        };
      } else {
        body = {
          statusCode: status,
          message: exception.message,
          error: exception.name,
        };
      }
    } else {
      body = {
        statusCode: status,
        message: 'Internal server error',
        error: 'Internal Server Error',
      };
    }

    res.status(status).json(body);
  }
}
