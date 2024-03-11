import upgradeComLib from "./crud/upgradeComLib";
import insertComLib from "./crud/insertComLib";
const comLibAdder = (libs: Array<ComLibType>) => (material: ComLibType) => {
  return new Promise(async (resolve, reject) => {
    const lib = libs.find((lib) => lib.namespace === material.namespace);
    if (lib) {
      const upgradeLib = await upgradeComLib(material);
      resolve(upgradeLib);
    } else {
      const insertedLib = await insertComLib(material);
      resolve(insertedLib);
    }
  });
};

export { comLibAdder };
