import { NextFunction, Request, Response } from "express";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
    console.error(err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(500).json({ message: "Erro interno do servidor" });
}
