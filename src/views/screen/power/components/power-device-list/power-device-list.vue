<template>
  <div class="device-list">
    <div class="device-type">
      <div v-for="(item,index) in list" :key="item.hyDevTypeId" class="type-item">
        <div :class="{active:item.showList}" class="type-item-title flex pointer" @click="onShowList(index)">
          <i v-if="!item.showList" class="el-icon-plus mr-10" />
          <i v-else class="el-icon-minus mr-10" />
          <span class="type-item-name">{{ item.hyDevTypeName }}</span>
          <span class="type-item-num">{{ item.deviceList.length }}</span>
        </div>
        <div class="px-10 my-10">
          <div v-if="item.showList" class="type-item-list pointer">
            <div v-for="(it,idx) in item.deviceList" :key="idx" class="list-item my-10 pointer flex-h-center">
              <div :style="{background:currentDevice['hostId']===it['hyDeviceId']?'#9DE4FD':'#2A465E'}" class="list-item-circle" @click="changeMapItem(it)" />
              <div class="list-item-title linear-1" @click="onSelectItem(it)">{{ it.hyAlias }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!--    <deviceHistory ref="deviceHistory" :device-id="deviceId" :device-name="deviceName" />-->
    <el-dialog :title="deviceName" :visible.sync="dialogVisible" append-to-body custom-class="device-dialog" top="5vh">
      <Monitor v-if="dialogVisible" :id="deviceId" />
      <div slot="footer">
        <el-button type="primary" @click="dialogVisible=false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
export default {
  name: 'PowerDeviceList',
  components: {
    Monitor: () => import('@/views/ring-monitor/rotaing-right')
  },
  data() {
    return {
      list: [],
      deviceId: '',
      deviceName: '',
      sliceDeviceList: [],
      dialogVisible: false,
      currentDevice: {}
    }
  },
  mounted() {
    this.findHyitDevType()
  },
  methods: {
    async changeMapItem(it) {
      let { data, code } = await request({ url: api.diagram.findDiagramItem, data: { hostId: it.hyDeviceId, userDefineType: 4 }})
      if (code !== 1) return
      this.currentDevice = data[0]
      this.$EventBus.$emit('changeDevice', data[0])
    },
    onSelectItem(device) {
      this.deviceId = device.hyDeviceId
      this.deviceName = device.hyAlias
      this.dialogVisible = true
      console.log('选择列表设备', device)
      // this.$refs.deviceHistory.open()
    },
    onShowList(index) { // 打开某一列
      this.list = this.list.map(it => ({ ...it, showList: false }))
      this.$set(this.list[index], 'showList', !this.list[index]['showList'])
    },
    async findHyitDevType() { // 查找列表
      let { code, data } = await request({ url: api.powerEnv.findHyitDevType, data: { Pid: 2, limit: -1 }})
      if (code !== 1) return
      data = data.filter(it => it.isShow === 1)
      console.log('isShow', data)
      for (const item of data) {
        item.deviceList = await this.findHyitDevice(item.hyDevTypeValue)
        console.log('deviceList', item.deviceList)
      }
      // 对应父类下的子类型数
      console.log('data', data.length)
      for (let i = 0; i < data.length; i++) {
        const it = data[i]
        // console.log('it', it)
        if (it.deviceList.length <= 0) continue
        this.sliceDeviceList.push(...it.deviceList.slice(0, 1))
        // console.log('it.deviceList', ...it.deviceList, ...it.deviceList.slice(0, 1))
      }
      this.$emit('sliceDeviceList', this.sliceDeviceList)
      // console.log('sliceDeviceList', this.sliceDeviceList)
      this.list = data
    },
    async findHyitDevice(hyDevTypeValue) {
      let { code, data } = await request({
        url: api.powerEnv.findHyitDevice,
        data: { hyDevTypeValue }
      })
      if (code !== 1) return
      return data
    }
  }
}
</script>

<style lang="scss" scoped>
.device-list{
  overflow: hidden;
  overflow-y: scroll;
  height: 100%;
  padding-bottom:100px;
  &::-webkit-scrollbar{
    display: none
  }
  .type-item{
    font-size:16px;
    margin-bottom: 20px;
      color: #cccccc;
   .type-item-title{
     border: 2px solid #9EE6FF;
     border-radius: 25px;
     padding:12px 20px;
   }
    .type-item-name{
      font-size: 14px;
      flex:1;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow:hidden;
    }
    .type-item-list{
      padding:0px 20px 0 20px;
      max-height: 200px;
      overflow: hidden;
      overflow-y: auto;
      &::-webkit-scrollbar-thumb{//滑块颜色
        background-color: var(--power-srceen-text-color);;
      }
             &::-webkit-scrollbar-track{//导轨颜色
               background-color: #324863;
             }
      .list-item{
        overflow:hidden;
        color: #cccccc;
        text-indent:10px;
        line-height: 30px;
        width: 100%;
        .list-item-title{
          flex: 1;
        }
      }
      .list-item-circle{
        width: 10px;
        height: 10px;
        border-radius:50%;
        background: #2A465E;
      }
    }
  }
}
.active{
  background-color: #071F39;
  color: #9EE6FF;
 }
::v-deep .device-dialog{
.el-dialog__body{
  max-height:80vh;
  overflow: hidden;
  overflow-y: scroll;
}
}
</style>
