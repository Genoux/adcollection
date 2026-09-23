import * as migration_20260911_203704_initial from './20260911_203704_initial';
import * as migration_20260914_181353_drop_gif_field from './20260914_181353_drop_gif_field';
import * as migration_20260922_132738_mcp_api_keys from './20260922_132738_mcp_api_keys';
import * as migration_20260922_161337_frameio_connections from './20260922_161337_frameio_connections';
import * as migration_20260922_170608_frameio_account_name from './20260922_170608_frameio_account_name';
import * as migration_20260922_182127_mcp_oauth from './20260922_182127_mcp_oauth';
import * as migration_20260923_155322_tag_restructure from './20260923_155322_tag_restructure';
import * as migration_20260923_155741_content_types from './20260923_155741_content_types';

export const migrations = [
  {
    up: migration_20260911_203704_initial.up,
    down: migration_20260911_203704_initial.down,
    name: '20260911_203704_initial',
  },
  {
    up: migration_20260914_181353_drop_gif_field.up,
    down: migration_20260914_181353_drop_gif_field.down,
    name: '20260914_181353_drop_gif_field',
  },
  {
    up: migration_20260922_132738_mcp_api_keys.up,
    down: migration_20260922_132738_mcp_api_keys.down,
    name: '20260922_132738_mcp_api_keys',
  },
  {
    up: migration_20260922_161337_frameio_connections.up,
    down: migration_20260922_161337_frameio_connections.down,
    name: '20260922_161337_frameio_connections',
  },
  {
    up: migration_20260922_170608_frameio_account_name.up,
    down: migration_20260922_170608_frameio_account_name.down,
    name: '20260922_170608_frameio_account_name',
  },
  {
    up: migration_20260922_182127_mcp_oauth.up,
    down: migration_20260922_182127_mcp_oauth.down,
    name: '20260922_182127_mcp_oauth',
  },
  {
    up: migration_20260923_155322_tag_restructure.up,
    down: migration_20260923_155322_tag_restructure.down,
    name: '20260923_155322_tag_restructure',
  },
  {
    up: migration_20260923_155741_content_types.up,
    down: migration_20260923_155741_content_types.down,
    name: '20260923_155741_content_types'
  },
];
