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
              :draggable="false"
              :style="{color:item.cabinetId===cabinetId?'#0145AB':''}"
              class="list-item pointer"
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
              :draggable="!item.notDrag"
              :style="{color:item.notDrag?'rgb(187, 183, 183)':''}"
              class="list-item pointer"
              @dragend="ondragEnd(item)"
              @dragstart="ondragStart"
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
        <CabinetItemConfig />
      </div>
    </div>
    <!-- <div class="cabinet-box">
      <div class="box-content ml-40">
        <div class="content-header">
          <img alt="" src="image/configuration/cabinet_header.png">
        </div>
        <div class="content-content">
          <div
            v-for="(item,index) in cabinetList"
            :key="index+Math.random()"
            :draggable="false"
            :style="{height:item.capacity*30+'px'}"
            class="content-item"
            style="background:url(image/configuration/cabinet_content.png)"
          >
            <div
              :class="{hasCabinet:item.itemId,active:currentDevice===index}"
              :draggable="false"
              :style="{backgroundImage:`url(${item.picUrl})`}"
              class="item-drag-box"
              @click="item.itemId?currentDevice=index:''"
              @dragleave="ondragleave"
              @dragover="ondragover($event,index)"
            />
            <div v-if="item.id" :class="[item.host.hyStatus===0?'danger':'success']" class="item-drag-info">
              <div class="drag-info-title">{{ item.host.hyHostName }}</div>
              <div>{{ item.host.hyIp }}</div>
              <div :style="{color: $tool.formatStr(item.host.hyStatus,'0:danger,1:success')}">
                {{ item.host.hyStatus === 0 ? '离线' : '在线' }}
              </div>
              <div class="drag-info-btn pointer" @click="onDelete(item)">移除</div>
            </div>
          </div>
        </div>
        <div class="content-footer">
          <img alt="" src="image/configuration/cabinet_footer.png">
        </div>
      </div>
    </div> -->

    <!-- <div class="map-sidebar sidebar-right">
      <div class="map-sidebar-box">
        <div class="map-sidebar-title">设备列表</div>
        <div class="map-sidebar-content">
          <el-form>
            <el-form-item label="背景图片类型">
              <el-select :value="currentPicType" placeholder="请选择" @change="onChangePicType">
                <el-option
                  v-for="item in diagramModelList"
                  :key="item.modelId"
                  :label="item.modelName"
                  :value="item.modelId"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="选择设备图片">
              <br>
              <div v-for="item in picList" :key="item.picId">
                <el-button border @click="submitDevicePic(item)">{{ item.name }}({{ item.capacity||1 }}U)</el-button>
                <br>
                <img :src="item.url" alt="" class="mt-10">
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import CabinetMap from '@/components/Cabinet/Components/CabinetMap'
import CabinetItemConfig from '@/components/Cabinet/Components/CabinetItemConfig'

// let cabinetIndex = 0// 拖拽下标
// let allow = false// 是否允许放置
export default {
  name: 'ConfigCabinet',
  components: {
    CabinetMap,
    CabinetItemConfig
  },
  data() {
    return {
      pageRightHeight: 0,
      cabinetId: '',
      hostList: [], // 设备列表
      cabinetInfo: {}, // 机柜信息
      cabinetList: [], // 节点列表
      diagramModelList: [], // 图片类型列表
      picList: [], // 图片列表
      currentPicType: '', // 图片类型
      currentDevice: '',
      rackList: []
    }
  },

  async created() {
    this.cabinetId = this.$route.query.cabinetId
    await this.getDiagramCabinet()
    // await this.findDiagramModel()
    await this.findDiagramCabinet()
    await this.initSortCabinet()
  },
  mounted() {
    this.setSize()
  },
  methods: {
    setSize() {
      const pageRight = this.$refs.pageRight
      this.pageRightHeight = window.innerHeight - pageRight.getBoundingClientRect().top - 10
    },
    ondragStart(e) {
      e.dataTransfer.dropEffect = 'move'
      e.dataTransfer.effectAllowed = 'move'
    },
    removeActiveClass() {
      const el = document.querySelector('.active')
      if (el) el.classList.remove('active')
    },
    async ondragEnd(item) {
      // this.removeActiveClass()
      // if (this.cabinetList.every(it => it.itemId)) return this.$message.error('机位已满，请移除重试')
      // if (!allow) return
      // await this.insertDiagramCabinetItem(this.cabinetId, item.hyHostId, cabinetIndex)
      // await this.initSortCabinet()
      this.$EventBus.$emit('drag-end-device', { ...item })
    },
    // ondragover(e, index) {
    //   e.preventDefault()
    //   e.dataTransfer.dropEffect = 'move'
    //   this.removeActiveClass()
    //   e.target.classList.add('active')
    //   cabinetIndex = index
    //   if (this.cabinetList[index]['id']) return
    //   allow = true
    // },
    // ondragleave(e) {
    //   // console.log(e)
    //   allow = false
    // },
    async changeCabinet(item) {
      this.cabinetId = item.cabinetId
      this.initSortCabinet()
      // this.removeActiveClass()
      // this.currentDevice = ''
      // await this.initSortCabinet()
    },
    async findDiagramCabinet() {
      let { data, code } = await request({
        url: api.diagram.findDiagramCabinet,
        data: { diagramId: this.$route.query.id }
      })
      if (code === 1) this.rackList = data.map(it => ({ ...it, userDefineType: 10 }))
    },
    // async submitDevicePic(item) {
    //   if (!this.currentDevice) return this.$message.error('请选择设备')
    //   const cabinet = this.cabinetList[this.currentDevice]
    //   delete cabinet['host']
    //   cabinet['picId'] = item['picId']
    //   let { msg, code } = await request({ url: api.diagram.updateDiagramCabinetItem, data: cabinet })
    //   if (code === 1) this.$message.success(msg)
    //   else this.$message.error(msg)
    //   await this.initSortCabinet()
    // },
    // onChangePicType(e) {
    //   this.findDiagramDevicePicture(e)
    // },
    // async findDiagramModel() {
    //   let { data, code } = await request({ url: api.diagram.findDiagramModel, data: {}})
    //   if (code !== 1) return
    //   this.diagramModelList = data
    //   this.currentPicType = data[0]['modelId']
    //   await this.findDiagramDevicePicture(data[0]['modelId'])
    // },
    // async findDiagramDevicePicture(modelId) {
    //   let { data, code } = await request({ url: api.diagram.findDiagramDevicePicture, data: { modelId }})
    //   if (code === 1) this.picList = data
    // },

    // onDelete(item) {
    //   this.$confirm('是否确认删除', '提示', {
    //     confirmButtonText: '确定',
    //     cancelButtonText: '取消',
    //     type: 'warning'
    //   }).then(async() => {
    //     let { code, msg } = await request({ url: api.diagram.deleteDiagramCabinetItem, data: { id: item.id }})
    //     if (code === 1) this.$message.success(msg)
    //     else this.$message.error(msg)
    //     await this.initSortCabinet()
    //   }).catch(() => {
    //     this.$message({
    //       type: 'info',
    //       message: '已取消删除'
    //     })
    //   })
    // },
    async initSortCabinet() {
      const hostList = await this.findHyitHost()
      const cabinetData = await this.findDiagramCabinetItem()
      // const cabinetList = Array.from({ length: this.cabinetInfo.capacity }, () => ({}))
      // if (cabinetData.length <= 0) this.cabinetList = cabinetList
      // cabinetList.forEach((it, index) => {
      //   cabinetData.forEach(cabinet => {
      //     if (index === cabinet.unum) {
      //       cabinetList[index] = { ...cabinetList[index], ...cabinet }
      //     }
      //   })
      // })
      cabinetData.forEach((it, index) => {
        hostList.forEach((host) => {
          if (+host.hyHostId === +it.itemId) {
            host['notDrag'] = true
          }
        })
      })
      console.log(hostList)
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
      // const deleteCabinetList = cabinetList.splice((cabinetList.length - total), (cabinetList.length - total))
      this.hostList = hostList
      // this.cabinetList = cabinetList
      // for (const it of deleteCabinetList) {
      //   if (it.id)request({ url: api.diagram.deleteDiagramCabinetItem, data: { id: it.id }})
      // }
    },
    // async insertDiagramCabinetItem(cabinetId, itemId, uNum) {
    //   let { code, msg } = await request({
    //     url: api.diagram.insertDiagramCabinetItem, data: {
    //       cabinetId,
    //       itemId,
    //       uNum
    //     }
    //   })
    //   if (code === 1) this.$message.success(msg)
    //   else this.$message.error(msg)
    // },
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
    //   //height: 100%;
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

  // .cabinet-box {
  //   flex: 1;

  //   .box-content {
  //     padding: 50px 0;
  //     //width: 380px;
  //     height: 100%;
  //     overflow-x: initial;
  //     text-overflow: ellipsis;
  //     overflow-y: scroll;

  //     .content-header,
  //     .content-footer {

  //       img {
  //         vertical-align: middle;
  //         width: 380px;
  //         height: 20px;
  //         object-fit: cover;
  //       }
  //     }

  //     .content-content {
  //       height: auto;
  //       width: 380px;
  //       user-select: none;

  //       .content-item {
  //         height: 30px;
  //         background-repeat: no-repeat !important;
  //         background-size: 100% 100% !important;
  //         background-position: center !important;
  //         position: relative;

  //         .item-drag-box {
  //           height: 100%;
  //           width: 322px;
  //           margin: 0 auto;
  //           background-size: 100% 100% !important;
  //           background-position: center !important;

  //           &.active {
  //             border: 1px dashed #0145AB;
  //           }

  //           &.hasCabinet {
  //             background: rgba(0, 0, 0, .5);
  //           }
  //         }

  //         .item-drag-info {
  //           position: absolute;
  //           top: 0;
  //           right: -450px;
  //           width: 400px;
  //           height: 100%;
  //           border: 1px solid #eee;
  //           display: flex;
  //           justify-content: space-between;
  //           padding-left: 20px;
  //           align-items: center;
  //           font-size: 14px;

  //           &:before {
  //             content: '';
  //             width: 2px;
  //             height: 100%;
  //             position: absolute;
  //             left: 0;
  //             top: 0;
  //           }

  //           &.success {
  //             &:before {
  //               background-color: #08B489;
  //             }
  //           }

  //           &.danger {
  //             &:before {
  //               background-color: #FD5051;
  //             }
  //           }

  //           .drag-info-title {
  //             width: 150px;
  //             overflow: hidden;
  //             text-overflow: ellipsis;
  //             white-space: nowrap;
  //           }

  //           .drag-info-btn {
  //             background-color: #eee;
  //             text-align: center;
  //             color: #999;
  //             width: 50px;
  //             height: 100%;
  //             display: flex;
  //             align-items: center;
  //             justify-content: center;
  //           }
  //         }
  //       }
  //     }
  //   }
  // }

}
.page-right {
  padding-left: 300px;
  height: 100%;
  width: 100%;
  display: flex;
  .map {
    width: 70%;
    overflow-y: auto;
  }
  .config {
    width: 30%;
    overflow-y: auto;
  }
}
@import './style/mapStyle';
</style>
