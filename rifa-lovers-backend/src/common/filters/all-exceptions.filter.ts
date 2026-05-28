import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus ,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { Prisma } from '@prisma/client'

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
  details?: Record<string, unknown>
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    
    const isProduction = process.env.NODE_ENV === 'production'
    
    // Determinar status code y mensaje
    let status: number
    let message: string
    let error: string

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      message = exception.message
      error = exception.name
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle Prisma unique constraint errors as 409 Conflict
      if (exception.code === 'P2002') {
        const fields = (exception.meta?.target as string[])?.join(', ') || 'campo'
        status = HttpStatus.CONFLICT
        message = `Ya existe un registro con ese ${fields}. Intenta con otro valor.`
        error = 'ConflictError'
      } else {
        status = HttpStatus.INTERNAL_SERVER_ERROR
        message = 'Error de base de datos. Intenta más tarde.'
        error = 'DatabaseError'
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR
      message = 'Internal server error'
      error = 'InternalServerError'
    }

    // Construir respuesta
    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: (request['requestId'] as string | undefined) || crypto.randomUUID(),
    }

    // Agregar detalles solo en desarrollo
    if (!isProduction) {
      if (exception instanceof HttpException) {
        const exceptionResponse = exception.getResponse()
        if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
          errorResponse.details = exceptionResponse as Record<string, unknown>
        }
      }
      if (exception instanceof Error) {
        errorResponse.stack = exception.stack
      }
    }

    // Loggear el error
    if (status >= 500) {
    } else if (status >= 400) {
    }

    // Enviar respuesta
    response.status(status).json(errorResponse)
  }
}
