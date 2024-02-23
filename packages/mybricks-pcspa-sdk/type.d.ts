declare module '*.less' {
  const classes: { [key: string]: string };
  export default classes;
}

declare interface Window {
  __POWERED_BY_QIANKUN__: boolean;
  React: React;
  ReactDOM: ReactDOM;
  antd: any;
  pluginConnectorDomain: Function
  mybricks: any
}

declare type RenderWeb = {
  render: (json: Record<string, any> | string, opts: Record<string, any>) => any
}