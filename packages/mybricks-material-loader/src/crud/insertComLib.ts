import { loader } from "../loader";
import { ComLibType, CMD } from "../global";
import materialServerIns from "../materialService";
import { upgradeExternalFn } from  "../utils/updateExternal";

const insertComLib = (lib: ComLibType) => {
  return new Promise(async (resolve, reject) => {
    if (!lib.namespace) return reject('物料缺少"namespace"');
    try {
      let updMaterials: any;
      if (materialServerIns.config.getLibExternalsAPI) {
        updMaterials = await upgradeExternalFn(
          materialServerIns.config.getLibExternalsAPI
        )({ namespace: lib.namespace, version: lib?.version });
      }
      const loadedLib = await loader(lib);
      materialServerIns.config.operateCallback(CMD.ADD_COM_LIB, {
        lib: updMaterials ?? loadedLib as ComLibType
      })
      resolve(loadedLib);
    } catch (error) {
      reject(error);
    }
  });
};

export default insertComLib;
