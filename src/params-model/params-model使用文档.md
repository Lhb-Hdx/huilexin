# params-model 参数模型定义

为了统一管理前端项目定义的类型参数，实现参数共享，有时候一些前端定义写死的参数可能不只在一个文件中使用，规定这个文件夹方便在其他文件使用定义的参数，不需要再重新在文件中定义参数和重复的过滤方法。

## 使用步骤

### 1、文件夹定义

`params-model` 目录里面以系统上的功能模块划分参数文件夹，比如it监控就定义一个 `it-monitor` 文件夹存放参数和查询方法，资产的就定义一个 `assets` 的文件夹，目前预定义了几个模块，如果有缺的需要的时候再自行补上。

### 2、参数定义
在定义的功能模块参数文件夹里新建一个 `params.js` 文件。

参数文件固定格式如下：
````
export default {
  // 这里就可以写上要定义的参数名称，比如定义一个设备类型参数
  deviceType: [
    { value: 1, label: '服务设备' },
    { value: 2, label: 'SDWAN' },
    ...    
  ],
  // 后续有就继续加上
}
````

### 3、方法定义

在定义的功能模块参数文件夹里新建一个 `function.js` 文件。

方法文件固定格式如下：
````
import params from './params'

export default {
  // 默认查询方法
  get(paramsName) {
    if (!paramsName && !params[`${paramsName}`]) return
    return params[paramsName]
  }
  // 下面可以写自定义查询方法
}
````

定义完成方法文件后，在 `params-model` 根目录的 `index.js` 中引入导出

````
import automationOperations from './automation-operations/function'

export default {
  automationOperations,
  ...
}
````

### 4、调用
this.$paramsModel.模块方法名称.get('参数对象名称')

- 模块方法名称：在 `params-model中的index.js` 文件导出的时候写的名称
- 参数对象名称：在 `params.js` 文件定义参数对象时定义的参数对象名称

比如 `this.$paramsModel.automationOperations.get('deviceType')` 就可以调用出上面例子中定义的deviceType的参数