<template>
  <div class="BreadView">
    <Breadcrumb />
  </div>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'
export default {
  name: 'BreadView',
  components: {
    Breadcrumb
  }

}

</script>
<style lang="scss" scoped>
.BreadView {
  height: 36px;
  padding: 0 12px;
  background: #eeeeee;
  .el-breadcrumb.app-breadcrumb {
    line-height: 36px;
  }
}
</style>
