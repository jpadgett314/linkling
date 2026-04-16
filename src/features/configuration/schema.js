import { z } from 'zod';

const ConfigFileSchema = z.object({
  libraryDirectory: z.string(),
  port: z.number(),
});

export { ConfigFileSchema };
