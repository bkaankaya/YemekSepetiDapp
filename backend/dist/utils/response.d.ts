import { Response } from 'express';
export declare class ResponseUtils {
    static success<T>(res: Response, data?: T, message?: string, statusCode?: number): Response;
    static error(res: Response, error: string, message?: string, statusCode?: number): Response;
    static badRequest(res: Response, message?: string, validationErrors?: any[]): Response;
    static unauthorized(res: Response, message?: string): Response;
    static forbidden(res: Response, message?: string): Response;
    static notFound(res: Response, message?: string): Response;
    static validationError(res: Response, message?: string, validationErrors?: any[]): Response;
    static rateLimitExceeded(res: Response, retryAfter?: number): Response;
    static paginatedSuccess<T>(res: Response, data: T[], pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    }, message?: string): Response;
    static created<T>(res: Response, data?: T, message?: string): Response;
    static updated<T>(res: Response, data?: T, message?: string): Response;
    static deleted(res: Response, message?: string): Response;
    static noContent(res: Response): Response;
    static fileDownload(res: Response, filePath: string, fileName: string, contentType: string): Response;
    static jsonFile(res: Response, data: any, fileName: string): Response;
}
//# sourceMappingURL=response.d.ts.map