import { loader } from "../loader";
import { SourceEnum } from "../constant";
import { compareVersions } from "compare-versions";
import { ComLibType } from "../global";
import { getMyselfComLib } from "../util";
import materialServerIns from "../materialService";
import { getComlibsByNamespaceAndVersion } from "../utils/comlib";
import { myRequire } from "../utils/comlib";
const init = (libs: Array<ComLibType>) => {
  debugger
  return new Promise(async (resolve, reject) => {
    let myselfComLib = getMyselfComLib(libs);
    libs = libs.filter((lib) => lib.id !== SourceEnum.MySelfId);
    console.log('mySelf', myselfComLib, libs, materialServerIns.config)
    // if(myselfComLib && materialServerIns.config.hasMaterialApp) {
    //   myselfComLib = await getComlibsByNamespaceAndVersion(myselfComLib?.comAray)
    // }
    // const { styles } = await myRequire(
    //   libs.map((lib) => lib?.editJs ?? lib),
    //   (error) => {
    //     Promise.reject(error);
    //   }
    // );
  //    /**
  //  * insert styles
  //  */
  // // const comlibIndex = window[SourceEnum.ComLib_Edit].findIndex(
  // //   (comlib) => comlib.id !== "_myself_"
  // // );

  // // if (comlibIndex !== -1) {
  // //   window[SourceEnum.ComLib_Edit][comlibIndex]._styleAry = styles;
  // // }
    try {
      const loadedLibs =  await Promise.all(libs.map((lib) => loader(lib)));
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
      resolve(loadedLibs)
    } catch (error) {
      reject(error);
    }
  });
};

export default init;
