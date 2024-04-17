import Vue from 'vue'
import VueI18n from 'vue-i18n'
import enLocale from 'element-ui/lib/locale/lang/en'
import vnLocale from 'element-ui/lib/locale/lang/vi'
import zhCNLocale from 'element-ui/lib/locale/lang/zh-CN'

import viVee from 'vee-validate/dist/locale/vi.json'
import enVee from 'vee-validate/dist/locale/en.json'
import zhCNVee from 'vee-validate/dist/locale/zh_CN.json'

import * as rules from 'vee-validate/dist/rules'
import { extend, configure } from 'vee-validate'

Vue.use(VueI18n)

const messages = {
  en: {
    ...require('./en.js'),
    ...enLocale,
    ...enVee
  },
  vi: {
    ...require('./vi.js'),
    ...vnLocale,
    ...viVee
  },
  'zh-cn': {
    ...require('./zh-cn.js'),
    ...zhCNLocale,
    ...zhCNVee
  },
}

const i18n = new VueI18n({
  locale: 'en',
  messages,
  fallbackLocale: 'en'
})
// loop over all rules
for (const rule in rules) {
  extend(rule, rules[rule])
}
configure({
  defaultMessage: (field, values) => {
    // override the field name.
    return i18n.t(`messages.${values._rule_}`, values)
  }
})

export default i18n
