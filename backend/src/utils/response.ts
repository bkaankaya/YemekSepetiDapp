import { Response } from 'express';
import { HTTP_MESSAGES } from '../constants/index.js';

export class ResponseUtils {
  // Success response
  static success<T>(
    res: Response, 
    data?: T, 
    message?: string, 
    statusCode: number = 200
  ): Response {
    return res.status(statusCode).json({
      success: true,
      data,
      message: message || HTTP_MESSAGES.SUCCESS,
      timestamp: new Date().toISOString()
    });
  }

  // Success response with metadata (pagination, etc.)
  static successWithMetadata<T>(
    res: Response, 
    data?: T, 
    message?: string, 
    metadata?: any,
    statusCode: number = 200
  ): Response {
    return res.status(statusCode).json({
      success: true,
      data,
      message: message || HTTP_MESSAGES.SUCCESS,
      metadata,
      timestamp: new Date().toISOString()
    });
  }

  // Error response
  static error(
    res: Response, 
    error: string, 
    message?: string, 
    statusCode: number = 500
  ): Response {
    return res.status(statusCode).json({
      success: false,
      error,
      message: message || HTTP_MESSAGES.INTERNAL_ERROR,
      timestamp: new Date().toISOString()
    });
  }

  // Bad request response
  static badRequest(
    res: Response, 
    message?: string, 
    validationErrors?: any[]
  ): Response {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: message || HTTP_MESSAGES.BAD_REQUEST,
      validationErrors,
      timestamp: new Date().toISOString()
    });
  }

  // Unauthorized response
  static unauthorized(
    res: Response, 
    message?: string
  ): Response {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: message || HTTP_MESSAGES.UNAUTHORIZED,
      timestamp: new Date().toISOString()
    });
  }

  // Forbidden response
  static forbidden(
    res: Response, 
    message?: string
  ): Response {
    return res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: message || HTTP_MESSAGES.FORBIDDEN,
      timestamp: new Date().toISOString()
    });
  }

  // Not found response
  static notFound(
    res: Response, 
    message?: string
  ): Response {
    return res.status(404).json({
      success: false,
      error: 'Not Found',
      message: message || HTTP_MESSAGES.NOT_FOUND,
      timestamp: new Date().toISOString()
    });
  }

  // Validation error response
  static validationError(
    res: Response, 
    message?: string, 
    validationErrors?: any[]
  ): Response {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: message || HTTP_MESSAGES.VALIDATION_ERROR,
      validationErrors,
      timestamp: new Date().toISOString()
    });
  }

  // Rate limit exceeded response
  static rateLimitExceeded(
    res: Response, 
    retryAfter?: number
  ): Response {
    return res.status(429).json({
      success: false,
      error: 'Too Many Requests',
      message: HTTP_MESSAGES.RATE_LIMIT_EXCEEDED,
      retryAfter,
      timestamp: new Date().toISOString()
    });
  }

  // Paginated success response
  static paginatedSuccess<T>(
    res: Response,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    },
    message?: string
  ): Response {
    return res.status(200).json({
      success: true,
      data,
      message: message || HTTP_MESSAGES.SUCCESS,
      pagination,
      timestamp: new Date().toISOString()
    });
  }

  // Created response
  static created<T>(
    res: Response, 
    data?: T, 
    message?: string
  ): Response {
    return this.success(res, data, message || HTTP_MESSAGES.CREATED, 201);
  }

  // Updated response
  static updated<T>(
    res: Response, 
    data?: T, 
    message?: string
  ): Response {
    return this.success(res, data, message || HTTP_MESSAGES.UPDATED, 200);
  }

  // Deleted response
  static deleted(
    res: Response, 
    message?: string
  ): Response {
    return this.success(res, undefined, message || HTTP_MESSAGES.DELETED, 200);
  }

  // No content response
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  // File download response
  static fileDownload(
    res: Response,
    filePath: string,
    fileName: string,
    contentType: string
  ): Response {
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.download(filePath);
    return res;
  }

  // JSON file response
  static jsonFile(
    res: Response,
    data: any,
    fileName: string
  ): Response {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.json(data);
  }
}
