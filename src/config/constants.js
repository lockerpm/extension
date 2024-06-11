export const OBSERVE_IGNORED_ELEMENTS = ['a', 'i', 'b', 'strong', 'span', 'code', 'br', 'img', 'small', 'em', 'hr']
export const CANCEL_BUTTON_NAMES = ['cancel', 'close', 'back']
export const LOGIN_BUTTON_NAMES = ['log in', 'sign in', 'login', 'go', 'submit', 'continue', 'next', 'đăng nhập']
export const REGISTER_BUTTON_NAMES = ['sign up', 'create', 'register', 'tiếp tục', 'đăng ký', 'tạo tài khoản']
export const LOGIN_PATHS = ['log-in', 'log_in', 'sign-in', 'sign_in', 'signin', 'login', 'dang-nhap', 'authenticate', 'enter']
export const REGISTER_PATHS = ['sign-up', 'create', 'register', 'dang-ky', 'sign_up', 'enter']
export const CHANGE_PASSWORD_BUTTON_NAMES = ['save password', 'update password', 'change password', 'change']
export const CHANGE_PASSWORD_BUTTON_CONTAINS_NAMES = ['pass', 'change', 'contras', 'senha']
export const VAULT_TIMEOUTS = [
  { label: "data.timeouts.oneMinute", value: 1 },
  { label: "data.timeouts.fiveMinutes", value: 5 },
  { label: "data.timeouts.fifteenMinutes", value: 15 },
  { label: "data.timeouts.thirtyMinutes", value: 30 },
  { label: "data.timeouts.oneHour", value: 60 },
  { label: "data.timeouts.fourHours", value: 240 },
  { label: "data.timeouts.twoWeeks", value: 20160 },
  { label: "data.timeouts.onRefresh", value: -1 },
];

export const AUTOFILL_MENU_OPTIONS = [
  { label: "data.settings.menu_off", value: 'off' },
  { label: "data.settings.menu_field_selected", value: 'field_selected' },
  { label: "data.settings.menu_icon_selected", value: 'icon_selected' },
];

export const AUTOFILL_OPTIONS = [
  { label: "data.settings.never_autofill", value: 'off' },
  { label: "data.settings.autofill_page", value: 'autofill_page' },
  { label: "data.settings.autofill_page_iframes", value: 'autofill_page_iframes' },
];

export const LANGUAGE_OPTIONS = [
  { label: "data.settings.english", value: 'en' },
  { label: "data.settings.vietnamese", value: 'vi' },
  { label: "data.settings.chinese", value: 'zh-cn' },
];

export const EVENTS = {
  CHANGE: "change",
  INPUT: "input",
  KEYDOWN: "keydown",
  KEYPRESS: "keypress",
  KEYUP: "keyup",
  BLUR: "blur",
  CLICK: "click",
  FOCUS: "focus",
  SCROLL: "scroll",
  RESIZE: "resize",
  DOMCONTENTLOADED: "DOMContentLoaded",
  LOAD: "load",
  MESSAGE: "message",
  VISIBILITYCHANGE: "visibilitychange",
  FOCUSOUT: "focusout",
};
