import path from 'node:path';
import fs from 'node:fs/promises';
import writeFileAtomic from 'write-file-atomic';
import { ConfigFileSchema } from './schema.js';
import { resolveDataRoot } from './resolveRoot.js';
import DEFAULT_CONFIG from './defaultConfig.json' with { type: 'json' };

class ConfigurationRegistry {
  constructor() {
    /** @type {Object<string, string>} */
    this._config = null;
    /** @type {string} */
    this._configPath = null;
  }

  /**
   * Initialize service before querying configuration.
   */
  async init() {
    this._configPath = path.join(resolveDataRoot(), 'config.json');
    await this._ensureConfigFile();
    await this._load();
  }

  /**
   * Create default configuration file if missing.
   */
  async _ensureConfigFile() {
    try {
      await fs.access(this._configPath);
    } catch (err) {
      if (err?.code !== 'ENOENT') throw err;
      await fs.mkdir(path.dirname(this._configPath), { recursive: true });
      await writeFileAtomic(
        this._configPath,
        `${JSON.stringify(DEFAULT_CONFIG, null, 2)}\n`,
        'utf8'
      );
    }
  }

  /**
   * Read configuration data from JSON config file.
   */
  async _load() {
    const raw = await fs.readFile(this._configPath, 'utf8');
    const parsed = ConfigFileSchema.parse(JSON.parse(raw));
    this._config = {
      ...DEFAULT_CONFIG,
      ...parsed,
    };
  }

  /**
   * Sync configuration data with JSON config file.
   */
  async _save() {
    const validated = ConfigFileSchema.parse(this._config);
    await writeFileAtomic(
      this._configPath,
      `${JSON.stringify(validated, null, 2)}\n`,
      'utf8'
    );
  }

  /**
   * Read a single configuration record by key.
   * @param {string} key 
   * @returns {string}
   */
  get(key) {
    if (!(key in ConfigFileSchema.shape)) {
      throw new Error(`"${key}" is not a valid configuration field.`);
    } else {
      return this._config[key];
    }
  }

  /**
   * Save a single configuration record by key (overwrites).
   * @param {string} key 
   * @param {string} value 
   */
  async set(key, value) {
    if (!(key in ConfigFileSchema.shape)) {
      throw new Error(`"${key}" is not a valid configuration field.`);
    } else {
      this._config[key] = value;
      await this._save();        
    }
  }

  /**
   * Save multiple configuration records, overwriting previous values
   * @param {Object<string, string>} partial
   */
  async update(partial) {
    const keysA = new Set(Object.keys(partial));
    const keysB = new Set(Object.keys(this._config));
    const extra = keysA.difference(keysB);
    if (extra.size > 0) {
      throw new Error(`Invalid configuration fields: ${[...extra]}`);
    }
    this._config = { ...this._config, ...partial };
    await this._save();
  }
}

export { ConfigurationRegistry };
