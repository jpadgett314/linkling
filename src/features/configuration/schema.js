import { z } from 'zod';

const ConfigFileSchema = z.object({
  libraryDirectory: z.string(),
});

export { ConfigFileSchema };
