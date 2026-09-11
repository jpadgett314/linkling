import esbuild from 'esbuild';
import config from './esbuild.config.json' with { type: 'json' };
esbuild.build(config).catch(() => process.exit(1));

