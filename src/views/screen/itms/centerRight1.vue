<template>
  <div id="centerRight1">
    <div class="bg-color-black">
      <div class="d-flex pt-2 pl-2">
        <span style="color:#5cd9e8">
          <icon name="chart-line" />
        </span>
        <div class="d-flex">
          <span class="fs-xl text mx-2">运维工单任务完成排行榜</span>
        </div>
      </div>
      <div class="d-flex jc-center body-box">
        <dv-scroll-board :config="config" style="width:3.375rem;height:4.28rem" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      config: {
        header: ['工程师', '工单组', '覆盖率'],
        data: [
          ['李工', 'dev-1', "<span  class='colorGrass'>↑75%</span>"],
          ['张工', 'dev-2', "<span  class='colorRed'>↓33%</span>"],
          ['刘工', 'dev-3', "<span  class='colorGrass'>↑100%</span>"],
          ['黎工', 'rea-1', "<span  class='colorGrass'>↑94%</span>"],
          ['温工', 'rea-2', "<span  class='colorGrass'>↑95%</span>"],
          ['梁工', 'fix-2', "<span  class='colorGrass'>↑63%</span>"],
          ['廖工', 'fix-4', "<span  class='colorGrass'>↑84%</span>"],
          ['陈工', 'fix-7', "<span  class='colorRed'>↓46%</span>"],
          ['毛工', 'dev-2', "<span  class='colorRed'>↓13%</span>"],
          ['赵工', 'dev-9', "<span  class='colorGrass'>↑76%</span>"]
        ],
        rowNum: 7, // 表格行数
        headerHeight: 35,
        headerBGC: '#0f1325', // 表头
        oddRowBGC: '#0f1325', // 奇数行
        evenRowBGC: '#171c33', // 偶数行
        index: true,
        columnWidth: [50],
        align: ['center']
      }
    }
  },
  mounted() {},
  methods: {}
}
</script>

<style lang="scss">
#centerRight1 {
  padding: 0.2rem;
  height: 5.125rem;
  min-width: 3.75rem;
  border-radius: 0.0625rem;
  .bg-color-black {
    height: 4.8125rem;
    border-radius: 0.125rem;
  }
  .text {
    color: #c3cbde;
  }
  .body-box {
    border-radius: 0.125rem;
    overflow: hidden;
  }
}
</style>
