/**
 * @description activity-mixins.js
 * @author linhaojia
 * @date 2022/3/13 01:38:11
 */
import request from '@/utils/request'
import api from '@/api/api'
import { getUserSession } from '@/utils/auth'

/**
 * @description activity-mixins.js
 * @author linhaojia
 * @date 2022/3/7 16:53:58
 */
export default {
  methods: {
    // 查看审批
    async findTask(instanceId) {
      const { code, model } = await request({
        url: api.activity.findTask,
        data: {
          instanceId
        }
      })
      if (code !== 1) return
      return model
    },
    // 查看审核
    async findNewOaApproveLog(approveIds, approveType, approveStatue) {
      return new Promise(resolve => {
        return request({
          url: api.approveLog.findNewOaApproveLog, data: { approveIds, approveType, approveStatue, page: 1, limit: -1 }
        }).then(res => {
          if (res.code === 1) resolve(res.data)
        })
      })
    },
    // 根据用户id查询申请
    async findApply(userId, defineApproveType) {
      return new Promise(resolve => {
        request({
          url: api.apply.findApply, data: {
            userId,
            approveType: this.$defineData.projectActivityProcessDefine(`${defineApproveType}`, 'key', 'id'),
            page: 1,
            limit: -1
          }
        }).then(res => {
          if (res.code === 1) resolve(res.data)
        })
      })
    },
    // 查询activity流程
    async findNewOaActivity(type) {
      return new Promise(resolve => {
        request({
          url: api.activity.findNewOaActivity, data: { page: 1, limit: -1, type }
        }).then(res => {
          if (res.code === 1) resolve(res.data)
        })
      })
    },
    // 处理流程
    completeActivity(taskId, successFn, errorFn) {
      request({
        url: api.activity.completeActivity, data: { taskId, approveStatue: 5 }
      }).then(res => {
        if (res.code === 1) {
          this.$message({ type: 'success', message: '提交成功' })
          this[`${successFn}`]()
        } else {
          this[`${errorFn}`]()
        }
      })
    },
    // 启动流程
    async startActivity(model, approveType) {
      const getActivity = await this.findNewOaActivity(approveType)
      if (getActivity.length === 0) return this.$message({ message: '暂无该类型的流程' })
      const { code } = await request({
        url: api.activity.startActivity, data: {
          bpmnKey: getActivity[0].bpmnKey,
          approveType: approveType,
          approveId: model.id,
          userId: getUserSession().userId
        }
      })
      return code
    },
    // 删除已启动的流程
    async deleteInstance(instanceId, approveStatue) {
      return new Promise(resolve => {
        const data = { instanceId }
        if (approveStatue) data.approveStatue = approveStatue
        return request({
          url: api.activity.deleteInstance, data
        }).then(res => {
          if (res.code === 1) resolve()
        })
      })
    }
  }
}
