<template>
  <div class="menu-list">
    <div
      v-for="item in list"
      :key="item.name"
      class="menu-list-item"
      @click.stop="handleClick(item)"
    >
      <div class="menu-list-item-box">
        <div>{{ item.name }}</div>
        <div>
          <i class="el-icon-plus" />
        </div>
      </div>
      <template v-if="item.list && item.list.length">
        <TreeMenus
          :key="item.name"
          :list="item.list"
        />
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TreeMenus',
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {}
  },
  methods: {
    handleClick(item) {
      console.log(item.name)
    }
  }
}
</script>

<style lang="scss" scoped>
.menu-list {
  width: 240px;
  height: 100%;
  float: left;
  background-color: #e9ecf3;
  // overflow: hidden;
  // overflow-y: scroll;
  padding-left: 5px;
  .menu-list-item {
    height: 45px;
    cursor: pointer;

    .menu-list-item-box {
      &:hover,
      &.active {
        background-color: #b7cbe7;
      }
      padding: 0 20px 0 10px;
      // width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }
}
</style>
