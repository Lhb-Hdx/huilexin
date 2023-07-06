<template>
  <div>
    <ElDialog title="关联微信" :visible="true" width="60%" @close="$emit('close', false)">
      <div class="dialog-body">
        <div>
          <el-select v-model="listQuery.applicationId" placeholder="请选择公众号" class="ml-10" clearable @clear="handleSearch">
            <el-option v-for="item in application" :key="item.applicationId" :label="item.applicationName" :value="item.applicationId" />
          </el-select>
          <el-button type="primary" class="ml-10" @click="handleSearch">查询</el-button>
        </div>
        <div class="mt-20 table-wrapper">
          <ElTable ref="table" :data="tableData" class="table" row-key="id" @select="handleSelectChange" @select-all="handleSelectAll">
            <ElTableColumn type="selection" align="center" reserve-selection />
            <ElTableColumn label="序号" width="55px" type="index" align="center" />
            <ElTableColumn label="状态" prop="" show-overflow-tooltip align="center">
              <template slot-scope="{ row }">
                {{ $tool.formatStr(row.status, 'init:待审,enable:启用,disable:冻结,flow:审核中,not_pass:不通过') }}
              </template>
            </ElTableColumn>
            <ElTableColumn label="公司名称" prop="customerName" show-overflow-tooltip align="center" />
            <ElTableColumn label="类型" prop="" show-overflow-tooltip align="center">
              <template slot-scope="{ row }">
                {{ $tool.formatStr(row.classify, 'wxapp:微信小程序,weixin:微信公众号,qywx.self:企业微信(内部),dingding:钉钉(内部),app:原生') }}
              </template>
            </ElTableColumn>
            <ElTableColumn label="昵称" prop="realname" show-overflow-tooltip align="center" />
            <ElTableColumn label="手机" prop="mobile" show-overflow-tooltip align="center" />
            <!-- <ElTableColumn label="头像" prop="headimgurl">
              <template slot-scope="{ row }">
                <el-image style="width: 40px; height: 40px" :src="row.headimgurl" fit="cover" />
              </template>
            </ElTableColumn> -->
          </ElTable>
        </div>
        <pagination v-show="listQuery.count > 0" :auto-scroll="false" :total="listQuery.count" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="findPlatformUser" />
      </div>
      <template #footer>
        <el-button @click="$emit('close', false)">关闭</el-button>
        <el-button type="primary" @click="submit">确认</el-button>
      </template>
    </ElDialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import Pagination from '@/components/Pagination'

export default {
  components: {
    Pagination
  },
  props: {
    dynamicList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      bookid: '',
      diavisible: true,
      tableData: [],
      listQuery: {
        applicationId: '',
        count: 1,
        pageSize: 1,
        limit: 10
      },
      wxconfigs: [],
      currentSection: {},
      application: [],
      allSelection: []
    }
  },
  computed: {
    classify() {
      return this.$parent.dynamicValidateForm.domains[this.$parent.actionIndex]['classify']
    }
  },
  watch: {
    'listQuery.applicationId': {
      handler(n) {
        // this.$parent.dynamicValidateForm.domains[this.$parent.actionIndex][
        //   'applicationId'
        // ] = this.listQuery.applicationId
        this.findPlatformUser(n)
      }
    }
    // dynamicList: {
    //   handler(val) {
    //     const arr = []
    //     val.forEach((it) => {
    //       arr.push(...it.list)
    //     })
    //
    //     this.allSelection = [...arr]
    //   },
    //   deep: true,
    //   immediate: true
    // }
  },
  async mounted() {
    const data = await this.findPlatformMobileApplication()

    if (!data.length) return
    const arr = []
    this.dynamicList.forEach(it => {
      arr.push(...it.list)
    })
    this.allSelection = arr
    this.listQuery.applicationId = data[0].applicationId
  },
  methods: {
    submit() {
      this.$emit('uploadWxBookList', {
        allSelection: this.allSelection,
        application: this.application
      })
      this.$emit('close', false)
    },
    handleSelectChange(val, row) {
      const idx = this.allSelection.find(it => +it.id === +row.id)
      if (idx) {
        this.allSelection = this.allSelection.filter(it => +it.id !== +row.id)
      } else this.allSelection.push(row)
    },
    handleSelectAll(val) {
      console.log('val: ', val)
      if (val.length) {
        for (const it of val) {
          const idx = this.allSelection.find(item => +item.id === +it.id)
          if (!idx) this.allSelection.push(it)
        }
      } else {
        for (const it of this.tableData) {
          const idx = this.allSelection.findIndex(item => +item.id === +it.id && +it.applicationId === +item.applicationId)
          if (idx !== -1) this.allSelection.splice(idx, 1)
        }
      }
    },
    async findPlatformMobileApplication() {
      let res = await request({
        url: api.linkageManage.findPlatformMobileApplication,
        data: { classify: this.classify }
      })
      res = JSON.parse(res)
      if (res.code === 1) this.application = res.data
      return res.data
    },
    async open() {},
    handleSearch() {
      this.listQuery['page'] = 1
      this.findPlatformUser()
    },
    async findPlatformUser() {
      let res = await request({
        url: api.linkageManage.findPlatformUser,
        data: { ...this.listQuery, classify: this.classify }
      })
      res = JSON.parse(res)
      console.log('res: ', res)
      if (res.code !== 1) return
      this.$set(this.listQuery, 'count', +res.count)
      this.tableData = res.data
      this.$nextTick(() => {
        this.$nextTick(() => {
          this.initTable()
        })
      })
    },
    initTable() {
      // 勾选初始化
      for (let i = 0; i < this.allSelection.length; i++) {
        for (let j = 0; j < this.tableData.length; j++) {
          if (this.allSelection[i]['id'] === this.tableData[j]['id']) {
            this.$refs.table.toggleRowSelection(this.tableData[j], true)
          }
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
