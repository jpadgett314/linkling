import { z } from 'zod';

const BookmarkDataSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const BookmarkSchema = BookmarkDataSchema.extend({
  url: z.string(),
});

const CollectionDocSchema = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string(),
  version: z.number(),
  bookmarks: z.record(z.string(), BookmarkDataSchema),
});

export { BookmarkDataSchema, BookmarkSchema, CollectionDocSchema };
