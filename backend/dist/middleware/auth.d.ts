import { Request, Response, NextFunction } from 'express';
export declare const authenticateApiKey: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const rateLimitMiddleware: import("express-rate-limit").RateLimitRequestHandler;
export declare const corsMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const requestLoggingMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const errorHandlerMiddleware: (error: Error, req: Request, res: Response, next: NextFunction) => void;
export declare const notFoundMiddleware: (req: Request, res: Response) => void;
//# sourceMappingURL=auth.d.ts.map