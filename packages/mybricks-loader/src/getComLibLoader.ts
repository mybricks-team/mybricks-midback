import initComLib from "./crud/initComLib";
import { upgradeComLib, upgradeLatestComLib } from "./crud/upgradeComLib";
import deleteComLib from "./crud/deleteComLib";
import insertComLib from "./crud/insertComLib";
import { initGlobal } from "./loader";
import { ComLibType, LibDesc, CMD } from './global'

const getComLibLoader = (libs: Array<ComLibType>) => (libDesc: LibDesc) => {
  initGlobal();
  return new Promise(async (resolve, reject) => {
    const { cmd } = libDesc;
    try {
      if (cmd) {
        switch (cmd) {
          case CMD.ADD_COM:
            break;
          case CMD.DELETE_COM:
            break;
          case CMD.UPGRADE_COM:
            break;
          case CMD.DELETE_COM_LIB:
            deleteComLib(libs, libDesc);
            resolve(true);
            break;
          case CMD.UPGRADE_COM_LIB:
            const upgradeLib = await upgradeLatestComLib(
              {
                ...libDesc,
                namespace: libDesc.libNamespace,
                id: libDesc.libId,
              },
              libs
            );
            resolve(upgradeLib);
            break;
          default:
            break;
        }
        return;
      }
      if (!libDesc) {
        /**
         * init
         */
        const initLibs = await initComLib(libs);
        return resolve(initLibs);
      }
      if (libDesc?.editJs) {
        let lib = libs.find((lib) => lib.namespace === libDesc.namespace);
        if (lib) {
          lib = {
            ...lib,
            ...libDesc,
            namespace: libDesc.libNamespace,
            id: libDesc.libId,
          };
          const upgradeLib = await upgradeComLib(lib, libs);
          return resolve(upgradeLib);
        } else {
          const lib = {
            ...libDesc,
            namespace: libDesc?.libNamespace,
            id: libDesc?.libId,
          };
          const insertedComLib = await insertComLib(lib, libs);
          return resolve(insertedComLib);
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

export { getComLibLoader };
