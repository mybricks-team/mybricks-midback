import { loader } from "../loader";
import { SourceEnum } from "../constant";
import { compareVersions } from "compare-versions";
import { ComLibType } from "../global";
import { getMyselfComLib, } from "../util";
import materialServerIns from "../materialService";
import { getComlibsByNamespaceAndVersion } from "../utils/comlib";
import { myRequire } from "../utils/comlib";
import { getComLibsLatestAndExternals, getLatestComLib } from "../utils/updateExternal";
import { loadScript } from "../loader/loadScript";
const init = (libs: Array<ComLibType | string>) => {
  return new Promise(async (resolve, reject) => {
    let myselfComLib = getMyselfComLib(libs);
    libs = libs.filter((lib) => (lib as ComLibType)?.id !== SourceEnum.MySelfId);

    // latestComlibs 也是从传入的libs中来
    let latestComlibs = libs.filter(lib => (lib as ComLibType).latestComlib).map(lLib => (lLib as ComLibType).latestComlib)
    // 如果传入获取最新组件库API，最新组件库调接口；否则，从libs中提取
    if (materialServerIns.config.getLatestComLibsAPI) {
      const res: any = await getLatestComLib(libs)
      latestComlibs = res.latestComlibs;
    }
    if (myselfComLib && materialServerIns.config.hasMaterialApp) {
      myselfComLib = await getComlibsByNamespaceAndVersion(myselfComLib?.comAray)
    }
    if (!libs.length) {
      resolve([]);
    }
    const { styles } = await myRequire(
      libs.map((lib) => (lib as ComLibType)?.editJs ?? lib),
      (error) => {
        Promise.reject(error);
      }
    );
    extraCaseProcess(libs, styles);
    try {
      let loadedLibs = window[SourceEnum.ComLib_Edit]
      /**
      * insert latestComlib for upgrade
      */
      latestComlibs.forEach((latestLib) => {
        try {
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
      /**
       * sort with namespace of lib
       */
      let namespaceArr = libs.map((raw) => (raw as ComLibType)?.namespace);
      loadedLibs.sort((a, b) => {
        let aIndex = namespaceArr.indexOf(a.namespace);
        let bIndex = namespaceArr.indexOf(b.namespace);
        return aIndex - bIndex;
      });
      resolve(loadedLibs)
    } catch (error) {
      reject(error);
    }
  });
};

function extraCaseProcess(libs, styles) {
  /**
   * insert styles
   */
  const comlibIndex = window[SourceEnum.ComLib_Edit].findIndex(
    (comlib) => comlib.id !== "_myself_"
  );

  if (comlibIndex !== -1) {
    window[SourceEnum.ComLib_Edit][comlibIndex]._styleAry = styles;
  }
  /**
   * 兼容中间没有namespace存量页面数据
   */
  window[SourceEnum.ComLib_Edit].forEach((winLib) => {
    if (!winLib.namespace) {
      const lib = libs.find((lib) => lib?.id === winLib.id);
      if (lib) {
        winLib.namespace = lib?.namespace;
      }
    }
  });

  /**
   * without namespace tips
   */
  const libWithoutNamespace = window[SourceEnum.ComLib_Edit].filter(
    (lib) => !lib.namespace && lib.id !== "_myself_"
  );
  if (libWithoutNamespace.length) {
    const titleStr = libWithoutNamespace.map((lib) => lib.title).join("、");
    console.error(
      `组件库【${titleStr}】未找到namespace，无法进行更新、删除操作`
    );
  }
}

export default init;
