import { loader } from "../loader";
import { ComLibType } from "../global";
const insertComLib = (lib: ComLibType) => {
  return new Promise(async (resolve, reject) => {
    if (!lib.namespace) return reject('物料缺少"namespace"');
    try {
      const loadedLib = await loader(lib);
      resolve(loadedLib);
    } catch (error) {
      reject(error);
    }
  });
};

export default insertComLib;
