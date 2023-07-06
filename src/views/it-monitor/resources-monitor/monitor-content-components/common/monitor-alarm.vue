<template>
  <div v-if="alarmList.lenght > 0" class="alarm">
    <div v-for="(item,index) in alarmList" :key="index">
      <div>
        <img src="image/common/alarm.png">
        <div>{{ item.hy_event_name }}</div>
        <div>{{ item.hy_ctime }}</div>
      </div>
      <div>
        {{ item.hy_alarm_desc }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  // eslint-disable-next-line vue/no-unused-components
  data() {
    return {
      hostId: 0, sbId: 0, alarmList: [], widthLine: 500
    }
  }, mounted() {
    this.hostId = this.$route.params.id
    this.sbId = this.$route.params.sbid

    /* getMethodByName({ name: 'GetHostAlarmlog', hostId: this.hostId, sbId: this.sbId }).then(res => {
      that.alarmList = res.data
    }) */
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/monitor-device.scss";
</style>
