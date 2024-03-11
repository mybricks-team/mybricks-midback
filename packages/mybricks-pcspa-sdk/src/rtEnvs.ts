import { rtHasPermission } from './permissionService'

const rtEnvs = ({ context }) => {

  return {
    get hasPermission() {
      return rtHasPermission({ context })
    }
  }
}

export default rtEnvs