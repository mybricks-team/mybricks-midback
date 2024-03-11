declare interface Config {
  shortcuts?: Record<string, Array>;
  plugins?: [];
  comLibAdder?: () => Promise;
  comLibLoader?: () => Promise;
  pageContentLoader?: () => Promise;
  toplView?: {
    title: string;
    cards: Record<string, any>;
    globalIO: {
      startWithSingleton: boolean;
    };
    vars: Record<string, any>;
    fx: Record<string, any>;
    useStrict: boolean;
  };
  editView: {
    editorAppender?: (editConfig: Record<string, any>) => void;
    items: () => void;
    editorOptions?: Record<string, any>;
  };
  com: {
    env?: Record<string, any>;
    events?: [];
  };
  geoView: {
    scenes: {
      adder?: [];
    };
    theme: {
      css?: [];
    };
  };
}
