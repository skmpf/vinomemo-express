import { Request } from "express";
import { IUser } from "../api/user/user.model";

export interface CustomRequest extends Request {
  user?: IUser;
}
