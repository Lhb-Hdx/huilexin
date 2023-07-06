<template>
  <div class="control">
    <el-dropdown :hide-on-click="false" class="filter-item screen">
      <i class="icon el-icon-s-operation" />
      <el-dropdown-menu slot="dropdown">
        <el-scrollbar style="height: 60vh">
          <el-checkbox-group v-model="filterItems">
            <el-dropdown-item v-for="(item,index) in checkList" :key="index"><el-checkbox :key="item" :label="item" />
            </el-dropdown-item>
          </el-checkbox-group>
        </el-scrollbar>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
export default {
  props: {
    checkList: {
      type: Array,
      default() {
        return []
      }
    },
    storageVal: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      filterItems: [],
      lists: [],
      storageName: ''
    }
  },
  watch: {
    checkList: {
      handler(newValue) {
        this.lists = []
        newValue.forEach(item => {
          this.lists.push({label: item, ispass: false})
        })
      },
      deep: true,
      immediate: true
    },
    filterItems(newVal) {
      if (newVal) {
        this.localStorageOperation('set', this.storageName, newVal)
        let arr = this.checkList.filter(i => newVal.indexOf(i) < 0) // 未选中
        this.lists.map(i => {
          if (arr.indexOf(i.label) !== -1) {
            i.ispass = false
          } else {
            i.ispass = true
          }
        })
        this.$emit('setLists', this.lists)
      }
    }
  },
  mounted() {
    const routerData = (this.$route.path).split('/')
    this.storageVal !== '' ? this.storageName = this.storageVal : this.storageName = routerData[routerData.length - 1]
    const itemsData = this.localStorageOperation('get', this.storageName) // 查缓存
    itemsData ? this.filterItems = itemsData : this.filterItems = this.checkList // 首次赋值
  }
}

</script>

<style lang="scss" scoped>
.control {
    display: inline;
}
.screen {
        float: right;
        .icon {
            border: 2px solid gray;
            font-size:25px;
        }
    }

</style>
