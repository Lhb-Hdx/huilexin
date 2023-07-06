<template>
  <div>
    <el-dialog title="栏目配置" :visible.sync="dialogVisible" width="80%" @close="$emit('update')">
      <div class="filter-container">
        <el-input v-model="contentUnionAttributeListQuery.hyDes" placeholder="请输入属性名称" style="width: 200px;" class="filter-item" />
        <!-- <el-input v-model="contentUnionAttributeListQuery.hyAddr" placeholder="请输入模块名称" style="width: 200px;" class="filter-item" />
        <el-input v-model="contentUnionAttributeListQuery.hyDatIndex" placeholder="请输入索引" style="width: 200px;" class="filter-item" /> -->
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="onFilter">查询</el-button>
      </div>
      <div class="table-wrapper">
        <el-table
          ref="table"
          :data="contentUnionAttributeList"
          fit
          :border="true"
          highlight-current-row
          style="width: 100%;"
          class="table"
          @select="select"
        >
          <el-table-column type="selection" prop="11" />
          <el-table-column label="NO" prop="id" type="index" width="80" />
          <el-table-column :resizable="true" label="所属设备" prop="device" show-overflow-tooltip>
            <template slot-scope="item">
              {{ setDeviceName(item.row.hyDeviceId) }}
            </template>
          </el-table-column>
          <el-table-column :resizable="true" label="所属子系统" prop="hySbId" show-overflow-tooltip>
            <template slot-scope="item">
              {{ setSubSystem(item.row.hySbId) }}
            </template>
          </el-table-column>
          <el-table-column :resizable="true" label="属性名" prop="hyDes" show-overflow-tooltip />
          <el-table-column label="类型" prop="hyType" show-overflow-tooltip />
          <el-table-column label="模块" prop="hyAddr" width="80" show-overflow-tooltip />
          <el-table-column label="端口" prop="hyPort" width="80" show-overflow-tooltip />
          <el-table-column label="索引" prop="hyDatIndex" width="80" show-overflow-tooltip />
          <el-table-column label="值类型" prop="hyType" width="120" show-overflow-tooltip>
            <template slot-scope="item">
              {{ setValueType(item.row.hyType) }}
            </template>
          </el-table-column>
          <el-table-column label="当前值" prop="deviceValue" width="80" show-overflow-tooltip />
          <el-table-column label="更新时间" prop="hyUtime" show-overflow-tooltip />
          <el-table-column v-if="info.displayType!==1" label="优先级" size="normal" width="210">
            <template slot-scope="{row}">
              <el-input-number v-model="row.priority" size="mini" :min="1" :max="20" :disabled="!row.check" @change="change(row)" />
            </template>
          </el-table-column>
          <el-table-column v-if="info.displayType!==1" label="是否显示" size="normal">
            <template slot-scope="{row}">
              <el-switch v-model="row.history" :active-value="true" :inactive-value="false" :disabled="!row.check" @change="change(row)" />
            </template>
          </el-table-column>
        </el-table>
      </div>
      <pagination v-show="contentUnionAttributeListQuery.total > 0" :auto-scroll="false" :total="contentUnionAttributeListQuery.total" :page.sync="contentUnionAttributeListQuery.page" :limit.sync="contentUnionAttributeListQuery.limit" @pagination="findHyitDeviceValue" />

      <span slot="footer">
        <!-- <el-button @click="dialogVisible = false">取消</el-button> -->
        <el-button type="primary" @click="dialogVisible = false">确定</el-button>
      </span>

    </el-dialog>

  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'

export default {
  name: 'Dialog',
  components: { Pagination },
  data() {
    return {
      dialogVisible: false,
      form: {
        priority: 1,
        history: true,
        vid: ''
      },
      list: [],
      info: {},
      valueTypeList: [],
      subSystemList: [],
      deviceList: [],
      DhMenuValue: [],
      contentUnionAttributeListQuery: {
        page: 1,
        limit: 10,
        hyHostId: '',
        hyType: '',
        hyDes: '',
        hyDeviceId: '',
        total: 0,
        hyAddr: '',
        hyDatIndex: ''
      },
      contentUnionAttributeList: []
    }
  },
  computed: {
    setValueType() {
      return function(hyDevTypeValue) {
        const idx = this.valueTypeList.findIndex(item => item.hyTypeId === hyDevTypeValue)
        if (idx !== -1) {
          return this.valueTypeList[idx].hyDescription
        }
      }
    },
    setDeviceName() {
      return function(hyDeviceId) {
        const idx = this.deviceList.findIndex(item => item.hyDeviceId === hyDeviceId)
        if (idx !== -1) {
          return this.deviceList[idx].hyDeviceName
        }
      }
    },
    setSubSystem() {
      return function(hySbId) {
        const idx = this.subSystemList.findIndex(item => item.hySbId === hySbId)
        if (idx !== -1) {
          return this.subSystemList[idx].hySbName
        }
      }
    }
  },
  methods: {
    open(info) {
      this.dialogVisible = true
      this.info = info
      this.contentUnionAttributeListQuery.hyDeviceId = info.dhMenuItem.deviceId
      this.$nextTick(async() => {
        // this.$refs.form.resetFields()
        await this.findHyitSubSystem()
        await this.findHyitDhMenuValue()
        await this.findHyitDevice()
        await this.findHyitValueType()
        await this.findHyitDeviceValue()
      })
    },
    async select(a, b) {
      if (a.includes(b)) {
        let { code } = await request({ url: api.powerEnv.insertHyitDhMenuValue,
          data: { columnId: this.info.dhMenuItem.id, history: +b.history, priority: b.priority, vid: b.hyVid }})
        if (code !== 1) return
        this.$message.success('绑定成功')
      } else {
        let { code } = await request({ url: api.powerEnv.deleteHyitDhMenuValue, data: { id: b.idd }})
        if (code !== 1) return
        this.$message.success('删除绑定成功')
      }
      this.findHyitDhMenuValue()

      this.findHyitDeviceValue()
    },
    async change(b) {
      if (!b.check) return
      let { code } = await request({ url: api.powerEnv.updateHyitDhMenuValue,
        data: { columnId: this.info.dhMenuItem.id, history: +b.history, priority: b.priority, vid: b.hyVid, id: b.idd }})
      if (code !== 1) return
      this.$message.success('更新成功')
      this.findHyitDhMenuValue()

      this.findHyitDeviceValue()
    },
    findHyitDeviceValue() {
      request({
        url: api.powerEnv.findHyitDeviceValue,
        data: this.contentUnionAttributeListQuery
      }).then(res => {
        if (res.code === 1) {
          res.data.forEach(item => {
            const vid = this.DhMenuValue.find(it => it.vid === item.hyVid)
            if (vid) {
              item.priority = vid.priority
              item.history = !!vid.history
              item.check = true
              item.idd = vid.id
            } else {
              item.priority = 1
              item.history = true
            }

            const idx = this.valueTypeList.findIndex(items => items.hyTypeId === item.hyType)
            if (idx !== -1) {
              const activeValueType = this.valueTypeList[idx].hyFieldName
              // const splitTypeValue = activeValueType.split('_')
              let result = this.$tool.humpStr(activeValueType)
              item.deviceValue = item[`${result}`]
            }
          })
          this.contentUnionAttributeList = res.data
          this.contentUnionAttributeListQuery.total = Number(res.count)
          this.$nextTick(() => {
            for (let i = 0; i < this.contentUnionAttributeList.length; i++) {
              const tableEle = this.contentUnionAttributeList[i]
              for (let j = 0; j < this.DhMenuValue.length; j++) {
                const ele = this.DhMenuValue[j]
                if (tableEle['hyVid'] === ele['vid']) {
                  this.$refs['table'].toggleRowSelection(tableEle, true)
                }
              }
            }
          })
        }
      })
    },
    async findHyitDhMenuValue() {
      let { code, data } = await request({ url: api.powerEnv.findHyitDhMenuValue, data: { columnId: this.info.dhMenuItem.id, limit: -1 }})
      if (code !== 1) return
      this.DhMenuValue = data
      return data
    },
    // async dialogSubmit(history
    //   , priority) {
    //   let { code } = await request({ url: api.powerEnv.insertHyitDhMenuValue,
    //     data: { columnId: this.info.columnId, history, priority }})
    //   if (code !== 1) return
    //   // this.$emit('update')
    //   this.$message.success('添加成功')
    //   this.dialogVisible = false
    // },
    onFilter() {
      this.contentUnionAttributeListQuery.page = 1
      this.findHyitDeviceValue()
    },
    findHyitValueType() {
      request({
        url: api.powerEnv.findHyitValueType,
        data: {limit: -1}
      }).then(res => {
        if (res.code === 1) {
          this.valueTypeList = res.data
        }
      })
    },
    findHyitSubSystem() {
      request({
        url: api.powerEnv.findHyitSubSystem,
        data: {limit: -1}
      }).then(res => {
        if (res.code === 1) {
          this.subSystemList = res.data
        }
      })
    },
    findHyitDevice() {
      request({
        url: api.powerEnv.findHyitDevice, data: { page: 1, limit: -1 }
      }).then(res => {
        if (res.code === 1) {
          this.deviceList = res.data
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .table{
  thead .el-checkbox{
    display: none;
  }
}
</style>
