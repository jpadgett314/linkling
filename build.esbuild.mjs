import esbuild from 'esbuild';
import config from './config.esbuild.json' with { type: 'json' };
esbuild.build(config).catch(() => process.exit(1));

