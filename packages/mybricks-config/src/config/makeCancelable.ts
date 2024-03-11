const makeCancelable = (promise: Promise<any>) => {
  let hasCanceled = false;

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then((val: any) =>
      hasCanceled ? reject("operation is manually canceled") : resolve(val)
    );
    promise.catch(reject);
  });
  //@ts-ignore
  return (wrappedPromise.cancel = () => (hasCanceled = true)), wrappedPromise;
};
