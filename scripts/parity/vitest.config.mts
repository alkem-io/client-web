import { defineConfig } from 'vitest/config';
import config from '../../vitest.config.mts';

export default defineConfig({ ...config, test: { ...config.test, include: ['scripts/parity/*.test.ts'] } });
