export class AppError extends Error {
    public readonly code: string;
    public readonly statusCode: number;

    constructor(message: string, code: string, statusCode: number) {
        super(message);
        this.name = this.constructor.name; // To differentiate (eg: when NotFoundError subclass throws an error the name will be "NotFoundError")
        this.code = code;
        this.statusCode = statusCode;

        // Maintaining stack trace (only works in V8 engine browsers ignored silently in others)
        Error.captureStackTrace(this, this.constructor);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = "Resource not found") {
        super(message, "NOT_FOUND", 404);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = "Unauthorized") {
        super(message, "UNAUTHORIZED", 401);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = "Forbidden") {
        super(message, "FORBIDDEN", 403);
    }
}

export class ConflictError extends AppError {
    constructor(message: string = "Conflict Error", code: string = "CONFLICT") {
        super(message, code, 409);
    }
}

export class ValidationError extends AppError {
    public readonly details: { field: string, message: string }[];

    constructor(message: string = "Validation Failed", details: { field: string, message: string }[] = []) {
        super(message, "VALIDATION_ERROR", 422);
        this.details = details
    }
}