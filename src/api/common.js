/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import JSLib from '@/popup/services/services'
import { CORE_JS_INFO } from '@/config/constants'
const cryptoService = JSLib.getBgService('cryptoService')()

async function make_key(username, password) {
  if (global.jsCore) {
    return await cryptoService.makeKey(
      password,
      username,
      CORE_JS_INFO.KDF,
      CORE_JS_INFO.KDF_ITERATIONS
    )
  }
  return ''
}

async function service_login(that, data) {
  if (that.$store.state.isConnected && self.service.pairingService?.hasKey) {
    let hashedPassword = data?.hashedPassword
    let key = data?.keyB64
    if (data.password) {
      const makeKey = await make_key(data.email, data.password)
      hashedPassword = await cryptoService.hashPassword(data.password, makeKey)
      key = makeKey?.keyB64
    }
    await self.service.login({
      email: data.email,
      key: key,
      hashedPassword: hashedPassword
    })
  }
}

async function service_logout(that) {
  if (that.$store.state.isConnected && self.service.pairingService?.hasKey) {
    await self.service.logout();
  }
}

export default {
  make_key,
  service_login,
  service_logout
}