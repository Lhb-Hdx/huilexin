<template>
  <div class="components-border flex">
    <div v-if="title" class="components-border-title flex-h-center overflow-text-a font-20">
      <span style="fontSize:14px;">{{ title }}</span>
    </div>
    <div class="components-border-content p-20">
      <slot />
      <!-- <div class="border-content-line" /> -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'ComponentBorder',
  props: {
    title: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
.components-border {
  height: 100%;
  flex-direction: column;
  .components-border-title {
    width: 138px;
    height: 35px;
    background: var(--default-color);
    color: #ffffff;
    clip-path: polygon(80% 0, 100% 100%, 0 100%, 0 0);
    span {
      padding-left: 20%;
    }
  }
  .components-border-content {
    flex: 1;
    overflow: hidden;
    border: 1px solid var(--default-color);
    position: relative;
    clip-path: polygon(100% 0, 100% 93%, 93% 100%, 0 100%, 0 0);
    display: flex;
    flex-direction: column;
    &:before,
    &:after {
      content: '';
      position: absolute;
      height: 18px;
      width: 18px;
      background-size: 100% 100%;
      background-position: center center;
    }
    &::before {
      right: 0;
      top: 0;
      background-image: url(/image/screen/it-monitor/边框——右上.png);
    }
    &::after {
      left: 0;
      bottom: 0;
      background-image: url(/image/screen/it-monitor/边框——左下.png);
    }
  }
}
</style>
