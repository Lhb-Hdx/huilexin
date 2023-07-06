<template>
  <el-dialog v-set-dialog-main-height="'80%'" class="dialog-body-scroll" append-to-body title="值班计划" :visible.sync="showDialog" width="55%" top="5vh">
    <div class="dialog-body">
      <el-form ref="form" label-width="110px" :rules="rule" :model="form">
        <el-form-item label="值班地点" prop="dutyAddressId">
          <el-select
            v-model="form.dutyAddressId"
            placeholder="请选择值班地点"
            style="width: 40%;"
          >
            <el-option
              v-for="item in dutyAddressList"
              :key="item.catId"
              :label="item.catName"
              :value="item.catId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="值班月份" prop="dutyYMD">
          <el-date-picker
            v-model="form.dutyYMD"
            type="month"
            placeholder="选择日期"
            style="width: 40%;"
            @change="changeDutyYMD"
          />
        </el-form-item>
        <el-form-item label="班次">
          <div v-for="(option, optionIndex) in dutyTableOptions" :key="optionIndex" class="duty-list">
            <div class="duty-list-header">{{ option.dutyTitle }}</div>
            <div class="duty-list-body">
              <div v-for="(item, index) in option.items" :key="index" class="duty-radio">
                <el-radio v-model="option.itemsIndex" :label="index" @change="changeRadioOption(option.dutyType)">{{ item.itemTitle }}</el-radio>
                <div v-for="(dutyNumItem, dutyNumIndex) in item.dutyNum" :key="dutyNumIndex" class="duty-item-form">
                  <template v-if="option.itemsIndex === index && item.dutyNum > 0">
                    <el-select
                      v-if="item.dutyUsers[dutyNumIndex]"
                      v-model="item.dutyUsers[dutyNumIndex].dayType"
                      placeholder="请选择班次"
                      class="select"
                      @change="changeDutyType($event, { dutyType: option.dutyType, optionIndex, dayTypeIndex: dutyNumIndex, itemsIndex: index, ...item, dutyNumIndex })"
                      @focus="focusDutyType(item.dutyUsers[dutyNumIndex].dayType)"
                    >
                      <el-option
                        v-for="dutyTypeItem in dayType"
                        :key="dutyTypeItem.value"
                        :label="dutyTypeItem.label"
                        :value="dutyTypeItem.value"
                      />
                    </el-select>
                    <el-time-picker
                      v-if="item.dutyUsers[dutyNumIndex]"
                      v-model="item.dutyUsers[dutyNumIndex].dutyStartTime"
                      class="start-time"
                      arrow-control
                      placeholder="开始时间"
                      value-format="HH:mm:ss"
                      @change="changeTime(item.dutyUsers[dutyNumIndex])"
                    />
                    <el-time-picker
                      v-if="item.dutyUsers[dutyNumIndex]"
                      v-model="item.dutyUsers[dutyNumIndex].dutyEndTime"
                      class="end-time"
                      arrow-control
                      placeholder="结束时间"
                      value-format="HH:mm:ss"
                      @change="changeTime(item.dutyUsers[dutyNumIndex])"
                    />
                    <el-input v-if="item.dutyUsers[dutyNumIndex]" v-model="item.dutyUsers[dutyNumIndex].hours" class="hours">
                      <template slot="append">小时</template>
                    </el-input>
                    <el-button class="btn" type="primary" @click="handlerSelectUser({ dutyType: option.dutyType, ...item }, dutyNumIndex)">选择人员</el-button>
                    <div class="text">已选择 <span>{{ item.dutyUsers.length > 0 ? item.dutyUsers[dutyNumIndex].userIds.length : 0 }}</span> 人</div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="showDialog = false">取 消</el-button>
      <el-button class="filter-item" type="primary" :loading="loading" @click="confirmDialog">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'SchedulingPlanDialog',
  data() {
    return {
      showDialog: false,
      form: {
        dutyAddressId: '',
        dutyMonth: '',
        dutyYear: '',
        dutyDate: '',
        dutyYMD: '' // 这个参数是数据库没有的，是用来存日期组件的数据的
      },
      rule: {
        dutyAddressId: [
          { required: true, message: '请选择值班地点', trigger: 'blur' }
        ],
        dutyYMD: [
          { required: true, message: '请选择值班月份', trigger: 'blur' }
        ]
      },
      dDutyDayJson: [],
      dutyAddressList: [],
      dutyTableOptions: [
        {
          dutyTitle: '工作日', // 值班类型名称
          dutyType: 1, // 值班类型值
          itemsIndex: 0, // 选择的班次索引 对应 items
          items: [ // 值班班次
            /*
            itemTitle 班次标题
            dutyValue 班次值
            dutyNum 班次类型
            dutyUsers 选择用户
            */
            { itemTitle: '一天一班', dutyValue: 1, dutyNum: 1, dutyUsers: [] },
            { itemTitle: '一天两班', dutyValue: 1, dutyNum: 2, dutyUsers: [] },
            { itemTitle: '一天三班', dutyValue: 1, dutyNum: 3, dutyUsers: [] }
          ]
        },
        {
          dutyTitle: '节假日',
          dutyType: 2,
          itemsIndex: 0,
          items: [
            { itemTitle: '一天一班', dutyValue: 1, dutyNum: 1, dutyUsers: [] },
            { itemTitle: '一天两班', dutyValue: 1, dutyNum: 2, dutyUsers: [] },
            { itemTitle: '一天三班', dutyValue: 1, dutyNum: 3, dutyUsers: [] }
          ]
        }
      ],
      dayType: [
        { label: '早班', value: 1 },
        { label: '午班', value: 2 },
        { label: '晚班', value: 3 }
      ],
      handlerDutyItem: {},
      oldDayType: -1,
      loading: false
    }
  },
  watch: {
    showDialog: {
      handler() {
        if (!this.showDialog) this.$EventBus.$off('getCheckUser')
      }
    }
  },
  methods: {
    // 打开弹窗
    open() {
      this.showDialog = true
      this.$nextTick(() => {
        this.findSysCatByDutyAddress()
        this.resetDutyUsersTmp(1)
        this.resetDutyUsersTmp(2)
      })
      this.$EventBus.$on('getCheckUser', (res) => {
        const optionIndex = this.dutyTableOptions.findIndex(item => +item.dutyType === +this.handlerDutyItem.data.dutyType)
        const itemsIndex = this.dutyTableOptions[optionIndex].itemsIndex
        this.$set(this.dutyTableOptions[optionIndex].items[itemsIndex].dutyUsers[this.handlerDutyItem.index], 'userIds', this.$tool.deepCopy(res.checkIds))
        this.$set(this.dutyTableOptions[optionIndex].items[itemsIndex].dutyUsers[this.handlerDutyItem.index], 'users', this.$tool.deepCopy(res.dataCheck))
      })
    },
    // 保存
    confirmDialog() {
      this.$refs.form.validate(val => {
        if (!val) return
        this.loading = true
        // 人员选择判断
        for (let i = 0; i < this.dutyTableOptions.length; i++) {
          let isNullUser = false
          let msg = ''
          for (let j = 0; j < this.dutyTableOptions[i].items[this.dutyTableOptions[i].itemsIndex].dutyUsers.length; j++) {
            if (this.dutyTableOptions[i].items[this.dutyTableOptions[i].itemsIndex].dutyUsers[j].dutyStartTime.length === 0) {
              isNullUser = true
              msg = `请选择${this.dutyTableOptions[i].dutyTitle}${this.dayType[j].label}值班人员值班开始时间`
              this.loading = false
              break
            }
            if (this.dutyTableOptions[i].items[this.dutyTableOptions[i].itemsIndex].dutyUsers[j].dutyEndTime.length === 0) {
              isNullUser = true
              msg = `请选择${this.dutyTableOptions[i].dutyTitle}${this.dayType[j].label}值班人员值班结束时间`
              this.loading = false
              break
            }
          }
          if (isNullUser) return this.$message(msg)
        }

        // 通过
        const json = []
        this.dutyTableOptions.forEach(option => {
          option.items[option.itemsIndex].dutyUsers.forEach(item => {
            json.push({
              dutyAddressId: this.form.dutyAddressId,
              dutyType: option.dutyType,
              dutyMonth: this.form.dutyYMD.getMonth() + 1,
              dayType: item.dayType,
              dutyStartTime: item.dutyStartTime,
              dutyEndTime: item.dutyEndTime,
              dutyYear: this.form.dutyYMD.getFullYear(),
              userIds: item.userIds.toString(),
              hours: item.hours
            })
          })
        })
        this.$request({
          url: this.api.opm.insertHyitDutyDays,
          data: { json: JSON.stringify(json) }
        }).then(res => {
          this.loading = false
          if (res.code === 1) {
            this.showDialog = false
            this.$message.success('排班成功')
            this.$EventBus.$emit('reloadDutyDayData')
          }
        })
      })
    },
    // 获取值班地点
    findSysCatByDutyAddress() {
      this.$request({
        url: this.api.sys.findSysCat,
        data: { page: 1, limit: -1, systemName: 'userDefine', classify: 'userDefine_值班地点', parentId: -1, module: 2 }
      }).then(res => {
        if (res.code === 1 && res.data.length > 0) {
          this.dutyAddressList = res.data
        }
      })
    },
    // 根据班次设置对应的值班选择人数据
    resetDutyUsersTmp(dutyType) {
      const idx = this.dutyTableOptions.findIndex(item => +item.dutyType === +dutyType)
      if (idx !== -1) {
        const getDutyNum = this.dutyTableOptions[idx].items[this.dutyTableOptions[idx].itemsIndex].dutyNum
        this.$set(this.dutyTableOptions[idx].items[this.dutyTableOptions[idx].itemsIndex], 'dutyUsers', [])
        for (let i = 0; i < getDutyNum; i++) {
          this.$set(this.dutyTableOptions[idx].items[this.dutyTableOptions[idx].itemsIndex].dutyUsers, this.dutyTableOptions[idx].items[this.dutyTableOptions[idx].itemsIndex].dutyUsers.length, {
            userIds: [],
            dayType: i + 1,
            dutyStartTime: '',
            dutyEndTime: '',
            hours: 0
          })
        }
      }
    },
    // 打开选择值班人
    handlerSelectUser(item, index) {
      this.handlerDutyItem = { data: item, index }
      this.$EventBus.$emit('openSelectUser', this.$tool.deepCopy(item.dutyUsers[index]))
    },
    // 选择排班类型
    changeDutyType(e, val) {
      let count = 0
      val.dutyUsers.forEach(item => {
        if (+item.dayType === +e) ++count
      })
      if (count > 1) {
        this.$message('排班类型不可以重复')
        this.$set(this.dutyTableOptions[val.optionIndex].items[val.itemsIndex].dutyUsers[val.dutyNumIndex], 'dayType', this.oldDayType)
      } else {
        this.oldDayType = e
      }
    },
    // 记录上一个选择的排班类型
    focusDutyType(val) {
      this.oldDayType = val
    },
    // 值班班次类型选择
    changeRadioOption(dutyType) {
      this.resetDutyUsersTmp(dutyType)
    },
    // 选择时间
    changeTime(item) {
      if (item.dutyStartTime.length > 0 && item.dutyEndTime.length > 0) {
        const updateDayYMD = this.$tool.dateFormat('YYYY-mm-dd', new Date())
        if (new Date(`${updateDayYMD} ${item.dutyStartTime}`).getTime() > new Date(`${updateDayYMD} ${item.dutyEndTime}`).getTime()) {
          this.$message.error('开始时间不能大于结束时间')
          item.dutyStartTime = ''
          item.dutyEndTime = ''
        } else {
          item.hours = this.$tool.getHoursDiff(`${updateDayYMD} ${item.dutyStartTime}`, `${updateDayYMD} ${item.dutyEndTime}`).toFixed(2)
        }
      }
    },
    // 选择值班月份
    changeDutyYMD(e) {
      const getFirstDay = this.$tool.getFirstDay()
      if (e.getTime() < new Date(`${getFirstDay.text} 00:00:00`).getTime()) {
        this.$message('不可以选择过去月份')
        this.form.dutyYMD = ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.duty-list {
  border: 1px solid #dddddd;
  margin-bottom: 22px;
  .duty-list-header {
    background: #f5f7fa;
    padding: 0 15px;
    height: 40px;
    line-height: 40px;
  }
  .duty-list-body {
    padding: 0 15px;
    .duty-radio {
      display: block;
      width: 100%;
    }
    .duty-item-form {
      margin-bottom: 10px;
      .start-time {
        margin-right: 10px;
      }
      .start-time, .end-time, .hours {
        width: 20%;
      }
      .select {
        width: 15%;
        margin-right: 10px;
      }
      .end-time {
        margin-right: 10px;
      }
      .btn {
        margin-left: 10px;
        margin-right: 10px;
      }
      .text {
        display: inline-block;
        span {
          color: #0145ab;
          font-weight: bold;
        }
      }
    }
  }
}
</style>
