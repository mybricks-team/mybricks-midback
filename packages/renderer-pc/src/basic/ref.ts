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

export function canvasRefRegister({ canvasStatus, refs, json, }) {
  canvasStatus.refs = refs;
  canvasStatus.runTodos();

  const isPopup = json.type === "popup";
  const { outputs } = refs;
  // 弹出框场景，部分输出自动关闭
  json.outputs.forEach((output) => {
    const outputId = output.id;
    outputs(outputId, (value) => {
      if (outputId !== "apply" && isPopup) {
        // 输出不是apply并且是popup场景
        // 关闭场景
        canvasStatus.show = false;
      }
      canvasStatus.parentScope.outputs[outputId](value);
      canvasStatus.parentScope = null;
    });
  });
}
