<template>
  <div ref="opmMatterList" class="opm-matter-list">
    <div class="tab-bar">
      <div v-for="(item, index) in tabItem" :key="index" class="tab-item pointer" :class="tabItemIndex === index ? 'active' : ''" @click="handlerTabItem(item, index)">{{ item.name }}</div>
    </div>
    <div ref="tabMain" class="tab-main" :style="{ 'height': tabMainHeight + 'px' }">
      <div v-for="item in opsOrderProblem" :key="item.id" class="list-item">
        <div class="list-item-left">
          <div class="type overflow-text-a">{{ item.problemTypeName }} / {{ item.serviceTypeName }}</div>
          <div class="name pointer overflow-text-a">{{ item.name }}</div>
          <div class="user overflow-text-a">{{ item.lockUserRealName }} {{ item.lockUserTel }}</div>
        </div>
        <div class="list-item-right">
          <div class="right-main">
            <div v-if="item.createUserOrgName" class="org overflow-text-a">{{ item.createUserOrgName }}</div>
            <div v-if="item.createUserRealName" class="user-name overflow-text-a">{{ item.createUserRealName }}</div>
            <div v-if="item.createUserTel" class="user-tel overflow-text-a">{{ item.createUserTel }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OpmMatterList',
  data() {
    return {
      tabItem: [
        { name: '待处理', processState: 0 },
        { name: '处理中', processState: 1 },
        { name: '待计划', processState: 4 },
        { name: '待审批', key: 'todoApprove' },
        { name: '待确认', processState: 5 }
      ],
      tabItemIndex: 0,
      tabItemValue: {},
      listQuery: {
        page: 1,
        limit: 20
      },
      opsOrderProblem: [],
      tabMainHeight: ''
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.setSize()
      window.addEventListener('resize', this.setSize)
    })
    this.$EventBus.$on('handler-top-project', () => {
      this.init()
    })
    this.$EventBus.$on('start-up-date', () => {
      this.$set(this.listQuery, 'limit', this.listQuery.page * this.listQuery.limit)
      this.$set(this.listQuery, 'page', 1)
      this.$set(this.listQuery, 'limit', 20)
      this.init()
    })
    this.$refs.tabMain.addEventListener('scroll', this.scrollBody)
  },
  beforeDestroy() {
    this.batchOffEventBus('handler-top-project,start-up-date')
    window.removeEventListener('resize', this.setSize)
  },
  methods: {
    setSize() {
      this.tabMainHeight = this.$refs.opmMatterList.clientHeight - 40 - 10
    },
    async init() {
      if (!this.tabItemValue) {
        this.tabItemValue = this.tabItem[0]
        this.tabItemIndex = 0
      }
      let opsOrderProblem = []
      if (this.tabItemValue.key !== 'todoApprove') {
        const findOpsOrderProblem = await this.findOpsOrderProblem(this.listQuery)
        if (findOpsOrderProblem.code === 1 && findOpsOrderProblem.data) opsOrderProblem = findOpsOrderProblem.data
      } else {
        const findApprove = await this.findApprove(this.listQuery)
        const opsOrderProblemIds = []
        if (findApprove.code === 1 && findApprove.data) {
          findApprove.data.forEach(item => {
            opsOrderProblemIds.push(item.approveId)
          })
        }
        if (opsOrderProblemIds.length > 0) {
          const findOpsOrderProblem = await this.findOpsOrderProblem({ ids: opsOrderProblemIds.toString() })
          if (findOpsOrderProblem.code === 1 && findOpsOrderProblem.data) opsOrderProblem = findOpsOrderProblem.data
        }
      }

      const orgIds = []
      const userIds = []
      const serviceTypeIds = []
      const orderProblemIds = []

      opsOrderProblem.forEach(item => {
        orderProblemIds.push(item.id)
        if (item.lockUserId) userIds.push(item.lockUserId)
        if (item.serviceType) serviceTypeIds.push(item.serviceType)
        if (item.serviceType) serviceTypeIds.push(item.problemType)
        if (item.userId) userIds.push(item.userId)
      })

      // 查询事项提交人
      let user = []
      let hr = []
      if (userIds.length > 0) {
        const findSysUser = await this.findSysUser({
          ids: this.$tool.uniqueArray(userIds).toString(),
          companyId: this.$auth.getUserSession().companyId,
          limit: -1
        })
        if (findSysUser && findSysUser.data && findSysUser.data.length > 0) {
          user = findSysUser.data
          const findHrUserInfo = await this.findHrUserInfo({
            ids: this.$tool.uniqueArray(userIds).toString(),
            companyId: this.$auth.getUserSession().companyId,
            limit: -1
          })
          if (findHrUserInfo && findHrUserInfo.data && findHrUserInfo.data.length > 0) {
            hr = findHrUserInfo.data
            findHrUserInfo.data.forEach(item => {
              if (item.organizationCatId) orgIds.push(item.organizationCatId)
            })
          }
        }
      }

      // 查询事项请求部门
      let org = []
      if (orgIds.length > 0) {
        const findHyitOrg = this.findHyitOrg({
          ids: this.$tool.uniqueArray(orgIds).toString(),
          limit: -1
        })
        if (findHyitOrg && findHyitOrg.data && findHyitOrg.data.length > 0) org = findHyitOrg.data
      }

      // 查询事项服务类型
      let serviceType = []
      if (serviceTypeIds.length > 0) {
        const findOpsOrderProblemService = await this.findOpsOrderProblemService({ ids: this.$tool.uniqueArray(serviceTypeIds).toString(), limit: -1 })
        if (findOpsOrderProblemService && findOpsOrderProblemService.data && findOpsOrderProblemService.data.length > 0) serviceType = findOpsOrderProblemService.data
      }

      opsOrderProblem.forEach(item => {
        // 设置服务类型
        const getProblemTypeNameIndex = serviceType.findIndex(items => +items.serviceId === +item.problemType)
        if (getProblemTypeNameIndex !== -1) item.problemTypeName = serviceType[getProblemTypeNameIndex].serviceName

        const getServiceTypeNameIndex = serviceType.findIndex(items => +items.serviceId === +item.serviceType)
        if (getServiceTypeNameIndex !== -1) {
          item.serviceTypeName = serviceType[getServiceTypeNameIndex].serviceName
        }

        // 设置提交人
        const getUserIndex = user.findIndex(items => +items.userId === +item.userId)
        if (getUserIndex !== -1) {
          item.createUserRealName = user[getUserIndex].realName
          item.createUserTel = user[getUserIndex].tel
        }

        // 设置请求部门
        const getHrIndex = hr.findIndex(items => +items.userId === +item.userId)
        if (getHrIndex !== -1) {
          const getOrgNameIndex = org.findIndex(items => +items.hyOrgId === +item.organizationCatId)
          if (getOrgNameIndex !== -1) item.createUserOrgName = org[getOrgNameIndex].hyOrgName
        }

        // 设置流程发起人
        const getLockUserIndex = user.findIndex(items => +items.userId === +item.lockUserId)
        if (getLockUserIndex !== -1) {
          item.lockUserRealName = user[getLockUserIndex].realName
          item.lockUserTel = user[getLockUserIndex].tel
        }
      })
      this.opsOrderProblem = opsOrderProblem
      this.setSize()
    },
    handlerTabItem(t, i) {
      this.tabItemValue = t
      this.tabItemIndex = i
      this.$set(this.listQuery, 'page', 1)
      this.$set(this.listQuery, 'limit', 20)
      this.$set(this.listQuery, 'processState', t.processState)
      this.init()
    },
    async findApprove(query) {
      return await this.$request({ url: this.api.approve.findApprove, data: query })
    },
    async findOpsOrderProblem(query) {
      return await this.$request({ url: this.api.opm.findOpsOrderProblem, data: query })
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
    // 查询服务类型
    async findOpsOrderProblemService(query) {
      let { code, data, count } = await this.$request({
        url: this.api.opm.findOpsOrderProblemService,
        data: query
      })
      if (code !== 1) return
      return { data, count }
    },
    scrollBody() {
      const scrollTop = this.$refs.opmMatterList.scrollTop
      // 获取可视区的高度
      const windowHeight = this.$refs.opmMatterList.clientHeight
      // 获取滚动条的总高度
      const scrollHeight = this.$refs.opmMatterList.scrollHeight
      if (scrollTop + windowHeight >= scrollHeight - 1) {
      // 把距离顶部的距离加上可视区域的高度 等于或者大于滚动条的总高度就是到达底部
        if (this.listAllPageNum > this.listQuery.page) {
          this.$set(this.listQuery, 'page', ++this.listQuery.page)
          this.init()
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.tab-bar {
  padding-top: 15px;
  width: 100%;
  overflow: hidden;
  position: relative;
  display: flex;
  .tab-item {
    flex: 1;
    color: #cccccc;
    text-align: center;
    z-index: 1;
    text-decoration: none;
    transition: all .5s;
    height: 40px;
    line-height: 30px;
    &:hover {
      color: #99E5FF;
      background: url(/image/screen/tab_bg.png) no-repeat 50% 100%;
    }
  }
  .active {
    color: #99E5FF;
    background: url(/image/screen/tab_bg.png) no-repeat 50% 100%;
  }
}
.tab-main {
  height: 100%;
  margin-top: 10px;
  overflow-y: auto;
  .list-item {
    display: flex;
    padding: 5px 0;
    border-top: 1px solid #444444;
    border-bottom: 1px solid #444444;
    margin-top: -1px;
    .list-item-left {
      width: 70%;
      .type {
        font-size: 12px;
        line-height: 20px;
        height: 20px;
        color: #ffffff;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .name {
        line-height: 35px;
        height: 35px;
        white-space: nowrap;
        text-overflow: ellipsis;
        color: #ffffff;
        text-decoration: none;
        transition: all .5s;
        &:hover {
          color: #99CCFF;
        }
      }
      .user {
        font-size: 12px;
        color: #cccccc;
        line-height: 20px;
        height: 20px;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
    .list-item-right {
      width: 30%;
      text-align: right;
      display: flex;
      align-items: center;
      font-size: 12px;
      color: #cccccc;
      justify-content: flex-end;
      padding-right: 10px;
      .right-main {
        text-align: right;
        div {
          margin-bottom: 7px;
          &:last-of-type {
            margin-bottom: 0 !important;
          }
        }
      }
    }
  }
}
</style>
