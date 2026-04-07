import { z } from 'zod';

const BookmarkDataSchema = z.object({
  name: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
});

const CollectionDocSchema = z.object({
  id: z.number(),
  name: z.string(),
  version: z.number(),
  bookmarks: z.record(z.string(), BookmarkDataSchema),
});

export { BookmarkDataSchema, CollectionDocSchema }; 
