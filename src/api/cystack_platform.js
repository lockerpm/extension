/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import request from "@/config/request";
import ENDPOINT from "@/config/endpoint";

async function sync(params = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_SYNC,
    method: "get",
    params
  });
}

async function payments_cards(params = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_PAYMENTS_CARDS,
    method: "get",
    params
  });
}

async function create_payments_card(data = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_PAYMENTS_CARDS,
    method: "post",
    data
  });
}

async function teams(params = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_TEAMS,
    method: "get",
    params
  });
}

async function team_detail(id, params = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_TEAM_DETAIL.replace(':id', id),
    method: "get",
    params
  });
}

async function team_policy(teamId, params = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_TEAM_POLICY.replace(':id', teamId),
    method: "get",
    params
  });
}

async function team_import(teamId, data = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_TEAM_IMPORT.replace(':id', teamId),
    method: "post",
    data
  });
}

async function team_purge(teamId, data = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_TEAM_PURGE.replace(':id', teamId),
    method: "post",
    data
  });
}

async function team_groups(teamId, params = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_TEAM_GROUPS.replace(':id', teamId),
    method: "get",
    params
  });
}

async function team_group(teamId, groupId) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_TEAM_GROUP_DETAIL.replace(':id', teamId).replace(':group_id', groupId),
    method: "get",
  });
}

async function create_team_group(teamId, data = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_TEAM_GROUPS.replace(':id', teamId),
    method: "post",
    data
  });
}

async function update_team_group(teamId, groupId, data = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_TEAM_GROUP_DETAIL.replace(':id', teamId).replace(':group_id', groupId),
    method: "put",
    data
  });
}

async function delete_team_group(teamId, groupId) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_TEAM_GROUP_DETAIL.replace(':id', teamId).replace(':group_id', groupId),
    method: "delete",
  });
}

async function team_group_users(teamId, groupId) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_TEAM_GROUP_USERS.replace(':id', teamId).replace(':group_id', groupId),
    method: "get",
  });
}

async function update_team_group_users(teamId, groupId, data) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_TEAM_GROUP_USERS.replace(':id', teamId).replace(':group_id', groupId),
    method: "put",
    data
  });
}

async function team_members(teamId, params = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_TEAM_MEMBERS.replace(':id', teamId),
    method: "get",
    params
  });
}

async function update_team_member(teamId, memberId, data = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_TEAM_MEMBER_DETAIL.replace(':id', teamId).replace(':member_id', memberId),
    method: "put",
    data
  });
}

async function delete_team_member(teamId, memberId, params = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_TEAM_MEMBER_DETAIL.replace(':id', teamId).replace(':member_id', memberId),
    method: "delete",
    params
  });
}

async function create_team_members(teamId, data = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_TEAM_MEMBERS_MULTIPLE.replace(':id', teamId),
    method: "post",
    data
  });
}

async function upload_team_member_file(teamId, data = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_TEAM_MEMBERS_MULTIPLE_FILE.replace(':id', teamId),
    method: "post",
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data
  });
}

async function team_member_groups(teamId, memberId, params = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_TEAM_MEMBER_GROUPS.replace(':id', teamId).replace(':member_id', memberId),
    method: "get",
    params
  });
}

async function update_team_member_groups(teamId, memberId, data = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_TEAM_MEMBER_GROUPS.replace(':id', teamId).replace(':member_id', memberId),
    method: "put",
    data
  });
}

async function team_family_members(teamId, params = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_TEAM_FAMILY_MEMBERS.replace(':id', teamId),
    method: "get",
    params
  });
}

async function create_team_family_member(teamId, data = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_TEAM_FAMILY_MEMBERS.replace(':id', teamId),
    method: "post",
    data
  });
}

async function delete_team_family_member(teamId, memberId) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_TEAM_FAMILY_MEMBER_DETAIL.replace(':id', teamId).replace(':member_id', memberId),
    method: "delete",
  });
}

async function create_team_folder(teamId, data) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_TEAM_FOLDERS.replace(':id', teamId),
    method: "post",
    data
  });
}

async function team_folder(teamId, folderId) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_TEAM_FOLDER_DETAIL.replace(':id', teamId).replace(':folder_id', folderId),
    method: "get",
  });
}

async function update_team_folder(teamId, folderId, data) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_TEAM_FOLDER_DETAIL.replace(':id', teamId).replace(':folder_id', folderId),
    method: "put",
    data
  });
}

async function delete_team_folder(teamId, folderId) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_TEAM_FOLDER_DELETE.replace(':id', teamId).replace(':folder_id', folderId),
    method: "post",
  });
}

async function team_folder_users(teamId, folderId) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_TEAM_FOLDER_USERS.replace(':id', teamId).replace(':folder_id', folderId),
    method: "get",
  });
}

async function update_team_folder_users(teamId, folderId, data) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_TEAM_FOLDER_USERS.replace(':id', teamId).replace(':folder_id', folderId),
    method: "put",
    data
  });
}

async function payments_plan(params = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_PAYMENTS_PLAN,
    method: "get",
    params
  });
}

async function ciphers_vaults(params = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_CIPHERS_VAULTS,
    method: "get",
    params
  });
}

async function create_ciphers_vault(data = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_CIPHERS_VAULTS,
    method: "post",
    data
  });
}

async function update_cipher(id, data = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_CIPHERS_DETAIL.replace(':id', id),
    method: "put",
    data
  });
}

async function use_cipher(id, data = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_CIPHER_USE.replace(':id', id),
    method: "put",
    data
  });
}

async function share_cipher(id, data = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_CIPHER_SHARE.replace(':id', id),
    method: "put",
    data
  });
}

async function ciphers_permanent_delete(data = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_CIPHERS_PERMANENT_DELETE,
    method: "put",
    data
  });
}

async function ciphers_delete(data = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_CIPHERS_DELETE,
    method: "put",
    data
  });
}

async function ciphers_restore(data = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_CIPHERS_RESTORE,
    method: "put",
    data
  });
}

async function ciphers_import(data = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_CIPHERS_IMPORT,
    method: "post",
    data
  });
}

async function ciphers_move(data = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_CIPHERS_MOVE,
    method: "put",
    data
  });
}

async function folders(params) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_FOLDERS,
    method: "put",
    params
  });
}

async function create_folder(data) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_FOLDERS,
    method: "post",
    data
  });
}

async function update_folder(id, data) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_FOLDER_DETAIL.replace(':id', id),
    method: "put",
    data
  });
}

async function delete_folder(id) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_FOLDER_DETAIL.replace(':id', id),
    method: "delete",
  });
}

async function users(params) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_USERS,
    method: "get",
    params
  });
}

async function users_register(data) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_USERS_REGISTER,
    method: "post",
    data
  });
}

async function users_password_hint(data) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_USERS_PASSWORD_HINT,
    method: "post",
    data
  });
}

async function users_me(params = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_USERS_ME,
    method: "get",
    params
  });
}

async function users_me_purge(data = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_USERS_ME_PURGE,
    method: "post",
    data
  });
}

async function users_me_password(data = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_USERS_ME_PASSWORD,
    method: "post",
    data
  });
}

async function users_me_delete(data = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_USERS_ME_DELETE,
    method: "post",
    data
  });
}

async function users_me_login_method(params = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_USERS_ME_LOGIN_METHOD,
    method: "get",
    params
  });
}

async function update_users_me(data, params = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_USERS_ME,
    method: "put",
    data,
    params
  });
}

async function users_onpremise_prelogin(data = {}) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_USERS_ONPREMISE_PRELOGIN,
    method: "post",
    data
  });
}

async function user_invitations(params) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_USERS_INVITATIONS,
    method: "get",
    params
  });
}

async function user_invitation(id, params) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_USERS_INVITATION_DETAIL.replace(':id', id),
    method: "get",
    params
  });
}

async function update_user_invitation(id, data) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_USERS_INVITATION_DETAIL.replace(':id', id),
    method: "put",
    data
  });
}

async function users_session(data) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_USERS_SESSION,
    method: "post",
    data
  });
}

async function users_session_revoke_all(data) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_USERS_SESSION_REVOKE_ALL,
    method: "post",
    data
  });
}

async function emergency_access(params) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_EMERGENCY_ACCESS,
    method: "get",
    params
  });
}

async function invite_emergency_access(data) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_EMERGENCY_ACCESS_INVITE,
    method: "post",
    data
  });
}

async function update_emergency_access(id, data) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_EMERGENCY_ACCESS_DETAIL.replace(':id', id),
    method: "put",
    data
  });
}

async function delete_emergency_access(id) {
  return await request({
    url: ENDPOINT.CYSTACK_PLATFORM_EMERGENCY_ACCESS_DETAIL.replace(':id', id),
    method: "delete"
  });
}

export default {
  sync,
  payments_cards,
  create_payments_card,
  teams,
  team_detail,
  team_policy,
  team_import,
  team_purge,
  team_groups,
  team_group,
  create_team_group,
  update_team_group,
  delete_team_group,
  team_group_users,
  update_team_group_users,
  team_members,
  update_team_member,
  delete_team_member,
  create_team_members,
  upload_team_member_file,
  team_member_groups,
  update_team_member_groups,
  team_family_members,
  create_team_family_member,
  delete_team_family_member,
  create_team_folder,
  team_folder,
  update_team_folder,
  delete_team_folder,
  team_folder_users,
  update_team_folder_users,
  payments_plan,
  ciphers_vaults,
  create_ciphers_vault,
  update_cipher,
  use_cipher,
  share_cipher,
  ciphers_permanent_delete,
  ciphers_delete,
  ciphers_restore,
  ciphers_import,
  ciphers_move,
  folders,
  create_folder,
  update_folder,
  delete_folder,
  users,
  users_register,
  users_password_hint,
  users_me,
  users_me_purge,
  users_me_password,
  users_me_delete,
  users_me_login_method,
  update_users_me,
  users_onpremise_prelogin,
  user_invitations,
  user_invitation,
  update_user_invitation,
  users_session,
  users_session_revoke_all,
  emergency_access,
  invite_emergency_access,
  update_emergency_access,
  delete_emergency_access
};
