module.exports = {
  'POST /api/v1/incube/auth/reset-password': {
    action: 'incube/auth/reset-password',
    swagger: { tags: ['INCUBE - AUTH'] }
  },
  'POST /api/v1/admin/auth/reset-password': {
    action: 'admin/auth/reset-password',
    swagger: { tags: ['ADMIN - AUTH'] }
  },
  'POST /api/v1/formateur/auth/reset-password': {
    action: 'formateur/auth/reset-password',
    swagger: { tags: ['FORMATEUR - AUTH'] }
  },
};
