<template>
  <div class="config-cabinet flex">
    <div class="map-sidebar">
      <div class="map-sidebar-box">
        <div class="map-sidebar-title">机柜列表</div>
        <div class="map-sidebar-content">
          <div class="content-list pl-0">
            <div
              v-for="(item) in rackList"
              :key="item.cabinetId"
              class="list-item pointer"
              :draggable="false"
              :style="{color:item.cabinetId===cabinetId?'#0145AB':''}"
              @click="changeCabinet(item)"
            >
              {{ item.name }}
            </div>
          </div>
        </div>
        <div class="map-sidebar-title">设备列表</div>
        <div class="map-sidebar-content device-content">
          <div class="content-list pl-0">
            <div
              v-for="(item) in hostList"
              :key="item.hyHostId"
              class="list-item pointer"
              :style="{color:item.notDrag?'rgb(187, 183, 183)':''}"
              :draggable="!item.notDrag"
              @click="onDeviceActive(item)"
            >
              {{ item.hyHostName }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div ref="pageRight" class="page-right">
      <div class="map" :style="{ 'height': pageRightHeight + 'px' }">
        <CabinetMap :cabinet-id="cabinetId" />
      </div>
      <div class="config" :style="{ 'height': pageRightHeight + 'px' }">
        <env-detail-index ref="envDetailIndex" :right-device="ringDeviceData" :it-monitor-device="itMonitorDeviceData" />
      </div>
    </div>
    <!-- <div class="cabinet-box">
      <div class="box-content ml-40">
        <div class="content-header">
          <img src="image/configuration/cabinet_header.png" alt="">
        </div>
        <div class="content-content">
          <div
            v-for="(item,index) in cabinetList"
            :key="index+Math.random()"
            style="background:url(image/configuration/cabinet_content.png)"
            :style="{height:item.capacity*30+'px'}"
            class="content-item"
          >
            <div
              :class="{hasCabinet:item.itemId,active:currentDevice===index}"
              class="item-drag-box"
              :style="{backgroundImage:`url(${item.picUrl})`}"
            />
            <div v-if="item.id" class="item-drag-info" :class="[item.host ? item.host.hyStatus === 0 ? 'danger':'success' : 'danger']">
              <div class="drag-info-title">{{ item.host ? item.host.hyHostName :'' }}</div>
              <div>{{ item.host ? item.host.hyIp :'' }}</div>
              <div :style="{color: item.host ? $tool.formatStr(item.host.hyStatus,'0:danger,1:success'): 'danger'}">
                {{ item.host ? item.host.hyStatus === 0 || null ? '离线' : '在线' :'离线' }}
              </div>
            </div>
          </div>
        </div>
        <div class="content-footer">
          <img src="image/configuration/cabinet_footer.png" alt="">
        </div>
      </div>
    </div>
    <div class="cabinet-right">
      <env-detail-index ref="envDetailIndex" :right-device="ringDeviceData" :it-monitor-device="itMonitorDeviceData" />
    </div> -->
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import EnvDetailIndex from './component/envDetail/index'
import CabinetMap from '@/components/Cabinet/Components/CabinetMap'

let cabinetIndex = 0// 拖拽下标
let allow = false// 是否允许放置
export default {
  name: 'ConfigCabinetWeb',
  components: {
    EnvDetailIndex,
    CabinetMap
  },
  data() {
    return {
      cabinetId: '',
      hostList: [{ hyHostId: 1, hyHostName: 1 }], // 设备列表
      cabinetInfo: {}, // 机柜信息
      cabinetList: [], // 节点列表
      diagramModelList: [], // 图片类型列表
      picList: [], // 图片列表
      currentPicType: '', // 图片类型
      currentDevice: '',
      rackList: [],
      itMonitorDeviceData: [],
      ringDeviceData: {}
    }
  },

  async created() {
    this.cabinetId = this.$route.query.cabinetId
    await this.getDiagramCabinet()
    await this.findDiagramModel()
    await this.findDiagramCabinet()
    await this.initSortCabinet()
    this.$refs.envDetailIndex.sliderIndex = 2
  },
  methods: {
    onDeviceActive(item) {
      for (let i = 0; i < this.cabinetList.length; i++) {
        const it = this.cabinetList[i]
        if (it.host && +it.host.hyHostId === +item.hyHostId) {
          this.currentDevice = i
        }
      }
    },
    removeActiveClass() {
      const el = document.querySelector('.active')
      if (el) el.classList.remove('active')
    },
    async ondragEnd(e, item) {
      this.removeActiveClass()
      if (this.cabinetList.every(it => it.itemId)) return this.$message.error('机位已满，请移除重试')
      if (!allow) return
      await this.insertDiagramCabinetItem(this.cabinetId, item.hyHostId, cabinetIndex)
      await this.initSortCabinet()
    },
    async changeCabinet(item) {
      this.cabinetId = item.cabinetId
      this.removeActiveClass()
      this.currentDevice = ''
      await this.initSortCabinet()
    },
    async findDiagramCabinet() {
      let { data, code } = await request({
        url: api.diagram.findDiagramCabinet,
        data: { diagramId: this.$route.query.id }
      })
      if (code === 1) this.rackList = data.map(it => ({ ...it, userDefineType: 10 }))
    },
    async submitDevicePic(item) {
      if (!this.currentDevice) return this.$message.error('请选择设备')
      const cabinet = this.cabinetList[this.currentDevice]
      delete cabinet['host']
      cabinet['picId'] = item['picId']
      let { msg, code } = await request({ url: api.diagram.updateDiagramCabinetItem, data: cabinet })
      if (code === 1) this.$message.success(msg)
      else this.$message.error(msg)
      await this.initSortCabinet()
    },
    async initSortCabinet() {
      const hostList = await this.findHyitHost()
      // this.itMonitorDeviceData = hostList
      const cabinetData = await this.findDiagramCabinetItem()
      // const cabinetList = Array.from({ length: this.cabinetInfo.capacity }, () => ({}))
      if (cabinetData.length <= 0) return
      // cabinetList.forEach((it, index) => {
      //   cabinetData.forEach(cabinet => {
      //     if (index === cabinet.unum) {
      //       cabinetList[index] = { ...cabinetList[index], ...cabinet }
      //     }
      //   })
      // })
      cabinetData.forEach((it, index) => {
        hostList.forEach((host) => {
          if (host.hyHostId === it.itemId) {
            host['notDrag'] = true
            cabinetData[index]['host'] = { ...host }
          }
        })
      })

      // this.picList.forEach((pic) => {
      //   cabinetList.forEach((it, index) => {
      //     if (pic['picId'] === it['picId']) {
      //       it.picUrl = pic.url
      //       it.capacity = pic.capacity || 1
      //     }
      //   })
      // })
      // let total = cabinetList.reduce((pre, next) => {
      //   return pre + (next['capacity'] || 1)
      // }, 0)
      // total -= cabinetList.length
      // cabinetList.length = cabinetList.length - total
      this.hostList = hostList // 设备列表
      // this.cabinetList = cabinetList
    },
    async findDiagramModel() {
      let { data, code } = await request({ url: api.diagram.findDiagramModel, data: {}})
      if (code !== 1) return
      this.diagramModelList = data
      this.currentPicType = data[0]['modelId']
      await this.findDiagramDevicePicture(data[0]['modelId'])
    },
    async findDiagramDevicePicture(modelId) {
      let { data, code } = await request({ url: api.diagram.findDiagramDevicePicture, data: { modelId }})
      if (code === 1) this.picList = data
    },
    async findDiagramCabinetItem() {
      let { data, code } = await request({
        url: api.diagram.findDiagramCabinetItem,
        data: { cabinetId: this.cabinetId }
      })
      if (code === 1) return data
    },
    async findHyitHost() {
      let { data, code } = await request({
        url: api.itMonitor.findHyitHost, data: { hostType: 1, agents: this.sessionStorageOperation('get', 'agentId') }
      })

      if (code === 1) return data
    },
    async getDiagramCabinet() {
      let { model, code } = await request({
        url: api.diagram.getDiagramCabinet,
        data: { cabinetId: this.cabinetId }
      })
      if (code === 1) this.cabinetInfo = model
    }

  }
}
</script>

<style lang="scss" scoped>
.page-right {
  padding-left: 300px;
  height: 100%;
  width: 100%;
  display: flex;
  .map {
    width: 50%;
    overflow-y: auto;
  }
  .config {
    width: 50%;
    overflow-y: auto;
  }
}
.config-cabinet {
  height: 100%;
  display: flex;

  .sidebar-right {
    width: 500px !important;
  }

  .map-sidebar{
    height: 100%;
    overflow: hidden;
    width: 300px;

    .map-sidebar-box {
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;

    }

    // .map-sidebar-content {
    //   // height: 100%;
    // }

    .device-content {
      overflow: hidden;
      overflow-y: scroll;
      flex: 1;
    }

    .content-list {
      padding-left: 0 !important;
    }
  }

  .cabinet-box {
    flex: 1;

    .box-content {
      padding: 50px 0;
      // width: 380px;
      height: 100%;
      overflow-x: initial;
      text-overflow: ellipsis;
      overflow-y: scroll;

      .content-header,
      .content-footer {
        img {
          vertical-align: middle;
          width: 380px;
          height: 20px;
          object-fit: cover;
        }
      }

      .content-content {
        height: auto;
        width: 380px;
        user-select: none;

        .content-item {
          height: 30px;
          background-repeat: no-repeat !important;
          background-size: 100% 100% !important;
          background-position: center !important;
          position: relative;

          .item-drag-box {
            height: 100%;
            width: 322px;
            margin: 0 auto;
            background-size: 100% 100% !important;
            background-position: center !important;

            &.active {
              border: 1px dashed #0145AB;
            }

            &.hasCabinet {
              background: rgba(0, 0, 0, .5);
            }
          }

          .item-drag-info {
            position: absolute;
            top: 0;
            right: -450px;
            width: 400px;
            height: 100%;
            border: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            padding: 0 200px;
            align-items: center;
            font-size: 14px;

            &:before {
              content: '';
              width: 2px;
              height: 100%;
              position: absolute;
              left: 0;
              top: 0;
            }

            &.success {
              &:before {
                background-color: #08B489;
              }
            }

            &.danger {
              &:before {
                background-color: #FD5051;
              }
            }

            .drag-info-title {
              width: 150px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .drag-info-btn {
              background-color: #eee;
              text-align: center;
              color: #999;
              width: 50px;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
            }
          }
        }
      }
    }
  }

}

.cabinet-right {
  width: 600px;
}

@import './style/mapStyle';
</style>
