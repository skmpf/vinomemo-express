import { NextFunction, Request, Response } from "express";

export class ExpressError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const errorHandler = (
  error: ExpressError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(error);
  const errorStatus = error.status || 500;
  const errorMessage = error.message || "Internal Server Error";
  res.status(errorStatus).send({
    success: false,
    status: errorStatus,
    message: errorMessage,
    stack: process.env.NODE_ENV === "development" ? error.stack : {},
  });
  next();
};
