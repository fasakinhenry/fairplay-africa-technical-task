import { prisma } from "../../db/prisma.js";
import type { ContentType, Prisma } from "@prisma/client";

export interface CreateContentData {
  title: string;
  description?: string;
  type: ContentType;
  url?: string;
  ownerId: string;
}

export interface ListContentFilters {
  ownerId: string;
  type?: ContentType;
  page: number;
  pageSize: number;
}

export function createContent(data: CreateContentData) {
  return prisma.content.create({ data });
}

export function findContentById(id: string) {
  return prisma.content.findUnique({ where: { id } });
}

export async function listContentForOwner(filters: ListContentFilters) {
  const where: Prisma.ContentWhereInput = {
    ownerId: filters.ownerId,
    ...(filters.type ? { type: filters.type } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.content.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    prisma.content.count({ where }),
  ]);

  return { items, total };
}
