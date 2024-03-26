import materialServerIns from "../materialService";
import { getMyselfComLib } from "../util";

const onAddCom = () =>
  new Promise(async (resolve, reject) => {
    try {
      const myselfComLib = getMyselfComLib();
      if (!myselfComLib) {
        resolve({});
      }
      const com = await materialServerIns.config.onAddCom();
      const index = myselfComLib.comAray.findIndex(
        (item) => item.namespace === com.namespace
      );
      if (index >= 0) {
        myselfComLib.comAray.splice(index, 1, com);
      } else {
        myselfComLib.comAray.push(com);
      }
      resolve(myselfComLib);
    } catch (error) {
      reject(error);
    }
  });

export default onAddCom;
