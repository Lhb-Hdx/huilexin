<template>
  <div ref="appContainer" class="app-container relative">
    <div ref="filterContainer" class="filter-container margin-bottom-10">
      <el-page-header :content="navTitle" @back="$router.go(-1)" />
    </div>
    <CmdbMap :new-add-node="addMapNodeSuccessData" @handlerMapNode="onMapNode" @itemBindIds="onItemBindIds" />
    <CmdbRightPane :map-node-data="mapNodeData" :map-bind-ids="getItemBindIds" @addMapNodeSuccess="toAddMapNodeSuccess" />
  </div>
</template>

<script>
import CmdbRightPane from './components/cmdb-right-pane'
import CmdbMap from './components/cmdb-map'

export default {
  name: 'CmdbItemConfig',
  components: {
    CmdbRightPane, CmdbMap
  },
  data() {
    return {
      drawerCmdbItemBox: false,
      itemData: {},
      mapNodeData: {},
      addMapNodeSuccessData: [],
      getItemBindIds: []
    }
  },
  computed: {
    id() {
      return this.$route.query.id
    },
    navTitle() {
      return this.$route.meta.title
    }
  },
  mounted() {
  },
  methods: {
    onMapNode(val) {
      this.mapNodeData = val
    },
    toAddMapNodeSuccess(val) {
      this.addMapNodeSuccessData = val
    },
    onItemBindIds(val) {
      this.getItemBindIds = val
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
