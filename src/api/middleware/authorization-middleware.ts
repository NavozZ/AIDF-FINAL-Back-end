// navozz/aidf-final-back-end/.../src/api/middleware/authorization-middleware.ts

import { RequestHandler } from 'express';
import { getAuth } from '@clerk/express';
import ForbiddenError from '../../domain/errors/forbidden-error';

// Middleware to restrict access to users with 'admin' role
const authorizationMiddleware: RequestHandler = (req, res, next) => {
  // Get authenticated user's claim data
  const auth = getAuth(req);

  // Check authentication
  if (!auth.userId || !auth.sessionClaims) {
    return next(new ForbiddenError("Access denied: Not authenticated."));
  }

  // Extract 'role' from custom metadata
  const userRole = auth.sessionClaims.metadata?.role;

  // Check for 'admin' role
  if (userRole !== 'admin') {
    return next(new ForbiddenError("Access denied: Insufficient permissions."));
  }

  // Proceed if admin
  next();
};

export default authorizationMiddleware;
