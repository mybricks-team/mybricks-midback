import { runJs } from '../utils/runJs'

const debugHasPermission = (context) => {
  const { pageContent, designerRef } = context

  return ({ permission, key }) => {
    const hasPermissionFn = pageContent?.hasPermissionFn;

    if (!pageContent.isDebugPermissionEnabled) {
      return true
    }

    if (!hasPermissionFn) {
      return true;
    }

    // 编辑权限配置为”无“时，不需要进行权限校验
    if (permission?.type === 'none') {
      return true;
    }

    const code = permission?.register?.code || key;

    // 如果没有权限编码，不需要校验
    if (code === undefined) {
      return true;
    }

    let result: boolean;

    try {
      result = runJs(decodeURIComponent(hasPermissionFn), [
        { key: code },
      ]);

      if (typeof result !== 'boolean') {
        result = true;
        designerRef.current?.console?.log.error(
          '权限方法',
          `权限方法返回值类型应为 Boolean 请检查，[Key] ${code}; [返回值] Type: ${typeof result}; Value: ${JSON.stringify(
            result,
          )}`,
        );

        console.error(
          `权限方法返回值类型应为 Boolean 请检查，[Key] ${code}; [返回值] Type: ${typeof result}; Value: ${JSON.stringify(
            result,
          )}`,
        );
      }
    } catch (error) {
      result = true;
      designerRef.current?.console?.log.error(
        '权限方法',
        `${error.message}`,
      );
      console.error(`权限方法出错 [Key] ${code}；`, error);
    }

    return result;
  };
}

const rtHasPermission = ({ context }) => {
  return ({ permission, key }) => {
    if (!context.hasPermissionFn) {
      return true;
    }

    const code = permission?.register?.code || key;

    let result;

    try {
      result = runJs(decodeURIComponent(context.hasPermissionFn), [
        { key: code },
      ]);

      if (typeof result !== "boolean") {
        result = true;
        console.warn(
          `权限方法返回值类型应为 Boolean 请检查，[key] ${code}; [返回值] type: ${typeof result}; value: ${JSON.stringify(
            result
          )}`
        );
      }
    } catch (error) {
      result = true;
      console.error(`权限方法出错 [key] ${code}；`, error);
    }

    return result;
  };
}

export {
  debugHasPermission,
  rtHasPermission
}