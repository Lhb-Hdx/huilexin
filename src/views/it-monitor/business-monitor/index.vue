<template>
  <div class="app-container no-padding bs-system-container">
    <BusinessSystemList class="bs-system-list" @getSystemId="getSystemId" />
    <BusinessSystemMap class="bs-system-map" style="width: calc(100% - 340px);height: 100%" :system-id="getPropSystemId" />
  </div>
</template>

<script>
import BusinessSystemList from './components/business-system-list'
import BusinessSystemMap from './components/business-system-map'

export default {
  name: 'BusinessSystem',
  components: {
    BusinessSystemList,
    BusinessSystemMap
  },
  data() {
    return {
      getPropSystemId: ''
    }
  },
  methods: {
    getSystemId(val) {
      this.getPropSystemId = String(val)
    }
  }
}
</script>
<style lang="scss" scoped>
.bs-system-container {
  position: relative;
  .bs-system-list {
    position: absolute;
    left: 0;
    overflow-y: scroll;
  }
  .bs-system-map {
    margin-left: 340px;
  }
  .bs-system-right {
    position: absolute;
    right: 20px;
    top: 20px;
    width: 220px;
    border: 1px solid #e0e0e0;
    background: #FFFFFF;
    padding: 10px;
  }
}
</style>
