<template>
  <div class="businessList">
    <el-row>
      <el-col v-for="(item,index) in bsIds" :key="item.id" :span="7" class="businessList-item">
        <div class="item-name">{{ item.name }}</div>
        <!-- <div class="font-14">{{ item.hyAddr }}</div> -->
        <i class="el-icon-close font-16 pointer" @click="handleChange(index)" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'BusinessList',
  props: {
    bsIds: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    handleChange(index) {
      this.bsIds.splice(index, 1)
      this.$emit('change', this.bsIds)
    }
  }
}
</script>

<style lang="scss" scoped>
.businessList{
    .businessList-item{
        position: relative;
        background-color: #F2F6FB;
        border: #d6e6fa 1px solid;
        padding:10px 9px 10px 10px;
        margin-right: 10px;
        margin-top: 10px;
        line-height: 20px;
        box-sizing: content-box;
        height: 70px;
        width: 230px;
        .item-name{
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          width: 220px;
        }
        .font-14{
            color: #999;
        }
        .el-icon-close{
            position: absolute;
            right: 10px;
            top: 10px;
            font-size: 18px !important;
        }
    }
}
</style>
