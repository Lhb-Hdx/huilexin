<template>
  <el-dialog v-set-dialog-main-height="'80%'" title="执行脚本" class="dialog-body-scroll no-dialog-body dialog-not-footer" :visible.sync="showDialog" width="90%" top="5vh">
    <div ref="dialogBody" class="dialog-body">
      <div class="execute-progress" :style="{ width: setProgress + '%' }" />
      <div class="execute-result">
        <div class="execute-device">
          <div class="list-button">
            <el-button size="mini" type="primary" @click="allStop">全部中止</el-button>
            <el-button size="mini" type="primary">全部重试</el-button>
          </div>
          <div class="list-main">
            <div class="list-main-header">
              <div class="header-item left">设备名称</div>
              <div class="header-item right">执行状态</div>
            </div>
            <div class="list-main-body">
              <div v-for="item in scriptExecuteResult" :key="item.serverId" class="main-body-item pointer" :class="activeServerResult ? activeServerResult.serverId === item.serverId ? 'active' : '' : ''" @click="handlerServer(item)">
                <div class="name">{{ item.serverName }}</div>
                <div class="statue">
                  <i v-if="item.executeStatue === 1" class="el-icon-success success" />
                  <i v-else-if="item.executeStatue === 0" class="el-icon-error danger" />
                  <i v-else class="el-icon-loading" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="execute-build">
          <div v-if="buildResult" class="build-result execute-build-item border-right" :style="{ height: percentageOneHeight * 60 + 'px' }">
            <div class="execute-build-title">输出结果</div>
            <div class="execute-build-main">
              <textarea v-if="activeServerResult" v-model="activeServerResult.buildResult" readonly />
            </div>
          </div>
          <div class="execute-result execute-build-item border-right" :style="{ height: percentageOneHeight * 60 + 'px', width: buildResult ? '35%' : '45% !important' }">
            <div class="execute-build-title">执行结果</div>
            <div class="execute-build-main">
              <textarea v-if="activeServerResult" v-model="activeServerResult.executeResult" readonly />
            </div>
          </div>
          <div class="analysis-result execute-build-item" :style="{ height: percentageOneHeight * 60 + 'px', width: buildResult ? '30%' : '55% !important' }">
            <div class="execute-build-title">分析结果</div>
            <div class="execute-build-main">
              <textarea v-if="activeServerResult" v-model="activeServerResult.analysisResult" readonly />
            </div>
          </div>
          <div class="result-code execute-build-item border-right" :style="{ height: percentageOneHeight * 40 + 'px' }">
            <div class="execute-build-title">结果分析脚本</div>
            <div class="execute-build-main">
              <textarea v-if="activeServerResult" v-model="activeServerResult.analysisScript" readonly />
            </div>
          </div>
          <div class="analysis-table execute-build-item" :style="{ height: percentageOneHeight * 40 + 'px' }">
            <div class="execute-build-title">自动分析</div>
            <div class="execute-build-main">
              <div class="analysis-table-main">
                <div class="analysis-table-header">
                  <div class="table-header-item">设备</div>
                  <div class="table-header-item">表达式</div>
                  <div class="table-header-item">分析值</div>
                  <div class="table-header-item">实际值</div>
                  <div class="table-header-item">结果</div>
                </div>
                <div v-if="activeServerResult" class="analysis-table-body">
                  <div v-for="(item, index) in getAllDeviceAuthAnalysis" :key="index">
                    <div class="table-body-item overflow-text-a">{{ item.serverName }}</div>
                    <div class="table-body-item overflow-text-a">{{ item.name }}</div>
                    <div class="table-body-item overflow-text-a">{{ item.compareCharacter }}{{ item.compareValue }}</div>
                    <div class="table-body-item overflow-text-a">{{ item.analyseResult }}</div>
                    <div v-if="item.analyseResultReturnOk" class="table-body-item overflow-text-a" :class="item.analyseStatue === 0 ? 'danger' : 'success'">{{ item.analyseStatue === 0 ? '异常' : '正常' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'ScriptExecuteDialog',
  props: {
    scriptExecuteResult: {
      type: Array,
      default() {
        return []
      }
    },
    buildResult: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      showDialog: false,
      percentageOneHeight: 0, // 弹窗内容区域高度，除以100，得到百分之一的高度
      activeServerResult: null,
      setProgress: 0
    }
  },
  computed: {
    getAllDeviceAuthAnalysis() {
      const allDeviceAuthAnalysis = []
      if (this.scriptExecuteResult.length > 0) {
        this.scriptExecuteResult.forEach(item => {
          allDeviceAuthAnalysis.push({
            serverId: item.serverId, // 服务器id
            serverName: item.serverName, // 服务器名称
            name: item.authAnalysis[0].name || '', // 表达式名称
            compareCharacter: item.authAnalysis[0].compareCharacter || '', // 判断符号
            compareValue: item.authAnalysis[0].compareValue || '', // 判断值
            analyseResult: item.authAnalysis[0].analyseResult || '', // 实际结果
            analyseStatue: item.authAnalysis[0].analyseStatue || 0, // 分析状态
            analyseResultReturnOk: item.authAnalysis[0].analyseResultReturnOk
          })
        })
      }
      return allDeviceAuthAnalysis
    }
  },
  watch: {
    scriptExecuteResult: {
      handler() {
        if (this.scriptExecuteResult.length === 0) this.activeServerResult = null
        this.setActiveServerResult()
      },
      deep: true
    }
  },
  mounted() {
    this.activeServerResult = null
    this.setActiveServerResult()
  },
  methods: {
    // 打开弹窗
    open() {
      this.showDialog = true
      this.$nextTick(() => {
        const dialogHeight = this.$refs.dialogBody.clientHeight
        this.percentageOneHeight = dialogHeight / 100
      })
    },
    // 点击选择服务
    handlerServer(item) {
      this.activeServerResult = item
    },
    // 全部停止执行
    allStop() {
      this.$EventBus.$emit('stop-all-exec-script')
    },
    setActiveServerResult() {
      if (!this.activeServerResult && this.scriptExecuteResult.length > 0) {
        this.activeServerResult = this.scriptExecuteResult[0]
      }

      // 进度条计算
      let overCount = 0
      this.scriptExecuteResult.forEach(item => {
        if (item.executeStatue !== -1) overCount++
      })
      this.setProgress = (100 / this.scriptExecuteResult.length) * overCount
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog-body {
  height: 100%;
}
.execute-result {
  .border-right {
    border-right: 1px solid #797979;
  }
  .execute-device, .execute-build, .execute-result, .result-code, .build-result, .analysis-table, .analysis-result {
    display: inline-block;
    vertical-align: top;
  }
  .build-result {
    width: 35%;
    border-right: 1px solid #797979 !important;
  }
  .result-code {
    width: 45%;
  }
  .analysis-table {
    width: 55%;
  }
  .execute-device {
    width: 20%;
    .list-button {
      padding: 10px;
    }
    .list-main {
      .list-main-header {
        background: #eeeeee;
        color: #000;
        .header-item {
          display: inline-block;
          padding: 10px;
        }
        .left {
          width: 70%;
        }
        .right {
          width: 30%;
        }
      }
      .list-main-body {
        color: #000;
        .main-body-item {
          .name, .statue {
            display: inline-block;
            padding: 10px;
          }
          .name {
            width: 70%;
          }
          .statue {
            width: 30%;
          }
        }
        .active {
          background: #f2f2f2;
        }
      }
    }
  }
  .execute-build {
    width: 80%;
    .execute-build-title {
      color: #fff;
      font-size: 13px;
      padding: 10px;
      background: #2f3033;
    }
    .execute-build-main {
      color: #fff;
      font-size: 13px;
      padding: 10px;
      background: #212124;
      height: calc(100% - 35px);
      textarea {
        width: 100%;
        height: 100%;
        background: #212124;
        border: unset;
        color: #fff;
        font-size: 13px;
        resize: none;
        outline: none;
      }
      .analysis-table-main {
        width: 95%;
        margin: 0 auto;
        .analysis-table-header {
          border: 1px solid #4d4d4e;
          padding: 10px 5px;
          .table-header-item {
            width: 20%;
            display: inline-block;
            text-align: center;
          }
        }
        .analysis-table-body {
          .table-body-item {
            padding: 10px 5px;
            width: 20%;
            display: inline-block;
            text-align: center;
            border-bottom: 1px solid #2f3033;
          }
        }
      }
    }
  }
}
.execute-progress {
  background: #1846a5;
  height: 5px;
  width: 0;
}
</style>
