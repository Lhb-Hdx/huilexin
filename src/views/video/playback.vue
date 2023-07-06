<template>
  <div class="main video-live">
    <div ref="sideMenu" v-permission="['SearchChn']" class="sideMenu">
      <video-chn-list
        :show-calendar="showCalendar"
        @chnCurrentItem="getChnCurrentItem"
        @currentYearMonthDay="getCurrentYearMonthDay"
        @changeRecordType="changeRecordType"
        @resourceRequestError="resourceRequestError"
      />
    </div>
    <div
      ref="mainContent"
      v-loading="playLoading"
      class="main-content"
      element-loading-text="录像加载中"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    >
      <div class="video-container" :style="{height:videoPlayerBoxHeight+'px'}">
        <playback-player-content
          :key="reloadPlaybackKey"
          :sources="sources"
          :show-canvas="showCanvas"
          :set-play-time-object="currentTime"
          :record-type="recordType"
          :switch-play-num="switchPlayNumObject"
          :label-sources="labelSources"
          :show-message-tip="true"
          @playUpdateTime="playUpdateTime"
          @resourceRequestError="resourceRequestError"
          @closeLoading="closeLoading"
          @updatePlayerSliderBlock="updatePlayerSliderBlock"
        />
      </div>
      <div ref="controllerContent" class="controller-container">
        <div class="video-head">
          <div class="video-title">{{ chnCurrentItem.cname }}</div>
          <div class="video-buttons">
            <el-button-group style="margin-right: 10px">
              <el-button v-permission="['LastVideo']" class="v-button" type="info" size="mini" icon="el-icon-arrow-left" @click="onBlockSwitch('last')">上一个</el-button>
              <el-button v-permission="['NextVideo']" class="v-button" type="info" size="mini" @click="onBlockSwitch('next')">下一个<i class="el-icon-arrow-right el-icon--right" /></el-button>
            </el-button-group>
            <el-button v-if="recordType === 1" v-permission="['AddLabel']" class="v-button" type="info" size="mini" @click="markLabelVideo">插入标记</el-button>
            <el-button v-if="recordType === 1" v-permission="['LabelList']" class="v-button" type="info" size="mini" @click="openLabelVideoList">标记列表</el-button>
            <el-button v-permission="['Screenshot']" class="v-button" type="info" size="mini" @click="showCanvasEvent">截图</el-button>
          </div>
        </div>
        <div class="control-bar">
          <div class="control-bar-label">录像</div>
          <player-slider :sources="sources" :current-date="selectTargetDate" :current-play-time="videoTime" :update-player-slider-block-info="updatePlayerSliderBlockInfo" @currentChangePlayTime="currentChangePlayTime" />
        </div>
        <div v-if="recordType === 1" class="control-bar">
          <div class="control-bar-label">标记</div>
          <player-label-slider :sources="labelSources" :current-date="selectTargetDate" :current-play-time="videoTime" @currentChangePlayTime="currentChangePlayTime" />
        </div>
        <div class="control-bar">
          <div class="control-bar-label">告警</div>
          <player-alarm-slider :sources="alarmSources" :current-date="selectTargetDate" />
        </div>
        <div class="ruler">
          <span v-for="item in timeSegment" :key="item+'-timeSegment'" class="ruler-item">{{ item }}</span>
        </div>
      </div>
    </div>
    <!-- 编辑标签弹窗 -->
    <el-dialog title="编辑标记" :visible.sync="editLabelModal" width="400px">
      <div style="display:flex;align-items:center">
        <div style="width:150px">录像标记内容：</div>
        <el-input v-model="editLabelRemark" />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editLabelModal = false">取 消</el-button>
        <el-button type="primary" @click="editLabelModal = false">保 存</el-button>
      </span>
    </el-dialog>
    <!-- 标签列表 -->
    <el-dialog title="标记列表" :visible.sync="showLabelVideoList" width="1200px">
      <div v-permission="['SearchLabel']" class="filter-container">
        <el-input v-model="labelVideoListQuery.remarks" placeholder="请输入标记名称" style="width: 200px;" class="filter-item" clearable />
        <el-date-picker
          v-model="labelVideoListQuery.stime"
          type="datetime"
          placeholder="开始时间"
          class="filter-item"
        />
        <el-date-picker
          v-model="labelVideoListQuery.etime"
          type="datetime"
          placeholder="结束时间"
          class="filter-item"
        />
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="getLabelVideoList">查询</el-button>
      </div>
      <div v-loading="labelVideoListLoading" class="table-wrapper">
        <el-table :data="labelVideoList" style="width: 100%">
          <el-table-column type="index" label="NO" width="50" />
          <el-table-column label="标注" width="200" prop="remarks" show-overflow-tooltip />
          <el-table-column label="标注时间段" show-overflow-tooltip>
            <template slot-scope="{row}">
              {{ setLabelTime(row) }}
            </template>
          </el-table-column>
          <el-table-column label="标注时长" width="120" prop="length" show-overflow-tooltip />
          <el-table-column label="操作" width="360" class-name="small-padding fixed-width">
            <template slot-scope="{row}">
              <el-button v-permission="['PlayLabel']" type="primary" size="mini" @click="playLabel(row)">播放</el-button>
              <el-button v-permission="['DownloadLabel']" type="primary" size="mini" :loading="row.isLoading" :style="{ 'width': row.isLoading ? '140px' : '0px' }" @click="downloadLabel(row)">
                {{ row.isLoading ? '已下载' + row.loadPlan + '%' : '下载' }}
              </el-button>
              <el-button v-permission="['EditLabel']" type="primary" size="mini" @click="editLabel(row)">编辑</el-button>
              <el-button v-permission="['DeleteLabel']" type="danger" size="mini" @click="deleteLabelVideo(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="labelVideoListTotal > 0" :auto-scroll="false" :total="labelVideoListTotal" :page.sync="labelVideoListQuery.page" :limit.sync="labelVideoListQuery.limit" @pagination="getLabelVideoList" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import { parseTime } from '@/utils'
import { formatNumber, getBrowserHost, getNowDate, guid } from '@/utils/utils'
import { isIp, isHttps } from '@/utils/validate'
import PlaybackPlayerContent from './components/player-content/playback-player-content'
import VideoChnList from './components/video-chn-list/video-chn-list'
import PlayerSlider from './components/player-slider/player-slider'
import PlayerLabelSlider from './components/player-slider/label-slider'
import PlayerAlarmSlider from './components/player-slider/alarm-slider'
import Pagination from '@/components/Pagination'
import store from '@/store'

export default {
  name: 'VideoPlayBack',
  components: {
    PlaybackPlayerContent, PlayerSlider, VideoChnList, PlayerLabelSlider, Pagination, PlayerAlarmSlider
  },
  data() {
    return {
      timeSegment: [],
      selectTargetDate: null,
      currentTime: {},
      cid: 0,
      chnCurrentItem: {
        cid: 0,
        cname: ''
      },
      showCanvas: false,
      videoPlayerBoxHeight: 0,
      yearAndMonth: '',
      editLabelRemark: '',
      editLabelModal: false,
      videoTime: 0,
      sources: [],
      alarmSources: [],
      labelSources: [],
      recordType: 1,
      playLoading: false,
      switchPlayNumObject: {},
      insertLabelVideoForm: { // 插入标签表单参数
        srcRecordUrl: '',
        tagTime: '',
        srcSecond: '',
        csid: ''
      },
      updateLabelVideoForm: { // 标记标签表单参数
        id: '',
        remarks: ''
      },
      currentFindVideoDate: [],
      showLabelVideoList: false,
      labelVideoList: [],
      labelVideoListTotal: 0,
      labelVideoListQuery: {
        remarks: '',
        stime: 0,
        etime: 0,
        page: 1,
        limit: 10
      },
      labelVideoListLoading: false,
      getNowDate: getNowDate('object'),
      reloadPlaybackKey: '', // 无视频重置播放窗口
      updatePlayerSliderBlockInfo: {},
      showCalendar: false
    }
  },
  computed: {
    setLabelTime() {
      return function(s) {
        if (!s) return ''
        const stime = Number(s.tagTime) - Number(s.length)
        const etime = Number(s.tagTime) + Number(s.length)
        return `${getNowDate(null, new Date(stime * 1000))} ~ ${getNowDate(null, new Date(etime * 1000))}`
      }
    }
  },
  created() {
    for (let i = 0; i <= 24; i++) this.timeSegment.push(i)
    this.yearAndMonth = parseTime(new Date(), '{y}-{m}')
    this.selectTargetDate = parseTime(new Date(), '{y}-{m}-{d}')
  },
  mounted() {
    const mainHeight = this.$refs.mainContent.clientHeight
    const controllerHeight = this.$refs.controllerContent.clientHeight
    this.videoPlayerBoxHeight = mainHeight - controllerHeight
    this.$set(this.labelVideoListQuery, 'stime', new Date(this.getNowDate.Y, this.getNowDate.M - 1, this.getNowDate.D, 0, 0, 0))
    this.$set(this.labelVideoListQuery, 'etime', new Date(this.getNowDate.Y, this.getNowDate.M - 1, this.getNowDate.D, 23, 59, 59))
    const roles = store.getters && store.getters.roles
    this.showCalendar = roles.indexOf('SelectVideoDate') !== -1
  },
  methods: {
    // 监听当前播放时间
    playUpdateTime(val) {
      this.insertLabelVideoForm = { // 设置标签表单数据
        srcRecordUrl: val.fpath, // 打标签的片段
        tagTime: getNowDate('string', new Date((val.stime + parseInt(val.currentTime)) * 1000)), // 打标签时间
        srcSecond: parseInt(val.currentTime), // 开始秒
        csid: val.csid,
        length: 60 // 时长
      }
    },
    // 设置标记信息
    markLabelVideo() {
      const that = this
      if (that.currentTime.sliderType && that.currentTime.sliderType === 'label') return this.$message('不允许对标记录像进行标记')
      this.$prompt('请输入标注', '新增标记', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S/,
        inputErrorMessage: '请输入正确的标注信息'
      }).then(({ value }) => {
        that.submitLableVideo({ cid: that.cid, remarks: value, ...that.insertLabelVideoForm })
      }).catch(() => {})
    },
    // 提交标记信息
    submitLableVideo(data) {
      request({
        url: data.id ? api.video.updateVideoLable : api.video.lableVideo, data
      }).then(res => {
        if (res.code === 1) {
          if (data.id) {
            this.getLabelVideoList()
          } else {
            this.videoSource(...this.currentFindVideoDate, 3)
          }
          this.$message({
            type: 'success',
            message: '标注成功'
          })
        }
      })
    },
    /**
     * @description 获取播放资源
     * @param year 年
     * @param month 月
     * @param days 日
     * @param sourceType 资源类型 不传获取视频记录、标记记录、告警记录 1：视频记录 2：告警记录 3：标记记录
     * @returns {Promise<void>}
     */
    async videoSource(year, month, days, sourceType) { // 读取某天的视频记录
      const that = this
      that.reloadPlaybackKey = guid()
      const dateObj = new Date(year + '-' + month + '-' + days + ' 00:00:00')
      const date = new Date(dateObj)
      const stime = parseInt(date.getTime() / 1000) + 1
      date.setDate(date.getDate() + 1)
      const etime = parseInt(date.getTime() / 1000) - 1

      if (!sourceType) this.playLoading = true

      // 请求读取此天的录播视频记录
      if (!sourceType || sourceType === 1) {
        this.sources = []
        await request({
          url: api.video.findVideos, data: { cid: this.cid, stime, etime, recordType: this.recordType }
        }).then(res => {
          if (res.map && res.map.video) {
            res.map.video.forEach(item2 => {
              that.sources.push(item2)
            })
            that.chnCurrentItem.sources = this.sources
            that.chnCurrentItem.allSources = {}
            that.chnCurrentItem.allSources[ year.toString() + month.toString() + days.toString() ] = that.sources
          }
          if (!res.map || res.map.video.length === 0) {
            that.sources = []
            this.playLoading = false
            this.$message('暂无录像')
          }
        })
      }

      // 请求读取此天的报警事件视频记录
      if (!sourceType || sourceType === 2) {
        await request({
          url: api.video.findVideoAlarmLog, data: {
            ipcID: this.cid,
            sTime: getNowDate('string', new Date(stime * 1000)),
            eTime: getNowDate('string', new Date(etime * 1000)),
            alarmTypes: '1004,3', // 周界入侵、移动侦查
            page: 1,
            limit: -1
          }
        }).then(res => {
          if (res.code === 1) {
            this.alarmSources = res.data
          }
          // if (res.map && res.map.alaram) {
          //   this.alarmSources = []
          //   res.map.alaram.forEach(item2 => {
          //     that.alarmSources.push(item2)
          //   })
          //   that.chnCurrentItem.alarmSources = this.sources
          //   that.chnCurrentItem.allAlarmSources = {}
          //   that.chnCurrentItem.allAlarmSources[ year.toString() + month.toString() + days.toString() ] = that.sources
          // }
        })
      }

      // 请求读取此天的标注视频记录
      if (!sourceType || sourceType === 3) {
        const labelData = await this.findLabelVideos({ cid: this.cid, stime, etime })
        if (!labelData) return
        this.labelSources = []
        labelData.forEach(item2 => {
          item2.stime = Number(item2.tagTime) - Number(item2.length)
          item2.etime = Number(item2.tagTime) + Number(item2.length)
          that.labelSources.push(item2)
        })
        that.chnCurrentItem.labelSources = this.sources
        that.chnCurrentItem.allLabelSources = {}
        that.chnCurrentItem.allLabelSources[ year.toString() + month.toString() + days.toString() ] = that.sources
      }
    },
    // 开始截图
    showCanvasEvent() {
      this.showCanvas = false
      const that = this
      setTimeout(function() {
        that.showCanvas = true
      }, 300)
    },
    // 当前进度条点击事件
    currentChangePlayTime(secondsTime) {
      this.currentTime = secondsTime
    },
    // 点击摄像头通道
    getChnCurrentItem(val) {
      this.chnCurrentItem = val
      this.cid = val.cid
      const targetDate = new Date()
      const todaySources = val.allSources[targetDate.getFullYear().toString() + formatNumber((targetDate.getMonth() + 1)).toString() + formatNumber(targetDate.getDate()).toString()]
      this.currentFindVideoDate = [targetDate.getFullYear(), formatNumber((targetDate.getMonth() + 1)).toString(), formatNumber(targetDate.getDate()).toString()]
      this.selectTargetDate = parseTime(new Date(), '{y}-{m}-{d}')
      // 读取当前的记录
      if (todaySources && todaySources.length > 0) {
        this.sources = todaySources
      } else {
        this.videoSource(...this.currentFindVideoDate)
      }
    },
    // 获取当前选择年月日
    getCurrentYearMonthDay(item) {
      this.cid = item.cid
      this.chnCurrentItem = item
      this.selectTargetDate = item.year + '-' + item.month + '-' + item.date
      this.chnCurrentItem.active = false
      this.currentFindVideoDate = [item.year, item.month, item.date]
      if (this.chnCurrentItem.allSources) {
        const targetSource = this.chnCurrentItem.allSources[item.year + item.month + item.date]
        if (targetSource && targetSource.length > 0) {
          this.sources = targetSource
        } else {
          this.videoSource(...this.currentFindVideoDate)
        }
      } else {
        this.videoSource(...this.currentFindVideoDate)
      }
    },
    // 选择录像类型
    changeRecordType(val) {
      this.recordType = val
    },
    // 视频资源请求错误
    resourceRequestError(val) {
      if (val === true) {
        this.chnCurrentItem.allSources = []
        this.playLoading = false
      }
    },
    // 关闭视频加载loading
    closeLoading(val) {
      if (val === true) {
        this.playLoading = false
      }
    },
    // 片段切换
    onBlockSwitch(switchType) {
      this.switchPlayNumObject = {
        switchType
      }
    },
    // 打开标记列表
    openLabelVideoList() {
      this.showLabelVideoList = true
      this.getLabelVideoList()
    },
    // 查询标记
    async findLabelVideos(data) {
      return new Promise(resolve => {
        request({
          url: api.video.findLabelVideos, data
        }).then(res => {
          if (res.map && res.map.lable) {
            resolve(res.map.lable)
          }
        })
      })
    },
    // 获取标记列表
    async getLabelVideoList() {
      const query = { ...this.labelVideoListQuery }
      query.stime = query.stime.getTime() / 1000
      query.etime = query.etime.getTime() / 1000
      this.labelVideoList = await this.findLabelVideos({ ...query, cid: this.cid })
    },
    // 删除标记
    deleteLabelVideo(id) {
      this.$confirm('确认要删除当前记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.video.deleteVideoLable, data: { id }
        }).then(res => {
          if (res.code === 1) {
            this.getLabelVideoList()
            this.videoSource(...this.currentFindVideoDate, 3)
          }
        })
      })
    },
    // 下载标记视频
    async downloadLabel(val) {
      const listIndex = this.labelVideoList.findIndex(item => Number(item.id) === Number(val.id))
      const httpType = isHttps() ? 'https' : 'http'
      let port = ''
      if (isIp(getBrowserHost())) { // ip访问
        port = isHttps() ? `:${val.innerportHttps}` : `:${val.innerportHttp}`
      } else { // 域名访问
        port = Number(val.mappingPort) === 80 || Number(val.mappingPort) === 443 ? '' : `:${val.mappingPort}`
      }
      const url = `${httpType}://${val.host}${port}/${val.tagRecordUrl}` // 完整的url则直接使用
      let size = 0
      const that = this
      let totalSize = 0
      fetch(url)
        .then(response => {
          totalSize = +response.headers.get('Content-Length')
          if (response.ok) {
            return response
          } else {
            console.log('请求失败')
          }
        })
        .then(response => response.body)
        .then(body => {
          const reader = body.getReader()
          return new ReadableStream({
            start(controller) {
              return pump()
              function pump() {
                return reader.read().then(res => { // res  ({ done, value })
                  // 读不到更多数据就关闭流
                  // console.log(res, 'res')
                  const { done, value } = res
                  if (done) {
                    if (listIndex !== -1) {
                      that.$set(that.labelVideoList[listIndex], 'isLoading', false)
                    }
                    // console.log('end')
                    controller.close()
                    // return;
                  }
                  size += value.length || 0
                  if (listIndex !== -1) {
                    const loadPlan = (size / totalSize) * 100 // 百分比
                    if (!that.labelVideoList[listIndex].isLoading) that.$set(that.labelVideoList[listIndex], 'isLoading', true)
                    that.$set(that.labelVideoList[listIndex], 'loadPlan', loadPlan.toFixed(2))
                  }
                  // console.log(size, 'size', totalSize, 'total')
                  // 将下一个数据块置入流中
                  controller.enqueue(value)
                  return pump()
                })
              }
            }
          })
        })
        .then(stream => new Response(stream))
        .then(response => {
          that.savingFile(response, url.split('/')[url.split('/').length - 1])
        })
    },
    // 保存文件
    savingFile(response, fileName) {
      response.blob().then(blob => {
        if (typeof FileReader === 'undefined') {
          console.log('您的浏览器不支持 FileReader，请升级浏览器')
        }
        const reader = new FileReader()
        reader.addEventListener('loadend', function() {
          let resu = ''
          try {
            resu = JSON.parse(reader.result)
            // resu = eval('('+ reader.result + ')')
            if (resu.code === 500) {
              console.log('resu.msg')
            } else if (resu.code === 401) {
              console.log(resu.msg)
            }
          } catch (e) {
            // 捕获错误 说明是文本字符串
            resu = reader.result
            downloadBlob(blob, fileName)
          }
        })
        reader.readAsText(blob)

        // 下载
        function downloadBlob(blob, fileName) {
          let blobUrl = window.URL.createObjectURL(blob)
          let a = document.createElement('a')
          a.href = blobUrl
          a.target = '_blank'
          a.style.display = 'none'
          document.body.appendChild(a)
          a.download = fileName
          a.click()
          window.URL.revokeObjectURL(blobUrl)
          document.body.removeChild(a)
        }
      })
    },
    // 播放标记
    playLabel(val) {
      this.currentTime = { val, index: 0, sliderType: 'label' }
      this.labelSources = [{ ...val }]
      this.showLabelVideoList = false
    },
    // 标记标记
    editLabel(val) {
      const that = this
      this.$prompt('请输入标注', '编辑标记', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S/,
        inputValue: val.remarks,
        inputErrorMessage: '请输入正确的标注信息'
      }).then(({ value }) => {
        that.submitLableVideo({
          id: val.id,
          remarks: value
        })
      }).catch(() => {})
    },
    // 更新播放进度条下标
    updatePlayerSliderBlock(val) {
      this.updatePlayerSliderBlockInfo = val
    }
  }
}

</script>
<style lang="scss" scoped>
.app-main {
  height: 100vh;
}
.main.video-live {
  height: 100%;
  width: 100%;
  padding-left:240px;
  position: relative;
  .el-calendar__header {
    background: #ddd;
    height: 25px;
  }
  .el-calendar__title {
    font-weight: 500;
    font-size: 12px;
  }
}
$sideWH : 240px;
.sideMenu {
  width: $sideWH;
  background: #e9ecf3;
  height: 100%;
  font-size: 14px;
  font-weight: 600;
  line-height: 36px;
  position: absolute;
  top:0;
  left:0;
  overflow: auto;
}
.main-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 0 11px 11px;
  .video-container {
    flex: 1;
    background: #444444;
    width: 100%;
    .video-player{width: 100%;height: 100%;}
  }
  .controller-container {
    background: #090909;
    .video-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #fff;
      font-size: 14px;
      padding: 7px 18px;
      margin-bottom: 3px;
      .video-buttons {
        .v-button {
          height: 28px;
          background: #333;
          border-color: #333;
          color: #fff;
        }
        .v-button.active{background: #00B285;}
      }
    }
    .control-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px 20px 5px 15px;
      .control-bar-label {
        width: 45px;
        padding: 0 8px;
        color: #999999;
      }
    }
    .ruler {
      display: flex;
      justify-content: space-between;
      color: #999;
      padding: 0px 35px 5px 55px;
      font-size: 12px;
      .ruler-item {
        width: 7px;
      }
    }
  }
}
</style>
