<template>
  <div class="tvwal-config-main">
    <div class="page-nav">
      <i class="el-icon-back" @click="$router.back()" />
      <span>{{ navTitle }}</span>
    </div>
    <div ref="appContainer" class="app-container">
      <div class="sideMenu">
        <VideoAreaList :show-calendar="false" :is-dragging="true" />
      </div>
      <div ref="playerBox" class="player-box">
        <div v-for="(citem, cindex) in videoTvwallList" :key="'c' + cindex" class="player-box-row" :class="citem[0].isAbsolute ? 'width-100' : ''" draggable="true" @drop="dropChnItemInVideoDiv($event)">
          <div
            v-for="(ritem, rindex) in citem"
            :key="ritem.playerIndex"
            class="player-box-item"
            :style="{
              width: ritem.width - 2 + 'px',
              height: ritem.height - 2 + 'px',
              position: ritem.isAbsolute ? 'absolute' : 'relative',
              top: ritem.top + 'px',
              left: ritem.left + 'px',
            }"
            @drop="dropChnItemInVideoDiv($event, cindex, rindex)"
            @dragover.prevent="dropOver($event)"
          >
            <div class="box-item-content">
              <div class="player-index">{{ ritem.playerIndex }}</div>
              <el-button v-if="ritem.channelId" size="mini" type="primary" round @click="getTvWallItemConfig(ritem)">
                {{ ritem.channelName }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-dialog title="播放配置" :visible.sync="showVideoTvwall" width="40%" top="5vh">
      <div class="equipment_table">
        <el-form label-width="100px" class="select-width-fill">
          <el-form-item label="播放地址">
            <el-input v-model="playerItemForm.playUrl" readonly />
          </el-form-item>
          <el-form-item label="播放流类型">
            <el-select
              v-model="playerItemForm.flow"
              filterable
              placeholder="播放流类型"
              @change="changeFlow"
            >
              <el-option
                v-for="item in flow"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="轮询播放时间">
            <el-input v-model="playerItemForm.playSeconds" />
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showVideoTvwall = false">取 消</el-button>
        <el-button v-permission="['DeletePlayerLayout']" class="filter-item" type="danger" @click="deleteVideoTvwallPlayer">删 除</el-button>
        <el-button v-permission="['UpdatePlayerLayout']" class="filter-item" type="primary" @click="comfirm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import VideoAreaList from '@/views/video/components/video-chn-list/video-chn-list'
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: 'TVWallPlayerConfig',
  components: { VideoAreaList },
  data() {
    return {
      cid: '',
      getVideoTvwallForm: {},
      playerBoxWidth: '',
      playerBoxHeight: '',
      videoTvwallList: [],
      /*
      layoutList数据参数：
      layout 窗口个数
      xItem 横向个数
      yItem 竖向个数
      haveFirstIrregular 存在第一列不规则布局
      firstIrregularXItem 第一列不规则中横向窗口个数
      firstIrregularYItem 第一列不规则中竖向窗口个数
       */
      layoutList: [
        { layout: 1, xItem: 1, yItem: 1 },
        { layout: 4, xItem: 2, yItem: 2 },
        {
          layout: 6,
          xItem: 3,
          yItem: 3,
          haveFirstIrregular: true,
          itemCol: 2,
          firstIrregularXSize: 2,
          firstIrregularYSize: 2,
          firstIrregularCol: 2,
          firstIrregularRow: 1
        },
        { layout: 8, xItem: 4, yItem: 4, haveFirstIrregular: true, itemCol: 2, firstIrregularXSize: 3, firstIrregularYSize: 3, firstIrregularCol: 3, firstIrregularRow: 1 },
        { layout: 9, xItem: 3, yItem: 3 },
        { layout: 13, xItem: 4, yItem: 4, haveFirstIrregular: true, itemCol: 3, firstIrregularXSize: 2, firstIrregularYSize: 2, firstIrregularCol: 2, firstIrregularRow: 2 },
        { layout: 16, xItem: 4, yItem: 4 },
        { layout: 28, xItem: 6, yItem: 6, haveFirstIrregular: true, itemCol: 4, firstIrregularXSize: 3, firstIrregularYSize: 3, firstIrregularCol: 3, firstIrregularRow: 3 },
        { layout: 36, xItem: 6, yItem: 6 }
      ],
      showVideoTvwall: false,
      flow: [
        { label: '第一码流', value: 1 },
        { label: '第二码流', value: 2 },
        { label: '第三码流', value: 3 }
      ],
      activeEndSetPlayerItem: null,
      playerItemForm: {},
      addIdx: [],
      editIdx: [],
      delIdx: [],
      chnInfo: null,
      videoGatewayEx: {}
    }
  },
  computed: {
    id() { // 编辑获取内容
      return this.$route.query.id
    },
    navTitle() { // title
      return this.$route.meta.title
    }
  },
  mounted() {
    this.getVideoTvwall()
    this.findVideoGatewayEx()
  },
  methods: {
    // 获取电视墙
    getVideoTvwall() {
      request({
        url: api.video.getVideoTvwall, data: { id: this.id }
      }).then(res => {
        if (res.code === 1) {
          this.getVideoTvwallForm = res.model
          this.playerBoxHeight = this.$refs.appContainer.clientHeight - 20
          this.playerBoxWidth = this.$refs.playerBox.clientWidth
          const idx = this.layoutList.findIndex(item => item.layout === this.getVideoTvwallForm.tvwallLayout)
          if (idx !== -1) {
            this.playerScreenPartition(this.layoutList[idx])
          }
          this.findVideoTvwallPlayer()
        }
      })
    },
    // 获取电视墙播放窗口
    findVideoTvwallPlayer() {
      request({
        url: api.video.findVideoTvwallPlayer, data: { tvwallId: this.id, limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          if (res.data.length > 0) {
            res.data.forEach(item => {
              const idx = this.getPlayerIndex(item.playerIndex)
              if (idx.length > 0) {
                this.$set(this.videoTvwallList[idx[0]][idx[1]], 'channelName', item.channelName)
                this.$set(this.videoTvwallList[idx[0]][idx[1]], 'tvwallId', this.getVideoTvwallForm.id)
                this.$set(this.videoTvwallList[idx[0]][idx[1]], 'id', item.id)
                this.$set(this.videoTvwallList[idx[0]][idx[1]], 'channelId', item.channelId)
                this.$set(this.videoTvwallList[idx[0]][idx[1]], 'flow', item.flow)
                this.$set(this.videoTvwallList[idx[0]][idx[1]], 'playSeconds', item.playSeconds)
                this.$set(this.videoTvwallList[idx[0]][idx[1]], 'playUrl', item.playUrl)
              }
            })
          }
        }
      })
    },
    getPlayerIndex(playerIndex) {
      for (let i = 0; i < this.videoTvwallList.length; i++) {
        const idx = this.videoTvwallList[i].findIndex(item => item.playerIndex === playerIndex)
        if (idx !== -1) {
          return [i, idx]
        }
      }
    },
    dropChnItemInVideoDiv(e, ci, ri) {
      if (ci !== undefined && ri !== undefined) {
        this.activeEndSetPlayerItem = [ci, ri]
        console.log(this.activeEndSetPlayerItem)
        const getDragChnItem = e.dataTransfer.getData('chn') || this.DataTransfer.getData('chn')
        if (!getDragChnItem) return
        const ChnJson = getDragChnItem ? JSON.parse(getDragChnItem) : null
        console.log(ChnJson)
        this.draggingEl({ item: ChnJson })
      }
    },
    // 拖拽结束
    draggingEl(val) {
      this.$set(this.videoTvwallList[this.activeEndSetPlayerItem[0]][this.activeEndSetPlayerItem[1]], 'channelName', `${val.item.beDvr.title}${val.item.cname}`)
      this.$set(this.videoTvwallList[this.activeEndSetPlayerItem[0]][this.activeEndSetPlayerItem[1]], 'tvwallId', this.getVideoTvwallForm.id)
      this.$set(this.videoTvwallList[this.activeEndSetPlayerItem[0]][this.activeEndSetPlayerItem[1]], 'channelId', val.item.cid)
      this.$set(this.videoTvwallList[this.activeEndSetPlayerItem[0]][this.activeEndSetPlayerItem[1]], 'flow', 2)
      this.$set(this.videoTvwallList[this.activeEndSetPlayerItem[0]][this.activeEndSetPlayerItem[1]], 'playSeconds', 0)
      this.$set(this.videoTvwallList[this.activeEndSetPlayerItem[0]][this.activeEndSetPlayerItem[1]], 'playUrl', `rtsp://${this.videoGatewayEx.ip}/live/${val.item.cid}${this.videoTvwallList[this.activeEndSetPlayerItem[0]][this.activeEndSetPlayerItem[1]].flow}`)
      if (this.videoTvwallList[this.activeEndSetPlayerItem[0]][this.activeEndSetPlayerItem[1]].id === undefined) { // id为空是新增
        this.insertVideoTvwallPlayer(this.videoTvwallList[this.activeEndSetPlayerItem[0]][this.activeEndSetPlayerItem[1]])
      } else { // id为空是编辑
        this.updateVideoTvwallPlayer(this.videoTvwallList[this.activeEndSetPlayerItem[0]][this.activeEndSetPlayerItem[1]])
      }
      this.getChnCurrentItem(val.item.cid, 2)
    },
    getTvWallItemConfig(item) {
      this.showVideoTvwall = true
      this.playerItemForm = item
    },
    comfirm() {
      this.showVideoTvwall = false
      this.updateVideoTvwallPlayer(this.playerItemForm)
    },
    insertVideoTvwallPlayer(data) {
      request({
        url: api.video.insertVideoTvwallPlayer, data: data
      }).then(res => {
        if (res.code === 1) {
          this.$message.success(res.msg)
          for (let i = 0; i < this.videoTvwallList.length; i++) {
            const idx = this.videoTvwallList[i].findIndex(item => item.playerIndex === data.playerIndex)
            if (idx !== -1) {
              console.log(this.videoTvwallList[this.activeEndSetPlayerItem[0]][this.activeEndSetPlayerItem[1]])
              this.$set(this.videoTvwallList[this.activeEndSetPlayerItem[0]][this.activeEndSetPlayerItem[1]], 'id', res.model.id)
              break
            }
          }
        }
      })
    },
    updateVideoTvwallPlayer(data) {
      this.getChnCurrentItem(data.channelId, data.flow)
      request({
        url: api.video.updateVideoTvwallPlayer, data: data
      }).then(res => {
        if (res.code === 1) {
          this.$message.success(res.msg)
        }
      })
    },
    deleteVideoTvwallPlayer() {
      request({
        url: api.video.deleteVideoTvwallPlayer, data: { id: this.playerItemForm.id }
      }).then(res => {
        if (res.code === 1) {
          this.$message.success(res.msg)
          this.showVideoTvwall = false
          this.findVideoTvwallPlayer()
          for (let i = 0; i < this.videoTvwallList.length; i++) {
            const idx = this.videoTvwallList[i].findIndex(item => item.playerIndex === this.playerItemForm.playerIndex)
            if (idx !== -1) {
              this.$set(this.videoTvwallList[i][idx], 'channelId', '')
              delete this.videoTvwallList[i][idx].id
              break
            }
          }
        }
      })
    },
    changeFlow(val) {
      let str = this.playerItemForm.playUrl
      const length = str.length
      const arr = str.split('')
      arr[length - 1] = val
      str = arr.join('')
      this.$set(this.playerItemForm, 'playUrl', str)
    },
    findVideoGatewayEx() {
      request({
        url: api.video.findVideoGatewayEx, data: { clientType: 1 }
      }).then(res => {
        if (res.code === 1) {
          this.videoGatewayEx = res.data[0]
        }
      })
    },
    getChnCurrentItem(cid, isStream) {
      request({
        url: api.video.getLive, data: { cid, isStream }
      })
    },
    // 窗口划分
    playerScreenPartition(layoutItem) {
      const layout = []
      // 获取存放电视墙窗口的div的高度 / 当前电视墙窗口配置的竖向盒子个数 = 每一个窗口的高度
      const itemHeight = this.playerBoxHeight / layoutItem.yItem
      // 获取存放电视墙窗口的div的宽度 / 当前电视墙窗口配置的横向盒子个数 = 每一个窗口的宽度
      const itemWidth = this.playerBoxWidth / layoutItem.xItem
      if (layoutItem.haveFirstIrregular) { // 存在不规则的格子
        let idx = 0
        // 根据xItem生成列
        for (let i = 0; i < layoutItem.itemCol; i++) {
          const layoutRow = []
          if (i === 0) { // 第一列不规则
            layoutRow.push({
              playerIndex: idx,
              width: layoutItem.firstIrregularXSize * itemWidth,
              height: layoutItem.firstIrregularYSize * itemHeight - 1,
              top: 0, left: 0, isAbsolute: true
            })
            idx++
            for (let j = 0; j < layoutItem.firstIrregularCol; j++) {
              for (let k = 0; k < layoutItem.firstIrregularRow; k++) {
                layoutRow.push({
                  playerIndex: idx,
                  width: itemWidth,
                  height: itemHeight,
                  top: ((k + layoutItem.firstIrregularYSize) * itemHeight) - (2 + k), left: j * itemWidth, isAbsolute: true
                })
                idx++
              }
            }
            layout.push(layoutRow)
          } else { // 非第一列
            for (let j = 0; j < layoutItem.yItem; j++) {
              layoutRow.push({
                playerIndex: idx,
                width: itemWidth,
                height: itemHeight
              })
              idx++
            }
            layout.push(layoutRow)
          }
        }
      } else { // 不存在不规则的格子
        let idx = 0
        for (let i = 0; i < layoutItem.xItem; i++) {
          const layoutRow = []
          for (let j = 0; j < layoutItem.yItem; j++) {
            layoutRow.push({
              playerIndex: idx,
              width: itemWidth,
              height: itemHeight
            })
            idx++
          }
          layout.push(layoutRow)
        }
      }
      this.videoTvwallList = layout
    },
    dropOver(e) {
      e.dataTransfer.dropEffect = 'move'// e.dataTransfer.dropEffect="move";//在dragenter中针对放置目标来设置!
    }
  }
}
</script>

<style lang="scss" scoped>
.app-main {
  height: 200vh !important;
}

.tvwal-config-main {
  height: calc(100% - 50px);
  .app-container {
    height: 100% !important;
    display: flex;
    .sideMenu {
      width: 240px;
      background: #e9ecf3;
      height: 100%;
      font-size: 14px;
      font-weight: 600;
      line-height: 36px;
      overflow: auto;
    }
    .flexBox {
      display: flex;
    }
    .flex-direction-row {
      flex-direction: row;
    }
    .flex-direction-column {
      flex-direction: column;
    }
    .player-box {
      height: 100%;
      width: 100%;
      display: flex;
      margin-left: 10px;
      position: relative;
      .player-box-row {
        position: relative;
        .player-box-item {
          margin: 1px;
          background: #fff;
          height: 100%;
          width: 100%;
          .box-item-content {
            position: relative;
            height: 100%;
            .player-index {
              padding: 14px;
              font-size: 18px;
              font-weight: bold;
            }
            .el-button {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            }
          }
        }
      }
    }
  }
}
</style>
