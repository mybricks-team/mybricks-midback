import { loader } from "../loader";
const updateComLib = (lib: ComLibType) => {
  return new Promise(async (resolve, reject) => {
    if (lib.hasOwnProperty("legacy")) {
      Reflect.deleteProperty(lib, "legacy");
    }
    try {
      const loaded = await loader(lib);
      resolve(loaded);
    } catch (error) {
      reject(error);
    }
  });
};

export default updateComLib;
