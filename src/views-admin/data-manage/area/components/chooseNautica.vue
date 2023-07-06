<template>
  <el-dialog title="位置选择" :visible.sync="dialogVisible" width="70%" top="5vh">
    <div class="choose-nautica">
      <div class="mb-10">
        <el-input v-model="keyword" placeholder="请输入地址" style="width:200px" clearable @clear="keyword=''" />
        <!--        <span>{{ center.lng }}</span>-->
        <!--        <span>{{ center.lat }}</span>-->
      </div>
      <baidu-map
        class="map-box"
        :center="center"
        zoom="10"
        :scroll-wheel-zoom="true"
        @click="onclick"
      >
        <bm-navigation anchor="BMAP_ANCHOR_TOP_RIGHT" :enable-geolocation="true" :show-zoom-info="true" />
        <bm-view class="map" style="height:100%" />
        <bm-city-list anchor="BMAP_ANCHOR_TOP_LEFT" />
        <bm-geolocation anchor="BMAP_ANCHOR_BOTTOM_RIGHT" :show-address-bar="true" :auto-location="true" />
        <bm-local-search
          :keyword="keyword"
          :auto-viewport="true"
          style="position:absolute;top: 100px;width: 200px"
          :panel="false"
        />
      </baidu-map>
    </div>
    <div slot="footer" class="mt-20">
      <el-button type="primary" @click="submit">确定</el-button>
      <el-button type="primary" @click="dialogVisible=false">取消</el-button>
    </div>
  </el-dialog>

</template>

<script>
export default {
  name: 'ChooseNautica',
  props: {
    nautica: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      dialogVisible: false,
      zoom: 10,
      keyword: '',
      center: { lng: '', lat: '' }
    }
  },
  watch: {
    nautica: {
      deep: true,
      immediate: true,
      handler(n) {
        this.center.lng = n.hyLongitude || 113.261081
        this.center.lat = n.hyLatitude || 23.149692
      }
    }
  },
  methods: {
    open() {
      this.dialogVisible = true
    },
    onclick(e) {
      this.center = e.point
    },
    submit() {
      this.$emit('changeNautica', this.center)
      this.dialogVisible = false
    }
  }
}
</script>

<style scoped>
.choose-nautica, .map-box {
  width: 100%;
  height: 700px;
}
</style>
