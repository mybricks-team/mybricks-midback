import { loader } from "../loader";
import { SourceEnum } from "../constant";
import { compareVersions } from "compare-versions";
import { ComLibType } from "../global";
import { getMyselfComLib } from "../util";
import materialServerIns from "../materialService";
import { getComlibsByNamespaceAndVersion } from "../utils/comlib";
import { myRequire } from "../utils/comlib";
import { loadScript } from "../loader/loadScript";
const init = (libs: Array<ComLibType | string>) => {
  return new Promise(async (resolve, reject) => {
    let myselfComLib = getMyselfComLib(libs);
    libs = libs.filter((lib) => (lib as ComLibType)?.id !== SourceEnum.MySelfId);
    console.log('mySelf', myselfComLib, libs, materialServerIns.config)
    if(myselfComLib && materialServerIns.config.hasMaterialApp) {
      myselfComLib = await getComlibsByNamespaceAndVersion(myselfComLib?.comAray)
    }
    // const { styles } = await myRequire(
    //   libs.map((lib) => lib?.editJs ?? lib),
    //   (error) => {
    //     Promise.reject(error);
    //   }
    // );
    try {
      // loader 接收 ComLibType 格式的数据，对于lib为'localhost:2000'
      let loadedLibs =  await Promise.all(libs.map((lib) => loader(((lib as ComLibType)?.editJs ? lib :  { editJs: lib }) as ComLibType)));
      // let allStyles = await Promise.all(libs.map(lib => loadScript((lib as ComLibType).editJs ?? lib as string) ))
      debugger
      // let loadedLibs
      debugger
      // if(libs.some(item => typeof item === 'string')) {
        loadedLibs  = window[SourceEnum.ComLib_Edit]
      // }
      // debugger
      /**
       * sort with namespace of lib
       */
      let namespaceArr = libs.map((raw) => (raw as ComLibType)?.namespace);
      loadedLibs.sort((a, b) => {
        let aIndex = namespaceArr.indexOf(a.namespace);
        let bIndex = namespaceArr.indexOf(b.namespace);
        return aIndex - bIndex;
      });
      if(myselfComLib) {
        loadedLibs.unshift(myselfComLib);
      }
      resolve(loadedLibs)
    } catch (error) {
      reject(error);
    }
  });
};

export default init;
