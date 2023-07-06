<template>
  <div class="opm-sidebar">
    <div class="sidebar-header flex-v-between">
      <div class="font-18">服务类型</div>
      <div class="header-btns" />
    </div>
    <div class="sidebar-box">
      <el-menu background-color="#e5ecf6" :default-active="setDefaultActive()" active-text-color="#303133" @open="expansionChildren($event, true)" @close="expansionChildren($event, false)">
        <el-submenu v-for="(item,index) in classifyList" :key="item.serviceId" :index="index+''">
          <template slot="title">
            <el-tooltip effect="dark" :content="item.serviceName" placement="top">
              <div class="serviceName">
                {{ item.serviceName }}
              </div>
            </el-tooltip>
          </template>
          <el-menu-item v-for="(item2,index2) in item.children" :key="item2.serviceId" :style="selectOrNot(index,index2)" @click="chooseOne(item,item2,index,index2)">
            <div class="serviceMessage">
              <div class="serviceName">
                <el-tooltip effect="dark" :content="item2.serviceName" placement="top">
                  <div class="serviceName">
                    {{ item2.serviceName }}
                  </div>
                </el-tooltip>
              </div>
              <!-- <div class="serviceCount">（{{ item2.count||0 }}）</div> -->
            </div>
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
    groupIds: {
      type: Array,
      default() {
        return []
      }
    },
    groupIdsDataType: {
      type: String,
      default: 'prop'
    }
  },
  data() {
    return {
      classifyList: [],
      serviceIDS: [],
      current: {},
      selectIndex1: '',
      selectIndex2: '',
      chosen: '',
      allServiceTypeCount: [] // 服务类型事项数量
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
    menuQuery() {
      return this.$route.meta.menuQuery
    }
  },
  async mounted() {
    await this.infoSysAdmin()
    // await this.initData()
  },
  methods: {
    // 获取用户角色服务授权id
    async infoSysAdmin() {
      const userInfo = this.localStorageOperation('get', 'userInfo')
      const RoleData = await request({url: api.sys.findRoleByUser, data: { userId: +userInfo.userId }})

      let RoleService = []
      for (let item of RoleData.data) {
        if (item?.roleId) {
          const res = await request({url: api.sys.findSysRoleService, data: { roleId: item.roleId, limit: -1}})
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
    // 初始化
    async initData() {
      this.classifyList = await this.findOpsOrderProblemService({ pid: -1, limit: -1, ids: this.serviceIDS, type: 1})// type:0事项
      // console.log('findHyitDevType', this.classifyList)
    },
    // 展开服务类型
    async expansionChildren(e, status) {
      if (status) {
        // console.log('this.classifyList[e]', e, this.classifyList[e])
        const currentClassifyIndexItem = this.classifyList[e]
        // const childrenClassifyList = await this.findOpsOrderProblemService({ pid: currentClassifyIndexItem.serviceId, limit: -1 })
        const childrenClassifyList = await this.findOpsOrderProblemService({ pid: currentClassifyIndexItem.serviceId, limit: -1, ids: this.serviceIDS })
        if (childrenClassifyList.length > 0) {
          childrenClassifyList.forEach(item => {
            const allServiceTypeCountIndex = this.allServiceTypeCount.findIndex(items => +items.serviceType === +item.serviceId)
            if (allServiceTypeCountIndex !== -1) item.count = +this.allServiceTypeCount[allServiceTypeCountIndex].serviceTypeCount
          })
        }
        // console.log('children', childrenClassifyList, this.classifyList[e])
        this.$set(this.classifyList[e], 'children', childrenClassifyList)
      }
    },
    // 获取服务类型
    async findOpsOrderProblemService(query) {
      const { code, data } = await request({ url: api.opm.findOpsOrderProblemService, data: query })
      if (code !== 1) return
      return data
    },
    // 获取服务类型事项数量
    async countNumByDateAndServiceType(query) {
      const {code, map} = await this.$request({url: this.api.opm.countNumByDateAndServiceType, data: query})
      if (code === 1 && map) {
        return map.result
      } else {
        return []
      }
    },
    // 设置默认
    setDefaultActive() {
      return '1'
    },
    // 选择菜单
    chooseOne(item, item2, index, index2) {
      this.$emit('emitServiceChange', item2.serviceId)
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
    async getCountNumByDateAndServiceTypeData(groupIds) {
      this.allServiceTypeCount = await this.countNumByDateAndServiceType({ groupIds })
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-menu-item{
  padding: 0 30px 0 45px !important;
}
.opm-sidebar{
  height: 100%;
  width: 240px;
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
  .serviceMessage{
    display: flex;
    position: relative;
    //  .serviceCount{
    //    position: absolute;
    //    right: 0;
    //    top: 0;
    //  }
  }
}
  .serviceName{
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
