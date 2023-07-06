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
      <el-tabs v-model="activeTypeName" @tab-click="handlerTypeClick">
        <el-tab-pane label="设备列表" name="all_device" />
        <el-tab-pane label="已授权设备" name="auth_device" />
      </el-tabs>
      <video-device-table v-if="activeDeviceType === 1" />
      <it-device-table v-if="activeDeviceType === 2" />
      <ring-device-table v-if="activeDeviceType === 4" />
      <AssetsDeviceTable v-if="activeDeviceType === 5" />
    </div>
  </div>
</template>

<script>
import loadmore from '@/directive/el-select-loadmore/loadmore'
import { getVuexStoragePermission } from '@/utils/auth'
import VideoDeviceTable from './components/device-table/video-device-table'
import ItDeviceTable from './components/device-table/it-device-table'
import RingDeviceTable from './components/device-table/ring-device-table'
import AssetsDeviceTable from './components/device-table/assets-device-table'

export default {
  name: 'DeviceAuth',
  components: {
    VideoDeviceTable,
    ItDeviceTable,
    RingDeviceTable,
    AssetsDeviceTable
  },
  directives: { loadmore },
  data() {
    return {
      deviceTypeTab: [
        { label: '视频设备', value: 1, pKey: 'VideoDeviceAuth' },
        { label: 'IT监控设备', value: 2, pKey: 'ItMonitorDeviceAuth' },
        // { label: 'IT运维设备', value: 3, pKey: 'OpsDeviceAuth' },
        { label: '动环设备', value: 4, pKey: 'RingDeviceAuth' },
        { label: '资产设备', value: 5, pKey: 'AssetsDeviceAuth' }
      ],
      activeDeviceType: '',
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
    }
  },
  mounted() {
    this.getVuexStoragePermissionData = getVuexStoragePermission()
    if (this.getVuexStoragePermissionData.length === 0) {
      this.slider = []
      this.activeDeviceType = ''
    } else {
      const getSlide = this.deviceTypeTab
      const result = []
      getSlide.forEach(item => {
        const getPItem = this.getVuexStoragePermissionData.indexOf(item.pKey)
        if (getPItem !== -1) {
          result.push(item)
        }
      })
      this.deviceTypeTab = result
      this.activeDeviceType = this.deviceTypeTab.length > 0 ? this.deviceTypeTab[0].value : ''
    }
  },
  methods: {
    // 选择类型
    handlerDeviceType(item) {
      this.activeDeviceType = item.value
      this.activeTypeName = 'all_device'
    },
    handlerTypeClick(val) {
      this.activeTypeName = val.name
      this.$EventBus.$emit('handler-list-type', { type: val.name, val: this.activeDeviceType })
    }
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
