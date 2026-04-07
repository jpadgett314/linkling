import { z } from 'zod';

const ConfigFileSchema = z.object({
  collectionDirectory: z.string().optional(),
});

export { ConfigFileSchema };
