import { Request } from "express";
import { IUser } from "../models/User";

export interface CustomRequest extends Request {
  user?: IUser;
}
