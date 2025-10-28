import Joi from 'joi';
export declare class ValidationUtils {
    static isValidEthereumAddress(address: string): boolean;
    static isValidPrice(price: number): boolean;
    static validatePagination(page: number, limit: number): {
        isValid: boolean;
        errors: string[];
    };
    static isValidEmail(email: string): boolean;
}
export declare const validationSchemas: {
    oraclePriceUpdate: Joi.ObjectSchema<any>;
    oracleBatchUpdate: Joi.ObjectSchema<any>;
    pagination: Joi.ObjectSchema<any>;
};
//# sourceMappingURL=validation.d.ts.map