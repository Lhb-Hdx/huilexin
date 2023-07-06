<template>
  <div class="facilityList">
    <el-row>
      <el-col v-for="(item,index) in selectfacility" :key="item.id" :span="7" class="facilityList-item">
        <div class="item-name">{{ item.hyHostName }}</div>
        <div class="font-14">{{ item.hyIp }}</div>
        <div class="font-14">{{ item.hyAddr }}</div>
        <div class="font-14">{{ item.serverName }}</div>
        <div class="font-14">{{ item.ip }}</div>
        <div class="font-14">{{ item.location }}</div>
        <i class="el-icon-close font-16 pointer" @click="handleChange(index)" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'FacilityList',
  props: {
    selectfacility: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    selectfacility: {
      handler(newName, oldName) {
        console.log(oldName)
        console.log(newName)
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    console.log(this.selectfacility)
  },
  methods: {
    handleChange(index) {
      // const filterList = this.selectfacility.filter((it) => it.hyHostId !== item.hyHostId)
      this.selectfacility.splice(index, 1)
      this.$emit('change', this.selectfacility)
    }
  }
}
</script>

<style lang="scss" scoped>
.facilityList{
    .facilityList-item{
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
