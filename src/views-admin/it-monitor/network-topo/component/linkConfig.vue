<template>
  <div class="config-content-right-component">
    <div class="right-config-group">
      <div class="config-group-title">
        链路配置
        <i :class="isMenuDown === true ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" @click="clickMenuDown" />
      </div>
      <div v-show="isMenuDown" class="config-group-main">
        <div class="group-main-item">
          <div class="group-main-title">连接类型：</div>
          <div class="group-main-value">
            <el-select v-model.lazy="topoLineProp.linkType" size="mini" placeholder="请选择">
              <el-option
                v-for="item in connectLineTypeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
        </div>
        <div class="group-main-item">
          <el-tooltip class="item" effect="dark" :content="sourcePortLabel" placement="top">
            <div class="group-main-title width-100 overflow-text-a">{{ sourcePortLabel }}：</div>
          </el-tooltip>
        </div>
        <div class="group-main-item">
          <div class="group-main-value width-100">
            <el-select v-model.lazy="topoLineProp.sourceZbxItemId" size="mini" placeholder="请选择端口" clearable>
              <el-option
                v-for="item in sourcePortList"
                :key="item.itemid"
                :label="setAbbreviations(item.itemName)"
                :value="item.itemid"
              />
            </el-select>
          </div>
        </div>
        <div class="group-main-item">
          <el-tooltip class="item" effect="dark" :content="targetPortLabel" placement="top">
            <div class="group-main-title width-100 overflow-text-a">{{ targetPortLabel }}：</div>
          </el-tooltip>
        </div>
        <div class="group-main-item">
          <div class="group-main-value width-100">
            <el-select v-model.lazy="topoLineProp.targetZbxItemId" size="mini" placeholder="请选择端口" clearable>
              <el-option
                v-for="item in targetPortList"
                :key="item.itemid"
                :label="setAbbreviations(item.itemName)"
                :value="item.itemid"
              />
            </el-select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { connectLineTypeList, topoPortAbbreviations } from '@/utils/define-data'

export default {
  name: 'LinkConfig',
  props: {
    topoLine: {
      type: Object,
      default() {
        return {}
      }
    },
    sourcePortList: {
      type: Array,
      default() {
        return []
      }
    },
    targetPortList: {
      type: Array,
      default() {
        return []
      }
    },
    sourcePortLabel: {
      type: String,
      default: ''
    },
    targetPortLabel: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isMenuDown: true,
      connectLineTypeList: [],
      topoLineProp: {},
      topoPortAbbreviations: []
    }
  },
  computed: {
    setAbbreviations() {
      return function(portName) {
        if (!portName) return
        const idx = this.topoPortAbbreviations.findIndex(item => portName.indexOf(item.fullName) !== -1) // 匹配缩写
        if (idx === -1) return portName
        const suffix = portName.split(`${this.topoPortAbbreviations[idx].fullName}`)[1] // 截取匹配字符后的字符
        return this.topoPortAbbreviations[idx].abbreviations + suffix
      }
    }
  },
  watch: {
    topoLine: {
      handler(newVal) {
        this.topoLineProp = newVal
      },
      deep: true
    },
    sourcePortList: {
      handler(newVal) {
        this.sourcePortList = newVal
      },
      deep: true
    },
    targetPortList: {
      handler(newVal) {
        this.targetPortList = newVal
      },
      deep: true
    },
    topoLineProp: {
      handler(newVal, oldVal) {
        if (Object.keys(oldVal).length > 0 && oldVal.id === newVal.id) {
          const updateLineData = { ...newVal }
          const sourcePortIdx = this.sourcePortList.findIndex(item => Number(item.itemid) === Number(newVal.sourceZbxItemId))
          const targetPortIdx = this.targetPortList.findIndex(item => Number(item.itemid) === Number(newVal.targetZbxItemId))
          updateLineData.sourceZbxItemName = sourcePortIdx !== -1 ? this.sourcePortList[sourcePortIdx].itemName : ''
          updateLineData.targetZbxItemName = targetPortIdx !== -1 ? this.targetPortList[targetPortIdx].itemName : ''
          this.$emit('updateLineData', updateLineData)
        }
      },
      deep: true
    }
  },
  mounted() {
    this.connectLineTypeList = connectLineTypeList()
    this.topoPortAbbreviations = topoPortAbbreviations()
    this.topoLineProp = { ...this.topoLine }
  },
  methods: {
    clickMenuDown() {
      this.isMenuDown = !this.isMenuDown
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../style/configItemStyle.scss';
</style>
