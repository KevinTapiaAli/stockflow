import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);
  catch(error: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    let status = 500;
    let message: string | string[] = 'Error interno del servidor.';
    if (error instanceof HttpException) {
      status = error.getStatus();
      const body = error.getResponse();
      message = typeof body === 'string' ? body : (body as { message?: string | string[] }).message ?? error.message;
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') { status = 409; message = 'Ya existe un registro con ese nombre o SKU.'; }
      if (error.code === 'P2003') { status = 409; message = 'La relación no existe o el registro tiene datos asociados.'; }
      if (error.code === 'P2025') { status = 404; message = 'Registro no encontrado.'; }
      if (['P2004', 'P2020'].includes(error.code)) { status = 409; message = 'La operación excede los límites de integridad o capacidad.'; }
    }
    const requestId = response.getHeader('X-Request-ID')?.toString();
    if (status >= 500) this.logger.error({ requestId, path: request.path, error: error instanceof Error ? error.stack : String(error) });
    response.status(status).json({ statusCode: status, message, path: request.path, timestamp: new Date().toISOString(), requestId });
  }
}
