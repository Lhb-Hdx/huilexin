module.exports = {
  template: compoenntName => {
    return `<template>
  <div class="app-container">
  </div>
</template>
<script>
import request from '@/utils/request'
import api from '@/api/api'

export default {
  name: '${compoenntName}'
}
</script>
<style lang="less" scoped>
</style>
`
  }
}
