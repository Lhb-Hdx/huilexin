<template>
  <div class="detail-info-card">
    <div class="detail-info-card-header">
      基础信息
    </div>
    <div class="detail-info-card-content">
      <div class="detail-info-cell">
        <span class="left-cell">类型：</span>
        <span class="right-cell">服务设备</span>
      </div>
      <div class="detail-info-cell">
        <span class="left-cell">子类型：</span>
        <span class="right-cell">DELL</span>
      </div>
      <div class="detail-info-cell">
        <span class="left-cell">状态：</span>
        <span class="right-cell" :class="status===1?'green':'red'">在线</span>
      </div>
      <div class="detail-info-cell">
        <span class="left-cell">可用性：</span>
        <span class="right-cell">
          <el-tag
            v-for="(item, index) in availables"
            :key="item.label"
            size="mini"
            :type="setAvailables(index)"
            effect="dark"
            style="margin-right: 5px;"
          >
            {{ item.label }}
          </el-tag>
        </span>
      </div>
      <div class="detail-info-cell">
        <span class="left-cell">运行时长：</span>
        <span class="right-cell">21天2小时21分</span>
      </div>
      <div class="detail-info-cell">
        <span class="left-cell">管理者：</span>
        <span class="right-cell">admin</span>
      </div>
      <div class="detail-info-cell">
        <span class="left-cell">型号：</span>
        <span class="right-cell">DELL R7400</span>
      </div>
      <div class="detail-info-cell">
        <span class="left-cell">区域：</span>
        <span class="right-cell">数据中心机房数据中心机房数据中心机房数据中心机房</span>
      </div>
      <div class="detail-info-cell">
        <span class="left-cell">所在位置：</span>
        <span class="right-cell">A1-U23</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DetailInfo',
  data() {
    return {
      active: '1',
      status: 1,
      availables: [{
        label: 'AGENT'
      }, {
        label: 'SNMP'
      }, {
        label: 'JMX'
      }, {
        label: 'IPMI'
      }]
    }
  },
  computed: {
  },
  created() {
  },
  methods: {
    setAvailables(index) {
      let key = 'info'
      if (index === 0) {
        key = 'success'
      }
      return key
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-info-card {
  padding: 10px;
  .detail-info-card-header {
    color: #0145ab;
    font-weight: 600;
    display: inline-block;
    padding: 4px 0 10px;
    border-bottom: 2px solid #0145ab;
  }
  .detail-info-card-content {
    padding: 10px 0;
    .detail-info-cell {
      display: flex;
      align-items: center;
      padding-bottom: 10px;
      .left-cell {
        display: inline-block;
        width: 100px;
        text-align: right;
        line-height: 28px;
        margin-right: 10px;
        font-size:14px;
        color:#666666
      }
      .right-cell {
        display: inline-block;
        width: 230px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: 28px;
        font-size:14px;
        color:#666666;
        &.green {
          color: #0CB68B;
        }
        &.red {
          color: #FE4F50;
        }
      }
    }
  }
}
</style>
