<template>
  <div class="detailNav flex">
    <div
      v-for="(item,index) in components"
      :key="index"
      @click="handleSkip(item)"
    >
      <!-- <div v-if="item.componentName==='OpmPlanView'"> -->
      <div v-if="item.componentName!=='OpmPlanView'||isManageFlag" :class="['detailNav-item', 'pointer', 'font-16', currComponent === item.componentName ? 'active' : '']">
        {{ item.label }}
      </div>
      <!-- </div> -->
    </div>
  </div>
</template>

<script>
import {mapGetters} from 'vuex'
export default {
  props: {
    components: {
      type: Array,
      default: () => []
    },
    componentName: {
      type: String,
      default: 'OpmDetailOverview'
    }

  },
  data() {
    return {
      currComponent: 'OpmDetailOverview'
    }
  },
  computed: {
    ...mapGetters('opm', ['isManageFlag'])
  },
  watch: {
    componentName(n, o) {
      this.currComponent = n
    }
  },
  mounted() {
  },
  methods: {
    handleSkip(item) {
      this.$emit('update:component-name', item.componentName)
    }
  }
}
</script>

<style lang="scss" scoped>
.detailNav{
  width: 100%;
  margin-bottom: 20px;
  background-color: #E5ECF6;
  .detailNav-item{
    padding: 10px 30px;
    color: #999;
    &:hover{
      @extend .active
    }
  }
  .active{
    color: #000;
    background-color: #CEDBEE;
  }
}
</style>
