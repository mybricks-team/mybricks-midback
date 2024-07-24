import materialServerIns from "../materialService";
import { SourceEnum } from '../constant'
import { ComLibType, LibDesc, CMD } from '../global'
const deleteComLib = (libDesc: LibDesc, libs: Array<ComLibType>) => {
  const deleteLib = libs.find((lib) => lib.namespace === libDesc.namespace || lib.id === libDesc.id);
  const deleteLibIndex = libs.findIndex((lib) => lib.namespace === libDesc.namespace || lib.id === libDesc.id);
  //@ts-ignore
  window[SourceEnum.ComLib_Edit] = window[SourceEnum.ComLib_Edit].filter(
    (lib: ComLibType) => lib.namespace !== libDesc.namespace && lib.id !== libDesc.id
  );
  const restLibs = libs.filter((lib) => lib.namespace !== libDesc.namespace && lib.id !== libDesc.id);
  if (!deleteLib) {
    console.error(
      `[deleteComLib]: can not found lib with namespace ${libDesc.libNamespace} `
    );
  }
  materialServerIns.config.onDeleteComLib!(deleteLib, restLibs);
  materialServerIns.config.operateCallback(CMD.DELETE_COM_LIB, {lib: deleteLib, libs: restLibs, index: deleteLibIndex})
  return { deleteLib, restLibs };
};

export default deleteComLib;
