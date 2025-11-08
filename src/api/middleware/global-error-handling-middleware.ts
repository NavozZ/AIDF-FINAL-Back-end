import NotFoundError from "../../domain/errors/not-found-error";
import ValidationError from "../../domain/errors/validation-error";
import UnauthorizedError from "../../domain/errors/unauthorized-error";

import { Request, Response, NextFunction } from "express";

const globalErrorHandlingMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(error);
  if (error instanceof NotFoundError) {
    res.status(error.statusCode).json({
      message: error.message,
    });
  } else if (error instanceof ValidationError) {
    res.status(error.statusCode).json({
      message: error.message,
    });
  } else if (error instanceof UnauthorizedError) {
    res.status(error.statusCode).json({
      message: error.message,
    });
  } else {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export default globalErrorHandlingMiddleware;
