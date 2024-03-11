const deleteComLib = (libs: Array<ComLibType>, libDesc: LibDesc) => {
  return new Promise((resolve, reject) => {
    const lib = libs.find((lib) => lib.namespace === libDesc.namespace);
    resolve(lib);
    console.error(
      `[deleteComLib]: can not found lib with namespace ${libDesc.libNamespace} `
    );
  });
};

export default deleteComLib;
