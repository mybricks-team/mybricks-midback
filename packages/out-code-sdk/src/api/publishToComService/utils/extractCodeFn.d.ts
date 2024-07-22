declare const extractCodeFn: (json: Record<string, any>) => {
    transformJson: Record<string, any>;
    extractFns: string;
};
export { extractCodeFn };
