/**
 * Définition des rôles utilisateurs disponibles dans l'application.
 */
export const ROLES = {
  SAdmin_Role: 'super_admin',
  Admin_Role: 'admin',
  PForm_Role: 'formateur_principal',
  Form_Role: 'formateur',
  Incube_Role: 'incube',
};

/**
 * Groupes de rôles pour la gestion des permissions.
 */
export const ROLE_GROUPS = {
  GAdmin_Role: [
    ROLES.Admin_Role,
    ROLES.SAdmin_Role
  ],
  GForms_Role: [
    ROLES.Form_Role,
    ROLES.PForm_Role
  ],
  Managers_Role: [
    ROLES.Admin_Role,
    ROLES.SAdmin_Role,
    ROLES.Form_Role,
    ROLES.PForm_Role
  ],
};
