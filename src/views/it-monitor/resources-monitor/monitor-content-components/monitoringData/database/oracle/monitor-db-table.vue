<template>
  <div
    v-if="isConfig || (!isConfig && !watchItemShow)"
    v-loading="alarm_data.length < 1 && !showEmpty"
    element-loading-spinner="el-icon-loading"
    class="chuck-box overview box-border margin-left-15 margin-right-15 margin-top-15"
  >
    <div
      class="head-bar head"
    >
      <div class="title">表空间</div>
      <div class="chunk-opts">
        <div v-if="isConfig" class="chunk-opts-select">
          <el-switch
            v-model="watchItemSwitch"
            @change="changeItemSwitch"
          />
        </div>
      </div>
    </div>
    <div ref="systemInfoRef">
      <el-table
        :data="alarm_data"
        fit
        highlight-current-row
      >
        <el-table-column label="名称" align="center">
          <template slot-scope="{row}">
            <span>{{ row[0] }}</span>
          </template>
        </el-table-column>

        <el-table-column label="视图" align="center" width="250">
          <template slot-scope="{row}">
            <div class="progressBar">
              <div class="progress  no-progress-bar-innerText">
                <el-progress :text-inside="true" :stroke-width="10" :percentage="Number((Number(row[4])).toFixed(2))" :color="Number((Number(row[4])).toFixed(2)) > 90 ? 'red' : 'green'" />
              </div>
              <div>{{ conversion(Number(row[1])) }}</div>
            </div>

          </template>
        </el-table-column>

        <el-table-column label="已用空间" align="center">
          <template slot-scope="{row}">
            <span>{{ conversion(Number(row[2])) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="可用空间" align="center">
          <template slot-scope="{row}">
            <span>{{ conversion(Number(row[3])) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="可用率" align="center">
          <template slot-scope="{row}">
            <span>{{ (100 - Number(row[4])).toFixed(2) }}%</span>
          </template>
        </el-table-column>

        <el-table-column label="最大空间" align="center">
          <template slot-scope="{row}">
            <span>{{ conversion(Number(row[1])) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="自动扩展" align="center">
          <template slot-scope="{row}">
            <div class="icon-flex">
              <img v-if="row !== 0" class="monitor-icon" src="image/common/right.png" alt="">
              <img v-else class="monitor-icon" src="image/common/alarm.png" alt="">
            </div>
          </template>
        </el-table-column>
        <!--
        <el-table-column label="图形" align="center">
          <template slot-scope="{row}">
            <img src="image/common/ico_char.png" alt="" @click="openUsedDetailDialog(row)">
          </template>
        </el-table-column> -->
      </el-table>
    </div>
    <!-- 端口图表 -->
    <UsedDetailDialog
      v-if="showUsedDetailDialog"
      :show-dialog="showUsedDetailDialog"
      :echart-params="detailParams"
      :table-params="tableParams"
      @closeUsedDetailDialog="closeUsedDetailDialog"
    />
  </div>
</template>

<script>
import UsedDetailDialog from '../../component/used-detail-dialog'
export default {
  name: 'MonitorDbTable',
  components: {
    UsedDetailDialog
  },
  props: {
    table: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      watchItemSwitch: true,
      watchItemKey: 'dbTable',
      watchItemShow: null,
      alarm_data: [],
      showUsedDetailDialog: false,
      detailParams: [],
      tableParams: [],
      showEmpty: false
    }
  },
  computed: {
    isConfig() { return this.$route.query.isConfig },
    devTypeId() { return this.$route.query.devTypeId },
    id() { return this.$route.query.id },
    zbxHostId() { return this.$route.query.zbxHostId },
    conversion() {
      return function(val) {
        let num = this.$tool.conversionData('data', val, 'MB')
        return `${num.size}${num.units}`
      }
    }

  },
  watch: {
    table: {
      handler(newVal) {
        if (newVal) {
          this.alarm_data = newVal
        }
      },
      deep: true
    }
  },
  beforeDestroy() {
    this.batchOffEventBus('get-graph-show')
  },
  mounted() {
    this.$EventBus.$on('get-graph-show', (data) => {
      const idx = data.findIndex(item => item.name === this.watchItemKey)
      if (idx !== -1) {
        this.watchItemShow = data[idx]
        this.watchItemSwitch = Boolean(data[idx].isShow)
      }
    })
    const that = this
    setTimeout(() => {
      if (that.alarm_data.length < 2) that.showEmpty = true
    }, 10000)
  },
  methods: {
    openUsedDetailDialog(row) {
      this.showUsedDetailDialog = true
      // this.detailParams = [
      //   {
      //     itemid: this.processCount.processId,
      //     valueType: this.processCount.processType,
      //     name: '进程数量',
      //     color: '#87DEAF',
      //     unit: '',
      //     echartType: 'value',
      //     data: [0],
      //     units: [''],
      //     time: [this.$tool.dateFormat('HH:MM:SS', new Date())]
      //   },
      //   {
      //     itemid: this.processCount.maxProcessId,
      //     valueType: this.processCount.maxProcessType,
      //     name: '进程最大数量',
      //     color: '#3ba9ed',
      //     unit: '',
      //     conversionUnitType: 'data',
      //     data: [0],
      //     units: [''],
      //     time: [this.$tool.dateFormat('HH:MM:SS', new Date())]
      //   }
      // ]
      // this.tableParams = [
      //   {
      //     label: ['进程数量'],
      //     value: 0,
      //     unit: '',
      //     itemid: this.processCount.processId,
      //     valueType: this.processCount.processType,
      //     type: ['max']
      //   },
      //   {
      //     label: ['进程最大数量'],
      //     value: 0,
      //     unit: '',
      //     itemid: this.processCount.maxProcessId,
      //     valueType: this.processCount.maxProcessType,
      //     type: ['max']
      //   }
      // ]
    },
    // 关闭图表
    closeUsedDetailDialog() {
      this.showUsedDetailDialog = false
    },
    changeItemSwitch(val) {
      if (val === false) {
        this.$EventBus.$emit('change-item-switch', {
          name: this.watchItemKey,
          type: 1,
          showName: '表空间',
          isShow: Number(val),
          devType: this.devTypeId,
          hostId: this.id,
          zhostId: this.zbxHostId,
          graphType: 1
        })
      } else {
        this.$EventBus.$emit('change-item-switch', {
          id: this.watchItemShow.id,
          type: 1,
          isShow: Number(val),
          name: this.watchItemKey
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/monitor-device.scss";
.icon-flex {
  display: flex;
  align-items: center;
  justify-content: center;
}

.system-info {
  position: relative;
  .info-item {
    text-align: left;
    font-weight: 400;
    line-height: 1.5;
  }
}

.info-header {
  width: 100%;
  height: 120px;
  display: flex;
  .info-box {
    width: 30%;
    height: 100%;
    display: flex;
    margin: 0 10px;
    justify-content: center;
    align-items: center;
      .info-img {
        position: relative;
        width: 80px;
        height: 80px;
        background-color: rgb(231,248,244);
        border-radius: 80px;
        .img-box {
          width: 40px;
          height: 40px;
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          right: 0;
          margin: auto;
        }
    }
  }
  .progressBar {
    display: flex;
    border: 1px solid black;
  }
  .progress {
    // margin: 10px 0;
    border: 1px solid black;
    width: 40%;
  }
  .word-data {
    width: 70%;
    height: 100%;
    display: flex;
    margin: 0 10px;
    flex-direction: column;
    justify-content: center;
    .word-title {
      display: flex;
      justify-content: space-between;
    }
    .word-size {
       display: flex;
      justify-content: space-between;
    }
  }

}
</style>
