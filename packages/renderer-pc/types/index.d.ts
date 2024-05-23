/// <reference types="react" />
import { Renderer, Canvas, Slot, Component, Module } from './react';
import { compareVersionLatest } from './utils';
declare const version: string;
export { Renderer, Canvas, Slot, Component, Module, version, compareVersionLatest, };
declare const _default: {
  Renderer: import("react").ForwardRefExoticComponent<import("./react").RendererProps & import("react").RefAttributes<unknown>>;
  Canvas: typeof Canvas;
  Slot: typeof Slot;
  Component: typeof Component;
  Module: typeof Module;
  version: string;
  compareVersionLatest: (v1: string, v2: string) => number;
};
export default _default;
