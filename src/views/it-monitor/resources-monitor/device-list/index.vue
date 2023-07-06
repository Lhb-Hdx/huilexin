<template>
  <div class="flex-container">
    <DevicePer :dev-type-list="devTypeList" />
    <DeviceList :dev-type-list="devTypeList" />
  </div>
</template>

<script>
import DeviceList from '@/views/it-monitor/resources-monitor/device-list/device-list.vue'
import DevicePer from '@/views/it-monitor/resources-monitor/device-list/device-per.vue'
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'DeviceListIndex',
  components: {
    DeviceList,
    DevicePer
  },
  data() {
    return {
      devTypeList: []
    }
  },
  mounted() {
    this.loadItType()
  },
  methods: {
    // 获取设备类型
    loadItType() {
      this.paginationShow = false
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          res.data.forEach(item => {
            item.thumb = `image/it-monitor/it-monitor-type-icon-${item.id}.png`
            item.count = 0
            item.active = false
          })
          this.devTypeList = res.data
          this.devTypeList.splice(0, 0, {
            id: 0,
            dictdataName: '所有',
            thumb: `image/it-monitor/it-monitor-type-icon.png`,
            count: 0,
            active: true
          })
          this.$nextTick(() => {
            // if (this.devTypeList.length > 0) {
            //   this.findHyitHostQuery.devType = this.devTypeList[0].id === 0 ? '' : this.devTypeList[0].id
            // }
            const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
            if (pageQuery && !this.deviceTypeId) {
              // this.findHyitHostQuery = pageQuery
              const idx = this.devTypeList.findIndex(item => item.id === pageQuery.devType)
              this.devTypeList.forEach(item => {
                item.active = false
              })
              if (idx !== -1) {
                this.$set(this.devTypeList[idx], 'active', true)
                this.devTypeId = this.devTypeList[idx].id
              }
            }
            if (this.deviceTypeId) {
              const idx = this.devTypeList.findIndex(item => +item.id === +this.deviceTypeId)
              if (idx !== -1) {
                this.devTypeList.forEach(item => {
                  item.active = false
                })
                // this.$set(this.findHyitHostQuery, 'devType', this.deviceTypeId)
                // this.$set(this.findHyitHostQuery, 'page', 1)
                // this.$set(this.findHyitHostQuery, 'limit', 10)
                this.$set(this.devTypeList[idx], 'active', true)
              }
            }
            this.findHyitHost()
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.flex-container {
  width:100%;height:100%;position:relative;
  .left-tools {
    position: fixed;
    // position: absolute;top:0;left:0;bottom: 0;
    width: 240px;height: 100%;
    // min-height: calc(100vh - 146px);
    /*border-right: solid 1px #e6e6e6;*/
    background-color: #E5ECF6;
    overflow-y:scroll;
    overflow-x: hidden;
    .left-box{width: 100%;height: 100%;position: relative;}
    .echart-box{
      width: 240px;
      height: 200px;
      position: fixed;
      background-color: #E5ECF6;
      // top:0;
      // left:0;
      // right:0;
      .pieBar{
        flex: 1;
        width: 80%;
        height: 80%;
        margin: 0 10%;
      }
    }
    .cat-box{
      box-sizing: border-box;z-index: 50;padding-top:200px;
      .dev-type-item{
        padding:0 20px;box-sizing: border-box;cursor: pointer;
        height:45px;width:100%;line-height:45px;
        display:flex;justify-content: space-between;
        font-size: 14px;
        >div:first-child{
          display: flex;justify-content: flex-start;
          img{width:16px;height: 16px;margin-right: 10px; margin-top:15px}
        }
        .count{color: #999;}
      }
      .dev-type-item:hover,.dev-type-item.active {
        background:#B7CBE7;
      }
    }

  }
  .right-tools {
    // width: calc(100% - 300px);
    padding-left:240px;box-sizing: border-box;height: 100%;
  }
}
.monitoring-box{
  display: flex;flex-wrap:wrap;
  >div{margin-right: 5px;margin-bottom:5px;border: 1px solid #eee;padding:3px 5px;width: 70px;}
  >div.active{background: green;color:#fff;}
}
.el-tag--dark.el-tag--info { background: #cccccc;}
.reload-tag {
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 4px;
  background: #f8f8f8;
  color: #b1b1b1;
}
</style>
