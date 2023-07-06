<template>
  <div class="config-map">
    <MapLeft :menu-list.sync="areaTree" @changeCenter="center=$event" />
    <baidu-map
      v-if="show"
      :center="center"
      :scroll-wheel-zoom="true"
      :zoom="zoom"
      class="map-box"
      @ready="onReady"
      @load="onLoad"
    >
      <bm-navigation :enable-geolocation="true" anchor="BMAP_ANCHOR_TOP_RIGHT" />
      <bm-geolocation :auto-location="true" :show-address-bar="true" anchor="BMAP_ANCHOR_BOTTOM_RIGHT" />
      <bm-map-type :map-types="['BMAP_NORMAL_MAP', 'BMAP_HYBRID_MAP']" anchor="BMAP_ANCHOR_TOP_LEFT" />
      <template v-for="item in markers">
        <bm-marker
          v-if="item.showMaker"
          :key="item.hyAreaId"
          :position="{lng: item.hyLongitude, lat: item.hyLatitude}"
        >
          <bm-context-menu :width="200">
            <bm-context-menu-item
              v-for="child in item.children"
              :key="child.id"
              :callback="onMarkerClick.bind(this,child,item)"
              :text="child.name"
            />
          </bm-context-menu>
          <bm-context-menu :width="200">
            <bm-context-menu-item
              v-for="child in item.child"
              :key="child.id"
              :callback="onMarkerClick.bind(this,child,item)"
              :text="child.name"
            />
          </bm-context-menu>
          <bm-label
            :content="item.hyAreaName"
            :label-style="{color: '#fff', fontSize : '12px',background:'rgba(0,0,0,0.5)',padding:'5px',border:'none'}"
            :offset="{width: 0, height: 30}"
          />
        </bm-marker>
      </template>

    </baidu-map>
    <div v-if="!show" class="map-box flex-h-center mt-80" style="flexDirection: column">
      <h2 class="font-24 flex-h-center">
        <img src="image/configuration/notline.png" width="28" class="mr-10">
        <span>没有网络，无法加载地图</span>
      </h2>
      <ul class="ml-0">
        <li v-for="item in diagramlist" :key="item.id" class="font-16  ml-0">
          <span> {{ item.name }}</span>
          <a class="ml-4" @click="onMarkerClick(item,item)">[点击查看]</a>
        </li>
      </ul>
    </div>
    <MapDialog />
  </div>
</template>
<script>

import MapLeft from './component/mapLeft'
import MapDialog from './component/MapDialog'
import request from '@/utils/request'
import api from '@/api/api'
import { listToTree } from '@/utils'

export default {
  name: 'ConfigMapWeb',
  components: {
    MapLeft,
    MapDialog
  },
  data() {
    return {
      center: { lng: 0, lat: 0 },
      zoom: 10,
      markers: [],
      areaTree: [],
      show: true,
      diagramlist: []
    }
  },
  created() {
    const that = this
    var i = new Image()
    i.src = 'https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/img/logo_top_ca79a146.png?t=' + Date.parse(new Date())
    i.onerror = async function() {
      that.show = false
      await that.findHyitArea()
      // eslint-disable-next-line require-atomic-updates
      that.diagramlist = await that.findDiagram()
    }
  },
  methods: {
    onLoad(e) {
      console.log(e)
    },
    async onReady(e) {
      console.log('onready', e)
      await this.findHyitArea()
      if (this.markers.length <= 0) return
      this.center = { lng: this.markers[0]['hyLongitude'], lat: this.markers[0]['hyLatitude'] }
    },
    async findHyitArea() {
      let { data, code } = await request({ url: api.area.findHyitArea })
      if (code !== 1) return
      this.markers = data
      this.hyAreaId = this.markers[0]['hyAreaId']
      this.areaTree = listToTree(data, 0, 0, 'hyAreaId', 'hyPid')
      for (const it of this.areaTree) {
        it.child = await this.findDiagram(it.hyAreaId)
        if (it.child.length)it.showMaker = true
        for (const child of it.children) {
          child.children = await this.findDiagram(child.hyAreaId)
        }
      }
    },
    async findDiagram(orgId) {
      let { data, code } = await request({ url: api.diagram.findDiagram, data: { orgId }})
      if (code === 1) return data
    },

    onMarkerClick(child, item) {
      console.log(item)
      this.$router.push({ name: 'ConfigurationWeb', query: { id: child.id, orgId: item.hyAreaId || item.orgId }})
    },
    changeCenter({ lng, lat, id }) {
      this.center.lng = lng
      this.center.lat = lat
      this.hyAreaId = id
    }
  }
}
</script>
<style lang="scss">
@import './style/mapStyle';

.config-map {
  width: 100%;
  height: 100%;
  display: flex;

  .map-box {
    flex: 1;
    height: 100%;
  }
}
ul{
  li::marker{
    font-size:16px;
    font-weight:bold;
    width: 20px;
    height: 20px;
    display:inline-block;
  }
  a{
    text-decoration: underline;
    color:#0145ab;
  }
}
</style>
