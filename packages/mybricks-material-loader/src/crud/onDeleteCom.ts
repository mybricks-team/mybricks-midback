import materialServerIns from "../materialService";
import { getMyselfComLib } from "../util";
import { CMD } from "../global";

const onDeleteCom = (namespace: string) =>
  new Promise(async (resolve, reject) => {
    try {
      const myselfComLib = getMyselfComLib();
      if (!myselfComLib) {
        resolve({});
      }
      const index = myselfComLib.comAray.findIndex(
        (item) => item.namespace === namespace
      );
      const ret = await materialServerIns.config.onDeleteCom(
        myselfComLib.comAray[index]
      );
      if (ret) {
        const com = myselfComLib.comAray[index]
        myselfComLib.comAray.splice(index, 1);
        materialServerIns.config.operateCallback(CMD.DELETE_COM, {com, mySelfComlib: myselfComLib, index: index})
      }
      resolve(myselfComLib);
    } catch (error) {
      reject(error);
    }
  });

export default onDeleteCom;
