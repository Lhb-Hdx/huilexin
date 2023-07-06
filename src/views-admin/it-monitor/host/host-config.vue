<template>
  <div>
    <el-page-header class="p-10" :content="navTitle" @back="$router.go(-1)" />
    <ResourcesDetail :is-config="true" />
  </div>
</template>

<script>
import ResourcesDetail from '@/views/it-monitor/resources-monitor/monitor-detail'
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'HostConfig',
  components: {
    ResourcesDetail
  },
  computed: {
    navTitle() { return this.$route.meta.title },
    id() { return this.$route.query.id },
    zbxHostId() { return this.$route.query.zbxHostId }
  },
  mounted() {
    this.$EventBus.$on('change-item-switch', (data) => {
      // 系统类型
      if (data.type === 1) {
        if (data.isShow === 1) {
          this.deleteHyitHostGraphShow(data)
        } else {
          this.insertHyitHostGraphShow(data)
        }
      } else { // 自定义
        this.updateHyitHostGraphShow(data)
      }
    })
  },
  methods: {
    // 插入显示配置
    insertHyitHostGraphShow(data) {
      request({
        url: api.itMonitor.insertHyitHostGraphShow, data
      }).then(res => {
        if (res.code === 1) {
          this.findHyitHostGraphShow()
          this.$message.success('关闭显示成功')
          this.$EventBus.$emit('update-item-switch', { status: true, setIsShow: 0, name: data.name })
        } else {
          this.$message.error('关闭显示失败')
          this.$EventBus.$emit('update-item-switch', { status: false, setIsShow: 0, name: data.name })
        }
      })
    },
    // 查询显示配置
    findHyitHostGraphShow() {
      request({
        url: api.itMonitor.findHyitHostGraphShow, data: { hostId: this.id, zhostId: this.zbxHostId, limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.$EventBus.$emit('get-graph-show', res.data)
        }
      })
    },
    // 删除显示配置
    deleteHyitHostGraphShow(data, successText, errorText) {
      request({
        url: api.itMonitor.deleteHyitHostGraphShow, data: { id: data.id }
      }).then(res => {
        if (res.code === 1) {
          this.findHyitHostGraphShow()
          // 系统类型
          if (data.type === 1) {
            this.$message.success('开启显示成功')
            this.$EventBus.$emit('update-item-switch', { status: true, setIsShow: 1, name: data.name })
          } else {
            this.$message.error('删除成功')
            this.$EventBus.$emit('delete-item-switch', { status: true, name: data.name, itemId: data.itemid })
          }
        } else {
          // 系统类型
          if (data.type === 1) {
            this.$message.error('开启显示失败')
            this.$EventBus.$emit('update-item-switch', { status: false, setIsShow: 1, name: data.name })
          } else {
            this.$message.error('删除失败')
            this.$EventBus.$emit('delete-item-switch', { status: false, name: data.name, itemId: data.itemid })
          }
        }
      })
    },
    // 编辑显示配置
    updateHyitHostGraphShow(data) {
      request({
        url: api.itMonitor.updateHyitHostGraphShow, data: { id: data.id, isShow: data.isShow }
      }).then(res => {
        if (res.code === 1) {
          this.$message.success(data.isShow === 0 ? '关闭显示成功' : '开启显示成功')
          this.findHyitHostGraphShow()
          this.$EventBus.$emit('update-item-switch', { status: false, setIsShow: data.isShow, name: data.name })
        } else {
          this.$message.error(data.isShow === 0 ? '关闭显示失败' : '开启显示失败')
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
