import i18n from "@/locales/i18n"
export const OBSERVE_IGNORED_ELEMENTS = ['a', 'i', 'b', 'strong', 'span', 'code', 'br', 'img', 'small', 'em', 'hr']
export const CANCEL_BUTTON_NAMES = ['cancel', 'close', 'back']
export const LOGIN_BUTTON_NAMES = ['log in', 'sign in', 'login', 'go', 'submit', 'continue', 'next', 'sign up', 'create', 'register', 'đăng nhập', 'tiếp tục']
export const SIGN_UP_BUTTON_NAMES = ['sign up', 'create', 'register', 'đăng ký', 'tạo tài khoản']
export const CHANGE_PASSWORD_BUTTON_NAMES = ['save password', 'update password', 'change password', 'change']
export const CHANGE_PASSWORD_BUTTON_CONTAINS_NAMES = ['pass', 'change', 'contras', 'senha']
export const VAULT_TIMEOUTS = [
  { label: i18n.t("data.timeouts.oneMinute"), value: 1 },
  { label: i18n.t("data.timeouts.fiveMinutes"), value: 5 },
  { label: i18n.t("data.timeouts.fifteenMinutes"), value: 15 },
  { label: i18n.t("data.timeouts.thirtyMinutes"), value: 30 },
  { label: i18n.t("data.timeouts.oneHour"), value: 60 },
  { label: i18n.t("data.timeouts.fourHours"), value: 240 },
  { label: i18n.t("data.timeouts.twoWeeks"), value: 20160 },
  { label: i18n.t("data.timeouts.onRefresh"), value: -1 },
];
export const CORE_JS_INFO = {
  KDF: 0,
  KDF_ITERATIONS: 100000
}