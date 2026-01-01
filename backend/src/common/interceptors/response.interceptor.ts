import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  private readonly logger = new Logger('ResponseInterceptor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Attach requestId to request for logging
    request.requestId = requestId;

    const startTime = Date.now();

    return next.handle().pipe(
      map((data) => {
        const duration = Date.now() - startTime;

        // Format response
        const response: ApiResponse<any> = {
          success: true,
          data,
          meta: {
            timestamp: new Date().toISOString(),
            requestId,
          },
        };

        // Add pagination metadata if present
        if (data && typeof data === 'object' && 'pagination' in data) {
          response.meta!.pagination = data.pagination;
          delete data.pagination;
        }

        // Log successful response
        this.logResponse(request, requestId, 200, duration);

        return response;
      })
    );
  }

  private logResponse(request: any, requestId: string, statusCode: number, duration: number) {
    const logMessage = {
      requestId,
      method: request.method,
      path: request.path,
      statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    };

    if (duration > 5000) {
      this.logger.warn(`Slow response: ${JSON.stringify(logMessage)}`);
    }
  }
}
