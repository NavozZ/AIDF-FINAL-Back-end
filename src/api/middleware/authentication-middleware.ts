import UnauthorizedError from "../../domain/errors/unauthorized-error";
import { Request, Response, NextFunction } from "express";

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const authData = req.auth();
  if (!authData.isAuthenticated) {
    throw new UnauthorizedError("Unauthorized");
  }
  next();
};

export default isAuthenticated;
