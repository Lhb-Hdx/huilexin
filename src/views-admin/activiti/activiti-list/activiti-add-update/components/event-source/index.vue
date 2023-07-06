<template>
  <div v-if="show" class="py-20 pt-1">
    <el-divider content-position="left">
      事件源
      <el-button type="primary" icon="el-icon-plus" class="ml-10" size="small" @click="openDynamic">
        选择事件源
      </el-button>
    </el-divider>
    <div class="mt-6 pt-10">
      <deviceTable v-if="rulesForm.hyEventClassid===3" :dynamic-list.sync="rulesForm.hySrcIds" />
      <itTable v-if="rulesForm.hyEventClassid===2" :dynamic-list.sync="rulesForm.hySrcIds" />
      <videoTable v-if="rulesForm.hyEventClassid===1" :dynamic-list.sync="rulesForm.hySrcIds" />
    </div>

    <!--    事件源弹窗-->
    <itDialog
      v-if="itShow"
      ref="dynamic"
      :dynamic-list.sync="rulesForm.hySrcIds"
      @close="itShow = false"
    />
    <deviceDialog
      v-if="deviceShow"
      ref="dynamic"
      :dynamic-list.sync="rulesForm.hySrcIds"
      @close="deviceShow = false"
    />
    <videoDialog
      v-if="videoShow"
      ref="dynamic"
      :dynamic-list.sync="rulesForm.hySrcIds"
      @close="videoShow = false"
    />
  </div>
</template>

<script>
import deviceDialog from '@/views-admin/activiti/components/deviceDialog'
import itDialog from '@/views-admin/activiti/components/itDialog'
import videoDialog from '@/views-admin/activiti/components/videoDialog'
import deviceTable from './components/deviceTable'
import itTable from './components/itTable'
import videoTable from './components/videoTable'
export default {
  name: 'EventSource',
  components: {
    deviceDialog,
    itDialog,
    videoDialog,
    deviceTable,
    itTable,
    videoTable
  },
  props: {
    rulesForm: {
      type: Object,
      default: () => { }
    }
  },
  data() {
    return {
      videoShow: false,
      itShow: false,
      deviceShow: false
    }
  },
  computed: {
    show() {
      return !this.rulesForm?.deviceTypeIds?.length
    }
  },
  methods: {
    openDynamic() {
      if (!this.rulesForm.hyEventClassid) {
        return this.$message.error('请先选择事件类型')
      }
      if (this.rulesForm.hyEventClassid === 1) this.videoShow = true
      if (this.rulesForm.hyEventClassid === 2) this.itShow = true
      if (this.rulesForm.hyEventClassid === 3) this.deviceShow = true
    },
    deleteSelectDynamic(index) {
      this.rulesForm.hySrcIds.splice(index, 1)
    }
  }
}
</script>

<style></style>
