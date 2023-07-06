<template>
  <div class="map-sidebar">
    <div class="map-sidebar-box">
      <div class="map-sidebar-title">区域</div>
      <div class="map-sidebar-content">
        <div
          v-for="(item,index) in menuList"
          :key="item.hyAreaId"
          class="sidebar-content-item pointer"
        >
          <div
            class="flex-v-between content-item-header"
            @click="$set(menuList[index],'showList',!menuList[index]['showList'])"
          >
            <i v-if="!item.showList" class="el-icon-arrow-right" />
            <i v-else class="el-icon-arrow-down" />
            <div class="content-item-title" @click="changeCenter(item)">{{ item.hyAreaName }}</div>
          </div>
          <template v-if="item.showList">
            <div v-for="(chi) in item.child" :key="chi.id" class=" pointer ml-14 mt-10" @click="onMarkerClick(chi,item)">
              <div class="list-item flex-v-between">
                <div class="item-title">{{ chi.name }}</div>
                <div>
                  <i v-permission="['delete']" class="el-icon-minus" @click="onUpdateDiagram(chi)" />
                  <i v-permission="['edit']" class="el-icon-edit" @click="onUpdateDiagram(chi)" />
                </div>
              </div>
            </div>
          </template>
          <template v-if="item.showList">
            <div v-for="(it,ind) in item.children" :key="it.hyAreaId" class="sidebar-content-item pointer">
              <div
                :class="{active:currenHyAreaId===it.hyAreaId}"
                class="flex-v-between content-item-header"
                @click="onShowList(it,index,ind)"
              >
                <i v-if="!it.showList" class="el-icon-arrow-right" />
                <i v-else class="el-icon-arrow-down" />
                <div class="content-item-title" @click="changeCenter(it)">{{ it.hyAreaName }}</div>
                <!--                <div class="font-12 content-item-add" @click.stop="onAddDiagram(item)"><i class="el-icon-plus" />组态图</div>-->
              </div>
              <template v-if="it.showList">
                <div v-for="(child) in it.children" :key="child.id" class=" pointer ml-14 mt-10" @click="onMarkerClick(it,item)">
                  <div class="list-item" @click="onUpdateDiagram(child)">
                    {{ child.name }}
                  </div>
                </div>
              </template>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import request from '@/utils/request'
// import api from '@/api/api'

export default {
  name: 'MapLeft',
  props: {
    menuList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      currenHyAreaId: ''
    }
  },
  methods: {
    onShowList(item, index, ind) {
      this.currenHyAreaId = this.menuList[index]['children'][ind]['hyAreaId']
      this.$set(this.menuList[index]['children'][ind], 'showList', !this.menuList[index]['children'][ind]['showList'])
      this.$emit('changeCenter', { lng: item.hyLongitude, lat: item.hyLatitude })
      this.$forceUpdate()
    },
    onMarkerClick(child, item) {
      console.log(item)
      this.$router.push({ name: 'ConfigurationWeb', query: { id: child.id, orgId: item.hyAreaId }})
    },
    changeCenter(item) {
      this.$emit('changeCenter', { lng: item.hyLongitude, lat: item.hyLatitude })
    },
    onAddDiagram(item) {
      this.$EventBus.$emit('openDialog')
      this.$EventBus.$emit('addDiagram', item.hyAreaId)
    },
    onUpdateDiagram(item) {
      this.$EventBus.$emit('openDialog')
      this.$EventBus.$emit('updateDiagram', item)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
