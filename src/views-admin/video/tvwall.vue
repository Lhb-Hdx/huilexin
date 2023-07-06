<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-permission="['Add']" class="filter-item" type="primary" icon="el-icon-plus" @click="onCreate">新增</el-button>
      <el-input v-model="findVideoTvwallQuery.keyword" v-permission="['Search']" placeholder="请输入菜单名称" style="width: 200px;" class="filter-item" />
      <el-button v-permission="['Search']" class="filter-item" type="primary" icon="el-icon-search" @click="onFilter">查询</el-button>
      <ListControl :check-list="checkList" @setLists="setLists" />
    </div>
    <div v-loading="listLoading" class="table-wrapper">
      <el-table
        :data="videoTvwall"
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column v-if="lists.length > 0 ? lists[0].ispass : true" align="left" prop="tvwallName" label="电视墙名称" />
        <el-table-column v-if="lists.length > 0 ? lists[1].ispass : true" align="right" prop="tvwallIp" label="IP" />
        <el-table-column v-if="lists.length > 0 ? lists[2].ispass : true" align="right" prop="tvwallPort" label="端口" />
        <el-table-column v-if="lists.length > 0 ? lists[3].ispass : true" align="left" label="屏幕布局">
          <template slot-scope="scope">
            {{ scope.row.tvwallLayout }} 分屏
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[4].ispass : true" align="left" label="状态">
          <template slot-scope="item">
            <div :class="item.row.statue === 1 ? 'success' : 'danger'">
              <i :class="item.row.statue === 1 ? 'el-icon-success' : 'el-icon-error'" />
              {{ item.row.statue === 1 ? '在线' : '离线' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="lists.length > 0 ? lists[5].ispass : true" align="left" label="操作">
          <template slot-scope="row">
            <el-button v-permission="['Edit']" size="mini" type="primary" @click="onEdit(row)">
              编辑
            </el-button>
            <el-button v-permission="['PlayerConfig']" size="mini" type="primary" @click="onTVWallPlayerConfig(row)">
              窗口设置
            </el-button>
            <el-button v-permission="['Delete']" size="mini" type="danger" @click="onDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination v-show="videoTvwallTotal > 0" :auto-scroll="false" :total="videoTvwallTotal" :page.sync="findVideoTvwallQuery.page" :limit.sync="findVideoTvwallQuery.limit" @pagination="findVideoTvwall" />
    <el-dialog :title="dialogTitle" :visible.sync="showVideoTvwall" width="40%" top="5vh">
      <div class="equipment_table">
        <el-form ref="form" :model="form" :rules="rules" label-width="120px" class="select-width-fill">
          <el-form-item label="电视墙名称" prop="tvwallName">
            <el-input v-model="form.tvwallName" placeholder="请输入电视墙名称" />
          </el-form-item>
          <el-form-item label="IP" prop="tvwallIp">
            <el-input v-model="form.tvwallIp" placeholder="请输入电视墙IP地址" />
          </el-form-item>
          <el-form-item label="端口" prop="tvwallPort">
            <el-input v-model.number="form.tvwallPort" placeholder="请输入电视墙端口" type="number" />
          </el-form-item>
          <el-form-item label="屏幕布局" prop="tvwallLayout">
            <el-select
              v-model="form.tvwallLayout"
              filterable
              placeholder="屏幕布局"
            >
              <el-option
                v-for="item in layoutList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="事件通知地址" prop="eventApiUrl">
            <el-input v-model="form.eventApiUrl" placeholder="请输入电视墙事件通知地址" />
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showVideoTvwall = false">取 消</el-button>
        <el-button class="filter-item" type="primary" :loading="comfirmLoading" @click="comfirm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'
import { isIp } from '@/utils/validate'
import ListControl from '@/components/ListControl'

export default {
  name: 'TVWall',
  components: { Pagination, ListControl },
  data() {
    var checkIp = (rule, value, callback) => {
      if (!value) return callback(new Error('请输入IP'))
      if (!isIp(value)) return callback(new Error('请输入正确的IP地址'))
      callback()
    }
    return {
      listLoading: false,
      findVideoTvwallQuery: {
        page: 1,
        limit: 10,
        keyword: ''
      },
      videoTvwall: [],
      videoTvwallTotal: 0,
      dialogTitle: '新增电视墙',
      showVideoTvwall: false,
      form: {
        tvwallName: '',
        tvwallIp: '',
        tvwallPort: '',
        tvwallLayout: '',
        eventApiUrl: ''
      },
      rules: {
        tvwallName: [
          { required: true, message: '请输入电视墙名称', trigger: 'blur' }
        ],
        tvwallIp: [
          { validator: checkIp, required: true, trigger: 'blur' }
        ],
        tvwallPort: [
          { required: true, message: '请输入端口', trigger: 'blur' }
        ],
        tvwallLayout: [
          { required: true, message: '请输入窗口布局', trigger: 'blur' }
        ],
        eventApiUrl: [
          { required: true, message: '请输入事件通知地址', trigger: 'blur' }
        ]
      },
      layoutList: [
        { label: '1分屏', value: 1 },
        { label: '4分屏', value: 4 },
        { label: '6分屏', value: 6 },
        { label: '8分屏', value: 8 },
        { label: '9分屏', value: 9 },
        { label: '13分屏', value: 13 },
        { label: '16分屏', value: 16 },
        { label: '28分屏', value: 28 },
        { label: '36分屏', value: 36 }
      ],
      comfirmLoading: false,
      // 显示控制数据 start
      checkList: ['电视墙名称', 'IP', '端口', '屏幕布局', '状态', '操作'],
      lists: []
      // 显示控制数据 end
    }
  },
  created() {
    const pageQuery = this.$tool.getPageQuery(`${this.$route.name}`)
    if (pageQuery) {
      delete pageQuery.route
      this.findVideoTvwallQuery = pageQuery
    }
  },
  mounted() {
    this.findVideoTvwall()
  },
  methods: {
    setLists(val) {
      this.lists = val
    },
    // 进入创建
    onCreate() {
      this.dialogTitle = '新增电视墙'
      this.showVideoTvwall = true
      this.comfirmLoading = false
      setTimeout(() => {
        this.$refs['form'].resetFields()
      }, 300)
    },
    // 进入编辑
    onEdit(val) {
      this.dialogTitle = '编辑电视墙'
      this.form.id = val.row.id
      Object.keys(this.form).forEach(key => {
        this.$set(this.form, `${key}`, val.row[`${key}`])
      })
      this.showVideoTvwall = true
      this.comfirmLoading = false
    },
    // 搜索
    onFilter() {
      this.findVideoTvwall()
    },
    // 删除
    onDelete(val) {
      this.$confirm('确认要删除当前记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: api.video.deleteVideoTvwall, data: { id: val.row.id }
        }).then(res => {
          if (res.code === 1) {
            this.$message.success(res.msg)
            this.findVideoTvwall()
          }
        })
      })
    },
    comfirm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.comfirmLoading = true
          const requestApi = !this.form.id ? api.video.insertVideoTvwall : api.video.updateVideoTvwall
          request({
            url: requestApi, data: this.form
          }).then(res => {
            this.comfirmLoading = false
            if (res.code === 1) {
              this.$message.success(res.msg)
              this.showVideoTvwall = false
              this.findVideoTvwall()
            }
            if (res.code !== 1) {
              this.$message.error(res.msg)
            }
          })
        }
      })
    },
    findVideoTvwall() {
      request({
        url: api.video.findVideoTvwall, data: this.findVideoTvwallQuery
      }).then(res => {
        if (res.code === 1) {
          this.videoTvwall = res.data
          this.videoTvwallTotal = Number(res.count)
        }
      })
    },
    onTVWallPlayerConfig(val) {
      const data = { ...this.findVideoTvwallQuery }
      this.localStorageOperation('set', 'pageQuery', JSON.stringify({
        ...data, route: this.$route.name
      }))
      this.$router.push({
        name: 'TVWallPlayerConfig',
        query: {
          id: val.row.id
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
