<template>
  <div class="script-scene-list">
    <div v-for="item in sceneTypeList" :key="item.value" class="scene-list-item pointer" :class="activeScene === item.value ? 'active' : ''" @click="handlerScene(item)">
      <div class="label-name">{{ item.label }}</div>
      <div class="label-count">{{ item.count || 0 }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ScriptSceneList',
  data() {
    return {
      sceneTypeList: [
        { value: 0, label: '全部场景' },
        ...this.$defineData.getOpsSceneType()
      ],
      activeScene: 0
    }
  },
  mounted() {
    this.getHyitOpsScriptSceneTypeCount()
  },
  methods: {
    getHyitOpsScriptSceneTypeCount() {
      this.$request({
        url: this.api.automationOperations.getHyitOpsScriptSceneTypeCount,
        data: { limit: -1 }
      }).then(res => {
        if (res.code === 1 && res.model && this.$tool.isJSONString(res.model)) {
          const typeCountData = JSON.parse(res.model)
          let count = 0
          this.sceneTypeList.forEach((item, index) => {
            const idx = typeCountData.findIndex(items => Number(items.sceneType) === Number(item.value))
            if (idx !== -1) {
              this.$set(this.sceneTypeList[index], 'count', typeCountData[idx].typeCount)
              count += Number(typeCountData[idx].typeCount)
            }
          })
          this.$set(this.sceneTypeList[0], 'count', count)
        }
      })
    },
    handlerScene(item) {
      this.activeScene = item.value
      this.$EventBus.$emit('handler-ops-scene-item', this.$tool.deepCopy(item))
    }
  }
}
</script>

<style lang="scss" scoped>
.script-scene-list {
  .scene-list-item {
    padding: 8px 10px;
    display: block;
    font-size: 14px;
    .label-name {
      width: 70%;
      display: inline-block;
    }
    .label-count {
      width: 30%;
      display: inline-block;
      text-align: right;
    }
  }
  .active {
    background: #cedbee;
    font-weight: bold;
  }
}
</style>
