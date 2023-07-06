<template>
  <div class="device-form">
    <div class="device-form-item">
      <div class="form-item-label">调试执行结果</div>
      <div class="form-item-main">
        <TabListSwitch v-if="scriptExecuteResult.length > 0" :button-data="scriptExecuteResult" :button-width="140" style="width: 100% !important;height: 36px;;line-height: 36px;">
          <div v-for="(item, index) in scriptExecuteResult" :key="item.serverId" class="tab-item pointer" :class="scriptExecuteResultIndex === index ? 'active' : ''" @click="handlerScriptType(index)">
            <div class="flexBox align-item-center flex-center">
              <div class="gateway-name overflow-text-a">{{ item.serverName }}</div>
            </div>
          </div>
        </TabListSwitch>
        <div class="result">
          <textarea v-if="scriptExecuteResult.length > 0" v-model="scriptExecuteResult[scriptExecuteResultIndex].executeResult" readonly />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TabListSwitch from '@/components/AutomationOperationsComponent/TabListSwitch'

export default {
  name: 'ScriptRightPaneExecuteResult',
  components: {
    TabListSwitch
  },
  props: {
    scriptExecuteResult: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      scriptExecuteResultIndex: 0
    }
  },
  watch: {
    scriptExecuteResult: {
      handler() {
        if (this.scriptExecuteResult.length === 0) {
          this.scriptExecuteResultIndex = 0
        }
      },
      deep: true
    }
  },
  methods: {
    handlerScriptType(index) {
      this.scriptExecuteResultIndex = index
    }
  }
}
</script>

<style lang="scss" scoped>
.device-form {
  .device-form-item {
    margin-bottom: 20px;
    .form-item-label {
      font-size: 14px;
      margin-bottom: 10px;
    }
    .form-item-main {
      background: #212124;
      border: 1px solid #797979;
      height: 200px;
    }
  }
}
.tab-item {
  width: 140px;
  margin-bottom: 4px;
  display: inline-block;
  text-align: center;
  color: #9f9fa0;
  .gateway-name {
    font-size: 14px;
  }
}
.active {
  color: #fff;
}
.result {
  height: calc(200px - 46px);
  padding: 5px;
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
</style>
