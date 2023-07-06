<template>
  <div class="cabinet-box flex">
    <div class="box-index-box">
      <div v-for="item in cabinet.capacity" :key="item" class="flex-center">
        {{ cabinet.capacity-item+1 }}
      </div>
    </div>
    <div class="box-content">
      <div class="content-header">
        <img alt="" src="image/configuration/cabinet_header.png">
      </div>
      <div class="content-content">
        <transition-group class="transition-wrapper" name="sort">
          <div
            v-for="(item, index) in cabinetList"
            :key="item.numCode"
            :ref="'cabinet_' + item.numCode"
            :style="{height:(item.itemSize || 1)*30+'px'}"
            class="content-item"
            style="background:url(image/configuration/cabinet_content.png)"
            :draggable="mode === 'config' && item.itemId"
            @dragstart="dragstart(item)"
            @dragenter="dragenter(item, $event)"
            @dragend="dragend(item, $event)"
            @dragover="ondragover($event, index)"
            @mouseenter="mouseoverItem($event, item, 'cabinet_' + item.numCode)"
            @mouseleave="mouseoutItem($event, item)"
            @click.self="currentDevice='',currentDeviceObj={}"
          >
            <div
              v-if="setBgImg(item.picId) && setBgImg(item.picId)!==0"
              :class="{ hasCabinet: item.itemId, active: currentDeviceObj.id === item.id }"
              :style="{ backgroundImage: `url(${setBgImg(item.picId)})` }"
              class="item-drag-box"
              @click="handlerCabinetItem(item, index)"
              @contextmenu.prevent="selectCabinetItem(item)"
              @contextmenu="showMenu(item)"
            />
          </div>
        </transition-group>
      </div>
      <div class="content-footer">
        <img alt="" src="image/configuration/cabinet_footer.png">
      </div>
    </div>
    <vue-context-menu
      :context-menu-data="contextMenuData"
      @handlerDelete="handlerDelete"
    />
    <div v-show="showDetailTip" class="ip-detail-tip" :style="{ 'top': tipTop + 'px', 'left': tipLeft + 'px' }">
      <div class="tip-item">
        <span class="item-label">IP地址：</span>
        <span class="item-value">{{ handlerDevice.hyIp }}</span>
      </div>
      <div class="tip-item">
        <span class="item-label">设备类型：</span>
        <span class="item-value">{{ setDeviceType(handlerDevice.hyDevTypeId) }}</span>
      </div>
      <div class="tip-item">
        <span class="item-label">设备名称：</span>
        <span class="item-value">{{ handlerDevice.hyMarkName }}</span>
      </div>
      <div class="tip-item">
        <span class="item-label">端口：</span>
        <span class="item-value">{{ handlerDevice.hyPort }}</span>
      </div>
      <div class="tip-item">
        <span class="item-label">在线状态：</span>
        <span class="item-value" :class="handlerDevice.hyNetState === 1 ? 'success' : 'error'">
          <i class="el-icon-success" :class="handlerDevice.hyNetState === 1 ? 'success' : 'error'" /> {{ handlerDevice.hyNetState === 1 ? '在线' : '离线' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
let dragCabinetItemIndex = -1

export default {
  name: 'CabinetMap',
  props: {
    /**
     * @description 模式
     * @param mode 值（preview：预览模式 config：配置模式）
     */
    mode: {
      type: String,
      default() {
        return 'config'
      }
    },
    // 机柜id
    cabinetId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      cabinet: {},
      cabinetList: [],
      currentDevice: '',
      configFormData: {}, // 配置面板数据
      dragDevice: {},
      devicePicList: [],
      contextMenuData: {
        menuName: 'action',
        axis: {
          x: null,
          y: null
        },
        menulists: [
          {
            btnName: '删除',
            value: 1,
            fnHandler: 'handlerDelete'
          }
        ]
      },
      activeCabinetItem: {},
      oldData: null, // 开始排序时按住的旧数据
      newData: null, // 拖拽过程的数据
      showDetailTip: false,
      tipTop: 0,
      tipLeft: 0,
      handlerDevice: {},
      mouseoverId: '',
      devType: [],
      currentDeviceObj: {},
      currentCabinetShowPics: []
    }
  },
  computed: {
    setBgImg() {
      return function(picId) {
        // console.log('picId: ', picId)
        const idx = this.currentCabinetShowPics.findIndex(item => String(item.picId) === String(picId))
        // console.log('idx: ', idx)
        if (idx !== -1) {
          if (this.currentCabinetShowPics[idx].dataType === 'define') {
            return this.currentCabinetShowPics[idx].url
          } else {
            return this.$tool.staticResourceHost() + this.currentCabinetShowPics[idx].url
          }
        }
      }
    },
    setDeviceType() {
      return function(devType) {
        const idx = this.devType.findIndex(item => +item.id === +devType)
        return idx !== -1 ? this.devType[idx].dictdataName : ''
      }
    }
    // cabinetId() {
    //   return this.$route.query.id
    // }
  },
  watch: {
    cabinetId: {
      handler() {
        console.log('this.cabinetId', this.cabinetId)
        this.initCabinetDeviceData()
      }
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('drag-end-device,emit-data,update-cabinet-pic')
  },
  mounted() {
    // 重置拖拽索引
    dragCabinetItemIndex = -1
    // 初始化机柜数据
    this.initCabinetDeviceData()
    // 获取it监控类型
    this.loadItType()
    // 监听节点拖拽完成
    this.$EventBus.$on('drag-end-device', (res) => {
      if (dragCabinetItemIndex !== -1) {
        this.dragDevice = res
        this.dragEndDeviceInsertCabinet()
        dragCabinetItemIndex = -1
      }
    })
    // 监听配置面板数据
    this.$EventBus.$on('emit-data', (res) => {
      this.configFormData = this.$tool.deepCopy(res)
    })
    // 监听修改机柜设备图片
    this.$EventBus.$on('update-cabinet-pic', async (res) => {
      console.log('res: ', res)
      if (res.capacity > 1) {
        const activeUseItemSize = res.capacity // 当前需要用的U位
        // for (let i = 0; i < activeUseItemSize; i++) {
        //   if (this.cabinetList[this.cabinetList[this.currentDevice].unum + i].itemId) return this.$message('机柜目标位置U位不足，请移除重试')
        // }
        const LocalIsSuff = this.cabinetList.slice(this.currentDevice - activeUseItemSize + 1, this.currentDevice).some(it => it.id)
        console.log('cc', this.cabinetList.slice(this.currentDevice - activeUseItemSize + 1, this.currentDevice))
        if (LocalIsSuff || (activeUseItemSize + this.cabinetList[this.currentDevice].numCode) > this.cabinet.capacity) return this.$message('机柜目标位置U位不足，请移除重试')
      }
      const updateDiagramCabinetItemRes = await this.updateDiagramCabinetItem({ id: this.currentDeviceObj.id, itemSize: res.capacity, picId: res.picId })
      if (updateDiagramCabinetItemRes && updateDiagramCabinetItemRes === 1) {
        this.$message({ type: 'success', message: '修改成功' })
        this.initCabinetDeviceData()
      }
    })
  },
  methods: {
    // 查询机柜绑定的设备
    async findDiagramCabinetItem(query) {
      const { code, data } = await this.$request({
        url: this.api.diagram.findDiagramCabinetItem,
        data: query
      })
      if (code !== 1) return
      return data
    },
    // 新增机柜设备
    async insertDiagramCabinetItem(query) {
      const { code } = await this.$request({
        url: this.api.diagram.insertDiagramCabinetItem,
        data: query
      })
      if (code !== 1) return
      return code
    },
    // 删除机柜设备
    async deleteDiagramCabinetItem(query) {
      const { code } = await this.$request({
        url: this.api.diagram.deleteDiagramCabinetItem,
        data: query
      })
      if (code !== 1) return
      return code
    },
    // 编辑机柜设备
    async updateDiagramCabinetItem(query) {
      const { code } = await this.$request({
        url: this.api.diagram.updateDiagramCabinetItem,
        data: query
      })
      if (code !== 1) return
      return code
    },
    // 查询主机
    async findHyitHost(query) {
      const { code, data } = await this.$request({
        url: this.api.itMonitor.findHyitHost,
        data: query
      })
      if (code !== 1) return
      return data
    },
    // 查询机柜
    async getDiagramCabinet() {
      const { code, model } = await this.$request({
        url: this.api.diagram.getDiagramCabinet,
        data: { cabinetId: this.cabinetId }
      })
      if (code !== 1) return
      return model
    },
    // 查询机柜图片
    async findDiagramDevicePicture(query) {
      const { code, data } = await this.$request({
        url: this.api.diagram.findDiagramDevicePicture,
        data: query
      })
      if (code !== 1) return
      return data
    },
    // 获取设备类型
    loadItType() {
      this.$request({
        url: this.api.common.findSysDictionaryDetail,
        data: { dictCode: 'it_dev_type ', limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.devType = res.data
        }
      })
    },
    // 机柜设备数据
    async initCabinetDeviceData() {
      console.log(this.cabinetId)
      const cabinet = await this.getDiagramCabinet()// 机柜数据
      this.$EventBus.$emit('get-cabinet', cabinet)
      this.cabinet = cabinet
      const cabinetItem = await this.findDiagramCabinetItem({ limit: -1, cabinetId: this.cabinetId })// 机柜列表数据
      // console.log('cabinetItem: ', cabinetItem)
      this.$EventBus.$emit('get-cabinet-item', cabinetItem)

      // 关联设备数据
      const hostIds = []
      cabinetItem.forEach(cabinetItem => {
        if (cabinetItem.itemId) hostIds.push(cabinetItem.itemId)
      })
      const host = await this.findHyitHost({ limit: -1, ids: hostIds.toString(), agents: this.sessionStorageOperation('get', 'agentId') })
      cabinetItem.forEach(cabinetItem => {
        if (cabinetItem.itemId) {
          const hostIdx = host.findIndex(hostItem => +hostItem.hyHostId === +cabinetItem.itemId)
          if (hostIdx !== -1) cabinetItem.host = host[hostIdx]
        }
      })

      let cabinetList = []
      const picIds = []
      let itemSizeStorageIndex = -1 // 储存最新的一个设备u位最大索引
      for (let i = 0; i < cabinet.capacity; i++) {
        // console.log('i：', i)
        // console.log('itemSizeStorageIndex old：', itemSizeStorageIndex)
        if (itemSizeStorageIndex === -1) {
          const idx = cabinetItem.findIndex(item => (item.unum === 0 ? 0 : item.unum - 1) === i)
          if (idx !== -1) {
            console.log('itemSizeStorageIndex: ', itemSizeStorageIndex)
            // 比如设备是2U，那么这个设备会占两个位置，所以需要把两个位置合并起来
            if (itemSizeStorageIndex === -1 && cabinetItem[idx].itemSize > 1) itemSizeStorageIndex = ((cabinetItem[idx].unum === 0 ? cabinetItem[idx].unum : cabinetItem[idx].unum - 1) + cabinetItem[idx].itemSize) - 1
            // console.log('itemSizeStorageIndex new：', itemSizeStorageIndex)
            console.log('idx：', idx, cabinetItem[idx])
            cabinetList.push({ ...cabinetItem[idx], numCode: i })
            // picIds.push(cabinetItem[idx].picId)
            // console.log('cabinetList: ', cabinetList)
          } else {
            cabinetList.push({ numCode: i })
          }
        } else {
          // console.log('i else：', i)
          if (i >= itemSizeStorageIndex) {
            itemSizeStorageIndex = -1
          }
        }
        // console.log('=============================')
      }
      console.log('cabinetList: ', cabinetList)

      this.cabinetList = [...cabinetList].reverse()
      picIds.push(...new Set(cabinetItem.map(it => it.picId).filter(Boolean)))
      console.log('picIds: ', picIds)
      if (picIds.length > 0) {
        let currentCabinetShowPics = [...this.$defineData.getCabinetDefaultPic({ picIds: this.$tool.uniqueArray(picIds).toString() })]
        console.log('currentCabinetShowPics: ', currentCabinetShowPics)
        const devicePicList = await this.findDiagramDevicePicture({ limit: -1, ids: this.$tool.uniqueArray(picIds).toString() })
        console.log('devicePicList: ', devicePicList)
        // if (devicePicList) {
        currentCabinetShowPics = [...devicePicList, ...currentCabinetShowPics]
        // }
        this.currentCabinetShowPics = currentCabinetShowPics
      }

      if (this.currentDevice !== '') {
        this.currentDevice = this.cabinetList.findIndex(it => +it.id === +this.currentDeviceObj.id)
        this.currentDeviceObj = this.cabinetList.find(it => +it.id === +this.currentDeviceObj.id) || {}
      }
    },
    // 在机柜上移动
    ondragover(e, index) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      dragCabinetItemIndex = index
    },
    // 插入设备到机柜
    async dragEndDeviceInsertCabinet() {
      console.log('this.cabinetId: ', this.cabinetId)
      // console.log('configFormData: ', this.configFormData)
      // console.log('dragCabinetItemIndex: ', dragCabinetItemIndex)
      if (this.cabinet.capacity < this.configFormData.itemSize) return this.$message('设备U位超过机柜总U位')
      if (this.cabinetList[dragCabinetItemIndex].itemId) return this.$message(`机柜第${this.cabinetList[dragCabinetItemIndex].numCode + 1}个U位上已经有设备了`)
      // // if (this.configFormData.itemSize > 1) {
      // //   const activeUseItemSize = this.configFormData.itemSize // 当前需要用的U位
      // //   for (let i = 0; i < activeUseItemSize; i++) {
      // //     if (this.cabinetList[dragCabinetItemIndex + i].itemId) return this.$message('目标位置U位不足，请移除重试')
      // //   }
      // // }
      console.log(this.cabinetList.slice(dragCabinetItemIndex - this.configFormData.itemSize + 1, dragCabinetItemIndex))
      const LocalIsSuff = this.cabinetList.slice(dragCabinetItemIndex - this.configFormData.itemSize + 1, dragCabinetItemIndex).some(it => it.id)
      if (LocalIsSuff || ((dragCabinetItemIndex + 2) - this.configFormData.itemSize < 0)) return this.$message('机柜目标位置U位不足，请移除重试')
      const insertDiagramCabinetItemRes = await this.insertDiagramCabinetItem({
        cabinetId: this.cabinetId,
        itemId: this.dragDevice.hyHostId,
        uNum: this.cabinetList[dragCabinetItemIndex].numCode + 1,
        itemSize: this.configFormData.itemSize || 1,
        picId: this.configFormData.picId
      })
      if (insertDiagramCabinetItemRes && insertDiagramCabinetItemRes === 1) {
        this.$message({
          type: 'success',
          message: '新增成功'
        })
        await this.$nextTick()
        // setTimeout(() => {
        this.initCabinetDeviceData()
        // }, 500)
      }
    },
    // 右键删除
    handlerDelete(item) {
      this.$confirm('确定删除吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const { code } = await this.$request({
          url: this.api.diagram.deleteDiagramCabinetItem,
          data: { id: this.activeCabinetItem.id }
        })
        if (code !== 1) return this.$message.error('删除失败')
        this.$message.success('删除成功')
        this.$nextTick(async () => {
          await this.initCabinetDeviceData()
        })
      })
    },
    // 右键选择机柜设备
    selectCabinetItem(item) {
      this.activeCabinetItem = item
    },
    // 显示菜单
    showMenu(item) {
      if (this.mode !== 'config') return
      if (!item.itemId) return
      event.preventDefault()
      const x = event.clientX
      const y = event.clientY
      this.contextMenuData.axis = { x, y }
    },
    // 开始移动机柜设备
    dragstart(value) {
      this.oldData = value
    },
    // 记录移动过程中信息
    dragenter(value, e) {
      this.newData = value
      e.preventDefault()
    },
    // 拖拽最终操作
    async dragend(value, e) {
      if (this.oldData !== this.newData) {
        let oldIndex = this.oldData.numCode
        let newIndex = this.newData.numCode

        console.log('oldIndex', oldIndex)
        console.log('newIndex', newIndex)
        // const activeUseItemSize = this.oldData.itemSize // 当前需要用的U位

        // 新位置上没有设备
        if (!this.newData.itemId) {
          console.log('新的开始位置上没有设备')

          // 判断一下拖放到的位置空间够不够
          // for (let i = 0; i < activeUseItemSize; i++) {
          //   console.log(this.cabinetList[newIndex + i].id, this.cabinetList[oldIndex].id)
          //   if (this.cabinetList[newIndex + i].id && this.cabinetList[newIndex + i].id !== this.cabinetList[oldIndex].id) return this.$message('机柜目标位置U位不足，请移除重试')
          // }
          const trueNewIndex = this.cabinetList.indexOf(this.newData)
          console.log('trueNewIndex: ', trueNewIndex)
          const LocalIsSuff = this.cabinetList.slice(trueNewIndex - this.oldData.itemSize + 1, trueNewIndex).some(it => it.id && it.id !== this.oldData.id)
          console.log('cc', this.cabinetList.slice(trueNewIndex - this.oldData.itemSize + 1, trueNewIndex))
          if (LocalIsSuff || (+this.newData.numCode + +this.oldData.itemSize > this.cabinet.capacity)) return this.$message('机柜目标位置U位不足，请移除重试')

          // 移动距离中间有多少个有设备的 获取出他们的u位
          // const getDragDistanceData = this.cabinetList.slice(0, Math.max(oldIndex, newIndex))

          // console.log('getDragDistanceData', getDragDistanceData)

          // let dragDistanceDataCount = 0
          // getDragDistanceData.forEach(getDragDistanceDataItem => {
          //   if (getDragDistanceDataItem.itemId) dragDistanceDataCount += (getDragDistanceDataItem.itemSize - 1)
          // })

          const json = [
            { id: this.oldData.id, uNum: newIndex + 1 },
            { id: this.newData.id, uNum: oldIndex }
          ]
          console.log('json', json)
          // console.log('dragDistanceDataCount', dragDistanceDataCount)
          // console.log({ id: json[0].id, uNum: json[0].uNum + (dragDistanceDataCount === 0 ? this.cabinetList[oldIndex].itemSize : dragDistanceDataCount) })
          // return
          const updateDiagramCabinetItemRes = await this.updateDiagramCabinetItem({
            id: json[0].id,
            uNum: json[0].uNum
            // uNum: json[0].uNum + (dragDistanceDataCount === 0 ? this.cabinetList[oldIndex].itemSize : dragDistanceDataCount)
          })
          if (updateDiagramCabinetItemRes && updateDiagramCabinetItemRes === 1) {
            this.cabinetList = []
            this.$message({ type: 'success', message: '修改成功' })
            this.initCabinetDeviceData()
          }
          // console.log('=================================')
        } else {
          this.$message('目标位置U位不足，请移除重试')
          console.log('新的开始位置上有设备')
          const json = [
            { id: this.oldData.id, uNum: newIndex },
            { id: this.newData.id, uNum: oldIndex }
          ]
          console.log(json)
        }
      }
    },
    // 拖动事件（主要是为了拖动时鼠标光标不变为禁止）
    dragover(e) {
      e.preventDefault()
    },
    // 移入事件 机柜设备
    mouseoverItem(e, item, refName) {
      if (this.mouseoverId === item.id) return
      if (!item.itemId) return
      if (!this.$refs[`${refName}`]) return
      this.mouseoverId = item.id
      this.tipLeft = this.$refs[`${refName}`][0].getBoundingClientRect().right
      this.tipTop = this.$refs[`${refName}`][0].getBoundingClientRect().top
      this.handlerDevice = item.host
      this.showDetailTip = true
    },
    // 移出事件 机柜设备
    mouseoutItem() {
      this.showDetailTip = false
      this.mouseoverId = ''
    },
    // 点击机柜设备
    handlerCabinetItem(item, index) {
      this.currentDevice = index
      this.currentDeviceObj = item
      this.$EventBus.$emit('handler-cabinet-item', item)
    }
  }
}
</script>

<style lang="scss" scoped>
  .cabinet-box {
    flex: 1;
    width: 340px;
    margin: 0 auto;
    position: relative;
      overflow-y: scroll;
      padding-bottom: 60px;

.box-index-box{
  width: 30px;
    background-color: #333334;
    height: calc(100% - 40px);
    margin-top: 20px;
  div{
    height: 30px;
    color: #fff;
  }
}
    .box-content {
      height: 100%;
      overflow-x: initial;
      text-overflow: ellipsis;
      // overflow-y: scroll;

      .content-header,
      .content-footer {
        width: calc(100% + 30px);
        transform: translateX(-30px);
        img {
          vertical-align: middle;
          width: 100%;
          height: 20px;
          object-fit: cover;
        }
      }

      .content-content {
        height: auto;
        width: 100%;
        user-select: none;

        .content-item {
          height: 30px;
          background-repeat: no-repeat !important;
          background-size: 100% 100% !important;
          background-position: center !important;
          position: relative;

          .item-drag-box {
            flex: 1;
            height: 100%;
            // width: 322px;
            margin: 0 auto;
            background-size: 100% 100% !important;
            background-position: center !important;

            &.active {
              border: 1.5px solid #0145AB;
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
            padding-left: 20px;
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
  .ip-detail-tip {
    width: 400px;
    position: fixed;
    color: white;
    top: 38px;
    left: 0;
    z-index: 1000;
    background-color: rgba(0, 0, 0, 0.54);
    padding: 10px;
    .tip-item {
      padding: 10px;
      font-size: 14px;
    }
  }
</style>
