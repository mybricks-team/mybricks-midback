import materialServerIns from "../materialService";
import { getMyselfComLib } from "../util";
import { CMD } from "../global";
import { getComlibsByNamespaceAndVersion } from "../utils/comlib";

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

      const newComlib =  await getComlibsByNamespaceAndVersion(myselfComLib.comAray)
      materialServerIns.config.operateCallback(CMD.UPGRADE_COM, {com: com as any , mySelfComlib: { ...myselfComLib, comAray: newComlib.comAray}, index: index})
      resolve({
        id: '_myself_',
        title: '我的组件',
        defined: true,
        comAray: newComlib?.comAray || []
      });
    } catch (error) {
      reject(error);
    }
  });

export default onUpgradeCom;
