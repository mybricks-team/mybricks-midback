export const parseQuery = (query: string) => {
    const res = {}
    query = query.trim().replace(/^(\?|#|&)/, '')
    if (!query) {
        return res
    }
    query.split('&').forEach((param) => {
        const parts = param.replace(/\+/g, ' ').split('=')
        const key = decode(parts.shift())
        const val = parts.length > 0 ? decode(parts.join('=')) : null
        if (res[key] === undefined) {
            res[key] = val
        } else if (Array.isArray(res[key])) {
            res[key].push(val)
        } else {
            res[key] = [res[key], val]
        }
    })
    return res
}

export const decode = (str: string) => {
    try {
        return decodeURIComponent(str)
    } catch (err) {
        console.warn(false, `Error decoding "${str}". Leaving it intact.`)
    }
    return str
}

export function getQueryString(name) {
    const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");

    const r = window.location.search.substring(1).match(reg);
    if (r != null) {
        return r[2]
    }
    return null;
}

export const getComs = () => {
    const comDefs = {}
    const regAry = (comAray) => {
        comAray.forEach((comDef) => {
            if (comDef.comAray) {
                regAry(comDef.comAray)
            } else {
                comDefs[`${comDef.namespace}-${comDef.version}`] = comDef
            }
        });
    }
    // Object.keys(window['CloudComponentDependentComponents']).forEach((key) => {
    //   const [namespace, version] = key.split('@')

    //   comDefs[`${namespace}-${version}`] =
    //     window['CloudComponentDependentComponents'][key]
    // })
    const comlibs = [
        ...(window['__comlibs_edit_'] || []),
        ...(window['__comlibs_rt_'] || []),
    ]
    comlibs.forEach((lib) => {
        const comAray = lib.comAray
        if (comAray && Array.isArray(comAray)) {
            regAry(comAray)
        }
    })
    return comDefs
}


