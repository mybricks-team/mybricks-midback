import materialServerIns from "../materialService";
const ComLib_Edit = "__comlibs_edit_";
const deleteComLib = (libs: Array<ComLibType>, libDesc: LibDesc) => {
  const deleteLib = libs.find((lib) => lib.namespace === libDesc.namespace);
  //@ts-ignore
  window[ComLib_Edit] = window[ComLib_Edit].filter(
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
