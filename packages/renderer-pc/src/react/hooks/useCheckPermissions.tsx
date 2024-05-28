import React, { useRef } from "react";

/** 权限检查，无权限时返回提示信息 */
export function useCheckPermissions({ id, refs, hasPermission, permissions }) {
  const permission = useRef<{ next: boolean; dom?: any }>();
  if (!permission.current) {
    let next = true;
    let dom;
    const comInfo = refs.getComInfo(id);
    const permissionsId = comInfo.model.permissions?.id;
    if (permissionsId) {
      const permissionInfo = hasPermission(permissionsId);
      if (
        !permissionInfo ||
        (typeof permissionInfo !== "boolean" && !permissionInfo.permission)
      ) {
        // 没有权限信息或权限信息里的permission为false
        const envPermissionInfo = permissions.find(
          (p: any) => p.id === permissionsId,
        );
        const type =
          permissionInfo?.type || envPermissionInfo?.register.noPrivilege;
        next = false;
        if (type === "hintLink") {
          dom = (
            <div key={id}>
              <a
                href={permissionInfo?.hintLinkUrl || envPermissionInfo.hintLink}
                target="_blank"
                style={{ textDecoration: "underline" }}
              >
                {permissionInfo?.hintLinkTitle ||
                  envPermissionInfo.register.title}
              </a>
            </div>
          );
        }
      }
    }

    permission.current = { next, dom };
  }
  return permission.current;
}
