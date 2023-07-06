/**
 * @description env.build.js
 * @author linhaojia
 * @date 2022/10/27 11:36:05
 */

// 导入公用方法
const { fs, log, resolvePath, errorLog } = require('./common.js')
const argv = require('minimist')(process.argv.slice(2))
const child_process = require('child_process')

const modes = ['dev']
const envFile = ['dev']

// 项目配置json
const e = require('./env-list')

/* 参数解析 START */
if (argv.length === 0) {
  errorLog('参数为空，请检查命令')
  process.exit()
}

const params = {}
argv._.forEach(item => {
  const split = item.split('=')
  params[`${split[0]}`] = split[1]
})

if (modes.indexOf(params.mode) === -1) {
  errorLog(`mode：${params.mode}不支持`)
  process.exit()
}

if (envFile.indexOf(params.envFile) === -1) {
  errorLog(`envFile：${params.envFile}不支持`)
  process.exit()
}

console.log('================= 开始解析输入参数 =================')
Object.keys(params).forEach(key => {
  console.log(`${key}：${params[`${key}`]}`)
})
console.log('================= 完成解析输入参数 =================')

console.log('================= 开始获取配置参数 =================')
const getProjectkey = e.findIndex(eItem => eItem.key === params.key)
if (getProjectkey === -1) {
  errorLog('项目不存在，请检查项目是否存在env-build.json中')
  process.exit()
}

Object.keys(e[getProjectkey]).forEach(key => {
  console.log(`${key}：${e[getProjectkey][`${key}`]}`)
})
console.log('================= 完成获取配置参数 =================')

console.log('================= 开始写入配置参数到文件 =================')
// 存在即查找配置写入文件
const fileType = params.envFile === 'dev' ? e[getProjectkey].dev : e[getProjectkey].build
const envStartFileType = params.envFile === 'dev' ? '.env.development' : '.env.production'
console.log(`写入到：${envStartFileType}`)
const readEnvTmp = fs.readFileSync(resolvePath(`./${fileType.envTmpFilePath}`))
const readEnv = fs.readFileSync(resolvePath(`./${fileType.envFilePath}`))
fs.writeFileSync(resolvePath(`../${envStartFileType}`), readEnvTmp, 'utf8')
fs.appendFileSync(resolvePath(`../${envStartFileType}`), readEnv, 'utf8')
console.log('================= 完成写入配置参数到文件 =================')
process.stdin.emit('end')
/* 参数解析 END */

// 启动子进程启动npm
const spawnOptions = params.mode === 'dev' ? ['run', 'dev'] : ['run', 'build:prod']

console.log(`================= 子进程执行 npm ${spawnOptions.toString().replace(',', ' ')} 启动 =================`)

let childProcess = child_process.spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', `${params.script}`])

childProcess.stdout.on('data', function (data) {
  console.log(`${data}`)
})
childProcess.stderr.on('data', function (data) {
  console.log(`${data}`)
})
childProcess.on('close', function (code) {
  console.log(`================= 子进程执行 npm ${spawnOptions.toString().replace(',', ' ')} 已退出，退出码：${code} =================`)
})
