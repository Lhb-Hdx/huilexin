/**
 * @description common-request-fn.js
 * @author linhaojia
 * @date 2022/3/8 15:58:27
 */
import request from '@/utils/request'
import api from '@/api/api'

// 获取用户
export async function findSysUser(query) {
  const { code, data } = await request({
    url: api.sys.findSysUser,
    data: query
  })
  if (code !== 1) return
  return data
}

// 获取人员
export async function findHrUserInfo(query) {
  const { code, data } = await request({
    url: api.hr.findHrUserInfo,
    data: query
  })
  if (code !== 1) return
  return data
}

// 插入it监控告警处理日志
export async function insertOpsOrderAlarmLog(query) {
  const { code } = await request({
    url: api.itMonitor.insertOpsOrderAlarmLog,
    data: query
  })
  if (code !== 1) return
  return code
}

// 查询it监控告警处理日志
export async function findOpsOrderAlarmLog(query) {
  const { code, data } = await request({
    url: api.itMonitor.findOpsOrderAlarmLog,
    data: query
  })
  if (code !== 1) return
  return data
}

// 区域列表
export async function findArea(query) {
  const { code, data } = await request({
    url: api.area.findHyitArea,
    data: query
  })
  if (code !== 1) return
  return data
}

// 组织机构
export async function getHyitOrg(query) {
  const { code, model } = await request({
    url: api.org.getHyitOrg,
    data: query
  })
  if (code !== 1) return
  return model
}
