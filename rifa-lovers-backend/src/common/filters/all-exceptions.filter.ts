import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'

/**
 * Filtro de excepciones global
 * Fase 13 - Hardening
 * 
 * Captura todas las excepciones y devuelve respuestas estandarizadas
 * Oculta detalles de error en producción
 */

interface ErrorResponse {
  statusCode: number
  message: string
  error: string
  timestamp: string
  path: string
  requestId?: string
  // Solo en desarrollo
  stack?: string
  details?: any
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    
    const isProduction = process.env.NODE_ENV === 'production'
    
    // Determinar status code
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR

    // Mensaje seguro para el cliente
    const message = exception instanceof HttpException
      ? exception.message
      : 'Internal server error'

    // Nombre del error
    const error = exception instanceof HttpException
      ? exception.name
      : 'InternalServerError'

    // Construir respuesta
    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: request['requestId'] || crypto.randomUUID(),
    }

    // Agregar detalles solo en desarrollo
    if (!isProduction) {
      if (exception instanceof HttpException) {
        const exceptionResponse = exception.getResponse()
        if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
          errorResponse.details = exceptionResponse
        }
      }
      if (exception instanceof Error) {
        errorResponse.stack = exception.stack
      }
    }

    // Loggear el error
    if (status >= 500) {
      this.logger.error(
        `[${errorResponse.requestId}] ${request.method} ${request.url} - ${status}: ${message}`,
        exception instanceof Error ? exception.stack : undefined
      )
    } else if (status >= 400) {
      this.logger.warn(
        `[${errorResponse.requestId}] ${request.method} ${request.url} - ${status}: ${message}`
      )
    }

    // Enviar respuesta
    response.status(status).json(errorResponse)
  }
}
