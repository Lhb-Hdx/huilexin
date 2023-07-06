import params from '@/params-model/commom/params'

export default {
  // 默认查询方法
  get(paramsName) {
    if (!paramsName && !params[`${paramsName}`]) return
    return params[paramsName]
  },
  /**
   * @description 根据type过滤筛选审批状态
   * @param type 字符串，多个逗号隔开
   */
  filterApproveStatue(type) {
    const types = type.split(',')
    const res = []
    console.log(types)
    types.forEach(item => {
      params.approveStatue.forEach(items => {
        if (items.type.indexOf(item) !== -1) {
          res.push(items)
        }
      })
    })
    return res
  }
}
