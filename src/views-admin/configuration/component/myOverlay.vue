<template>
  <bm-overlay
    ref="customOverlay"
    :class="{sample: true, active}"
    pane="labelPane"
    @draw="draw"
  >
    <div class="map-maker">
      <img src="image/configuration/item_tag_bg_err.png" alt="">
      <div class="map-maker-info">11</div>
    </div>
    <!--    <div @click="handleClick" v-text="text" />-->
  </bm-overlay>
</template>

<script>
export default {
  // eslint-disable-next-line vue/require-prop-types
  props: ['text', 'position'],
  watch: {
    position: {
      handler() {
        this.$refs.customOverlay.reload()
      },
      deep: true
    }
  },
  methods: {
    handleClick() {
      global.alert('Well done.')
    },
    draw({ el, BMap, map }) {
      const { lng, lat } = this.position
      const pixel = map.pointToOverlayPixel(new BMap.Point(lng, lat))
      el.style.left = pixel.x - 60 + 'px'
      el.style.top = pixel.y - 20 + 'px'
    }
  }
}
</script>

<style>
.sample {
  width: 120px;
  /*height: 40px;*/
  /*line-height: 40px;*/
  /*background: rgba(0, 0, 0, 0.5);*/
  /*overflow: hidden;*/
  /*box-shadow: 0 0 5px #000;*/
  color: #fff;
  text-align: center;
  padding: 10px;
  position: absolute;
}

.map-maker img {
  height: 20px;
}

.map-maker-info {
  padding: 5px;
  background: rgba(0, 0, 0, 0.5);
}

.sample.active {
  /*background: rgba(0, 0, 0, 0.75);*/
  color: #fff;
}
</style>
