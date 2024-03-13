import { loader } from "../loader";
import materialServerIns from "../materialService";
import { ComLibType } from '../global'
const insertComLib = (lib: ComLibType, libs: Array<ComLibType>) => {
  return new Promise(async (resolve, reject) => {
    if (!lib.namespace) return reject('物料缺少"namespace"');
    try {
      const loadedLib = await loader(lib);
      resolve(loadedLib);
      materialServerIns.config.onAddComLib!(lib, [...libs, lib]);
    } catch (error) {
      reject(error);
    }
  });
};

export default insertComLib;
