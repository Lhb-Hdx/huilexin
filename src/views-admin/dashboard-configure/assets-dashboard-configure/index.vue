<template>
  <div>
    <Assets :is-show="true" />
  </div>
</template>

<script>
import Assets from '@/views/dashboard/assets'
import request from '@/utils/request'
import api from '@/api/api'
export default {
  name: 'AssetsDashboardConfigure',
  components: {
    Assets
  },
  data() {
    return {
      isShow: 'true'
    }
  },
  mounted() {
    this.$EventBus.$on('change-meter-switch', (data) => {
      console.log(data)
      // 系统类型
      if (data.type === 1) {
        if (data.modelShow === 1) {
          console.log('删除')
          this.deleteDashboardShow(data)
        } else {
          console.log('添加')
          this.insertDashboardShow(data)
        }
      } else { // 自定义
        this.updateHyitHostGraphShow(data)
      }
    })
  },
  methods: {
    // 查询显示配置
    findDashboardShow() {
      request({
        url: api.opm.findDashboardShow, data: { page: 1, limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          console.log(res)
          this.$EventBus.$emit('get-meter-show', res.data)
        }
      })
    },
    // 插入显示配置
    insertDashboardShow(data) {
      console.log(data)
      request({
        url: api.opm.insertDashboardShow, data
      }).then(res => {
        if (res.code === 1) {
          this.findDashboardShow()
          this.$message.success('关闭显示成功')
        } else {
          this.$message.error('关闭显示失败')
        }
      })
    },
    // 删除显示配置
    deleteDashboardShow(data) {
      console.log(data)
      request({
        url: api.opm.deleteDashboardShow, data: { id: data.id }
      }).then(res => {
        if (res.code === 1) {
          this.findDashboardShow()
          // 系统类型
          if (data.type === 1) {
            this.$message.success('开启显示成功')
          } else {
            this.$message.error('删除成功')
          }
        } else {
          // 系统类型
          if (data.type === 1) {
            this.$message.error('开启显示失败')
          } else {
            this.$message.error('删除失败')
          }
        }
      })
    },
    // 编辑显示配置
    updateDashboardShow(data) {
      request({
        url: api.opm.updateDashboardShow, data: { id: data.id, isShow: data.isShow }
      }).then(res => {
        if (res.code === 1) {
          this.$message.success(data.isShow === 0 ? '关闭显示成功' : '开启显示成功')
          this.findDashboardShow()
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
