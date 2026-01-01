import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    timestamp: string;
    path: string;
    requestId?: string;
  };
  details?: any;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('GlobalExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = this.generateRequestId();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';
    let details: any = {};

    // Handle Prisma errors
    if (this.isPrismaError(exception)) {
      const { status: prismaStatus, errorCode: code, message: msg } = this.handlePrismaError(exception);
      status = prismaStatus;
      errorCode = code;
      message = msg;
    }
    // Handle validation errors
    else if (this.isValidationError(exception)) {
      const { statusCode, message: msg, errors } = this.handleValidationError(exception);
      status = statusCode;
      errorCode = 'VALIDATION_ERROR';
      message = msg;
      details = errors;
    }
    // Handle HTTP exceptions
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object') {
        const exObj = exceptionResponse as any;
        message = exObj.message || exception.message;
        errorCode = exObj.error || this.getErrorCode(status);
        details = exObj.details || {};
      } else {
        message = exceptionResponse as string;
        errorCode = this.getErrorCode(status);
      }
    }
    // Handle other errors
    else if (exception instanceof Error) {
      message = exception.message;
      errorCode = this.classifyError(exception.message);
      
      // Log stack trace for debugging
      this.logger.error(`Stack: ${exception.stack}`, 'GlobalExceptionFilter');
    }

    // Log the error
    this.logError(
      requestId,
      status,
      errorCode,
      message,
      request,
      exception
    );

    // Send error response
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: errorCode,
        message,
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId,
      },
      details: Object.keys(details).length > 0 ? details : undefined,
    };

    response.status(status).json(errorResponse);
  }

  private isPrismaError(exception: unknown): boolean {
    const error = exception as any;
    return error?.name?.includes('Prisma') || error?.code?.startsWith('P');
  }

  private handlePrismaError(exception: any) {
    const code = exception.code;

    switch (code) {
      case 'P2002': // Unique constraint violation
        return {
          status: HttpStatus.CONFLICT,
          errorCode: 'DUPLICATE_ENTRY',
          message: `A record with this ${exception.meta?.target?.[0] || 'field'} already exists`,
        };
      case 'P2025': // Record not found
        return {
          status: HttpStatus.NOT_FOUND,
          errorCode: 'NOT_FOUND',
          message: 'The requested resource was not found',
        };
      case 'P2003': // Foreign key constraint
        return {
          status: HttpStatus.BAD_REQUEST,
          errorCode: 'INVALID_REFERENCE',
          message: 'Invalid reference to related record',
        };
      case 'P2014': // Required relation violation
        return {
          status: HttpStatus.BAD_REQUEST,
          errorCode: 'MISSING_REQUIRED_FIELD',
          message: 'Missing required related data',
        };
      case 'P2011': // Null constraint violation
        return {
          status: HttpStatus.BAD_REQUEST,
          errorCode: 'NULL_CONSTRAINT_VIOLATION',
          message: 'This field cannot be null',
        };
      default:
        return {
          status: HttpStatus.BAD_REQUEST,
          errorCode: 'DATABASE_ERROR',
          message: 'A database error occurred',
        };
    }
  }

  private isValidationError(exception: unknown): boolean {
    const error = exception as any;
    return error?.message?.includes('ValidationException') ||
           error?.getStatus?.() === HttpStatus.BAD_REQUEST &&
           error?.getResponse?.()?.message?.includes('validation');
  }

  private handleValidationError(exception: any) {
    const exceptionResponse = exception.getResponse?.() as any;
    const errors = exceptionResponse?.message || [];

    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Validation failed',
      errors: Array.isArray(errors) ? errors : [errors],
    };
  }

  private getErrorCode(status: number): string {
    const codeMap: { [key: number]: string } = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
      503: 'SERVICE_UNAVAILABLE',
    };
    return codeMap[status] || 'ERROR';
  }

  private classifyError(message: string): string {
    if (message.includes('not found')) return 'NOT_FOUND';
    if (message.includes('unauthorized') || message.includes('invalid token')) return 'UNAUTHORIZED';
    if (message.includes('validation') || message.includes('invalid')) return 'VALIDATION_ERROR';
    if (message.includes('timeout')) return 'TIMEOUT';
    if (message.includes('network')) return 'NETWORK_ERROR';
    return 'INTERNAL_SERVER_ERROR';
  }

  private logError(
    requestId: string,
    status: number,
    errorCode: string,
    message: string,
    request: Request,
    exception: unknown
  ) {
    const logLevel = status >= 500 ? 'error' : 'warn';
    const logger = this.logger;

    const logMessage = {
      requestId,
      timestamp: new Date().toISOString(),
      method: request.method,
      path: request.path,
      status,
      errorCode,
      message,
      userAgent: request.get('user-agent'),
      ip: request.ip,
    };

    if (logLevel === 'error') {
      logger.error(JSON.stringify(logMessage), exception instanceof Error ? exception.stack : '');
    } else {
      logger.warn(JSON.stringify(logMessage));
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
