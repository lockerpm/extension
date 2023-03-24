export default {
  ME: '/me',
  ME_INTERCOM: '/me/intercom',
  // auth
  SSO_AUTH: '/sso/auth',
  SSO_AUTH_OTP: '/sso/auth/otp',
  SSO_AUTH_OTP_MAIL: '/sso/auth/otp/mail',
  SSO_LAST_ACTIVE: '/sso/me/last_active',
  SSO_ACCESS_TOKEN: '/sso/access_token',

  LOGOUT: '/users/logout',

  RESOURCES_COUNTRIES: '/resources/countries',

  // cystack_platform
  CYSTACK_PLATFORM_SYNC: '/cystack_platform/pm/sync',

  CYSTACK_PLATFORM_PAYMENTS_CARDS: '/cystack_platform/payments/cards',

  CYSTACK_PLATFORM_TEAMS: '/cystack_platform/pm/teams',
  CYSTACK_PLATFORM_TEAM_DETAIL: '/cystack_platform/pm/teams/:id',
  CYSTACK_PLATFORM_TEAM_POLICY: '/cystack_platform/pm/teams/:id/policy',
  CYSTACK_PLATFORM_TEAM_IMPORT: '/cystack_platform/pm/teams/:id/import',
  CYSTACK_PLATFORM_TEAM_PURGE: '/cystack_platform/pm/teams/:id/purge',

  CYSTACK_PLATFORM_TEAM_GROUPS: '/cystack_platform/pm/teams/:id/groups',
  CYSTACK_PLATFORM_TEAM_GROUP_DETAIL: '/cystack_platform/pm/teams/:id/groups/:group_id',
  CYSTACK_PLATFORM_TEAM_GROUP_USERS: '/cystack_platform/pm/teams/:id/groups/:group_id/users',

  CYSTACK_PLATFORM_TEAM_MEMBERS: '/cystack_platform/pm/teams/:id/members',
  CYSTACK_PLATFORM_TEAM_MEMBER_DETAIL: '/cystack_platform/pm/teams/:id/members/:member_id',
  CYSTACK_PLATFORM_TEAM_MEMBER_GROUPS: '/cystack_platform/pm/teams/:id/members/:member_id/groups',
  CYSTACK_PLATFORM_TEAM_MEMBERS_MULTIPLE: '/cystack_platform/pm/teams/:id/members/multiple',
  CYSTACK_PLATFORM_TEAM_MEMBERS_MULTIPLE_FILE: '/cystack_platform/pm/teams/:id/members/multiple/file',

  CYSTACK_PLATFORM_TEAM_FAMILY_MEMBERS: '/cystack_platform/pm/teams/:id/family_members',
  CYSTACK_PLATFORM_TEAM_FAMILY_MEMBER_DETAIL: '/cystack_platform/pm/teams/:id/family_members/:member_id',

  CYSTACK_PLATFORM_TEAM_FOLDERS: '/cystack_platform/pm/teams/:id/folders',
  CYSTACK_PLATFORM_TEAM_FOLDER_DETAIL: '/cystack_platform/pm/teams/:id/folders/:folder_id',
  CYSTACK_PLATFORM_TEAM_FOLDER_DELETE: '/cystack_platform/pm/teams/:id/folders/:folder_id/delete',
  CYSTACK_PLATFORM_TEAM_FOLDER_USERS: '/cystack_platform/pm/teams/:id/folders/:folder_id/users',

  CYSTACK_PLATFORM_PAYMENTS_PLAN: '/cystack_platform/pm/payments/plan',

  CYSTACK_PLATFORM_CIPHERS_VAULTS: '/cystack_platform/pm/ciphers/vaults',
  CYSTACK_PLATFORM_CIPHERS_DETAIL: '/cystack_platform/pm/ciphers/:id',
  CYSTACK_PLATFORM_CIPHER_USE: '/cystack_platform/pm/ciphers/:id/use',
  CYSTACK_PLATFORM_CIPHER_SHARE: '/cystack_platform/pm/ciphers/:id/share',
  CYSTACK_PLATFORM_CIPHERS_DELETE: '/cystack_platform/pm/ciphers/delete',
  CYSTACK_PLATFORM_CIPHERS_RESTORE: '/cystack_platform/pm/ciphers/restore',
  CYSTACK_PLATFORM_CIPHERS_MOVE: '/cystack_platform/pm/ciphers/move',
  CYSTACK_PLATFORM_CIPHERS_IMPORT: '/cystack_platform/pm/ciphers/import',
  CYSTACK_PLATFORM_CIPHERS_PERMANENT_DELETE: '/cystack_platform/pm/ciphers/permanent_delete',

  CYSTACK_PLATFORM_FOLDERS: '/cystack_platform/pm/folders',
  CYSTACK_PLATFORM_FOLDER_DETAIL: '/cystack_platform/pm/folders/:id',

  CYSTACK_PLATFORM_USERS: '/cystack_platform/pm/users',
  CYSTACK_PLATFORM_USERS_REGISTER: '/cystack_platform/pm/users/register',
  CYSTACK_PLATFORM_USERS_PASSWORD_HINT: '/cystack_platform/pm/users/password_hint',

  CYSTACK_PLATFORM_USERS_ME: '/cystack_platform/pm/users/me',
  CYSTACK_PLATFORM_USERS_ME_PURGE: '/cystack_platform/pm/users/me/purge',
  CYSTACK_PLATFORM_USERS_ME_PASSWORD: '/cystack_platform/pm/users/me/password',
  CYSTACK_PLATFORM_USERS_ME_DELETE: '/cystack_platform/pm/users/me/delete',
  CYSTACK_PLATFORM_USERS_ME_LOGIN_METHOD: '/cystack_platform/pm/users/me/login_method',
  CYSTACK_PLATFORM_USERS_ONPREMISE_PRELOGIN: '/cystack_platform/pm/users/onpremise/prelogin',
  CYSTACK_PLATFORM_USERS_INVITATIONS: '/cystack_platform/pm/users/invitations',
  CYSTACK_PLATFORM_USERS_INVITATION_DETAIL: '/cystack_platform/pm/users/invitations/:id',

  CYSTACK_PLATFORM_USERS_SESSION: '/cystack_platform/pm/users/session',
  CYSTACK_PLATFORM_USERS_SESSION_REVOKE_ALL: '/cystack_platform/pm/users/session/revoke_all',

  CYSTACK_PLATFORM_EMERGENCY_ACCESS: '/cystack_platform/pm/emergency_access',
  CYSTACK_PLATFORM_EMERGENCY_ACCESS_DETAIL: '/cystack_platform/pm/emergency_access/:id',
  CYSTACK_PLATFORM_EMERGENCY_ACCESS_INVITE: '/cystack_platform/pm/emergency_access/invite',

  // notifications
  NOTIFICATIONS: '/notifications'
};