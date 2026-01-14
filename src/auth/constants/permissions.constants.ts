export const PERMISSIONS = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  READER: 'reader',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const PERMISSION_DESCRIPTIONS = {
  [PERMISSIONS.ADMIN]: 'Acesso total ao sistema',
  [PERMISSIONS.EDITOR]: 'Gerenciar artigos',
  [PERMISSIONS.READER]: 'Apenas visualizar artigos',
};
