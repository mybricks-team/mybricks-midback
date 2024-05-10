import initComLib from "./crud/initComLib";
import { upgradeComLib, upgradeLatestComLib } from "./crud/upgradeComLib";
import deleteComLib from "./crud/deleteComLib";
import insertComLib from "./crud/insertComLib";
import onAddCom from "./crud/onAddCom";
import onUpgradeCom from "./crud/onUpgradeCom";
import onDeleteCom from "./crud/onDeleteCom";
import { initGlobal } from "./util";
import { ComLibType, LibDesc, CMD } from "./global";

const resolveLibField = (lib: any) => {
  return {
    ...lib,
    namespace: lib.libNamespace,
    id: lib.libId,
  };
};

const getComLibLoader = (libs: Array<ComLibType>) => (libDesc: LibDesc) => {
  initGlobal();
  return new Promise(async (resolve, reject) => {
    if (!libDesc) {
      /**
       * init
       */
      const initLibs = await initComLib(libs);
      // debugger
      console.log('非libDesc', initLibs)
      return resolve(initLibs);
    }
    const { cmd, comNamespace } = libDesc;
    // debugger
    try {
      if (cmd) {
        switch (cmd) {
          case CMD.ADD_COM:
            let ret = await onAddCom();
            resolve(ret);
            break;
          case CMD.DELETE_COM:
            ret = await onDeleteCom(comNamespace);
            resolve(ret);
            break;
          case CMD.UPGRADE_COM:
            ret = await onUpgradeCom(comNamespace);
            resolve(ret);
            break;
          case CMD.DELETE_COM_LIB:
            deleteComLib(resolveLibField(libDesc), libs);
            resolve(true);
            break;
          case CMD.UPGRADE_COM_LIB:
            const upgradeLib = await upgradeLatestComLib(
              resolveLibField(libDesc),
              libs
            );
            resolve(upgradeLib);
            break;
          default:
            break;
        }
        return;
      }
      if (libDesc?.editJs) {
        let lib = libs.find((lib) => lib.namespace === libDesc.libNamespace);
        if (lib) {
          lib = {
            ...lib,
            ...resolveLibField(libDesc),
          };
          // debugger
          const upgradeLib = await upgradeComLib(lib, libs);
          return resolve(upgradeLib);
        } else {
          const insertedComLib = await insertComLib(resolveLibField(libDesc));
          return resolve(insertedComLib);
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

export { getComLibLoader };
