<template>
  <div class="classify-sidebar">
    <div class="sidebar-header flex-v-between">
      <div class="font-18">服务类型</div>
      <div class="header-btns">
        <!-- <i v-permission="['edit']" class="el-icon-edit-outline pointer" @click="handleEditService" />
        <i v-permission="['add']" class="el-icon-plus pointer" @click="handleOpenServiceDialog" />
        <i v-permission="['delete']" class="el-icon-minus pointer" @click="handleDeleteService" /> -->
      </div>
    </div>

    <div class="sidebar-box">
      <!-- <div class="sidebar-list">
        <div v-for="item in classifyList" :key="item.serviceId" class="list-item pointer" :style="setStyle(item.serviceId)" @click="handleItem(item)">{{ item.serviceName }}</div>
      </div> -->
      <el-menu background-color="#e5ecf6" :default-openeds="openNum" unique-opened active-text-color="#303133">
        <el-submenu v-for="(item,index) in opmServiceList" :key="item.serviceId" :index="index+''">
          <template slot="title">
            <el-tooltip effect="dark" :content="item.serviceName" placement="top">
              <div class="serviceName">
                {{ item.serviceName }}
              </div>
            </el-tooltip>
          </template>
          <el-menu-item v-for="(item2,index2) in item.children" :key="item2.serviceId" :style="selectOrNot(index,index2)" @click="chooseOne(item,item2,index,index2)">
            <el-tooltip effect="dark" :content="item2.serviceName" placement="top">
              <div class="serviceName">
                {{ item2.serviceName }}
              </div>
            </el-tooltip>
          </el-menu-item>
        </el-submenu>
      </el-menu>
    </div>

  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'

export default {
  props: {
    matterAppicationProps: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      opmServiceList: [],
      current: {},
      serviceIDS: [],
      defaultActive: '',
      listQuery: {
        page: -1,
        limit: -1
        // total: 0
      },
      openNum: ['0'],
      selectIndex1: '',
      selectIndex2: '',
      chosen: ''
    }
  },
  computed: {
    setStyle() {
      return (serviceId) => {
        return {
          background: this.current.serviceId === serviceId ? 'rgba(207, 219, 246)' : ''
        }
      }
    },
    selectOrNot() {
      return function (index, index2) {
        if (index === this.selectIndex1 && index2 === this.selectIndex2) {
          return `color:#409EFF`
        }
      }
    },
    alarmId() {
      return this.$route.query.alarmId
    }
  },
  async mounted() {
    await this.infoSysAdmin()
    // this.initData()
  },
  methods: {
    // 获取用户角色服务授权id
    async infoSysAdmin() {
      const userInfo = this.localStorageOperation('get', 'userInfo')
      const RoleData = await request({url: api.sys.findRoleByUser, data: { userId: +userInfo.userId }})

      let RoleService = []
      for (let item of RoleData.data) {
        if (item?.roleId) {
          const res = await request({url: api.sys.findSysRoleService, data: { roleId: item.roleId, limit: -1 }})
          if (res.data.length > 0) {
            RoleService.push(...res.data)
          }
        }
      }
      // 去重重排
      const serviceIDS = []
      if (RoleService.length > 0) {
        RoleService.forEach(item => {
          if (item?.serviceId) {
            if (!serviceIDS.includes(item.serviceId)) serviceIDS.push(item.serviceId)
          }
        })
      }
      // 授权的服务类型serviceId
      if (serviceIDS.length > 0) {
        this.serviceIDS = serviceIDS.sort()
        await this.initData()
      }
    },
    async initData() {
      let opmServiceList = await this.findOpsOrderProblemService({ pid: -1, limit: -1, ids: this.serviceIDS, type: 1 })
      // let opmServiceList = await this.findOpsOrderProblemService()
      const pids = []
      if (opmServiceList.length <= 0) return
      opmServiceList.forEach(item => { item.children = [] })
      this.opmServiceList = opmServiceList
      this.opmServiceList.forEach(v => {
        pids.push(v.serviceId)
      })
      // const opmServiceListChilidren = await this.findChildOpsOrderProblemService(pids)
      const opmServiceListChilidren = await this.findOpsOrderProblemService2({ pids: pids, limit: -1, ids: this.serviceIDS })
      if (opmServiceListChilidren.length <= 0) return

      this.opmServiceList.forEach((item, index) => {
        opmServiceListChilidren.forEach(v => {
          if (item.serviceId === v.pid) {
            // this.$set(this.opmServiceList[index], 'children', v)
            this.opmServiceList[index].children.push(v)
          }
        })
      })

      this.selectIndex1 = 0
      this.selectIndex2 = 0

      let selectOpmServiceListIndex = 0
      if (this.alarmId) {
        const idx = this.opmServiceList.findIndex(el => el.code === 'SXG')
        if (idx !== -1) {
          this.openNum = [idx + '']
          selectOpmServiceListIndex = idx
        }
      }

      // 编辑时的服务类型
      const serviceParentId = this.matterAppicationProps?.problemType
      const serviceChildId = this.matterAppicationProps?.serviceType

      if (serviceParentId) {
        const selectParentIndex = this.opmServiceList.findIndex(item => +item.serviceId === +serviceParentId)
        if (selectParentIndex !== -1) selectOpmServiceListIndex = selectParentIndex

        let selectChildIndex = null
        const childernData = this.opmServiceList[selectParentIndex].children
        if (childernData) selectChildIndex = childernData.findIndex(item => +item.serviceId === +serviceChildId)

        // 默认展开类型|选择
        this.openNum = [selectParentIndex + '']
        this.selectIndex1 = selectParentIndex
        this.selectIndex2 = selectChildIndex
        this.selectOrNot(selectParentIndex, selectChildIndex)
      }

      // this.chosen = 0
      const sidebarMessage = {urgencyType: this.opmServiceList[selectOpmServiceListIndex].urgencyType,
        severityType: this.opmServiceList[selectOpmServiceListIndex].children[0]?.severityType,
        effectType: this.opmServiceList[selectOpmServiceListIndex].children[0]?.effectType,
        problemType: this.opmServiceList[selectOpmServiceListIndex].serviceId,
        serviceType: this.opmServiceList[selectOpmServiceListIndex].children[0]?.serviceId,
        pName: this.opmServiceList[selectOpmServiceListIndex].serviceName,
        childName: this.opmServiceList[selectOpmServiceListIndex].children[0]?.serviceName,
        problemNo: this.opmServiceList[selectOpmServiceListIndex].code,
        instanceId: this.opmServiceList[selectOpmServiceListIndex].children[0]?.instanceId,
        formId: this.opmServiceList[selectOpmServiceListIndex].children[0]?.formId,
        flow: this.opmServiceList[selectOpmServiceListIndex].children[0]?.flow,
        groupId: this.opmServiceList[selectOpmServiceListIndex].children[0]?.groupId
      }
      this.$emit('emitParentService', sidebarMessage)
    },
    // 获取服务类型
    async findOpsOrderProblemService2(query) {
      const { code, data } = await request({ url: api.opm.findOpsOrderProblemService, data: query })
      if (code !== 1) return
      return data
    },

    async findOpsOrderProblemService(list) {
      const DATA = {pid: -1, ...list}
      const {code, data} = await request({url: api.opm.findOpsOrderProblemService, data: DATA})
      //   if (code === 1) this.classifyList = data
      if (code === 1) return data
    },
    async findChildOpsOrderProblemService(pids) {
      const {code, data} = await request({url: api.opm.findOpsOrderProblemService, data: {...this.listQuery, pids}})
      //   if (code === 1) this.classifyList = data
      if (code === 1) return data
    },
    chooseOne(item, item2, index, index2, event) {
      this.selectIndex1 = index
      this.selectIndex2 = index2
      // this.chosen = index
      this.openNum = [index + '']
      const sidebarMessage = {
        operateType: 'onClick',
        urgencyType: item2.urgencyType,
        severityType: item2.severityType,
        effectType: item2.effectType,
        problemType: item.serviceId,
        serviceType: item2.serviceId,
        pName: item.serviceName,
        childName: item2.serviceName,
        problemNo: item.code,
        instanceId: item2.instanceId,
        formId: item2.formId,
        flow: item2.flow,
        groupId: item2.groupId
      }
      this.$emit('emitParentService', sidebarMessage)
    },
    handleDeleteService() {
      if (!this.current.serviceId) return this.$message.error('请选择一条数据')
      this.$confirm('确定删除此条数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const {code } = await request({url: api.opm.deleteOpsOrderProblemService, data: {serviceId: this.current.serviceId}})
        if (code !== 1) return
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.initData()
      })
    },

    handleItem(item) {
      this.current = item
      this.$emit('emitParentService', item)
    },
    openChild(num) {
      return [`$[num]`]
    },
    setDefaultActive() {
      return '1'
    }
  }
}
</script>

<style lang="scss" scoped>

::v-deep .el-submenu .el-menu-item{
  height: 40px;
  line-height: 40px;
}
::v-deep .el-submenu__title, .el-menu-item{
  height: 40px;
  line-height: 40px;
}
 .serviceName{
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
.classify-sidebar{
  height: 100%;
//   width: 15%;
  background-color: #E5ECF6;
  overflow:hidden;
  overflow-y:scroll;
}
.sidebar-header{
  border-bottom: 4px solid #0145ab;
  padding: 10px;
  box-sizing: border-box;
  .header-btns{
    font-size: 16px;
    &>i{
      margin: 0 3px;
    }
  }
}
.sidebar-box{
  .sidebar-list{
    .list-item{
      // width: 100%;
      padding:10px;
      font-size: 14px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}
</style>
