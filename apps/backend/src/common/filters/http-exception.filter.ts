import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

type ErrorBody = {
  statusCode: number;
  message: string | string[];
  error?: string;
};

const log = new Logger('HTTP');

const MAX_STACK_LEN = 4000;

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

function messageForLog(exception: unknown, body: ErrorBody): string {
  const m = body.message;
  if (Array.isArray(m)) {
    return m.join('; ');
  }
  return m;
}

function stackForLog(exception: unknown, statusCode: number): string | undefined {
  if (statusCode < 500) {
    return undefined;
  }
  if (exception instanceof Error && exception.stack) {
    return exception.stack.length > MAX_STACK_LEN
      ? `${exception.stack.slice(0, MAX_STACK_LEN)}…`
      : exception.stack;
  }
  return undefined;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const res = http.getResponse<Response>();
    const req = http.getRequest<Request>();

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

    const logPayload: Record<string, unknown> = {
      level: 'error',
      type: 'http_error',
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      url: req.originalUrl,
      statusCode: body.statusCode,
      message: messageForLog(exception, body),
    };

    const stack = stackForLog(exception, body.statusCode);
    if (stack) {
      logPayload.stack = stack;
    }

    log.error(JSON.stringify(logPayload));

    res.status(status).json(body);
  }
}
