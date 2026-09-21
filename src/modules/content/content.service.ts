import { ApiError } from "../../utils/api-error.js";
import * as contentRepository from "./content.repository.js";
import type { CreateContentInput, ListContentQuery } from "./content.schema.js";

export function registerContent(ownerId: string, input: CreateContentInput) {
  return contentRepository.createContent({
    title: input.title,
    description: input.description,
    type: input.type,
    url: input.url,
    ownerId,
  });
}

export async function getOwnedContentById(ownerId: string, contentId: string) {
  const content = await contentRepository.findContentById(contentId);

  if (!content) {
    throw ApiError.notFound("Content not found");
  }

  if (content.ownerId !== ownerId) {
    // Reveal a 404 rather than a 403 so ownership isn't leaked by status code alone.
    throw ApiError.notFound("Content not found");
  }

  return content;
}

export async function listMyContent(ownerId: string, query: ListContentQuery) {
  const { items, total } = await contentRepository.listContentForOwner({
    ownerId,
    type: query.type,
    page: query.page,
    pageSize: query.pageSize,
  });

  return {
    items,
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize) || 1,
    },
  };
}
