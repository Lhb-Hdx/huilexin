<template>
  <div class="title">{{ title }}</div>
</template>

<script>
export default {
  name: 'VideoTitle',
  props: {
    title: {
      type: String,
      default() {
        return ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>

  .title{
          // margin: 10px 0 15px 10px;
          font-size: 14px;
          width: 100%;
          // height: 20%;
          // flex-basis: 20%;
          line-height: 20px;
          height: 20px;
          position: relative;
          color: #fff;
          margin-bottom: 14px;
          &::after{
            content: '';
            position: absolute;
            left: 0;
            bottom: -12px;
            width: 24px;
            border-bottom: 2px solid #fff;
            box-shadow: 0 0 4px 3px #83c3dc;
            border-radius: 1px;
          }
          }
</style>
