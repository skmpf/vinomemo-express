import { NextFunction, Request, Response } from "express";
import * as Yup from "yup";

export const validateSchema = (schema: Yup.ObjectSchema<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate(req.body);
      next();
    } catch (error: unknown) {
      res.status(400).send(error);
    }
  };
};
