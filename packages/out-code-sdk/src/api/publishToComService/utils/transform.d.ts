import { RtType } from '../types';
export declare const transformCodeByBabel: (code: string, tips?: string, keepCode?: boolean, options?: any) => string;
declare const transform: (json: Record<string, any>, rtType?: RtType) => Record<string, any>;
export { transform };
