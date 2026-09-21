import type { ParamsDictionary } from "express-serve-static-core";
import type { Response } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { loginUser, registerUser } from "./auth.service.js";
import type { LoginInput, RegisterInput } from "./auth.schema.js";
import type { TypedRequest } from "../../types/http.js";

export const register = asyncHandler(async (req: TypedRequest<ParamsDictionary, RegisterInput>, res: Response) => {
  const result = await registerUser(req.body);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req: TypedRequest<ParamsDictionary, LoginInput>, res: Response) => {
  const result = await loginUser(req.body);
  res.status(200).json(result);
});
