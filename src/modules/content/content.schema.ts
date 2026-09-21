import { z } from "zod";

export const contentTypeEnum = z.enum(["ARTICLE", "VIDEO", "IMAGE", "AUDIO", "OTHER"]);

export const createContentSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(2000).optional(),
  type: contentTypeEnum.default("OTHER"),
  url: z.string().trim().url("Must be a valid URL").optional(),
});

export const contentIdParamsSchema = z.object({
  id: z.string().uuid("Must be a valid content id"),
});

export const listContentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  type: contentTypeEnum.optional(),
});

export type CreateContentInput = z.infer<typeof createContentSchema>;
export type ContentIdParams = z.infer<typeof contentIdParamsSchema>;
export type ListContentQuery = z.infer<typeof listContentQuerySchema>;
