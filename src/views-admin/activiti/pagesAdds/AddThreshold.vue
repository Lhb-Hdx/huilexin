<template>
  <div class="threshold">
    <div class="flex-h-center header page-nav" @click="$router.back()">
      <i class="el-icon-back header-icon pointer" />
      <div class="font-16 header-title">{{ title }}</div>
    </div>
    <div class="content">
      <el-form ref="form" :model="form" label-width="120px" :rules="rules">
        <el-row :gutter="10">
          <el-col :span="10">
            <el-form-item label="阈值条件名称:" prop="name" style="width: 100%">
              <el-input v-model="form.name" />
            </el-form-item>
            <el-form-item label="类型:" style="width: 100%">
              <el-select v-model="eventCocietyType" placeholder="请选择" style="width: 100%" :disabled="conditionIdFlag" @change="updateSeondList">
                <el-option v-for="item in eventList" :key="item.hyEventClassid" :label="item.hyEventClassname" :value="item.hyEventClassid" />
              </el-select>
            </el-form-item>
            <el-form-item label="级别:" prop="level" style="width: 100%">
              <el-select v-model="form.level" placeholder="请选择" style="width: 100%">
                <el-option v-for="item in levelList" :key="item.hyLevel" :label="item.hyLevelName" :value="item.hyLevel" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="告警标题名称:" prop="alarmName" style="width: 100%">
              <el-input v-model="form.alarmName" />
            </el-form-item>
            <el-form-item v-if="!conditionId||eventCocietyTypeParent" label="适用对象：" style="width: 100%">
              <el-select v-model="eventCocietyTypeParent" placeholder="请选择" style="width: 100%" @change="changeaAtionCocietyTypeParent">
                <el-option v-for="item in secondList" :key="item.hyEventClassid" :label="item.hyEventClassname" :value="item.hyEventClassid" />
              </el-select>
            </el-form-item>
            <el-form-item label="时间模板：" style="width: 100%">
              <el-select v-model="form.tid" placeholder="请选择" style="width: 100%">
                <el-option v-for="item in hyitTimes" :key="item.hyTid" :label="item.hyTname" :value="item.hyTid" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item v-if="!conditionId||form.hyEventClassId" label="监控参数：" prop="hyActionClassId" style="width: 60%">
          <!--          <el-select v-model="form.hyActionClassId" placeholder="请选择">-->
          <!--            <el-option-->
          <!--              v-for="item in actionCocietyTypeChildList"-->
          <!--              :key="item.hyActionClassId"-->
          <!--              :label="item.hyActionClassName"-->
          <!--              :value="item.hyActionClassId"-->
          <!--            />-->
          <!--          </el-select>-->
          <!-- <el-table
            ref="table"
            :data="eventCocietyTypeChildList"
            style="width: 100%"
            class="table"
            @select="tableSelect"
          >
            <el-table-column type="selection" />
            <el-table-column prop="hyEventClassname" label="监控项" />
          </el-table> -->
          <!-- <el-radio-group v-model="form.hyActionClassId" style="margin-bottom: 0px">
            <el-radio v-for="(item, index) in thirdList" :key="index" border :label="item.hyEventClassid">{{ item.hyEventClassname }} </el-radio>
          </el-radio-group> -->
          <el-select v-model="form.hyEventClassId" placeholder="请选择" @change="changeThird">
            <el-option
              v-for="item in thirdList"
              :key="item.hyEventClassid"
              :label="item.hyEventClassname"
              :value="item.hyEventClassid"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <!--    选择事件-->
          <div class="my-10">
            <el-button type="primary" @click="openDynamic">选择事件源</el-button>
            <div class="dynamic-tag-box mt-6" style="width: 80%">
              <el-tag v-for="(item, index) in form.hySrcIds" :key="item.hyVid || item.hyHostId || item.dvrId" type="success" class="mt-6 ml-6" closable @close="deleteSelectDynamic(index,item)">
                {{ item.hyDeviceName || item.hyMarkName || item.title || item.hyDes }}
              </el-tag>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="阈值条件:" prop="hyActionClassId" style="width: 60%">
          <div class="flex-h-center">
            <el-select v-model="form.condType" placeholder="请选择条件">
              <el-option v-for="item in condTypeList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-input v-model="form.alarmValue" placeholder="请输入" class="mx-10" type="number" />
            <el-select v-model="form.unit" placeholder="请选择单位">
              <el-option v-for="item in unitList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </div>
        </el-form-item>
        <el-form-item label="备注:" prop="hyActionClassId" style="width: 60%">
          <el-input v-model="form.remark" placeholder="请输入" type="textarea" />
        </el-form-item>
        <el-form-item label="状态:" prop="hyStatus" style="width: 60%">
          <el-switch :value="!!form.status" active-color="#0145ab" inactive-color="#f5f5f5" @change="changeStatus" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="subloading" @click="handleSubmit">保存</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!--    事件源弹窗-->
    <itDialog v-if="itShow" ref="dynamic" :dynamic-list.sync="form.hySrcIds" @close="itShow = false" />
    <deviceDialog v-if="deviceShow" ref="dynamic" :dynamic-list.sync="form.hySrcIds" @close="deviceShow = false" />
    <videoDialog v-if="videoShow" ref="dynamic" :dynamic-list.sync="form.hySrcIds" @close="videoShow = false" />
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import deviceDialog from '@/views-admin/activiti/components/deviceDialog'
import itDialog from '@/views-admin/activiti/components/itDialog'
import videoDialog from '@/views-admin/activiti/components/videoDialog'

export default {
  name: 'AddThreshold',
  components: {
    deviceDialog,
    itDialog,
    videoDialog
  },
  data() {
    return {
      videoShow: false,
      itShow: false,
      deviceShow: false,
      radio: '',
      actionClassList: [],
      form: { name: '', status: 1, hyEventClassId: '' },
      rules: {
        name: [{ required: true, message: '请输入', trigger: 'blur' }]
      },
      optionsList: [],
      condTypeList: [
        { value: -1, label: '< 小于' },
        { value: 0, label: '= 等于' },
        { value: 1, label: '> 大于' }
      ],
      unitList: [
        { value: '%', label: '%' },
        { value: '℃', label: '℃' }
      ],
      levelList: [],
      subloading: false,
      eventClassList: [], // 全体类型
      eventList: [], // 事件类型
      secondList: [], // 2层事件类型
      thirdList: [], // 3层事件类型
      actionCocietyType: 3,
      eventCocietyType: '', // 初始化第一层类型id
      // actionCocietyTypeParent: '',
      eventCocietyTypeParent: '', // 初始化第二层id
      hyitTimes: [],
      tableSelectList: [],
      initTableSelectList: []
    }
  },
  computed: {
    title() {
      return this.$route.meta.title
    },
    conditionId() {
      return this.$route.query.conditionId
    },
    conditionIdFlag() {
      return Number.isInteger(this.conditionId)
    },
    // actionCocietyTypeParentList() {
    //   return this.eventClassList.filter(
    //     it => it['pid'] === this.actionCocietyType
    //   )
    // },
    // eventCocietyTypeParentList() {
    // console.log(this.eventClassList.filter(
    //   it => it['pid'] === this.eventCocietyType
    // ))
    // console.log(JSON.stringify(this.eventClassList))
    // console.log(this.eventCocietyType)
    //   return this.eventClassList.filter(item => {
    //     return item.pid === this.eventCocietyType
    //   })
    // },
    // actionCocietyTypeChildList() {
    //   return this.actionClassList.filter(
    //     it => it['pid'] === this.actionCocietyTypeParent
    //   )
    // },
    eventCocietyTypeChildList() {
      return this.eventClassList.filter(it => it['pid'] === this.eventCocietyTypeParent)
    }
  },
  watch: {
    // actionCocietyType: {
    //   handler(val, val2) {
    //     this.actionCocietyTypeParent = ''
    //     this.form.hyActionClassId = ''
    //     this.tableSelectList = []
    //     console.log(val, '11')
    //     console.log(val2, '22')
    //   }
    // },
    // eventCocietyType: {
    //   handler(val, val2) {
    // this.eventCocietyTypeParent = ''
    // this.form.hyEventClassId = ''
    // this.tableSelectList = []
    //   }
    // }
  },
  async created() {
    await this.findLinkageEventClass()
    await this.hyitAlarmLevel()
    await this.findHyitTime()
    if (this.conditionId) {
      // await this.findLinkageActionClass()
      await this.getLinkageThresholdCondition()

      await this.fetchData()
    }
    // 初始化
    // this.select
    // this.$refs.table
  },
  methods: {
    tableSelect(list) {
      // list是这个el-table selection自动注入的参数。。代表点击那一列
      console.log(this.eventCocietyTypeChildList, '1111111111111111111')
      console.log(list)
      console.log(this.$refs.table)
      this.tableSelectList = list

      console.log(this.form, '222222222222222222')
      // if (this.actionCocietyType === 3) {
      //   this.$refs.table.clearSelection()
      //   this.$refs.table.toggleRowSelection(list.at(-1), true)
      //   this.tableSelectList = list.at(-1) ? [list.at(-1)] : []
      // } else {
      //   this.tableSelectList = list
      // }
    },
    // 删除tag
    deleteSelectDynamic(index, item) {
      console.log(item)
      this.form.hySrcIds.splice(this.form.hySrcIds.indexOf(item), 1)
    },
    matchHySrcIds(fun, hysrcids, field) {
      let hySrcIds = []
      this[fun]().then((res) => { // 匹配对象
        console.log(res, '777777777777777')
        console.log(hysrcids)
        res.forEach(it => {
          hysrcids.forEach(dataIt => {
            if (it[field] === dataIt.hySrcId) {
              hySrcIds.push(it)
            }
          })
        })
        // this.form.hySrcIds = hySrcIds
        this.$set(this.form, 'hySrcIds', hySrcIds)
        // console.log(this.form.hySrcIds)
      })
    },

    async fetchData() { // 获取编辑数据
      let { data: srcdata, code: srcid } = await request({ // 获取事件
        url: api.linkageManage.findLinkageThresholdSrcMap,
        data: { conditionId: this.conditionId, page: '', limit: -1, keyword: '' }
      })
      console.log(srcdata, srcid, '111111111111')
      if (srcid !== 1) return
      console.log(this.form, 'helo', this.eventCocietyType)
      if (this.eventCocietyType === 1) this.matchHySrcIds('findVideoDvr', srcdata, 'dvrId')
      if (this.eventCocietyType === 2) this.matchHySrcIds('findHyitHost', srcdata, 'hyHostId')
      if (this.eventCocietyType === 3) this.matchHySrcIds('findHyitDeviceValue', srcdata, 'hyVid')
    },
    openDynamic() {
      console.log(this.form)
      if (!this.eventCocietyType) {
        return this.$message.error('请先选择事件类型')
      }
      if (this.eventCocietyType === 1) this.videoShow = true
      if (this.eventCocietyType === 2) this.itShow = true
      if (this.eventCocietyType === 3) this.deviceShow = true
    },
    async hyitAlarmLevel() {
      let { code, data } = await request({
        url: api.powerEnv.findHyitAlarmLevel,
        data: {}
      })
      if (code !== 1) return
      this.levelList = data
      return data
    },
    async findHyitTime() {
      // 时间模板
      let { data, code } = await request({
        url: api.video.findHyitTime,
        data: { limit: -1 }
      })
      if (code !== 1) return
      this.hyitTimes = data
    },
    // 设置关联
    async getLinkageThresholdCondition() {
      // 初始化查主表
      let { model, code } = await request({
        url: api.linkageManage.getLinkageThresholdCondition,
        data: { conditionId: this.conditionId }
      })
      if (code !== 1) return
      let hyEventClassId = model.hyEventClassId
      delete model.hyEventClassId
      this.form = model
      // 二级id
      let pId
      // 一级id
      let gpId

      this.eventClassList.forEach(item => {
        if (item.hyEventClassid === hyEventClassId) {
          pId = item.pid
          if (pId) {
            this.eventClassList.forEach(item2 => {
              if (item2.hyEventClassid === pId) {
                gpId = item2.pid
                if (gpId) {
                  this.eventCocietyType = gpId
                  this.eventCocietyTypeParent = pId
                  this.$set(this.form, 'hyEventClassId', hyEventClassId)
                  // this.form.hyEventClassId = hyEventClassId
                } else {
                  this.eventCocietyType = pId
                  this.eventCocietyTypeParent = hyEventClassId
                }
              }
            })
          } else {
            this.eventCocietyType = hyEventClassId
          }
        }
      })
      // this.eventClassList.forEach(item => {
      //   if (item.hyEventClassid === pId) {
      //     gpId = item.pid
      //     return
      //   }
      // })
      // this.eventCocietyType = gpId
      // this.eventCocietyTypeParent = pId
      this.secondList = this.secondList.filter(item => item.pid === gpId)
      this.thirdList = this.thirdList.filter(item => item.pid === pId)

      // this.eventCocietyTypeParent = this.eventCocietyTypeParentList[0].hyEventClassid
      // this.tableSelectList
      // this.thirdList
      // 关联表
      // let { data } = await request({
      //   url: api.powerEnv.findLinkageThresholdConditionClassMap,
      //   data: { conditionId: this.conditionId }
      // })
      // const list = []
      // 关联表和主表
      // for (const datum of data) {
      //   for (const datumElement of this.eventClassList) {
      //     if (datum['hyActionClassId'] === datumElement['hyEventClassid']) {
      //       // 得到和关联表有关联的list
      //       list.push(datumElement)
      //     }
      //   }
      // }
      // const idx = this.eventClassList.find(
      //   it => it.hyEventClassid === data[0].hyActionClassId
      // )
      // if (idx) {
      //   this.eventCocietyTypeParent = this.eventClassList.find(
      //     it => it.hyEventClassid === idx['pid']
      //   ).hyEventClassid
      // }
      // 最低层级多选被选中的list
      // this.tableSelectList = list
      // this.initTableSelectList = list
      // for (const classid of list) {
      //   for (const select of this.eventCocietyTypeChildList) {
      //     // console.log(classid, select)
      //     if (+classid['hyEventClassid'] === +select['hyEventClassid']) {
      //       await this.$nextTick()
      //       this.$refs.table.toggleRowSelection(select, true)
      //     }
      //   }
      // }
      // this.form = model
      console.log(JSON.stringify(this.form), '2222222222222')
    },
    changeaAtionCocietyTypeParent(id) {
      // this.actionCocietyTypeParent = id
      this.thirdList = this.eventClassList.filter(item => item.pid === id)
      // this.eventCocietyTypeParent = {}
      console.log(this.thirdList)
      this.form.hyEventClassId = this.thirdList[0].hyEventClassid
    },
    changeStatus(e) {
      this.form.status = +e
    },
    changeThird(id) {
      console.log(id)
    },
    updateSeondList(id) {
      // console.log(ad)
      this.secondList = this.eventClassList.filter(item => item.pid === id)
      console.log(this.secondList)
      console.log(this.eventCocietyType)
      if (this.secondList.length > 0) {
        console.log(this.secondList[0].hyEventClassid, '12112')
        this.$nextTick(() => {
          // this.eventCocietyTypeParent = this.secondList[0].hyEventClassid
          this.thirdList = this.eventClassList.filter(item => item.pid === this.eventCocietyTypeParent)
          this.form.hyEventClassId = ''
        })
      } else {
        this.eventCocietyTypeParent = ''
        this.form.hyEventClassId = ''
        this.thirdList = ''
      }
      this.form.hySrcIds = []
      // if (this.eventClassList.filter(item => item.pid === this.eventCocietyTypeParent.hyEventClassid).length > 0) {
      //   console.log(this.thirdList, 'kkkkkkk')
      // } else {
      //   this.eventCocietyTypeParent = ''
      //   this.thirdList = ''
      // }

      // this.thirdList = ''
    },
    async findLinkageEventClass() {
      let { data, code } = await request({
        url: api.linkageManage.findLinkageEventClass
      })
      if (code !== 1) return
      console.log(JSON.stringify(data), '333333333333333333333333')
      // 最高层级
      this.eventList = data.filter(item => item['level'] === 0)
      if (this.conditionId) {
        // 第二层
        this.secondList = data.filter(item => item['level'] === 1)
        console.log(this.eventList, '121212111')
        // 第三层
        this.thirdList = data.filter(item => item['level'] === 2)
      }
      // this.eventCocietyType = this.eventList[0]['hyEventClassid']
      // 全部eventClass
      this.eventClassList = data
      // this.actionTypeList = data.filter(it => it['level'] === 0)
      // this.actionCocietyType = this.actionTypeList[1]['hyActionClassId']
      // this.actionClassList = data
    },
    handleSubmit() {
      console.log(this.form.hyActionClassId)
      console.log(this.form.hySrcIds)
      this.$refs['form'].validate(async val => {
        if (!val) return
        // if (!this.eventCocietyType) {
        //   return this.$message.error('至少选择一项监控参数')
        // }
        if (!this.conditionId) {
          this.form.userId = this.localStorageOperation('get', 'userInfo').userId
        }
        this.subloading = true
        // if (this.tableSelectList.length > 0) {
        //   this.tableSelectList.forEach(item => {
        //     hyActionClassIdList.push(item.hyEventClassid)
        //   })
        //   this.form.hyActionClassId = hyActionClassIdList
        // } else {
        // this.form.hyActionClassId = this.tableSelectList[0]['hyEventClassid']
        // }
        let hySrcIds
        if (this.form.hySrcIds) {
          hySrcIds = this.form.hySrcIds.map(it => it.hyVid || it.hyHostId || it.dvrId).join(',')
          delete this.form.hySrcIds
        }

        let hyEventClassId
        if (!this.form.hyEventClassId) {
          if (!this.eventCocietyTypeParent) {
            if (!this.eventCocietyType) {
              return this.$message.error('至少选择一项监控参数')
            } else {
              hyEventClassId = this.eventCocietyType
              console.log(33)
            }
          } else {
            hyEventClassId = this.eventCocietyTypeParent
            console.log(22)
          }
        } else {
          console.log(111)
          hyEventClassId = this.form.hyEventClassId
        }

        // , hyEventIds: this.form['hyEventIds'].join(',')
        let { code, model } = await request({
          url: api.linkageManage[this.conditionId ? 'updateLinkageThresholdCondition' : 'insertLinkageThresholdCondition'],
          data: { ...this.form, hyEventClassId, hySrcIds }
        })
        if (code === 1) {
          const conditionId = this.conditionId ? this.conditionId : model.conditionId
          // 提交联动
          await request({
            url: api.linkageManage.changeLinkageThresholdSrc,
            data: { hyEventClassId: hyEventClassId, conditionId: conditionId, hySrcIds }
          })
          // //  最初的关系表
          // const { addList, deleteList } = this.$tool.tableAddDeleteList(
          //   this.initTableSelectList,
          //   this.tableSelectList,
          //   'hyEventClassid'
          // )
          // for (const Element of addList) {
          //   await request({
          //     url: api.powerEnv.insertLinkageThresholdConditionClassMap,
          //     data: { conditionId, hyActionClassId: Element.hyActionClassId }
          //   })
          // }
          // for (const Element of addList) {
          //   await request({
          //     url: api.powerEnv.insertLinkageThresholdConditionClassMap,
          //     data: { conditionId, hyEventClassid: Element.hyEventClassid }
          //   })
          // }
          // for (const Element of deleteList) {
          //   await request({
          //     url: api.powerEnv.deleteLinkageThresholdConditionClassMap,
          //     data: { conditionId, hyEventClassid: Element.hyEventClassid }
          //   })
          // }
          this.$message.success(conditionId ? '修改成功' : '添加成功')
          this.$router.back()
          return
        }
        this.subloading = false
        this.$message.error(this.conditionId ? '修改失败' : '添加失败')
      })
    },
    async findHyitDevice() {
      let { data, code } = await request({
        url: api.powerEnv.findHyitDevice, data: { limit: -1 }
      })
      if (code !== 1) return
      return data
    },
    async findVideoDvr() {
      let { data, code } = await request({
        url: api.video.findVideoDvr,
        data: { limit: -1 }
      })
      if (code !== 1) return
      return data
    },
    async findHyitDeviceValue() {
      let { code, data } = await request({
        url: api.powerEnv.findHyitDeviceValue,
        data: { limit: -1 }
      })
      if (code === 1) return data
    },
    async findHyitHost() {
      let { data, code } = await request({
        url: api.itMonitor.findHyitHost, data: { limit: -1, agents: this.sessionStorageOperation('get', 'agentId') }
      })
      if (code !== 1) return
      return data
    }
  }
}
</script>

<style lang="scss" scoped>
.threshold {
  .header {
    height: 40px;
    background-color: #fff;

    .header-icon {
      font-size: 20px;
    }

    .header-title {
      color: #999;
    }
  }

  .content {
    margin-top: 30px;
    padding: 20px 20px 100px 20px;
    background-color: #fff;
  }
}

::v-deep .table {
  .is-leaf .el-checkbox {
    display: none;
  }
}
.dynamic-tag-box {
  border: 1px solid #0145ab;
  min-height: 100px;
  padding: 10px;
  border-radius: 5px;
}
</style>
