<template>
  <div class="height-100 flexBox">
    <div class="sideMenu">
      <div class="menu-content">
        <div
          v-for="item in deviceTypeTab"
          :key="item.value"
          class="menu-content-item pointer"
          :class="activeDeviceType === item.value ? 'active' : ''"
          @click="handlerDeviceType(item)"
        >{{ item.label }}</div>
      </div>
    </div>
    <div class="list-content">
      <el-page-header :content="navTitle" @back="goBack" />

      <!-- <el-tabs v-model="activeTypeName" @tab-click="handlerTypeClick"> -->
      <el-tabs v-model="activeTypeName">
        <el-tab-pane label="设备列表" name="all_device" />
      </el-tabs>
      <video-device-table v-if="activeDeviceType === 1" />
      <it-device-table v-if="activeDeviceType === 2" />
      <ring-device-table v-if="activeDeviceType === 3" />
      <ring-device-table-host v-if="activeDeviceType === 4" />
    </div>
  </div>
</template>

<script>
import loadmore from '@/directive/el-select-loadmore/loadmore'
// import { getVuexStoragePermission } from '@/utils/auth'
import VideoDeviceTable from './components/video-device-table'
import ItDeviceTable from './components/it-device-table'
import RingDeviceTable from './components/ring-device-table'
import RingDeviceTableHost from './components/ring-device-table-host'

export default {
  name: 'DeviceAuth',
  components: {
    VideoDeviceTable,
    ItDeviceTable,
    RingDeviceTable,
    RingDeviceTableHost
  },
  directives: { loadmore },
  data() {
    return {
      deviceTypeTab: [
        { label: '视频设备', value: 1, pKey: 'VideoDeviceAuth' },
        { label: 'IT监控设备', value: 2, pKey: 'ItMonitorDeviceAuth' },
        { label: '动环主机', value: 3, pKey: 'RingDeviceAuth' },
        { label: '动环设备', value: 4, pKey: 'RingDeviceAuthHost' }

      ],
      activeDeviceType: 1,
      findSysUserQuery: {
        page: 1,
        limit: 10
      },
      sysUser: [],
      insertDeviceAuthData: {
        userId: '',
        extIds: '',
        deviceType: '',
        deviceIds: ''
      },
      getVuexStoragePermissionData: [],
      activeTypeName: 'all_device',
      findDeviceAuthQuery: {
        page: 1,
        limit: 10
      }
    }
  },
  computed: {
    roleId() {
      return this.$route.query.roleId
    },
    navTitle() {
      return this.$route.meta.title
    }
  },
  mounted() {
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    // 选择类型
    handlerDeviceType(item) {
      this.activeDeviceType = item.value
    }
    // handlerTypeClick(val) {
    //   this.activeTypeName = val.name
    //   this.$EventBus.$emit('handler-list-type', { type: val.name })
    // }
  }
}
</script>

<style lang="scss" scoped>
$h:0px;
.sideMenu {
  width: 240px;
  background: #e9ecf3;
  //height: 100%;
  font-size: 14px;
  font-weight: 600;
  line-height: 36px;
  overflow: auto;
  .menu-content {
    .menu-content-item {
      padding: 0 10px;
    }
    .active {
      background: #bbcbe5;
      color: #000;
      position: relative;
      &:after {
        content: "";
        width: 16px;
        height: 16px;
        position: absolute;
        top: 12px;
        right: -9px;
        background: #f5f5f5;
        transform: rotate(45deg);
        box-shadow: inset 0 1px 2px 1px #d7d6d6;
      }
    }
  }
}

.list-content {
  width: calc(100% - 240px);
  margin: 10px;
}
</style>
