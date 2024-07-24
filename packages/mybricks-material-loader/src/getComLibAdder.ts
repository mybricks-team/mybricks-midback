import { upgradeComLib } from "./crud/upgradeComLib";
import insertComLib from "./crud/insertComLib";
import materialServerIns from "./materialService";
import { CMD, ComLibType } from "./global";
const getComLibAdder = (libs: Array<ComLibType>) => () => {
  return new Promise(async (resolve, reject) => {
    const material = await materialServerIns.config.onAddComLib();
    if (!("namespace" in material)) reject("arguments must be comLib type");
    const lib = libs.find((lib) => lib.namespace === material.namespace);
    if (lib) {
      const upgradeLib = await upgradeComLib(material, libs);
      resolve(upgradeLib);
    } else {
      const insertedLib = await insertComLib(material);
      materialServerIns.config.operateCallback(CMD.ADD_COM_LIB, {
        lib: insertedLib as ComLibType
      })
      resolve(insertedLib);
    }
  });
};

export { getComLibAdder };
