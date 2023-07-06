<template>
  <div class="device-list">
    <div class="device-type">
      <div v-for="(item,index) in list" :key="item.hyDevTypeId" class="type-item">
        <div class="type-item-title flex pointer" @click="onShowList(index)">
          <i v-if="!item.showList" class="el-icon-plus mr-10" />
          <i v-else class="el-icon-minus mr-10" />
          <span class="type-item-name">{{ item.hyDevTypeName }}</span>
          <span class="type-item-num">{{ item.deviceList.length }}</span>
        </div>
        <div class="px-10 my-10">
          <div v-if="item.showList" class="type-item-list pointer">
            <div v-for="(it,idx) in item.deviceList" :key="idx" class="list-item my-16 text-center pointer" @click="onSelectItem(it)">
              <el-tooltip :content="it.hyAlias" placement="top">
                <div>
                  {{ it.hyAlias }}
                </div>
              </el-tooltip>
            </div>
          </div>
        </div>

      </div>
    </div>
    <deviceHistory ref="deviceHistory" :device-id="deviceId" :device-name="deviceName" />
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import deviceHistory from '@/views/dashboard/component/power/power-device-list/components/device-history'
export default {
  name: 'PowerDeviceList',
  components: { deviceHistory },
  data() {
    return {
      list: [],
      deviceId: '',
      deviceName: '',
      sliceDeviceList: []
    }
  },
  mounted() {
    this.findHyitDevType()
  },
  methods: {
    onSelectItem(device) {
      this.deviceId = device.hyDeviceId
      this.deviceName = device.deviceName
      this.$refs.deviceHistory.open()
    },
    onShowList(index) { // 打开某一列
      this.$set(this.list[index], 'showList', !this.list[index]['showList'])
    },
    async findHyitDevType() { // 查找列表
      let { code, data } = await request({ url: api.powerEnv.findHyitDevType, data: { Pid: 2, limit: -1 }})
      if (code !== 1) return
      data = data.filter(it => it.isShow === 1)
      for (const item of data) {
        item.deviceList = await this.findHyitDevice(item.hyDevTypeValue)
      }
      for (let i = 0; i < data.length; i++) {
        const it = data[i]
        if (it.deviceList.length <= 0) continue
        this.sliceDeviceList.push(...it.deviceList.slice(0, 2))
      }
      this.$emit('sliceDeviceList', this.sliceDeviceList)
      console.log(this.sliceDeviceList)
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

<style scoped lang="scss">
.device-list{
  overflow: hidden;
  overflow-y: scroll;
  height: 100%;
  padding-bottom:100px;
  &::-webkit-scrollbar{
    display: none
  }
  .type-item{
    color: #EFEFEF;
    font-size:16px;
    margin-bottom: 20px;
   .type-item-title{
     border: 2px solid #1A728B;
     border-radius: 25px;
     padding:12px 20px;
   }
    .type-item-name{
      flex:1;
    }
    .type-item-list{
      padding:0px 20px 0 20px;
      max-height: 200px;
      overflow: hidden;
      overflow-y: auto;
      &::-webkit-scrollbar-thumb{//滑块颜色
        background-color: #EFEFEF;
      }
             &::-webkit-scrollbar-track{//导轨颜色
               background-color: #324863;
             }
      .list-item{
        text-overflow: ellipsis;
        overflow:hidden;
        white-space: nowrap;
      }
    }
  }
}
</style>
