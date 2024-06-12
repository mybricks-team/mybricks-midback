import { loader } from "../loader";
import { SourceEnum } from "../constant";
import { ComLibType } from "../global";
import { getMyselfComLib } from "../util";
const init = (libs: Array<ComLibType>) => {
  return new Promise(async (resolve, reject) => {
    libs = libs.filter((lib) => lib.id !== SourceEnum.MySelfId);
    const myselfComLib = getMyselfComLib(libs);
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
      resolve(loadedLibs)
    } catch (error) {
      reject(error);
    }
  });
};

export default init;
