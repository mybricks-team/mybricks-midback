import { loader } from "../loader";
const MySelfId = "_myself_";
const init = (libs: Array<ComLibType>) => {
  return new Promise(async (resolve, reject) => {
    const materials = libs.filter((lib) => lib.id !== MySelfId);
    try {
      const loadedLibs = await Promise.all(materials.map((lib) => loader(lib)));
      /**
       * sort with namespace of lib
       */
      let namespaceArr = libs.map((raw) => raw.namespace);
      loadedLibs.sort((a, b) => {
        let aIndex = namespaceArr.indexOf(a.namespace);
        let bIndex = namespaceArr.indexOf(b.namespace);
        return aIndex - bIndex;
      });
      resolve(loadedLibs);
    } catch (error) {
      reject(error);
    }
  });
};

export default init;
