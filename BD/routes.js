module.exports = {
  'POST /api/v1/admin/auth/logout': {
    action: 'admin/auth/logout',
    swagger: { tags: ['ADMIN - AUTH'] }
  },
  'POST /api/v1/formateur/auth/logout': {
    action: 'formateur/auth/logout',
    swagger: { tags: ['FORMATEUR - AUTH'] }
  },
  'POST /api/v1/incube/auth/logout': {
    action: 'incube/auth/logout',
    swagger: { tags: ['INCUBE - AUTH'] }
  },
};
