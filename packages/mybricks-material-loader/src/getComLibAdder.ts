import { upgradeComLib } from "./crud/upgradeComLib";
import insertComLib from "./crud/insertComLib";
import { ComLibType } from './global'
const getComLibAdder = (libs: Array<ComLibType>) => (material: ComLibType) => {
  return new Promise(async (resolve, reject) => {
    if (!material) reject("arguments must be comLib object");
    const lib = libs.find((lib) => lib.namespace === material.namespace);
    if (lib) {
      const upgradeLib = await upgradeComLib(material, libs);
      resolve(upgradeLib);
    } else {
      const insertedLib = await insertComLib(material, libs);
      resolve(insertedLib);
    }
  });
};

export { getComLibAdder };
