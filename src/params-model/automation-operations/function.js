import params from '@/params-model/automation-operations/params'

export default {
  // 默认查询方法
  get(paramsName) {
    if (!paramsName && !params[`${paramsName}`]) return
    return params[paramsName]
  }
}
