<template>
  <div v-if="tableData.length > 0" class="used-statistics-table">
    <el-table size="small" :data="tableData">
      <el-table-column
        v-for="(item, index) of tableData[0].col"
        :key="index"
        :label="item.label"
        align="center"
      >
        <template slot-scope="{row}">
          <span v-if="!row.col[index].arithmeticOperator">
            {{ row.col[index].notToFixed ? row.col[index].value : Number(row.col[index].value).toFixed(row.col[index].fixed || 0) }}
          </span>
          <span v-else>
            {{ setColValueByArithmetic(Number(row.col[index].value), row.col[index]) }}
          </span>
          {{ row.col[index].unit }}{{ row.col[index].unitSuffix }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>

/*
组件名称：监控项实时数据统计表格
描述：这个组件是用于it监控业务详情各个监控项使用情况实时表格

组件参数
tableData 数组类型 统计的数据
数组结构：
[
  {
    col: [
      {
        label: '当前读', // 表格列名称
        value: 0, // 表格列值
        unit: '', // 表格列值单位 没有单位就传空
        fixed: '', // 小数点位数
        arithmeticOperatorValue: '100', // 算术运算符比较值
        arithmeticOperator: '-' // 算术运算符
      }
    ]
  }
]
*/

export default {
  name: 'UsedStatisticsTable',
  props: {
    tableData: {
      type: Array,
      default() {
        return []
      }
    }
  },
  computed: {
    // 根据算术运算符计算表格列的值
    setColValueByArithmetic() {
      return function(val, col) {
        let resultValue = 0
        if (col.arithmeticOperator) {
          switch (col.arithmeticOperator) {
            case '+':
              resultValue = col.arithmeticOperatorValue + val
              break
            case '-':
              resultValue = col.arithmeticOperatorValue - val
              break
            case '*':
              resultValue = col.arithmeticOperatorValue * val
              break
            case '/':
              resultValue = col.arithmeticOperatorValue / val
              break
          }
        }
        return resultValue.toFixed(col.fixed || 0)
      }
    }
  }
}
</script>

<style scoped>

</style>
