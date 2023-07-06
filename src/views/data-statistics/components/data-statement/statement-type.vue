<template>
  <div class="statement-type">
    <div v-for="(item, index) in statementType" :key="index" class="statement-type-group">
      <div class="group-header">
        <div class="group-header-title">{{ item.label }}</div>
      </div>
      <div
        v-for="(children, childrenIndex) in item.statement"
        :key="childrenIndex"
        class="group-item pointer"
        :class="children.permissionsName === activePermissionsName ? 'active' : ''"
        @click="handlerStatementType(children)"
      >
        <div class="item-name">{{ children.label }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatementType',
  data() {
    return {
      statementType: [],
      activePermissionsName: ''
    }
  },
  mounted() {
    const getVuexStoragePermission = this.$auth.getVuexStoragePermission()
    if (getVuexStoragePermission.length > 0) {
      const statementTypeStorage = this.$tool.deepCopy(this.$paramsModel.dataStatistical.get('statementType'))
      const statementType = []
      statementTypeStorage.forEach(item => {
        const tmp = {
          value: item.value,
          label: item.label,
          statement: []
        }
        item.statement.forEach(items => {
          if (getVuexStoragePermission.indexOf(items.permissionsName) !== -1) tmp.statement.push(items)
        })
        if (tmp.statement.length > 0) {
          statementType.push(tmp)
          if (this.activePermissionsName === '') {
            this.activePermissionsName = tmp.statement[0].permissionsName
            setTimeout(() => {
              this.$EventBus.$emit('handlerStatementType', {
                componentName: tmp.statement[0].componentName
              })
            }, 500)
          }
        }
      })
      this.statementType = statementType
    }
  },
  methods: {
    handlerStatementType(item) {
      this.activePermissionsName = item.permissionsName
      this.$EventBus.$emit('handlerStatementType', {
        componentName: item.componentName
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.statement-type {
  .statement-type-group {
    margin-bottom: 14px;
    .group-header {
      padding: 10px;
      border-bottom: 3px solid #143f94;
      .group-header-title {
        font-size: 18px;
        font-weight: bold;
      }
    }
    .group-item {
      padding: 10px;
      .item-name {
        font-size: 14px;
      }
      &:hover {
        background: #d0dcec;
      }
    }
    .active {
      background: #d0dcec;
    }
  }
}
</style>
