import initComLib from "./crud/initComLib";
import upgradeComLib from "./crud/upgradeComLib";
import deleteComLib from "./crud/deleteComLib";
import insertComLib from "./crud/insertComLib";
import materialServerIns from "./materialService";
const getComLibLoader = (libs: Array<ComLibType>) => (libDesc: LibDesc) => {
  return new Promise(async (resolve, reject) => {
    const { cmd } = libDesc;
    try {
      if (cmd) {
        switch (cmd) {
          case CMD.ADD_COM:
          case CMD.DELETE_COM:
          case CMD.UPGRADE_COM:
          case CMD.DELETE_COM_LIB:
            const deleteLib = deleteComLib(libs, libDesc);
            materialServerIns.config.afterDeleteComLib!(deleteLib);
            resolve(true);
            break;
          case CMD.UPGRADE_COM_LIB:
            const upgradeLib = await upgradeComLib({
              ...libDesc,
              namespace: libDesc.libNamespace,
              id: libDesc.libId,
            });
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
        const material = libs.find(
          (lib) => lib.namespace === libDesc.namespace
        );
        if (material) {
          const upgradeLib = await upgradeComLib({
            ...material,
            ...libDesc,
            namespace: libDesc.libNamespace,
            id: libDesc.libId,
          });
          return resolve(upgradeLib);
        } else {
          const insertedComLib = await insertComLib({
            ...libDesc,
            namespace: libDesc?.libNamespace,
            id: libDesc?.libId,
          });
          return resolve(insertedComLib);
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

export { getComLibLoader };
