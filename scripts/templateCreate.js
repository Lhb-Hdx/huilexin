// 导入公用方法
const { dotExistDirectoryCreate, generateFile, fs, log, resolvePath, successLog, errorLog } = require('./common.js')
// 导入模板
// 普通界面模板，没有什么结构
const { template } = require('./generateView/template')
const { tableTemplate } = require('./generateView/tableTemplatre')
const { formPageTemplate } = require('./generateView/formPageTemplatre')
let componentName = '' // 组件名称
let filePath = 'views' // 组件路径
const templateType = ['view', 'table', 'form'] // 组件类型
const templateTypeInName = [template, tableTemplate, formPageTemplate] // 组件组件类型对应的模板
let typeIndex = 0 // 组件类型索引

log('输入要生成的界面组件地址和名称，格式：view:/views/test/text')

process.stdin.on('data', async chunk => {
  if (String(chunk).trim().toString().indexOf(':') === -1) return errorLog(`请输入模板类型`)
  if (String(chunk).trim().toString().indexOf(':') !== -1) {
    const type = String(chunk).trim().toString().split(':')[0]
    typeIndex = templateType.indexOf(type)
    if (typeIndex === -1) return errorLog(`类型不存在，支持的类型：${templateType}`)
  }
  // 组件名称
  const inputName = String(chunk).trim().toString().split(':')[1]
  // 获取组件名
  if (inputName.includes('/')) {
    const inputArr = inputName.split('/')
    componentName = inputArr[inputArr.length - 1]
    filePath = inputArr.slice(0, inputArr.length - 1).join('/')
  } else {
    componentName = inputName
  }
  // 文件完整路径
  const componentPath = resolvePath(`../src${filePath}/`) // 获取完成的文件路径
  const componentPathFile = resolvePath(`../src${filePath}/`, componentName) // 获取完成的组件路径
  // vue文件
  const vueFile = resolvePath(componentPath, `${componentName}.vue`)
  // 判断组件文件夹或者组件是否存在
  const hasPathExists = fs.existsSync(componentPath)
  const hasPathFileExists = fs.existsSync(componentPathFile)
  // 组件存在
  if (hasPathFileExists) return errorLog(`${inputName}页面组件已存在，请重新输入`)
  // 文件路径存在
  if (!hasPathExists) {
    log(`正在生成目录 ${componentPath}`)
    await dotExistDirectoryCreate(componentPath)
  }
  // 生成文件
  try {
    log(`正在生成 vue 文件 ${vueFile}`)
    await generateFile(vueFile, templateTypeInName[typeIndex](componentName))
    successLog('页面生成成功')
    log('输入要生成的界面组件地址和名称，格式：view:/views/test/text')
  } catch (e) {
    errorLog(e.message)
  }
  // process.stdin.emit('end')
})
process.stdin.on('end', () => {
  process.exit()
})
