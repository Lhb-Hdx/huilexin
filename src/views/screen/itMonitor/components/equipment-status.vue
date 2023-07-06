<template>
  <div class="equipment-status">
    <componentBorder title="设备概况">
      <template>
        <div class="equipment-status-content">
          <div class="content-list">
            <div v-for="item in devTypeList" :key="item.id" class="list-item flex-h-center">
              <div class="item-img-box mr-12 flex-center">
                <img :src="imgList[item.id]" alt="">
              </div>
              <div class="item-right flex-1">
                <div class="font-16 right-title">{{ item.dictdataName }}</div>
                <div class="flex-h-center mt-6">
                  <div class="item-right-num">{{ item.child.length }}</div>
                  <div class="item-right-progress flex-1">
                    <div v-for="items in [0,1,2]" :key="items" class="progress-wrapper ml-12">
                      <div :style="{background:items===0?'#00B285':items===1?'#FF4D4D':'#888888',width:(items+1)*10+'%'}" class="progress-item" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </componentBorder>
  </div>
</template>

<script>
import componentBorder from '@/views/screen/itMonitor/components/component-border'
import request from '@/utils/request'
import api from '@/api/api'
export default {
  name: 'EquipmentStatus',
  components: {
    componentBorder
  },
  data() {
    return {
      devTypeList: [],
      imgList: {
        490: 'image/screen/it-monitor/SDWAN(1).png',
        484: 'image/screen/it-monitor/操作系统(1).png',
        483: 'image/screen/it-monitor/数据库(1).png',
        482: 'image/screen/it-monitor/中间件(1).png',
        481: 'image/screen/it-monitor/网络设备(1).png',
        480: 'image/screen/it-monitor/应用软件(1).png',
        479: 'image/screen/it-monitor/服务设备(1).png',
        478: 'image/screen/it-monitor/虚拟资源(1).png',
        477: 'image/screen/it-monitor/存储设备(1).png'
      }
    }
  },
  mounted() {
    this.findDevTypeList()
  },
  methods: {
    async findHyitHost(devType) {
      let { data, code } = await request({ url: api.itMonitor.findHyitHost, data: { limit: -1, devType, agents: this.sessionStorageOperation('get', 'agentId') }})
      if (code === 1) return data
    },
    async findDevTypeList() {
      request({
        url: api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type ', limit: -1 }
      }).then(async res => {
        const data = res.data
        for (let i = 0; i < data.length; i++) {
          data[i]['child'] = await this.findHyitHost(data[i]['id'])
        }
        this.devTypeList = data
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.equipment-status{
  flex: .6;
  overflow: hidden;
}
.equipment-status-content{
  overflow:hidden;
  overflow-y: auto;
  .list-item{
    margin-bottom: 20px;
    .item-img-box{
      width: 42px;
      height: 42px;
      background: #071F39;
      border-radius: 10px;
      img{
        width: 16px;
        height: 16px;
      }
    }
    .item-right{
      .right-title{
        color:#ddd;
      }
      .item-right-num{
color: #FFBF00;
      }
      .progress-wrapper{
          &:nth-of-type(2){
            margin: 4px 0;
          }
        .progress-item{
          height: 3px;
        }
      }
    }
  }
}
.equipment-status ::v-deep  .border-content-line{
  position: absolute;
  bottom: 26px;
  right: -30px;
  width: 17%;
  height: 1px;
  background-color: var( --default-color);
  transform: rotate(132deg);
}
</style>
