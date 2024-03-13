import materialServerIns from "../materialService";
import { SourceEnum } from '../constant'
import { ComLibType, LibDesc } from '../global'
const deleteComLib = (libs: Array<ComLibType>, libDesc: LibDesc) => {
  const deleteLib = libs.find((lib) => lib.namespace === libDesc.namespace);
  //@ts-ignore
  window[SourceEnum.ComLib_Edit] = window[SourceEnum.ComLib_Edit].filter(
    (lib: ComLibType) => lib.namespace !== libDesc.namespace
  );
  const restLibs = libs.filter((lib) => lib.namespace === libDesc.namespace);
  if (!deleteLib) {
    console.error(
      `[deleteComLib]: can not found lib with namespace ${libDesc.libNamespace} `
    );
  }
  materialServerIns.config.onDeleteComLib!(deleteLib, restLibs);
  return { deleteLib, restLibs };
};

export default deleteComLib;
