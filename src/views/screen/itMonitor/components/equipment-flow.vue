<template>
  <div class="equipment-flow bottom-center-box">
    <div class="top-title">
      设备故障TOP
    </div>
    <div class="bottom-center-box-box">
      <!--      <div class="bottom-center-box-tabs pointer">-->
      <!--        <div class="tabs-tab" :class="{active:currType===0}" @click="currType=0">接收</div>-->
      <!--        <div class="tabs-tab" :class="{active:currType===1}" @click="currType=1">发送</div>-->
      <!--      </div>-->
      <div class="bottom-center-box-content">
        <div class="content-list">
          <div v-for="item in 14" :key="item" class="list-item flex-v-between py-10">
            <div class="flex-1">
              <div>hccccccccccccc</div>
              <div class="list-item-ip font-12 mt-6">192.168.1.4</div>
            </div>
            <div class="font-12">35sd4f54f</div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'EquipmentFlow',
  data() {
    return {
      currType: 0
    }
  }
}
</script>

<style scoped>
.equipment-flow{
  flex: 1;
  height: 100%;
}
</style>
