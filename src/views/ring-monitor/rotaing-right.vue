<template>
  <div class="main">
    <el-card
      v-for="item in list"
      :key="item.id"
      :body-style="{ padding: '10px' }"
      class="mb-20"
      shadow="never"
    >
      <div
        slot="header"
        class="flex-v-between"
      >
        <span>{{ item.dhMenuItem.columnName }}</span>
        <el-button
          v-if="showConfig"
          v-permission="['deploy']"
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
      />
    </el-card>
    <Dialog
      v-if="dislogShow"
      ref="dialog"
      @update="update"
    />

    <el-empty v-if="!lanmu.length && showConfig" style="margin-top:46px;height:calc(100% - 46px)" />
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Groove from './components/groove.vue'
// import Dialog from './components/dialog.vue'
import Echart from './components/echart.vue'
import Gauge from './components/gauge.vue'
import { dateFormat } from '@/utils/utils'
export default {
  name: 'RotaingRight',
  components: {
    Groove,
    Dialog: () => import('./components/dialog.vue'),
    Echart,
    Gauge
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
      lanmu: [],
      type: [],
      index: [],
      dislogShow: false,
      timeType: 1
    }
  },
  computed: {
    list() {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      return this.lanmu.sort((a, b) => {
        return a.dhMenuItem.priority - b.dhMenuItem.priority
      })
    },
    componentName() {
      return function(displayType) {
        return displayType === 0
          ? 'Groove'
          : displayType === 1
            ? 'Echart'
            : displayType === 2
              ? 'Gauge'
              : ''
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
    async handleCurrentChange(id) {
      if (!id) return
      this.lanmu = []
      this.dhMenuList = []
      const _this = this

      await this.findHyitDhMenu(id)
      // 返回一下菜单的条数，组态图那边依靠这个来判断是否显示空状态
      this.$emit('dhMenuListLength', this.dhMenuList.length)
      this.dhMenuList.forEach(dhMenuItem => {
        let hyitDeviceIds = []
        this.findHyitDhMenuValue(dhMenuItem.id).then(res => {
          if (!res.length) { // 没有需要显示的不往下走
            return this.$set(this.lanmu, this.lanmu.length, { dhMenuItem, res: [] })
          }
          const ids = res.map(it => it.vid).join(',')
          _this.findHyitDeviceValue(ids).then(hyitDevice => {
            const ids1 = hyitDevice.map(it => it.hyType).join(',')
            _this.findHyitValueType(ids1).then(hyitValueType => {
              if (+dhMenuItem['displayType'] === 0) {
                if (dhMenuItem.deviceId !== this.id) return // 阻止网络慢栏目错乱
                if (this.lanmu.find(it => it.dhMenuItem.id === dhMenuItem.id)) return // 阻止点击过快栏目错乱
                this.$set(this.lanmu, this.lanmu.length, { hyitDeviceIds, hyitDevice, hyitValueType, dhMenuItem, res })
              }
              if (+dhMenuItem['displayType'] === 1) {
                if (dhMenuItem.deviceId !== this.id) return // 阻止网络慢栏目错乱
                if (this.lanmu.find(it => it.dhMenuItem.id === dhMenuItem.id)) return // 阻止点击过快栏目错乱
                hyitDevice.forEach(it => {
                  hyitDeviceIds.push({ hyVid: it.hyVid, hyDes: it.hyDes, hyVname: it.hyVname })
                })
                this.$set(this.lanmu, this.lanmu.length, { hyitDeviceIds, hyitDevice, hyitValueType, dhMenuItem, res })
              }
              if (+dhMenuItem['displayType'] === 2) {
                if (dhMenuItem.deviceId !== this.id) return // 阻止网络慢栏目错乱
                if (this.lanmu.find(it => it.dhMenuItem.id === dhMenuItem.id)) return // 阻止点击过快栏目错乱
                this.$set(this.lanmu, this.lanmu.length, { hyitDeviceIds, hyitDevice, hyitValueType, dhMenuItem, res })
              }
            })
          })
        })
      })
    },
    async dialogOpen(item) {
      console.log('item', item)
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
        data: { deviceId }
      })
      if (code !== 1) return
      this.dhMenuList = data
      return data
    },
    async findHyitDhMenuValue(columnId) {
      // 栏目
      let { code, data } = await request({
        url: api.powerEnv.findHyitDhMenuValue,
        data: { columnId }
      })
      if (code !== 1) return
      return data
    }
  }
}
</script>
<style scoped>
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
</style>
