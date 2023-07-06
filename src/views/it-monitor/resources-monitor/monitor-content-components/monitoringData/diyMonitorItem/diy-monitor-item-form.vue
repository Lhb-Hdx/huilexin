<template>
  <div class="diy-watch-item-form margin-left-15 margin-top-15 margin-bottom-15">
    <div class="form-item pointer" @click="handlerAddModule">
      <div class="form-item-main">
        <i class="el-icon-plus font-60" />
        <div class="mt-20">增加模块</div>
      </div>
    </div>
    <el-dialog title="添加模块" :visible.sync="showDialog" width="80%" top="5vh">
      <div class="dialog-body">
        <el-row :gutter="20">
          <el-col :span="14">
            <div class="add-module-title">第一步，选择监控项</div>
            <div class="filter-container">
              <el-select v-model="findZbxItemsQuery.tag" class="filter-item" @change="changeItemType">
                <el-option
                  v-for="item in hostItemTypeList"
                  :key="item.sslCertFile"
                  :label="item.sslCertFile"
                  :value="item.sslCertFile"
                />
              </el-select>
            </div>
            <div class="table-wrapper">
              <el-table
                ref="table"
                :data="zbxItemsList"
                row-key="itemid"
                fit
                highlight-current-row
              >
                <el-table-column
                  label="监控项名称"
                  prop="name"
                  show-overflow-tooltip
                />
                <el-table-column
                  label="监控项周期"
                  prop="delay"
                  show-overflow-tooltip
                />
                <el-table-column
                  label="选择"
                >
                  <template slot-scope="{row}">
                    <el-radio v-model="hostGraphShowForm.itemid" :label="row.itemid" :disabled="isDisabled(row)" @change="changeItem(row)">{{ }}</el-radio>
                  </template>
                </el-table-column>
              </el-table>
              <Pagination
                v-show="zbxItemsListTotal > 0"
                :total="zbxItemsListTotal"
                :page.sync="findZbxItemsQuery.page"
                :limit.sync="findZbxItemsQuery.limit"
                @pagination="findZbxItems"
              />
            </div>
          </el-col>
          <el-col :span="10">
            <div class="add-module-title">第二步，选择展示方式</div>
            <div class="show-classify">
              <div v-for="(item, index) in showClassify" :key="index" class="show-classify-item">
                <img :src="item.img" alt="">
                <div>
                  <el-radio v-model="hostGraphShowForm.graphType" :label="item.value">{{ item.title }}</el-radio>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showDialog = false">取 消</el-button>
        <el-button class="filter-item" type="primary" @click="confirm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'DiyMonitorItemForm',
  components: {
    Pagination
  },
  data() {
    return {
      showDialog: false,
      zbxItemsList: [],
      findZbxItemsQuery: {
        page: 1,
        limit: 10,
        keyword: '',
        tag: ''
      },
      zbxItemsListTotal: 0,
      hostItemTypeList: [],
      ideField: 'itemid', // 匹配的字段，用id
      allSelection: [], // 所有页面选择的
      showClassify: [
        { title: '折线图', value: '1', img: 'image/it-monitor/it-monitor-config-line-echart.png' },
        // { title: '饼状图', value: '2', img: 'image/it-monitor/it-monitor-config-pre-echart.png' },
        { title: '仪表盘', value: '3', img: 'image/it-monitor/it-monitor-config-dash-echart.png' }
      ],
      formId: '',
      hostGraphShowForm: {
        type: 2,
        isShow: 1,
        itemid: '',
        graphType: '1',
        showName: '',
        devType: '',
        hostId: '',
        zhostId: ''
      },
      grachData: []
    }
  },
  computed: {
    navTitle() { return this.$route.meta.title },
    id() { return this.$route.query.id },
    agent() { return this.$route.query.agent },
    zbxHostId() { return this.$route.query.zbxHostId },
    devType() { return this.$route.query.devTypeId },
    isDisabled() {
      return function(val) {
        const idx = this.grachData.findIndex(item => Number(item.itemid) === Number(val.itemid))
        return idx !== -1
      }
    }
  },
  mounted() {
    this.$EventBus.$on('get-graph-show', (data) => {
      this.grachData = data
    })
  },
  methods: {
    // 获取主机监控项
    findZbxItems() {
      request({
        url: api.itMonitor.findZbxItemsHost,
        data: { ...this.findZbxItemsQuery, agent: this.agent, hostid: this.zbxHostId }
      }).then(res => {
        this.zbxItemsList = res.data
        this.zbxItemsListTotal = Number(res.count)
        // this.$nextTick(() => {
        //   this.initTableSelection(this.zbxItemsList, 'table')
        // })
      })
    },
    findZbxItemsHostTag(row) {
      request({
        url: api.itMonitor.findZbxItemsHostTag,
        data: { page: 1, limit: -1, hostid: this.zbxHostId }
      }).then(res => {
        if (res.code === 1) {
          this.hostItemTypeList = res.data
          this.findZbxItemsQuery.page = 1
          this.findZbxItemsQuery.tag = res.data[0].sslCertFile
          this.findZbxItems()
        }
      })
    },
    // 打开添加模块
    handlerAddModule() {
      this.showDialog = true
      this.findZbxItemsHostTag()
    },
    // 保存
    confirm() {
      this.$set(this.hostGraphShowForm, 'devType', this.devType)
      this.$set(this.hostGraphShowForm, 'hostId', this.id)
      this.$set(this.hostGraphShowForm, 'zhostId', this.zbxHostId)
      request({
        url: api.itMonitor.insertHyitHostGraphShow, data: this.hostGraphShowForm
      }).then(res => {
        if (res.code === 1) {
          this.showDialog = false
          this.$message.success('添加成功')
          this.$EventBus.$emit('add-item-switch')
          Object.keys(this.hostGraphShowForm).forEach(key => {
            if (key !== 'type' && key !== 'isShow' && key !== 'graphType') {
              this.$set(this.hostGraphShowForm, `${key}`, '')
            }
          })
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    // handleSelect(rows, row) {
    //   let handleSelected = rows.length && rows.indexOf(row) !== -1
    //   if (!handleSelected) {
    //     this.allSelection = this.allSelection.filter(
    //       (it) => it[this.ideField] !== row[this.ideField]
    //     )
    //   }
    // },
    // handleSelectionChange(val) {
    //   this.multipleSelection = val
    //   let setPagingSelection = [...this.allSelection, ...val]
    //   setPagingSelection = setPagingSelection.map((it) => JSON.stringify(it))
    //   setPagingSelection = [...new Set(setPagingSelection)].map((item) =>
    //     JSON.parse(item)
    //   )
    //   this.allSelection = setPagingSelection
    // },
    // initTableSelection(list, ref) {
    //   this.$nextTick(() => {
    //     this.$nextTick(() => {
    //       for (let i = 0; i < list.length; i++) {
    //         const tableEle = list[i]
    //         for (let j = 0; j < this.allSelection.length; j++) {
    //           const ele = this.allSelection[j]
    //           if (tableEle[ref === 'table' ? `${this.ideField}` : 'id'] === ele[ref === 'table' ? `${this.ideField}` : 'id']) {
    //             this.$refs[ref].toggleRowSelection(tableEle, true)
    //           }
    //         }
    //       }
    //     })
    //   })
    // },
    changeItemType() {
      this.findZbxItems()
    },
    changeItem(val) {
      this.$set(this.hostGraphShowForm, 'name', `${val.itemid}-${val.name}`)
      this.$set(this.hostGraphShowForm, 'showName', val.name)
      this.$set(this.hostGraphShowForm, 'itemid', val.itemid)
    }

  }
}
</script>

<style lang="scss" scoped>
.diy-watch-item-form {
  .form-item {
    border: #E5ECF6 3px dotted;
    width: 180px;
    height: 180px;
    color: #999;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.add-module-title {
  color: #0145ab;
  font-size: 18px;
  font-weight: bold;
  padding-bottom: 14px;
}
.show-classify {
  .show-classify-item {
    width: 50%;
    text-align: center;
    display: inline-block;
    img {
      width: 100%;
    }
  }
}
</style>
