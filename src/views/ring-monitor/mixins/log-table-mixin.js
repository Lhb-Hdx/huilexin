import Pagination from '@/components/Pagination'
import request from '@/utils/request'
import api from '@/api/api'

export default {
  components: { Pagination },
  props: {
    id: {
      type: [Number, String],
      default: ''
    }
  },
  data() {
    return {
      list: [],
      findHyitAlarmLogQuery: {
        page: 1,
        limit: 10
      },
      total: 0,
      devStatus: [
        { value: 0, name: '灾难告警', color: '#000000', level: 1 },
        { value: 0, name: '严重告警', color: '#00b285', level: 2 },
        { value: 0, name: '一般告警', color: '#82a026', level: 3 },
        { value: 0, name: '一般告警', color: '#FF7F00', level: 4 },
        { value: 0, name: '一般告警', color: '#FE4D4E', level: 5 }
      ],
      hostlist: [],
      devicelist: [],
      levellist: []
    }
  },
  watch: {
    id(newVal) {
      if (newVal) {
        this.$set(this.findHyitAlarmLogQuery, 'hyDeviceId', newVal)
        this.findHyitAlarmLog()
      }
    }
  },
  computed: {
    setAlarmLevel() {
      const that = this
      return function(hyLevel) {
        const idx = that.level.findIndex(item => item.hyLevel === hyLevel)
        if (idx !== -1) {
          return that.level[idx].hyLevelName
        }
      }
    },
    setAlarmLevelColor() {
      const that = this
      return function(hyLevel) {
        const idx = that.devStatus.findIndex(item => item.level === hyLevel)
        if (idx !== -1) {
          return that.devStatus[idx].color
        }
      }
    },
    setHost() {
      return function(id) {
        const idx = this.hostlist.findIndex(item => item.hyHostId === id)
        if (idx !== -1) {
          return this.hostlist[idx].hyHostName
        }
      }
    },
    setDevice() {
      return function(id) {
        const idx = this.devicelist.findIndex(item => item.hyDeviceId === id)
        if (idx !== -1) {
          return this.devicelist[idx].hyAlias
        }
      }
    },
    setLevel() {
      return function(id) {
        const idx = this.levellist.findIndex(item => item.hyLevel === id)
        if (idx !== -1) {
          return this.levellist[idx].hyLevelName
        }
      }
    }
  },
  mounted() {
    if (this.id) this.$set(this.findHyitAlarmLogQuery, 'hyDeviceId', this.id)
    this.findHyitAlarmLog()
    this.findHyitHost()
    this.findHyitDevice()
    this.findHyitAlarmLevel()
  },
  methods: {
    async findHyitHost() {
      let { code, data } = await request({ url: api.powerEnv.findHyitHost, data: { limit: -1 }})
      if (code !== 1) return
      this.hostlist = data
    },
    async findHyitAlarmLevel() {
      let { code, data } = await request({ url: api.powerEnv.findHyitAlarmLevel, data: { limit: -1 }})
      if (code !== 1) return
      this.levellist = data
    },
    async findHyitDevice() {
      let { code, data } = await request({ url: api.powerEnv.findHyitDevice, data: { limit: -1 }})
      if (code !== 1) return
      this.devicelist = data
    },
    findHyitAlarmLog() {
      request({
        url: api.powerEnv.findHyitAlarmLog,
        data: this.findHyitAlarmLogQuery
      }).then(res => {
        if (res.code === 1) {
          this.list = res.data
          this.total = Number(res.count)
        }
      })
    }
  }
}
