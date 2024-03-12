import { loader } from "../loader";
import materialServerIns from "../materialService";
const upgradeComLib = (lib: ComLibType, libs: Array<ComLibType>) => {
  return new Promise(async (resolve, reject) => {
    if (lib.hasOwnProperty("legacy")) {
      Reflect.deleteProperty(lib, "legacy");
    }
    try {
      const loadedLib = await loader(lib);
      resolve(loadedLib);
      const prevIndex = libs.findIndex(
        ({ namespace }) => namespace === lib.namespace
      );
      materialServerIns.config.onUpgradeComLib!(
        lib,
        libs.slice().splice(prevIndex, 1, lib)
      );
    } catch (error) {
      reject(error);
    }
  });
};

const upgradeLatestComLib = (lib: ComLibType, libs: Array<ComLibType>) => {
  return new Promise(async (resolve, reject) => {
    const libIndex = libs.findIndex(
      ({ namespace }) => lib.namespace === namespace
    );
    if (libIndex < 0) return reject("comLib not found");
    const { latestComlib } = libs[libIndex];
    if (!latestComlib) return reject("comLib not found");
    const loadedLib = await loader(latestComlib);
    materialServerIns.config.onUpgradeComLib!(
      latestComlib,
      libs.slice().splice(libIndex, 1, latestComlib)
    );
    resolve(loadedLib);
  });
};

export { upgradeComLib, upgradeLatestComLib };
