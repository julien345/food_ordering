import { AppError } from "./AppError";

export class NotFoundError extends AppError {
  constructor(message: string = "Ressource introuvable.") {
    super(message, 404);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Accès refusé.") {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Conflit avec l'état actuel de la ressource.") {
    super(message, 409);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = "Requête invalide.") {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Non authentifié.") {
    super(message, 401);
  }
}

export { AppError };