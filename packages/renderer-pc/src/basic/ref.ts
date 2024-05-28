export function generateRef({ mainRefs, refs, refsPromise }) {
  const res = {};

  refs.reduce((p, c) => {
    p[c] = mainRefs.inputs[c];
    return p;
  }, res);

  refsPromise.reduce((p, c) => {
    const { inputId, outputId } = c;
    p[inputId] = (value) => {
      return new Promise((resolve) => {
        mainRefs.outputs(outputId, resolve);
        mainRefs.inputs[inputId](value);
      });
    };
    return p;
  }, res);

  return res;
}
