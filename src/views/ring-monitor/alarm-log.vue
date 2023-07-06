<template>
  <div class="main">
    <div class="flex">
      <div class="left">
        <div v-for="(item,index) in list" :key="index" class="left-item">
          <div class="flex-v-between" @click="item.show = !item.show">
            <div>
              <span class="font-14">{{ item.name }}</span>
              <span>({{ item.arr.length }})</span>
            </div>
            <i :class="[!item.show?'el-icon-caret-bottom':'el-icon-caret-top']" />
          </div>
          <div v-if="item.show">
            <div v-for="(it,ind) in item.arr" :key="ind" class="pl-16 font-12 line" @click="onclick($event,it),currindex=ind">
              <el-tooltip class="item" effect="dark" :content="it.hyDeviceName" placement="right-end">
                <span class="line-child"> {{ it.hyAlias || '' }}({{ it.hyAddr }})</span>
              </el-tooltip>
            </div>
          </div>

        </div>
      </div>
      <div class="right">
        <Logtable :id="ringDeviceId" />
      </div>
    </div>

  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Logtable from './components/log-table.vue'
export default {
  components: {
    Logtable
  },
  data() {
    return {
      list: [],
      ringDeviceId: '',
      currindex: 0
    }
  },
  async mounted() {
    let data = await this.findHyitArea()
    let data1 = await this.findHyitDevice()
    let arr = {}
    data.forEach(it => {
      !arr[it.hyAreaName] && (arr[it.hyAreaName] = { name: it.hyAreaName, arr: [], show: true })

      data1.forEach(itt => {
        if (itt.hyOrgid === it.hyAreaId) {
          arr[it.hyAreaName]['arr'].push(itt)
        }
      })
    })
    this.list = arr
  },
  methods: {
    onclick(e, item) {
      document.querySelector('.active').classList.remove('active')
      if (e.target.classList.contains('line')) {
        e.target.classList.add('active')
      }
      if (e.target.classList.contains('line-child')) {
        e.target.parentElement.classList.add('active')
      }
      this.ringDeviceId = String(item.hyDeviceId)
    },
    async findHyitArea() {
      let { code, data } = await request({ url: api.area.findHyitArea, data: { limit: -1 }})
      if (code !== 1) return

      return data
    },
    async findHyitDevice() {
      let { code, data } = await request({ url: api.powerEnv.findHyitDevice, data: { limit: -1 }})
      if (code !== 1) return
      return data
    },
    async findHyitAlarmLog(hyDeviceId) {
      let { code, data } = await request({ url: api.powerEnv.findHyitAlarmLog, data: { hyDeviceId }})
      if (code !== 1) return
      return data
    }
  }
}
</script>

<style lang="scss" scoped>
.main{
  height: 100%;
  >div{
    height: 100%;
  }
}
.left-item{
  cursor: pointer;
}
.left{
  width: 240px;
  background: #e9ecf3;
  height: 100%;
  font-size: 14px;
  font-weight: 600;
  line-height: 36px;
  overflow: auto;
  padding:10px;
  // flex-basis: 240px;
}
.right{
  height: 100%;
  background-color: #fff;
  flex: 1;
  width: 100%;
  overflow: auto;
  padding: 10px;
}
.line{
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 200px;
  display: block;
}
.active{
  background-color: #caccd1;
}
</style>>

