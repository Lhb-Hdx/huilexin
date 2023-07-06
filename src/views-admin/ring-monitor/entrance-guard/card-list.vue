<template>
  <div class="app-container">
    <el-card shadow="never">

      <el-page-header :content="navTitle" @back="goBack" />
    </el-card>
    <el-card shadow="never">

      <div class="filter-container">
        <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="onCreate">新增</el-button>
        <el-input v-model="findPowerEnvCardQuery.keyword" placeholder="请输入卡号" style="width: 200px;" class="filter-item" />
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="onFilter">查询</el-button>
      </div>
      <div v-loading="listLoading" class="table-wrapper">
        <el-table
          :data="cardList"
          fit
          highlight-current-row
          style="width: 100%;"
        >
          <el-table-column label="NO" prop="id" type="index" width="120" />
          <el-table-column label="卡号" prop="cardNum" show-overflow-tooltip />
          <el-table-column label="状态">
            <template slot-scope="item">
              {{ setCardStatus(item.row.cardState) }}
            </template>
          </el-table-column>
          <el-table-column label="卡类型" prop="cardType" show-overflow-tooltip>
            <template slot-scope="item">
              {{ setCardType(item.row.cardType) }}
            </template>
          </el-table-column>
          <el-table-column label="创建时间" prop="ctime" show-overflow-tooltip />
          <el-table-column label="更新时间" prop="utime" show-overflow-tooltip />
          <el-table-column label="操作" width="400" class-name="small-padding fixed-width" align="center">
            <template slot-scope="{row}">
              <el-button size="mini" type="primary" @click="onEdit(row)">
                编辑
              </el-button>
              <el-button size="mini" type="danger" @click="onDelete(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <pagination v-show="findPowerEnvCardQuery.total > 0" :auto-scroll="false" :total="findPowerEnvCardQuery.total" :page.sync="findPowerEnvCardQuery.page" :limit.sync="findPowerEnvCardQuery.limit" @pagination="findPowerEnvCard" />
      <el-dialog :title="guardCardInfoTitle" :visible.sync="showGuardCardInfo" width="40%" top="5vh">
        <div class="equipment_table">
          <el-form label-width="80px" :rules="rules" class="select-width-fill">
            <el-form-item label="卡号">
              <el-input v-model="form.cardNum" placeholder="请输入卡号" />
            </el-form-item>
            <el-form-item label="卡类型">
              <el-select
                v-model="form.cardType"
                filterable
                placeholder="请选择卡类型"
              >
                <el-option
                  v-for="item in cardType"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="卡号状态">
              <el-select
                v-model="form.cardState"
                filterable
                placeholder="请选择卡号状态"
              >
                <el-option
                  v-for="item in cardStatus"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="showGuardCardInfo = false">取 消</el-button>
          <el-button class="filter-item" type="primary" @click="comfirm">确 定</el-button>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'

export default {
  name: 'GuardCardList',
  components: { Pagination },
  data() {
    return {
      listLoading: false,
      findPowerEnvCardQuery: {
        userId: '',
        keyword: '',
        page: 1,
        limit: 10,
        total: 0
      },
      cardList: [],
      areaList: [
        { id: 1, name: '中心网点' }
      ],
      hostList: [
        { id: 1, name: '动环监控物联主机' }
      ],
      showGuardCardInfo: false,
      form: {
        cardNum: '',
        cardType: '',
        cardState: '',
        userId: ''
      },
      rules: {
        cardNum: [
          { required: true, message: '请输入卡号', trigger: 'blur' }
        ],
        cardType: [
          { required: true, message: '请选择卡类型', trigger: 'blur' }
        ],
        cardState: [
          { required: true, message: '请选择卡号状态', trigger: 'blur' }
        ]
      },
      cardStatus: [
        { id: 0, name: '闲置' },
        { id: 1, name: '在用' }
      ],
      cardType: [
        { id: 0, name: 'IC卡' },
        { id: 1, name: 'ID卡' }
      ],
      guardCardInfoTitle: '新增门禁卡'
    }
  },
  computed: {
    id() { // 编辑获取内容
      return this.$route.query.id
    },
    navTitle() { // title
      return this.$route.meta.title
    },
    setCardType() {
      return function(cardType) {
        const idx = this.cardType.findIndex(item => item.id === cardType)
        if (idx !== -1) {
          return this.cardType[idx].name
        }
      }
    },
    setCardStatus() {
      return function(cardState) {
        const idx = this.cardStatus.findIndex(item => item.id === cardState)
        if (idx !== -1) {
          return this.cardStatus[idx].name
        }
      }
    }
  },
  mounted() {
    this.$set(this.findPowerEnvCardQuery, 'userId', this.id)
    this.findPowerEnvCard()
  },
  methods: {
    resetForm(form) {
      Object.keys(form).forEach(key => {
        form[key] = ''
      })
    },
    onCreate() {
      this.resetForm(this.form)
      this.$set(this.form, 'userId', this.id)
      this.guardCardInfoTitle = '新增门禁卡'
      this.showGuardCardInfo = true
    },
    onEdit(row) {
      this.resetForm(this.form)
      this.$set(this.form, 'cardId', row.cardId)
      this.$set(this.form, 'cardNum', row.cardNum)
      this.$set(this.form, 'cardState', row.cardState)
      this.$set(this.form, 'cardType', row.cardType)
      this.guardCardInfoTitle = '编辑门禁卡'
      this.showGuardCardInfo = true
    },
    submitUserCard() {

    },
    onFilter() {
      this.$set(this.findPowerEnvCardQuery, 'page', 1)
      this.findPowerEnvCard()
    },
    goBack() {
      this.$router.go(-1)
    },
    openGuardCardInfo(row) {
      this.showGuardCardInfo = true
      this.form = {}
      if (row) {
        this.form = row
        this.guardCardInfoTitle = '新增门禁卡'
      }
    },
    comfirm() {
      this.showGuardCardInfo = false
      const data = { ...this.form }
      Object.keys(data).forEach(key => {
        if (data[key] === '') {
          delete data[key]
        }
      })
      request({
        url: this.form.cardId && this.form.cardId !== '' ? api.powerEnv.updatePowerEnvCard : api.powerEnv.insertPowerEnvCard,
        data: data
      }).then(res => {
        if (res.code === 1) {
          this.$set(this.findPowerEnvCardQuery, 'page', 1)
          this.findPowerEnvCard()
        }
      })
    },
    findPowerEnvCard() {
      request({
        url: api.powerEnv.findPowerEnvCard,
        data: this.findPowerEnvCardQuery
      }).then(res => {
        if (res.code === 1) {
          this.cardList = res.data
        }
      })
    },
    onDelete(row) {
      this.$confirm('确认删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        request({ url: api.powerEnv.deletePowerEnvCard, data: { cardId: row.cardId }}).then(res => {
          if (res.code === 1) {
            this.$message.success('删除成功')
            this.findPowerEnvCardQuery.page = 1
            this.findPowerEnvCard()
          }
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-container {padding-top: 14px}
</style>
