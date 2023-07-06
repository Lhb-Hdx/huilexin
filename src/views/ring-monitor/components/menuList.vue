<template>
  <div class="list-wrapper">
    <ul class="list">
      <template v-for="(item) in list">
        <li v-if="item.isShow===1" :key="item.hyDevTypeId" :class="['list-item', { active: +item.hyDevTypeValue === curr }]" @click="onItemClick(item)">
          <el-image
            :lazy="true"
            :src="listIcon[item.hyDevTypeValue]"
            fit="fill"
            style="width: 16px; height:16px;"
          />
          <span class="ml-10">{{ item.hyDevTypeName }}</span>
        </li>
      </template>
    </ul>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
export default {
  name: 'MenuList',
  props: {
    active: {
      type: String,
      default: undefined
    }
  },
  data() {
    return {
      list: [
        // {
        //   hyDevTypeId: 'wsd',
        //   hyDevTypeValue: 1000,
        //   hyDevTypeName: '温湿度',
        //   path: 'Temperature'
        // },
        // {
        //   hyDevTypeId: 'mj',
        //   hyDevTypeValue: 105,
        //   hyDevTypeName: '门禁',
        //   path: 'Entrance',
        //   isShow: 1
        // }
      ],
      curr: 0,
      listIcon: {
        10060: require('../../../../public/image/ring-monitor/jmkt.png'),
        1016: require('../../../../public/image/ring-monitor/ups.png'),
        1000: require('../../../../public/image/ring-monitor/wsd.png'),
        10058: require('../../../../public/image/ring-monitor/gpd.png'),
        1017: require('../../../../public/image/ring-monitor/xdc.png'),
        10069: require('../../../../public/image/ring-monitor/sgbj.png'),
        10068: require('../../../../public/image/ring-monitor/ls.png'),
        10067: require('../../../../public/image/ring-monitor/ls.png'),
        10066: require('../../../../public/image/ring-monitor/ltg.png'),
        1012: require('../../../../public/image/ring-monitor/xfj.png')
      }
    }
  },
  async created() {
    await this.findHyitDevType()
  },
  methods: {
    onItemClick(item) {
      this.curr = item.hyDevTypeValue
      this.$emit('change', item.hyDevTypeValue, this.curr)
    },
    async findHyitDevType() {
      let { code, data } = await request({ url: api.powerEnv.findHyitDevType, data: { Pid: 2, limit: -1 }})
      if (code !== 1) return
      this.list = [...data, ...this.list]
      if (!this.list[0]['isShow']) return
      this.curr = this.list[0].hyDevTypeValue
      this.$emit('change', this.list[0]['hyDevTypeValue'], this.curr)
    }

  }

}

</script>
<style lang="scss" scoped>
.full-left-header-right-icon {
  width: 40px;
  text-align: center;
  cursor: pointer;
}
.list-wrapper {
  height: 100%;
  width: 100%;
  .list{
  height: 100%;
    overflow: hidden;
    // overflow-y: scroll;
    // padding-bottom: 60px !important;
  }
  .list, .list-item {
    padding: 0;
    margin: 0;
  }
  .list-item {
    width: 100%;
    list-style: none;
    display: flex;
    align-items: center;
    // line-height: 45px;
    padding: 0px 20px;
    height: 45px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    &:hover {
      background: #B7CBE7;
    }
    &.active {
      background: #B7CBE7;
      color: #000;
    }

  }
}
</style>
