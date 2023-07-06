<template>
  <div class="console-spec">
    <div class="console-spec-main">
      <!--      <div ref="headerBtn" class="console-code">-->
      <!--        <div ref="consoleCodeHeader" class="console-code-header">-->
      <!--          <div class="code-header-title">-->
      <!--            &lt;!&ndash;            <el-button size="mini" type="primary" :loading="loading" @click="implement">{{ loading ? '调试中' : '调试脚本' }}</el-button>&ndash;&gt;-->
      <!--            &lt;!&ndash;            <el-button v-if="analysisResult" size="mini" type="primary" :loading="analysisResultLoading" @click="implementAnalysisResult">{{ analysisResultLoading ? '调试中' : '分析脚本调试' }}</el-button>&ndash;&gt;-->
      <!--          </div>-->
      <!--        </div>-->
      <!--      </div>-->
      <!--      <div v-if="buildResult" class="console-code" :style="{ height: heightOne * 25 + 'px' }">-->
      <!--        <div ref="consoleCodeHeader" class="console-code-header">-->
      <!--          <div class="code-header-title">输出结果</div>-->
      <!--        </div>-->
      <!--        <div class="console-code-main">-->
      <!--          <textarea v-if="activeServerResult" v-model="activeServerResult.buildResult" readonly />-->
      <!--        </div>-->
      <!--      </div>-->
      <div class="console-code" :style="{ height: 328 + 'px' }">
        <div ref="consoleCodeHeader" class="console-code-header">
          <div class="code-header-title">
            执行结果
            <el-button size="mini" type="primary" :loading="loading" @click="implement">{{ loading ? implementScriptButtonOptions.loadingText : implementScriptButtonOptions.defaultText }}</el-button>
          </div>
        </div>
        <div class="console-code-main">
          <textarea v-if="activeServerResult" v-model="activeServerResult.executeResult" readonly />
        </div>
      </div>
      <div class="console-code" :style="{ height: 300 + 'px' }">
        <div ref="consoleCodeHeader" class="console-code-header">
          <div class="code-header-title">
            分析输出
            <el-button v-if="implementAnalysisScript" size="mini" type="primary" :loading="analysisResultLoading" @click="implementAnalysisResult">{{ analysisResultLoading ? '调试中' : '分析脚本调试' }}</el-button>
          </div>
        </div>
        <div class="console-code-main">
          <textarea v-if="activeServerResult" v-model="activeServerResult.analysisResult" readonly />
        </div>
      </div>
      <div class="console-code" :style="{ height: options.height - (300 + 328) + 'px' }">
        <div ref="consoleCodeHeader" class="console-code-header">
          <div class="code-header-title">自动分析</div>
        </div>
        <div class="console-code-main">
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
</template>

<script>
export default {
  name: 'ConsoleResultSpec',
  props: {
    // 样式配置
    options: {
      type: Object,
      default() {
        return {}
      }
    },
    // 执行结果数据
    scriptExecuteResult: {
      type: Array,
      default() {
        return []
      }
    },
    // 是否显示输出结果
    buildResult: {
      type: Boolean,
      default: true
    },
    // 是否显示分析结果
    analysisResult: {
      type: Boolean,
      default: false
    },
    // 是否显示分析调试按钮
    implementAnalysisScript: {
      type: Boolean,
      default: false
    },
    // 运行脚本按钮配置
    implementScriptButtonOptions: {
      type: Object,
      default() {
        return {
          defaultText: '调试脚本',
          loadingText: '调试中'
        }
      }
    }
  },
  data() {
    return {
      heightOne: 0,
      activeServerResult: null,
      loading: false,
      analysisResultLoading: false
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
    },
    id() { // 编辑获取内容
      return this.$route.query.id
    }
  },
  watch: {
    scriptExecuteResult: {
      handler() {
        if (this.scriptExecuteResult.length === 0) this.activeServerResult = null
        this.setActiveServerResult()
      },
      deep: true
    },
    options: {
      handler() {
        let optionsHeight = this.options.height
        // if (!this.id) {
        //   optionsHeight += 19.84
        // }
        if (this.$refs.headerBtn) {
          this.heightOne = (optionsHeight - this.$refs.headerBtn.clientHeight) / 100
        } else {
          this.heightOne = optionsHeight / 100
        }
      },
      deep: true
    }
  },
  mounted() {
    this.$EventBus.$on('implement-button-loading-statue', (statue) => {
      this.loading = statue
    })
    this.$EventBus.$on('analysis-button-loading-statue', (statue) => {
      this.analysisResultLoading = statue
    })
  },
  destroyed() {
    this.batchOffEventBus('implement-button-loading-statue,analysis-button-loading-statue')
  },
  methods: {
    implement() {
      this.loading = true
      this.$EventBus.$emit('implement-script')
    },
    implementAnalysisResult() {
      if (!this.activeServerResult) return this.$message('请先调试脚本')
      if (this.loading) return this.$message('脚本调试正在执行中，请稍后再试')
      if (this.activeServerResult.buildResult.length === 0 && this.activeServerResult.executeResult === 0 && !this.loading) return this.$message('请先调试脚本')
      this.analysisResultLoading = true
      this.$EventBus.$emit('implement-analysis-result', this.activeServerResult)
    },
    setActiveServerResult() {
      if (!this.activeServerResult && this.scriptExecuteResult.length > 0) {
        this.activeServerResult = this.scriptExecuteResult[0]
      }
      if (this.scriptExecuteResult[0] && this.scriptExecuteResult[0].executeStatue === 1) this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>
.console-spec {
  margin-left: 0 !important;
  .console-spec-main {
    width: 100%;
    display: inline-block;
    background: #000;
    .console-code {
      .console-code-header {
        height: 48px;
        color: #fff;
        font-size: 13px;
        padding: 0 10px;
        background: #2f3033;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .code-header-title {
          padding: 10px 0;
          button {
            margin-left: 5px !important;
          }
        }
        .btns {
          display: flex;
          align-items: center;
          .btn-item {
            padding: 0 15px;
          }
        }
        .active {
          background: #202024;
        }
      }
      .console-code-main {
        height: calc(100% - 48px);
        font-size: 13px;
        padding: 10px;
        background: #212124;
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
      }
    }
  }
}
.analysis-table-main {
  color: #fff;
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
</style>
