function createScript(src: string) {
  var script = document.createElement("script");
  script.src = src;
  return script;
}

const loadScript = (src: string) => {
  return new Promise<{ styles: Array<HTMLStyleElement> }>((resolve, reject) => {
    const styles: Array<HTMLStyleElement> = [];
    const _headAppendChild = document.head.appendChild;
    document.head.appendChild = (ele: any) => {
      if (ele && ele.tagName?.toLowerCase() === "style") {
        styles.push(ele);
      } else {
        _headAppendChild.call(document.head, ele);
      }
      return ele;
    };
    const script = createScript(src);
    document.body.appendChild(script);
    (function (script) {
      script.onerror = (err) => {
        reject(err);
        document.head.appendChild = _headAppendChild;
      };
      script.onload = function () {
        resolve({ styles });
        document.head.appendChild = _headAppendChild;
      };
    })(script);
  });
};

export { loadScript };
