import type { ParamsDictionary } from "express-serve-static-core";
import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import * as contentService from "./content.service.js";
import type { ContentIdParams, CreateContentInput, ListContentQuery } from "./content.schema.js";
import { ApiError } from "../../utils/api-error.js";
import type { TypedRequest } from "../../types/http.js";

function requireUserId(req: Request): string {
  if (!req.user) {
    throw ApiError.unauthorized();
  }
  return req.user.sub;
}

export const create = asyncHandler(async (req: TypedRequest<ParamsDictionary, CreateContentInput>, res: Response) => {
  const ownerId = requireUserId(req);
  const content = await contentService.registerContent(ownerId, req.body);
  res.status(201).json({ content });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = requireUserId(req);
  const query = req.query as unknown as ListContentQuery;
  const result = await contentService.listMyContent(ownerId, query);
  res.status(200).json(result);
});

export const getById = asyncHandler(async (req: TypedRequest<ContentIdParams>, res: Response) => {
  const ownerId = requireUserId(req);
  const content = await contentService.getOwnedContentById(ownerId, req.params.id);
  res.status(200).json({ content });
});
