import materialServerIns from "../materialService";
import { ComLibType, CMD } from "../global";
import { SourceEnum } from "../constant";
import { loader } from "../loader";
import { upgradeExternalFn } from "../utils/updateExternal";
import { loadScript } from "../loader/loadScript";

const upgradeComLib = (lib: ComLibType, libs: Array<ComLibType>) => {
  return new Promise(async (resolve, reject) => {
    if (lib.hasOwnProperty("legacy")) {
      Reflect.deleteProperty(lib, "legacy");
    }
    try {
      const winIndex = window[SourceEnum.ComLib_Edit].findIndex(
        (wLib) => wLib.namespace === lib.namespace
      );
      window[SourceEnum.ComLib_Edit].splice(winIndex, 1);
      let updMaterials;
      if (materialServerIns.config.getLibExternalsAPI) {
        updMaterials = await upgradeExternalFn(
          materialServerIns.config.getLibExternalsAPI
        )({ namespace: lib.namespace, version: lib?.version });
      }
      const { styles } = await loadScript(lib.editJs);
      const prevIndex = libs.findIndex(
        ({ namespace }) => namespace === lib.namespace
      );
      if (prevIndex < 0) reject("comLib not found");
      const loadedLib = window[SourceEnum.ComLib_Edit].find(
        (wLib) => wLib.namespace === lib.namespace
      );
      loadedLib._styleAry = styles;

      const nextLibs = libs.slice();
      const fLib = { ...lib, ...updMaterials };
      nextLibs.splice(prevIndex, 1, fLib);
      resolve(loadedLib);

      materialServerIns.config.onUpgradeComLib!(fLib, nextLibs);
      materialServerIns.config.operateCallback(CMD.UPGRADE_COM_LIB, {
        lib: fLib,
        libs: nextLibs,
        index: prevIndex,
      });
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
    const latestComlib = libs[libIndex]?.latestComlib || getLatestComlibFromWindow(lib).latestComlib

    if (!latestComlib) return reject("comLib not found");
    const winIndex = window[SourceEnum.ComLib_Edit].findIndex(
      (wLib) => wLib.namespace === lib.namespace
    );

    window[SourceEnum.ComLib_Edit].splice(winIndex, 1);
    // PC页面，这里只执行原来的load(latestComlib) 会出现，提示添加,而不是升级提醒
    let updMaterials: any = {};
    if (materialServerIns.config.getLibExternalsAPI) {
      updMaterials = await upgradeExternalFn(
        materialServerIns.config.getLibExternalsAPI
      )({ namespace: latestComlib.namespace, version: latestComlib.version });
    }
    const { styles } = await loadScript(
      updMaterials?.editJs ?? latestComlib.editJs
    );

    const loadedLib = window[SourceEnum.ComLib_Edit].find(
      (wLib) => wLib.namespace === lib.namespace
    );
    
    loadedLib._styleAry = styles;
    const nextLibs = libs.slice();
    const fLib = {
      id: loadedLib.id,
      editJs: latestComlib.editJs,
      rtJs: latestComlib.rtJs,
      coms: latestComlib.coms,
      ...updMaterials,
    };
    nextLibs.splice(libIndex, 1, fLib);
    materialServerIns.config.onUpgradeComLib!(fLib, nextLibs);
    materialServerIns.config.operateCallback(CMD.UPGRADE_COM_LIB, {
      lib: fLib,
      libs: nextLibs,
      index: libIndex,
    });
    resolve(loadedLib);
  });
};

const getLatestComlibFromWindow = (lib) => {
  return window[SourceEnum.ComLib_Edit].find(
    (wLib) => wLib.namespace === lib.namespace || wLib.id === lib.id
  );
}
export { upgradeComLib, upgradeLatestComLib };
