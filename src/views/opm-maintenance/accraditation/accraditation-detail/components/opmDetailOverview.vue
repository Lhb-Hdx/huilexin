<template>
  <div class="detailOverview">
    <h3 v-if="info.matter.customForm" class="under-line font-16">相关内容</h3>
    <div class="detailOverview-table mb-10">
      <div class="workContainer">
        <table border="0" cellspacing="0" width="80%">
          <tr v-for="(trItem, trIdx) in info.matter.customForm" :key="trIdx" style="width:100%">
            <template v-for="(tdItem, tdIdx) in trItem">
              <td :key="'label_' + tdIdx + tdItem.id" style="width:25%">{{ tdItem.label }}：</td>
              <td :key="'value_' + tdIdx + tdItem.id" style="width:25%">{{ tdItem.value }}</td>
            </template>
          </tr>
        </table>
      </div>
    </div>
    <h3 v-if="info.matter.problemDetail" class="under-line font-16">描述</h3>
    <div class="detailOverview-content font-14 mb-10" v-html="info.matter.problemDetail" />
    <h3 v-if="info.fileList" class="under-line font-16">附件</h3>
    <div class="detailOverview-accessory d-flex mb-10">
      <div v-for="(item) in info.fileList" :key="item.id" class="detailOverview-accessory-item flex-v-between">
        <span class="font-14 overflow-text-a">{{ item.name }}</span>
        <el-link v-down="item.url" target="_blank" :underline="false" type="primary" class="font-14">下载</el-link>
      </div>
    </div>
    <h3 v-if="info.bsList" class="under-line font-16">相关业务</h3>
    <div class="detailOverview-table mb-10">
      <!-- <el-tabs v-model="activeBsId" @tab-click="handleBsClick">
        <el-tab-pane v-for="item in info.bsList" :key="item.bsId" :label="item.bsName" :name="item.bsId">
          <table border="0" cellspacing="0" width="100%">
            <tr>
              <td>业务名称：</td>
              <td>{{ item.bsName }}</td>
              <td>业务系统端口：</td>
              <td />
            </tr>
            <tr>
              <td>所属业务系统：</td>
              <td />
              <td>访问域名或ip地址</td>
              <td />
            </tr>
            <tr>
              <td>收影响部门</td>
              <td />
              <td />
              <td />
            </tr>
          </table>
        </el-tab-pane>
      </el-tabs> -->
      <div v-for="item in info.bsList" :key="item.id" :label="item.name" :name="item.id" class="workContainer">
        <table border="0" cellspacing="0" width="80%">
          <tr style="width:100%">
            <td style="width:25%">业务名称：</td>
            <td style="width:25%">{{ item.name }}</td>
            <td style="width:25%">业务系统端口：</td>
            <td style="width:25%" />
          </tr>
          <tr>
            <td>所属业务系统：</td>
            <td />
            <td>访问域名或ip地址</td>
            <td />
          </tr>
          <tr>
            <td>收影响部门</td>
            <td />
            <td />
            <td />
          </tr>
        </table>
      </div>
    </div>
    <h3 v-if="info.hostList" class="under-line font-16">相关设备</h3>
    <div class="detailOverview-table mb-10">
      <!-- <el-tabs v-model="activeHostId" @tab-click="handleHostClick">
        <el-tab-pane v-for="item in info.hostList" :key="item.hostId" :label="item.hostName" :name="item.hostId">
          <table border="0" cellspacing="0" width="100%">
            <tr>
              <td>设备名称：</td>
              <td>{{ item.hostName }}</td>
              <td>品牌/型号：</td>
              <td />
            </tr>
            <tr>
              <td>MAC地址：</td>
              <td />
              <td>ip地址：</td>
              <td>{{ item.ip }}</td>
            </tr>
            <tr>
              <td>所在区域：</td>
              <td />
              <td>所在位置：</td>
              <td />
            </tr>
            <tr>
              <td>业务端口：</td>
              <td>{{ item.port }}</td>
              <td>操作系统：</td>
              <td />
            </tr>
          </table>
        </el-tab-pane>
      </el-tabs> -->
      <div v-for="item in info.hostList" :key="item.hyHostId" :label="item.hyMarkName" :name="item.hyHostId" class="deviceContainer">
        <table border="0" cellspacing="0" width="80%">
          <tr style="width:100%">
            <td style="width:20%">设备名称：</td>
            <td style="width:20%">{{ item.hyMarkName }}</td>
            <td style="width:20%">品牌/型号：</td>
            <td style="width:20%" />
          </tr>
          <tr>
            <td>MAC地址：</td>
            <td />
            <td>ip地址：</td>
            <td>{{ item.ip }}</td>
          </tr>
          <tr>
            <td>所在区域：</td>
            <td />
            <td>所在位置：</td>
            <td />
          </tr>
          <tr>
            <td>业务端口：</td>
            <td>{{ item.port }}</td>
            <td>操作系统：</td>
            <td />
          </tr>
        </table>
      </div>

    </div>

    <div />
  </div>
</template>

<script>
export default {
  props: {
    // 事项信息
    info: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      activeHostId: '',
      activeBsId: ''
    }
  },
  watch: {
    info: {
      handler(newVal) {
        console.log(newVal)
        if (newVal.hostList && newVal.hostList.length > 0) { this.activeHostId = newVal.hostList[0].hyHostId }
        if (newVal.bsList && newVal.bsList.length > 0) { this.activeBsId = newVal.bsList[0].id }
      },
      deep: true
    }
  },
  methods: {
    handleHostClick(val) {},
    handleBsClick(val) {}
  }
}
</script>

<style lang="scss" scoped>
.detailOverview-content{
   /deep/ img{
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
   }
    line-height: 24px;

}
.detailOverview-accessory{
    .detailOverview-accessory-item{
        width: 170px;
        background-color: #F5F8FC;
        padding: 10px 10px;
        border: 1px solid #d8e4f5;
        margin-right: 10px;
      span {
        display: inline-block;
        width: 70%;
      }
    }
}
.deviceContainer{
  margin-bottom: 10px;
  text-align: center;
}
.workContainer{
  text-align: center;
  margin-bottom: 10px;
}
table{
    font-size: 14px;
    border-collapse:collapse;
    td{
        padding: 10px;
        &:nth-child(2n+1){
            background-color: #EEEEEE;
            width: 140px;
            text-align: center;
        }
    }
}
table,tr,td{
    border: 1px solid #E0E0E0;
}
</style>
