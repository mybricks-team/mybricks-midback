import { loader } from "../loader";
import materialServerIns from "../materialService";
import { ComLibType } from "../global";
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
      if (prevIndex < 0) reject("comLib not found");
      const nextLibs = libs.slice();
      nextLibs.splice(prevIndex, 1, lib);
      materialServerIns.config.onUpgradeComLib!(lib, nextLibs);
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
    const { latestComlib, ...rest } = libs[libIndex];
    if (!latestComlib) return reject("comLib not found");
    const loadedLib = await loader(latestComlib);
    const nextLib = { ...rest, ...latestComlib };
    const nextLibs = libs.slice();
    nextLibs.splice(libIndex, 1, nextLib);
    materialServerIns.config.onUpgradeComLib!(nextLib, nextLibs);
    resolve(loadedLib);
  });
};

export { upgradeComLib, upgradeLatestComLib };
