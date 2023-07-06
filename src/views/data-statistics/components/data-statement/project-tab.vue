<template>
  <div class="tabs">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane v-for="item in projectTab" :key="String(item.id)" :label="item.name" :name="String(item.id)" />
    </el-tabs>
  </div>
</template>

<script>
export default {
  name: 'ProjectTab',
  data() {
    return {
      projectTab: [],
      activeName: ''
    }
  },
  mounted() {
    this.findHyitAgentGroup()
  },
  methods: {
    async findHyitAgentGroup() {
      const findHyitAgentGroup = await this.$request({
        url: this.api.itAgentGroup.findHyitAgentGroup,
        data: { limit: -1 }
      })
      if (findHyitAgentGroup.code !== 1) return
      const groupIds = []
      findHyitAgentGroup.data.forEach(item => groupIds.push(item.id))

      const findHyitAgentGroupLink = await this.$request({
        url: this.api.itAgentGroup.findHyitAgentGroupLink,
        data: { limit: -1, groupIds }
      })

      if (findHyitAgentGroupLink.code === 1) {
        findHyitAgentGroupLink.data.forEach(item => {
          const idx = findHyitAgentGroup.data.findIndex(items => +items.id === +item.groupId)
          if (idx !== -1) {
            if (findHyitAgentGroup.data[idx].agent) {
              findHyitAgentGroup.data[idx].agent.push(item.agentId)
            } else {
              findHyitAgentGroup.data[idx].agent = [item.agentId]
            }
          }
        })
      }

      this.projectTab = findHyitAgentGroup.data
      this.activeName = String(findHyitAgentGroup.data[0].id)
      this.activeProjectAgent = String(findHyitAgentGroup.data[0].agent)
      this.$emit('handleClick', {
        agent: this.activeProjectAgent,
        id: this.activeName
      })
    },
    handleClick(val) {
      this.$emit('handleClick', {
        agent: this.projectTab[val.index].agent,
        id: this.activeName
      })
    }
  }
}
</script>

<style scoped>

</style>
