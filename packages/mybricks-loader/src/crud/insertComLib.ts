import { loader } from "../loader";
const insertComLib = (lib: ComLibType) => {
  return new Promise(async (resolve, reject) => {
    if (!lib.namespace) return reject('物料缺少"namespace"');
    try {
      const loaded = await loader(lib);
      resolve(loaded);
    } catch (error) {
      reject(error);
    }
  });
};

export default insertComLib
