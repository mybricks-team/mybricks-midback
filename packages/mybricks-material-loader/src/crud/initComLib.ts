import { loader } from "../loader";
import { SourceEnum } from "../constant";
import { compareVersions } from "compare-versions";
import { ComLibType } from "../global";
import { getMyselfComLib } from "../util";
import materialServerIns from "../materialService";
import { getComlibsByNamespaceAndVersion } from "../utils/comlib";

const init = (libs: Array<ComLibType>) => {
  return new Promise(async (resolve, reject) => {
    const myselfComLib = getMyselfComLib(libs);
    libs = libs.filter((lib) => lib.id !== SourceEnum.MySelfId);
    console.log('mySelf', myselfComLib, libs, materialServerIns.config)
    const { latestComlibs = [] } = materialServerIns.config || {}
    if(myselfComLib && materialServerIns.config.hasMaterialApp) {
      await getComlibsByNamespaceAndVersion(myselfComLib?.comAray)
    }
    try {
      const loadedLibs = await Promise.all(libs.map((lib) => loader(lib)));
      /**
       * sort with namespace of lib
       */
      let namespaceArr = libs.map((raw) => raw.namespace);
      loadedLibs.sort((a, b) => {
        let aIndex = namespaceArr.indexOf(a.namespace);
        let bIndex = namespaceArr.indexOf(b.namespace);
        return aIndex - bIndex;
      });
      if(myselfComLib) {
        loadedLibs.unshift(myselfComLib);
      }
      /**
   * insert latestComlib for upgrade
   */
  latestComlibs.forEach((latestLib) => {
    try {
      debugger
      const shouldUpdateLib = window[SourceEnum.ComLib_Edit].find(
        (lib) =>
          (lib.namespace === latestLib.namespace || lib.id === latestLib.id) &&
          compareVersions(latestLib.version, lib.version) > 0
      );
      if (shouldUpdateLib) {
        shouldUpdateLib.latestComlib = latestLib;
      }
    } catch (error) {
      console.warn(
        `[初始化组件库]: ${latestLib.namespace} 组件库是测试版本，无法进行在线升级`
      );
    }
  });
  debugger
      resolve(loadedLibs)
    } catch (error) {
      reject(error);
    }
  });
};

export default init;
