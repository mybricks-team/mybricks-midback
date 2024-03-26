import materialServerIns from "../materialService";
import { getMyselfComLib } from "../util";

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
        myselfComLib.comAray.splice(index, 1);
      }
      resolve(myselfComLib);
    } catch (error) {
      reject(error);
    }
  });

export default onDeleteCom;
