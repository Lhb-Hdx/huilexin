<template>
  <div>
    <div class="classify-sidebar">
      <div class="resize-bar" />
      <div class="resize-line" />
      <div class="resize-save">
        <div class="sidebar-header flex-v-between">
          <div class="font-18">服务类型</div>
          <div class="header-btns">
            <i v-permission="['edit']" class="el-icon-edit-outline pointer" @click="handleEditService" />
            <i v-permission="['add']" class="el-icon-plus pointer" @click="handleOpenServiceDialog" />
            <i v-permission="['delete']" class="el-icon-minus pointer" @click="handleDeleteService" />
          </div>
        </div>

        <div class="sidebar-box">
          <div class="sidebar-list">
            <div v-for="item in classifyList" :key="item.serviceId" class="list-item pointer" :style="{ background:current.serviceId===item.serviceId?'rgba(207, 219, 246)':''}" @click="handleItem(item)">{{ item.serviceName }}</div>
          </div>
        </div>
      </div>
    </div>

    <ServiceDialog ref="ServiceDialog" :type="1" @updateData="initData" @cleanCurrent="current={}" />
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import ServiceDialog from './service-dialog.vue'

export default {
  components: {
    ServiceDialog
  },
  data() {
    return {
      classifyList: [],
      current: {}
    }
  },
  async mounted() {
    await this.initData()
  },
  methods: {
    async initData() {
      await this.findOpsOrderProblemService()
      let item = {}
      if (this.current['serviceId']) {
        const idx = this.classifyList.find(it => +it['serviceId'] === +this.current['serviceId'])
        if (idx)item = idx
        else item = this.classifyList[0]
      } else item = this.classifyList[0]
      this.handleItem(item)
    },
    async findOpsOrderProblemService() {
      const { code, data } = await this.$request({ url: api.opm.findOpsOrderProblemService, data: { pid: -1, limit: -1 } })
      if (code === 1) this.classifyList = data
    },
    async deleteOpsOrderProblemServiceMap(serviceId) {
      const {code, msg} = await this.$request({url: this.api.opm.deleteOpsOrderProblemServiceMap, data: {serviceId}})
      return {code, msg}
    },
    handleDeleteService() {
      if (!this.current.serviceId) return this.$message.error('请选择一条数据')
      this.$confirm('确定删除此条数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { code } = await request({ url: api.opm.deleteOpsOrderProblemService, data: { serviceId: this.current.serviceId } })
        await this.deleteOpsOrderProblemServiceMap(this.current.serviceId)
        if (code !== 1) return
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        await this.initData()
        this.handleItem(this.classifyList[0])
      })
    },
    handleEditService() {
      if (!this.current.serviceId) return this.$message.error('请选择一条数据')
      this.$refs.ServiceDialog.open(this.current, false, 'edit')
    },
    handleOpenServiceDialog() {
      this.$refs.ServiceDialog.open()
    },
    handleItem(item) {
      this.current = item
      this.$emit('emitParentService', item, this.classifyList)
    }
  }
}
</script>

<style lang="scss" scoped>
.classify-sidebar {
  height: 100%;
  position: relative;
  background-color: #e5ecf6;
}
.sidebar-header {
  border-bottom: 4px solid #0145ab;
  padding: 10px;
  box-sizing: border-box;
  .header-btns {
    font-size: 16px;
    & > i {
      margin: 0 3px;
    }
  }
}
.sidebar-box {
  .sidebar-list {
    .list-item {
      padding: 10px;
      font-size: 14px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}

.resize-save {
  position: absolute;
  top: 0;
  right: 5px;
  bottom: 0;
  left: 0;
  padding: 16px;
  box-shadow: border-box;
  overflow-x: hidden;
}

.resize-bar {
  width: 300px;
  height: inherit;
  resize: horizontal;
  cursor: ew-resize;
  opacity: 0;
  overflow-x: scroll;
  background-color: red;
}

/* 拖拽线 */

.resize-line {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  border-right: 2px solid #eee;
  border-left: 1px solid #bbb;
  pointer-events: none;
}

.resize-bar:hover ~ .resize-line,
.resize-bar:active ~ .resize-line {
  border-left: 1px dashed skyblue;
}

.resize-bar::-webkit-scrollbar {
  width: 10px;
  position: absolute;
  height: 100vh;
}

/* Firefox只有下面一小块区域可以拉伸 */
@supports (-moz-user-select: none) {
  .resize-bar:hover ~ .resize-line,
  .resize-bar:active ~ .resize-line {
    border-left: 1px solid #bbb;
  }

  .resize-bar:hover ~ .resize-line::after,
  .resize-bar:active ~ .resize-line::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    bottom: 0;
    right: -8px;
    background-size: 100% 100%;
  }
}
</style>
