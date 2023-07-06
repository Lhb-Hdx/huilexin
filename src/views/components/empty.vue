<template>
  <div class="empty-wrapper">
    {{ text }}
  </div>
</template>

<script>
export default {
  name: 'Empty',
  props: {
    text: {
      type: String,
      default: '暂无数据'
    }
  }

}

</script>
<style lang="scss" scoped>
.empty-wrapper {
  padding: 50px 0;
  text-align: center;
  color: rgba(0, 0, 0, 0.5);
  font-size: 14px;
}
</style>
