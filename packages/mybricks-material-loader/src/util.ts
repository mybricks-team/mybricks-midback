import { SourceEnum } from "./constant";

export const getMyselfComLib = (libs = window[SourceEnum.ComLib_Edit]) =>
  libs!.find((lib) => lib.id === SourceEnum.MySelfId);

export const initGlobal = () => {
  if (!window[SourceEnum.ComLib_Edit]) {
    window[SourceEnum.ComLib_Edit] = [];
  }

  if (!window[SourceEnum.ComLib_Rt]) {
    window[SourceEnum.ComLib_Rt] = window[SourceEnum.ComLib_Edit];
  }

  if (!window[SourceEnum.CloudComponentDependentComponents]) {
    window[SourceEnum.CloudComponentDependentComponents] = {};
  }
};
