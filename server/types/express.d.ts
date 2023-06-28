import { Request } from "express";
import { IUser } from "../api/users/user.model";

export interface CustomRequest extends Request {
  user?: IUser;
}
