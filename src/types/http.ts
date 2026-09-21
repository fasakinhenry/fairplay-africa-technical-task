import type { ParamsDictionary } from "express-serve-static-core";
import type { Request } from "express";

/** A Request typed with concrete route params and/or a validated body shape. */
export type TypedRequest<Params extends ParamsDictionary = ParamsDictionary, Body = unknown> = Request<
  Params,
  unknown,
  Body
>;
