/**
 * @description matter-mixins.js
 * @author linhaojia
 * @date 2022/10/16 17:08:27
 */
export default {
  methods: {
    async updateOpsOrderProblem(query) {
      const { code, msg } = await this.$request({ url: this.api.opm.updateOpsOrderProblem, data: { ...query } })
      if (code === 1) return { code, msg }
    },
    // 查询服务类型权限
    async findSysRoleService(query) {
      const { data, code } = await this.$request({ url: this.api.sys.findSysRoleService, data: { ids: this.localStorageOperation('get', 'role'), limit: -1, ...query } })
      if (code === 1) return data
    },
    // 查询事项
    async findOpsOrderProblem(query) {
      let { code, data, count } = await this.$request({
        url: this.api.opm.findOpsOrderProblem,
        data: { type: 0, ...query }
      })
      if (code !== 1) return
      return { data, count }
    },
    // 查询事项任务
    async findOpsOrderWorkTask(query) {
      let { code, data, count } = await this.$request({
        url: this.api.opm.findOpsOrderWorkTask,
        data: query
      })
      if (code !== 1) return
      return { data, count }
    },
    // 查询服务类型
    async findOpsOrderProblemService(query) {
      let { code, data, count } = await this.$request({
        url: this.api.opm.findOpsOrderProblemService,
        data: query
      })
      if (code !== 1) return
      return { data, count }
    },
    // 查询运维小组
    async findHrUserGroup(query) {
      let { code, data, count } = await this.$request({
        url: this.api.sys.findHrUserGroup,
        data: query
      })
      if (code !== 1) return
      return { data, count }
    },
    // 查询用户
    async findSysUser(query) {
      let { code, data, count } = await this.$request({
        url: this.api.sys.findSysUser,
        data: query
      })
      if (code !== 1) return
      return { data, count }
    },
    // 查询人员
    async findHrUserInfo(query) {
      let { code, data, count } = await this.$request({
        url: this.api.hr.findHrUserInfo,
        data: query
      })
      if (code !== 1) return
      return { data, count }
    },
    // 查询部门
    async findHyitOrg(query) {
      const { code, data, count } = await this.$request({
        url: this.api.org.findHyitOrg,
        data: query
      })
      if (code !== 1) return
      return { data, count }
    },
    // 用户关联人员分组
    async findHrUserGroupMap(query) {
      const { code, data, count } = await this.$request({
        url: this.api.sys.findHrUserGroupMap,
        data: query
      })
      if (code !== 1) return
      return { data, count }
    },
    // 分组关联事项
    async findOpsOrderProblemGroupMap(query) {
      const { code, data, count } = await this.$request({
        url: this.api.opm.findOpsOrderProblemGroupMap,
        data: query
      })
      if (code !== 1) return
      return { data, count }
    },
    // 根据分组ids查询分组事项
    async findOpsOrderProblemEx(query) {
      const { code, map, count } = await this.$request({
        url: this.api.opm.findOpsOrderProblemEx,
        data: query
      })
      if (code !== 1) return
      return { map, count }
    },
    // 查询审批
    async findApprove(query) {
      const { code, data, count } = await this.$request({
        url: this.api.approve.findApprove,
        data: query
      })
      if (code !== 1) return
      return { data, count }
    },
    // 查询审批日志
    async findNewOaApproveLog(query) {
      const { code, data, count } = await this.$request({
        url: this.api.approveLog.findNewOaApproveLog,
        data: query
      })
      if (code !== 1) return
      return { data, count }
    },
    // 查询审批日志过滤重复
    async findNewOaApproveLogEx(query) {
      const { code, data, count } = await this.$request({
        url: this.api.approveLog.findNewOaApproveLogEx,
        data: query
      })
      if (code !== 1) return
      return { data, count }
    }
  }
}
