import materialServerIns from "../materialService";
import { SourceEnum } from '../constant'
import { ComLibType, LibDesc } from '../global'
const deleteComLib = (libDesc: LibDesc, libs: Array<ComLibType>) => {
  const deleteLib = libs.find((lib) => lib.namespace === libDesc.namespace || lib.id === libDesc.id);
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
  return { deleteLib, restLibs };
};

export default deleteComLib;
