const deleteComLib = (libs: Array<ComLibType>, libDesc: LibDesc) => {
  const lib = libs.find((lib) => lib.namespace === libDesc.namespace);
  if (!lib) {
    console.error(
      `[deleteComLib]: can not found lib with namespace ${libDesc.libNamespace} `
    );
  }
  return lib;
};

export default deleteComLib;
