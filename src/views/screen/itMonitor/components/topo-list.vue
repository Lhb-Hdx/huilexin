<!--
 * @Author: liangxiongwei 284430752@qq.com
 * @Date: 2022-06-29 21:12:05
 * @LastEditors: liangxiongwei 284430752@qq.com
 * @LastEditTime: 2022-06-29 22:03:16
 * @FilePath: \ItMonitoring\src\views\screen\itMonitor\components\topo-list.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->

<template>
  <div class="todoListContainer">
    <componentBorder>
      <ul class="topoListUl">
        <li v-for="(item,index) in list" :key="index" style="list-style:none;" class="topoListItem" :class="{activeStyle:item.id===activeId}" @click="onItemClick(item)">{{ item.name }}</li>
      </ul>
    </componentBorder>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import componentBorder from '@/views/screen/itMonitor/components/component-border'
export default {
  components: {
    componentBorder
  },
  data() {
    return {
      findHyitTopologyInfoQuery: {
        keyword: '',
        page: 1,
        limit: 10,
        total: 0
      },
      list: [],
      activeId: ''
    }
  },
  mounted() {
    this.loadTopoList()
  },
  methods: {
    // 获取拓扑列表
    // 点击拓扑列表项
    onItemClick(item) {
      this.activeId = item.id
      this.$emit('handlerTopo', item)
    },
    loadTopoList() {
      request({
        url: api.itMonitor.findHyitTopologyInfo, data: { ...this.findHyitTopologyInfoQuery }
      }).then(res => {
        if (res.code === 1) {
          this.list = res.data
          if (res.data.length > 0) {
            this.activeId = res.data[0].id
            this.$emit('handlerTopo', res.data[0])
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
 .todoListContainer{
  width: 240px;
  height: 100%;
  margin-left: 16px;
  background: rgba(4,21,48,.5);
  .topoListUl{
    cursor: pointer;
    padding: 0;
    .topoListItem{
     text-align: left;
     padding: 0 0 0 10px;
     font-size: 14px !important;
     line-height: 30px;
     height: 35px;
     overflow: hidden;
     text-overflow: ellipsis;
     white-space: nowrap;
    //  margin: 10px 0 10px 0;
  }
  .activeStyle{
     border-left: 2px solid #a2ecff;
     background-color: #071f39;
     color: #a2ecff;
  }
  }

 }
</style>
