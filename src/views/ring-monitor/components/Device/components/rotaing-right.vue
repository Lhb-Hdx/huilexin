<template>
  <div
    class="main"
  >
    <el-card
      v-for="item in lanmu"
      :key="item.id"
      :body-style="{ padding: '10px 0 10px 0' }"
      class="mb-20 ring-card"
      shadow="never"
      style="border:none"
    >
      <!-- <div> -->

      <div
        slot="header"
        class="flex-v-between"
      >
        <span>{{ item.dhMenuItem.columnName }}</span>
        <el-button
          v-if="showConfig"
          size="small"
          type="primary"
          @click="dialogOpen(item)"
        >配置</el-button>
      </div>
      <component
        :is="componentName(item.dhMenuItem.displayType)"
        :id="id"
        :key="item.dhMenuItem.id"
        :list="item"
        :time-type="timeType"
        :type="type[index]"
        @changTime="changTime"
        @changeLoading="ChangeLoading"
      />
      <!-- </div> -->

    </el-card>
    <Dialog
      v-if="dislogShow"
      ref="dialog"
      @update="update"
    />

    <el-empty v-if="!lanmu.length && showConfig" style="margin-top:46px;height:calc(100% - 46px)">
      <el-button type="primary" @click="$router.push({name:'content-union-menu'})">点击配置栏目</el-button>
    </el-empty>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Groove from './groove.vue'
// import Dialog from './components/dialog.vue'
import Echart from './echart.vue'
import Gauge from './gauge.vue'
import SwitchOc from './switch.vue'
import Histogram from '@/views/ring-monitor/components/Device/components/histogram'
import { dateFormat } from '@/utils/utils'
export default {
  name: 'RotaingRight',
  components: {
    Groove,
    Dialog: () => import('./dialog.vue'),
    Echart,
    Gauge,
    SwitchOc,
    Histogram
  },
  props: {
    id: {
      type: [String, Number],
      default: ''
    },
    showConfig: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      today: '2021-12-17',
      dhMenuList: [],
      lanmuLoading: true,
      lanmu: [],
      type: [],
      index: [],
      dislogShow: false,
      timeType: 1
    }
  },
  computed: {
    // list() {
    //   return this.lanmu.sort((a, b) => {
    //     if (a.dhMenuItem.priority === b.dhMenuItem.priority) {
    //       return 1
    //     } else {
    //       return a.dhMenuItem.priority - b.dhMenuItem.priority
    //     }
    //   })
    // },
    componentName() {
      return function(displayType) {
        return displayType === 0
          ? 'Groove'
          : displayType === 1
            ? 'Echart'
            : displayType === 2
              ? 'Gauge'
              : displayType === 3 ? 'SwitchOc' : displayType === 4 ? 'Histogram' : ''
      }
    }
  },
  watch: {
    id(n) {
      this.dhMenuList = []
      this.lanmu = []
      this.timeType = 1
      this.handleCurrentChange(n)
    }
  },
  created() {
    this.dhMenuList = []
    this.lanmu = []
    this.handleCurrentChange(this.id)
    this.today = dateFormat('YYYY-mm-dd', new Date())
  },
  methods: {
    changTime(e) {
      this.timeType = e
      this.handleCurrentChange(this.id)
    },
    ChangeLoading(val) {

      // if (val[0].length > 0) {
      // this.showLoading = !(val[0].length > 0)
      // }
    },
    async handleCurrentChange(id) {
      if (!id) return
      this.lanmu = []
      this.dhMenuList = []
      const _this = this

      await this.findHyitDhMenu(id)
      // 返回一下菜单的条数，组态图那边依靠这个来判断是否显示空状态
      this.$emit('dhMenuListLength', this.dhMenuList.length)
      // this.dhMenuList.forEach(dhMenuItem => {
      //   let hyitDeviceIds = []
      //   this.findHyitDhMenuValue(dhMenuItem.id).then(res => {
      //     if (!res.length) { // 没有需要显示的不往下走
      //       return this.$set(this.lanmu, this.lanmu.length, { dhMenuItem, res: [] })
      //     }
      //     const ids = res.map(it => it.vid).join(',')
      //     _this.findHyitDeviceValue(ids).then(hyitDevice => {
      //       const ids1 = hyitDevice.map(it => it.hyType).join(',')
      //       _this.findHyitValueType(ids1).then(hyitValueType => {
      //         if (dhMenuItem.deviceId !== this.id) return // 阻止网络慢栏目错乱
      //         if (this.lanmu.find(it => it.dhMenuItem.id === dhMenuItem.id)) return // 阻止点击过快栏目错乱
      //         if (+dhMenuItem['displayType'] === 0) {
      //           this.$set(this.lanmu, this.lanmu.length, { hyitDeviceIds, hyitDevice, hyitValueType, dhMenuItem, res })
      //         }
      //         if (+dhMenuItem['displayType'] === 1) {
      //           hyitDevice.forEach(it => {
      //             hyitDeviceIds.push({ hyVid: it.hyVid, hyDes: it.hyDes })
      //           })
      //           this.$set(this.lanmu, this.lanmu.length, { hyitDeviceIds, hyitDevice, hyitValueType, dhMenuItem, res })
      //         }
      //         if (+dhMenuItem['displayType'] === 2) {
      //           this.$set(this.lanmu, this.lanmu.length, { hyitDeviceIds, hyitDevice, hyitValueType, dhMenuItem, res })
      //         }
      //         if (+dhMenuItem['displayType'] === 3) {
      //           this.$set(this.lanmu, this.lanmu.length, { hyitDeviceIds, hyitDevice, hyitValueType, dhMenuItem, res })
      //         }
      //         if (+dhMenuItem['displayType'] === 4) {
      //           this.$set(this.lanmu, this.lanmu.length, { hyitDeviceIds, hyitDevice, hyitValueType, dhMenuItem, res })
      //         }

      //       })
      //     })
      //   })
      // })

      let column = []
      for (const dhMenuItem of this.dhMenuList) {
        let hyitDeviceIds = []
        let res = await this.findHyitDhMenuValue(dhMenuItem.id)
        if (!res.length) { // 没有需要显示的不往下走
          column.push({ dhMenuItem, res: [] })
          continue
        }
        const ids = res.map(it => it.vid).join(',')
        let hyitDevice = await _this.findHyitDeviceValue(ids)
        const ids1 = hyitDevice.map(it => it.hyType).join(',')
        let hyitValueType = await _this.findHyitValueType(ids1)
        if (dhMenuItem.deviceId !== this.id) continue // 阻止网络慢栏目错乱
        if (column.find(it => it.dhMenuItem.id === dhMenuItem.id)) continue // 阻止点击过快栏目错乱
        if (+dhMenuItem['displayType'] === 0) {
          column.push({ hyitDeviceIds, hyitDevice, hyitValueType, dhMenuItem, res })
        }
        if (+dhMenuItem['displayType'] === 1) {
          hyitDevice.forEach(it => {
            hyitDeviceIds.push({ hyVid: it.hyVid, hyDes: it.hyDes })
          })
          column.push({ hyitDeviceIds, hyitDevice, hyitValueType, dhMenuItem, res })
        }
        if (+dhMenuItem['displayType'] === 2) {
          column.push({ hyitDeviceIds, hyitDevice, hyitValueType, dhMenuItem, res })
        }
        if (+dhMenuItem['displayType'] === 3) {
          column.push({ hyitDeviceIds, hyitDevice, hyitValueType, dhMenuItem, res })
        }
        if (+dhMenuItem['displayType'] === 4) {
          column.push({ hyitDeviceIds, hyitDevice, hyitValueType, dhMenuItem, res })
        }
      }
      console.log('column: ', column)
      this.lanmu = column.sort((a, b) => {
        if (a.dhMenuItem.priority === b.dhMenuItem.priority) {
          return 1
        } else {
          return a.dhMenuItem.priority - b.dhMenuItem.priority
        }
      })
    },
    async dialogOpen(item) {
      this.dislogShow = true
      await this.$nextTick()
      await this.$nextTick()
      this.$refs.dialog.open(item)
    },
    update() {
      this.handleCurrentChange(this.id)
      this.dislogShow = false
    },
    async findHyitDeviceMap(deviceId) {
      let { code, data } = await request({
        url: api.powerEnv.findHyitDeviceMap,
        data: { limit: -1, hyDeviceId: deviceId }
      })
      if (code !== 1) return
      return data
    },
    // 获取设备值
    async findHyitDeviceValue(vids, hyDeviceId) {
      let { code, data } = await request({
        url: api.powerEnv.findHyitDeviceValue,
        data: { limit: -1, ids: vids, hyDeviceId }
      })
      if (code !== 1) return
      return data
    },
    // 获取设备类型数据
    async findHyitValueType(hyType) {
      let { code, data } = await request({
        url: api.powerEnv.findHyitValueType,
        data: { limit: -1, ids: hyType }
      })
      if (code !== 1) return
      return data
    },
    async findHyitDhMenu(deviceId) {
      // 栏目
      let { code, data } = await request({
        url: api.powerEnv.findHyitDhMenu,
        data: { deviceId, limit: -1 }
      })
      this.lanmuLoading = false
      if (code !== 1) return
      this.dhMenuList = data
      if (this.dhMenuList.length === 0) {
        this.$message({type: 'warning', message: '请配置栏目', center: true})
      }

      return data
    },
    async findHyitDhMenuValue(columnId) {
      // 栏目
      let { code, data } = await request({
        url: api.powerEnv.findHyitDhMenuValue,
        data: { columnId, limit: -1}
      })
      if (code !== 1) return
      return data
    }
  }
}
</script>
<style lang="scss" scoped>
// .el-message {
// top: 20px !important;
// }
// .el-message:not(:last-child){
// visibility: hidden;
// }
.main {
  width: 100%;
  height: 100%;
  flex: 1;
  overflow: hidden;
  overflow-y: scroll;
  padding-bottom: 120px;
}
.main::-webkit-scrollbar {
  display: none;
}
::v-deep .ring-card{
  .el-card__header{
    //border: 1px solid #eee;
    border-bottom: none;
    background: #F8F8F8;
    //border-radius: 4px;
  }
}
::v-deep .el-loading-spinner{
  font-size: 30px;
}
</style>
