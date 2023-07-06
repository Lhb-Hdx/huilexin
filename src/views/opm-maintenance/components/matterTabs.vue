<template>
  <div class="matter-tabs">
    <div class="tabs-wrapper">
      <div class="submissionWrapper">
        <div class="stateWrapper">
          <el-menu mode="horizontal" collapse-transition default-active="0" class="titleNavi">
            <el-menu-item v-for="(item, index) in getTabProp" :key="index" :index="index + ''" @click="freshTableList(item, index)">{{ item.value }} （{{ item.count }}）</el-menu-item>
          </el-menu>
          <div class="searchWrapper flex">
            <el-button class="margin-right-5" type="primary" @click="handlerToAdd">事项申请</el-button>
            <div class="search-input-group">
              <el-input v-model="searchKeyword" style="width:200px" />
              <el-button type="primary" @click="handlerSearch">搜索</el-button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    itemType: {
      type: String,
      default: ''
    },
    statisticsCountParam: {
      type: Array,
      default() {
        return []
      }
    },
    tabsList: {
      type: Array,
      default() {
        return []
      }
    },
    approveTabCount: {
      type: Number,
      default() {
        return 0
      }
    },
    userGroupIds: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      searchKeyword: '',
      tabCount: {},
      getTabProp: {}
    }
  },
  computed: {
    menuQuery() {
      return this.$route.meta.menuQuery
    }
  },
  watch: {
    tabsList: {
      handler() {
        if (this.tabsList) {
          this.getTabProp = this.tabsList
        }
      },
      deep: true
    }
  },
  methods: {
    // 点击tab后触发
    freshTableList(item) {
      this.$store.dispatch('opm/setState', { stateName: 'tabsItemCode', stateData: item.code })
      this.$store.dispatch('opm/setState', { stateName: 'tabsItemStatus', stateData: item.statue })
      this.$emit('emitSetTableList', item)
    },
    // 点击搜索
    handlerSearch() {
      this.$emit('emitHandlerSearch', this.searchKeyword)
    },
    // 获取tab统计
    async getTabCount(getGroupIds) {
      for (let i = 0; i < this.statisticsCountParam.length; i++) {
        let query = {}

        if (this.statisticsCountParam[i].query) query = { ...this.statisticsCountParam[i].query }
        if (+this.menuQuery.tableDataType === 2 && this.statisticsCountParam[i].findMyKey) {
          if (this.statisticsCountParam[i].findMyKey === 'userId' || this.statisticsCountParam[i].findMyKey === 'approveUserId') query[`${this.statisticsCountParam[i].findMyKey}`] = this.$auth.getUserSession().userId
          if (this.statisticsCountParam[i].findMyKey === 'groupIds') query[`${this.statisticsCountParam[i].findMyKey}`] = getGroupIds
        }
        const { code, map } = await this.$request({
          url: this.statisticsCountParam[i].api,
          data: {...query, type: 0, serviceType: this.$parent.currentServiceType}// type:0统计服务类型为0的数量，
        })
        if (code !== 1) return
        const tabCount = map.count
        this.getTabProp.forEach(item => {
          if (item.stateField === this.statisticsCountParam[i].inTabStateField) {
            if (this.statisticsCountParam[i].api === '/admin/findNewOaApproveLogStatistics') {
              const countFilter = tabCount.filter(items => +item.tabQuery[`${item.stateField}`] === +items[`${this.statisticsCountParam[i].key}`])
              item.count = countFilter.length
            } else {
              const countIndex = tabCount.findIndex(items => +item.tabQuery[`${item.stateField}`] === +items[`${this.statisticsCountParam[i].key}`])
              if (countIndex !== -1) item.count = tabCount[countIndex][`${this.statisticsCountParam[i].value}`]
            }
          }
        })

        // 待计划 被驳回 使用统计接口会把历史已经结束的流程也统计出来
        if (this.itemType === 'todo-plan') {
          let api = ''
          let todoPlanRejectQuery = {}
          if (+this.menuQuery.tableDataType === 1) {
            // 所有事项的 被驳回 就调用事项表接口 statue 4
            api = this.api.opm.findOpsOrderProblem
            todoPlanRejectQuery = { limit: 1, statue: 4 }
          } else {
            // 我的事项的 被驳回 就调用 findOpsOrderProblemEx statue 4
            // 新的改为调用findOpsOrderProblem 参数传groupIds就好，不需要findOpsOrderProblemEx
            api = this.api.opm.findOpsOrderProblem
            todoPlanRejectQuery = { groupIds: getGroupIds, limit: 1, statue: 4 }
          }
          const { count: todoPlanRejectDataCount, code: todoPlanRejectDataCountCount } = await this.$request({
            url: api,
            data: todoPlanRejectQuery
          })
          if (todoPlanRejectDataCountCount === 1) {
            const getTabPropIndex = this.getTabProp.findIndex(items => items.code === 'reject')
            if (getTabPropIndex !== -1) this.$set(this.getTabProp[getTabPropIndex], 'count', +todoPlanRejectDataCount)
          }
        }

        // 待审批的数量从获取到的待审批数据总数量总取
        if (this.itemType === 'todo-approve') {
          const getTabPropIndex = this.getTabProp.findIndex(items => items.code === 'approve')
          if (getTabPropIndex !== -1) this.$set(this.getTabProp[getTabPropIndex], 'count', +this.approveTabCount)
        }
      }
    },
    handlerToAdd() {
      this.$router.push({
        name: 'matterApplication'
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.matter-tabs {
  height: 100%;
  width: 100%;
  position: relative;
  .tabs-wrapper {
    // height: 100px;
    .submissionWrapper {
      .stateWrapper {
        display: flex;
        justify-content: space-between;
        .titleNavi{
          flex: 1;
          display: flex;
        }
        .searchWrapper {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          padding: 0 20px 0 0;
          background-color: #ffffff;
          border-bottom: 1px solid #e6e6e6;
        }
      }
    }
  }
}
</style>
