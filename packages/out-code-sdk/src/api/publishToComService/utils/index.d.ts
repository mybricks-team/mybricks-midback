import { GetMaterialContent, Schema, ToJSON } from "../types";
export declare function getComlibContent(comlib: {
    namespace: string;
    version: string;
}, getMaterialContent: GetMaterialContent): Promise<string[]>;
export declare function collectModuleCom(coms: any, comlibDeps: any[]): {
    importInfo: Record<string, any>;
    newComDefs: any;
};
export declare function transSchemaToTS(schema: Schema): string;
export declare function transSchemaToVueProp(schema: Schema, defaultValue?: string): string;
declare function analysisConfigInputsTS(json: ToJSON): string;
declare function analysisNormalInputsTS(json: ToJSON): string;
declare function analysisOutputsTS(json: ToJSON): string;
declare function analysisReactDefaultProps(json: ToJSON): string;
export { analysisConfigInputsTS, analysisNormalInputsTS, analysisOutputsTS, analysisReactDefaultProps };
export declare function camelToKebab(camelCaseString: string): string;
export declare function hasRequiredProperties(obj: Record<string, any>, requiredProperties: string[]): boolean;
