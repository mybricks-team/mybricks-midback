import { debugHasPermission } from './permissionService'
import { i18nEnv } from './i18nService'
import { SdkContext } from './index'

const getDebugEnv = (context: SdkContext) => {

  return {
    i18n(title) {
      return i18nEnv(context, title)
    },
    get hasPermission () {
      return debugHasPermission(context)
    }
  }
}

export default getDebugEnv