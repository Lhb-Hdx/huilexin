const chalk = require('chalk')
const path = require('path')
const fs = require('fs')
const resolvePath = (...file) => path.resolve(__dirname, ...file)
const log = message => console.log(chalk.green(`${message}`))
const successLog = message => console.log(chalk.blue(`${message}`))
const errorLog = error => console.log(chalk.red(`${error}`))

// 递归创建目录
const mkdirs = (directory, callback) => {
  var exists = fs.existsSync(directory)
  if (exists) {
    callback()
  } else {
    mkdirs(path.dirname(directory), function() {
      fs.mkdirSync(directory)
      callback()
    })
  }
}

module.exports = {
  dotExistDirectoryCreate: (directory) => {
    return new Promise((resolve) => {
      mkdirs(directory, function() {
        resolve(true)
      })
    })
  },
  generateFile: (path, data) => {
    if (fs.existsSync(path)) {
      errorLog(`${path}文件已存在`)
      return
    }
    return new Promise((resolve, reject) => {
      fs.writeFile(path, data, 'utf8', err => {
        if (err) {
          errorLog(err.message)
          reject(err)
        } else {
          resolve(true)
        }
      })
    })
  },
  path: path,
  chalk: chalk,
  fs: fs,
  log: log,
  successLog: successLog,
  errorLog: errorLog,
  resolvePath: resolvePath
}
