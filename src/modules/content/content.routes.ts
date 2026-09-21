import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { contentIdParamsSchema, createContentSchema, listContentQuerySchema } from "./content.schema.js";
import { create, getById, list } from "./content.controller.js";

export const contentRouter = Router();

contentRouter.use(requireAuth);

contentRouter.post("/", validate({ body: createContentSchema }), create);
contentRouter.get("/", validate({ query: listContentQuerySchema }), list);
contentRouter.get("/:id", validate({ params: contentIdParamsSchema }), getById);
