import materialServerIns from "../materialService";
import { getMyselfComLib } from "../util";
import { getComlibsByNamespaceAndVersion } from "../utils/comlib";

const onAddCom = () =>
  new Promise(async (resolve, reject) => {
    try {
      const myselfComLib = getMyselfComLib();
      if (!myselfComLib) {
        resolve({});
      }
       // 添加组件可能选择多个 addOrUpdateComponents， newComs 为应用侧传来的，新的我的组件comAray 数组
       const newComs = await materialServerIns.config.onAddCom();
       const newComLib =  await getComlibsByNamespaceAndVersion(newComs);
      resolve(newComLib);
    } catch (error) {
      reject(error);
    }
  });

export const onAddUICom = () =>
  new Promise(async (resolve, reject) => {
    try {
      const myselfComLib = getMyselfComLib();
      if (!myselfComLib) {
        resolve({});
      }
      const newComs = await materialServerIns.config.onAddUICom();
      const newComlib =  await getComlibsByNamespaceAndVersion(newComs);
      resolve(newComlib)
    } catch (error) {
      reject(error);
    }
  });
  
export  const onAddJSCom = () =>
    new Promise(async (resolve, reject) => {
      try {
        const myselfComLib = getMyselfComLib();
        if (!myselfComLib) {
          resolve({});
        }
        const newComs = await materialServerIns.config.onAddJSCom();
        const newComLib =  await getComlibsByNamespaceAndVersion(newComs)
        resolve(newComLib);
      } catch (error) {
        reject(error);
      }
    });
export default onAddCom;
