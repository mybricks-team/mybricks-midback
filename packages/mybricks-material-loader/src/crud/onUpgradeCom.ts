import materialServerIns from "../materialService";
import { getMyselfComLib } from "../util";

const onUpgradeCom = (namespace: string) =>
  new Promise(async (resolve, reject) => {
    try {
      const myselfComLib = getMyselfComLib();
      if (!myselfComLib) {
        resolve({});
      }
      const index = myselfComLib.comAray.findIndex(
        (item) => item.namespace === namespace
      );
      const com = await materialServerIns.config.onUpgradeCom(
        myselfComLib.comAray[index]
      );
      myselfComLib.comAray.splice(index, 1, com);
      resolve(myselfComLib);
    } catch (error) {
      reject(error);
    }
  });

export default onUpgradeCom;
