<template>
  <div v-if="isShow || (!isShow && !watchItemShow)" v-loading="loading" class="dashboard-box-item width-100">
    <div class="box-item-content content-height-460">
      <div class="item-content-header">
        <div class="title">我的工单</div>
        <div class="line"><div class="blo" /></div>
        <div class="item-content">
          <el-switch
            v-if="isShow"
            v-model="modelDefineSwitch"
            @change="changemodelDefine"
          />
        </div>
      </div>
      <div class="item-content-body">
        <div class="content-body-btn">
          <el-button-group>
            <el-button v-for="item in valueBtns" :key="item.valueKey" :type="systemActiveSelect.valueKey === item.valueKey ? 'primary' : 'default'" @click="handleValue(item)">
              {{ item.name }}</el-button>
          </el-button-group>
        </div>
        <div class="task-list">
          <template v-if="problemList.length > 0">
            <div v-for="(item, index) in problemList" :key="index" class="task-list-item pointer" @click="handleCheck(item)">
              <div class="list-main flexBox align-item-center">
                <div class="list-tag" :class="systemActiveSelect.color">[{{ systemActiveSelect.name }}]</div>
                <el-tooltip class="item" effect="dark" :content="item.problemNo" placement="top-start">
                  <div class="list-title overflow-text-a">{{ item.problemNo }}</div>
                </el-tooltip>
              </div>
              <div class="list-footer">
                {{ item.createTime }}
              </div>
            </div>
          </template>
          <template v-else>
            <el-empty class="empty" description="暂无数据" />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OpsInfo',
  props: {
    agentId: {
      type: String,
      default: ''
    },
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      modelDefineSwitch: true,
      modelDefine: 'OpsInfo',
      watchItemShow: null,
      dashboardType: 1,
      modelShow: '',
      loading: true,
      valueBtns: [
        {
          name: '待处理',
          valueKey: 1,
          processState: 0,
          code: 'todoHandle',
          color: 'danger'
        },
        {
          name: '待计划',
          valueKey: 2,
          processState: 4,
          code: 'todoPlan',
          color: 'warning'
        },
        {
          name: '待审批',
          valueKey: 3,
          code: 'todoApprove',
          color: 'danger'
        }
      ],
      systemActiveSelect: {},
      problemList: []
    }
  },
  computed: {

  },
  beforeDestroy() {
    this.batchOffEventBus('get-meter-show')
  },
  mounted() {
    this.systemActiveSelect = this.valueBtns[0]
    this.$EventBus.$on('get-meter-show', (data) => {
      const idx = data.findIndex(item => item.modelDefine === this.modelDefine)
      if (idx !== -1) {
        this.watchItemShow = data[idx]
        this.modelDefineSwitch = Boolean(data[idx].modelShow)
      }
    })
    this.findProblemList()
    setTimeout(() => {
      this.loading = false
    }, 500)
  },
  methods: {
    // 更改显示配置
    changemodelDefine(val) {
      console.log(val)
      if (val === false) {
        // 新增
        this.$EventBus.$emit('change-meter-switch', {
          modelDefine: this.modelDefine,
          type: 1,
          modelShow: Number(val),
          dashboardType: 1
        })
      } else {
        // 删除
        this.$EventBus.$emit('change-meter-switch', {
          id: this.watchItemShow.id,
          modelDefine: this.modelDefine,
          type: 1,
          modelShow: Number(val),
          dashboardType: 1
        })
      }
    },
    // 点击按钮
    handleValue(item) {
      this.systemActiveSelect = item
      this.problemList = []
      this.findProblemList()
    },
    // 查询用户关联的分组
    async findHrUserGroupMap(query) {
      const { code, data } = await this.$request({
        url: this.api.sys.findHrUserGroupMap,
        data: query
      })
      if (code !== 1) return
      return data
    },
    // 查询分组关联事项
    async findOpsOrderProblem(query) {
      const { code, data } = await this.$request({
        url: this.api.opm.findOpsOrderProblem,
        data: query
      })
      if (code !== 1) return
      return data
    },
    // 查询审批
    async findApprove(query) {
      const { code, data } = await this.$request({
        url: this.api.approve.findApprove,
        data: query
      })
      if (code !== 1) return
      return data
    },
    // 查询事项
    // async findOpsOrderProblemEx(query) {
    //   const { code, data } = await this.$request({
    //     url: this.api.opm.findOpsOrderProblemEx,
    //     data: query
    //   })
    //   if (code !== 1) return
    //   return map
    // },
    // 获取事项
    async findProblemList() {
      if (this.systemActiveSelect.code !== 'todoApprove') {
        const findHrUserGroupMap = await this.findHrUserGroupMap({ userId: this.$auth.getUserSession().userId, limit: -1 })
        if (!findHrUserGroupMap) return
        const groupIds = []
        findHrUserGroupMap.forEach(item => groupIds.push(item.groupId))
        if (groupIds.length === 1) return
        // 调用findOpsOrderProblem 传参传groupIds就可以获取对应的运维小组事项，不需要调用findOpsOrderProblemEx
        const findOpsOrderProblem = await this.findOpsOrderProblem({ groupIds: this.$tool.uniqueArray(groupIds), limit: 10, page: 1, processState: this.systemActiveSelect.processState })
        if (findOpsOrderProblem) {
          this.problemList = findOpsOrderProblem
        }
      } else {
        const findApprove = await this.findApprove({
          approveType: this.$defineData.projectActivityProcessDefine('matter', 'key', 'id'),
          page: 1,
          limit: 10,
          userId: this.$auth.getUserSession().userId,
          approveStatue: ''
        })
        if (!findApprove) return
        const problemIds = []
        findApprove.forEach(item => problemIds.push(item.approveId))
        if (problemIds.length === 0) return
        const findOpsOrderProblem = await this.findOpsOrderProblem({ ids: this.$tool.uniqueArray(problemIds) })
        if (findOpsOrderProblem) {
          this.problemList = findOpsOrderProblem
        }
      }
    },
    handleCheck(row) {
      this.$router.push({
        name: 'matterDetail',
        query: {
          id: row.id
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.item-content {
  float: right;
  margin-top: -35px;
}
.item-content-body {
  .echart-box {
    width: 40%;
  }
  .content-body-btn {
    padding-top: 14px;
  }
  .task-list {
    overflow-y: auto;
    height: calc(100% - 50px);
    .task-list-item {
      margin: 22px 0;
      font-size: 14px;
      .list-tag {
        margin-right: 6px;
      }
      .list-footer {
        color: #999999;
        margin-top: 12px;
      }
      .list-title {
        width: 80%;
      }
    }
  }
}
</style>
