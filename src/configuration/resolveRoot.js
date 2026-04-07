import path from 'node:path';

function resolveDataRoot() {
  if (process.env.LINKLING_DATA_DIR) {
    return path.resolve(process.env.LINKLING_DATA_DIR);
  }
  return path.resolve(process.cwd());
}

export { resolveDataRoot };
