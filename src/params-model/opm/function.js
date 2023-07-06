import params from '@/params-model/opm/params'
import request from '@/utils/request'
import api from '@/api/api'
import { localStorageOperation } from '@/utils/browser-storage'
export default {
  // 默认查询方法
  get(paramsName) {
    if (!paramsName && !params[`${paramsName}`]) return
    return params[paramsName]
  },
  // 消息推送
  async messageSendToPlatform(type, query) {
    // getLinkageActionTemplate linkageManage
    // let application = await request({
    //   url: api.linkageManage.findPlatformMobileApplication,
    //   data: {classify: 'weixin'}
    // })
    // application = JSON.parse(application)
    // if (!application.code || !application.data.length) return
    // applicationId,receiverIds,msg,title,type
    const data = {
      type: 'weixin',
      // applicationId: application.data[0]['applicationId'],
      applicationId: 4,
      msg: params.infoPushList[type],
      processor: localStorageOperation('get', 'userInfo')['realName'],
      ...query,
      status: params.infoStatusList[query.status]
    }
    const { msg } = await request({
      url: api.opm.messageSendToPlatform,
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(data)
    })
    return { msg }
  }
  // 下面可以写自定义查询方法
}
