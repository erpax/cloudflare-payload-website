import * as migration_20260513_130838 from './20260513_130838';
import * as migration_20260513_132443 from './20260513_132443';

export const migrations = [
  {
    up: migration_20260513_130838.up,
    down: migration_20260513_130838.down,
    name: '20260513_130838',
  },
  {
    up: migration_20260513_132443.up,
    down: migration_20260513_132443.down,
    name: '20260513_132443'
  },
];
