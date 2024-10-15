export const fetchComponent = async(url, packages) => {
  const text = await fetch(url).then(a => {
    if(!a.ok) {
      console.log('a---', a)
      throw new Error('Network response is not ready')
    }
    return a.text()
  })
  
  const module = getParsedModule(text, packages)
  return { default: module.exports.default }

}

const getParsedModule = (code, packages: any) => {
  let module = {
    exports: {},
  }
  const require = (name) => {
    return packages[name]
  }

  Function('require, exports, module', code)(require, module.exports, module)
  // console.log('module', module,)
  return module
}
