import { z } from 'zod.js';

const BookmarkTypeEnum = z.union([z.literal(1), z.literal(2)]);

const baseNodeSchema = z.object({
  guid: z.string(),
  title: z.string(),
  index: z.number(),
  dateAdded: z.number(),
  lastModified: z.number(),
  id: z.number(),
  typeCode: BookmarkTypeEnum,
  type: z.string(),
  root: z.string().optional(),
});

const bookmarkSchema = baseNodeSchema.extend({
  typeCode: z.literal(1),
  uri: z.string(),
  iconUri: z.string().optional(),
  tags: z.string().optional(),
});

const folderSchema = baseNodeSchema.extend({
  typeCode: z.literal(2),
  children: z.lazy(
    () => z.array(
      z.union([bookmarkSchema, folderSchema])
    )
  ).optional(),
});

export const FirefoxBookmarkBackupSchema = folderSchema;
