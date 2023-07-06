<template>
  <el-dialog v-if="visible" title="新增IC卡" :visible.sync="visible" width="40%" @close="onClose">
    <div>
      <el-form ref="form" :model="form" :rules="rules" label-width="60px" label-position="left" :inline="false" size="normal">
        <el-row :gutter="20">
          <el-col :span="12" :offset="0">
            <el-form-item label="IC卡号" prop="cardNo">
              <div class="flex">
                <el-input v-model="form.cardNo" style="width: 250px" placeholder="请输入卡号" type="number" />
                <el-button type="primary" size="default" class="ml-10" @click="readCard">读卡</el-button>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="房号" prop="roomId">
              <el-select v-model="form.roomId" placeholder="请选择房号" filterable>
                <el-option v-for="item in room" :key="item.hyRoomId" :label="item.hyRoomNo" :value="item.hyRoomId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="持卡人" prop="ownerId">
              <el-select v-model="form.ownerId" v-loadmore="loadMore" placeholder="请选择持卡人" filterable>
                <el-option v-for="item in owner" :key="item.ownerId" :label="item.ownerName" :value="item.ownerId" />
              </el-select>
            </el-form-item>
          </el-col>
          <!-- <el-col :span="12" :offset="0">
            <el-form-item label="子系统" prop="sbId">
              <el-select v-model="form.sbId" multiple placeholder="请选择子系统" filterable>
                <el-option v-for="item in sbIdList" :key="item.hySbId" :label="item.hySbName" :value="item.hySbId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="网关" prop="agentId">
              <el-select v-model="form.agentId" placeholder="请选择网关" filterable>
                <el-option v-for="item in agentList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col> -->
        </el-row>
      </el-form>

      <el-divider><el-button type="primary" size="mini" @click="addsbAgent">添加子系统网关</el-button> </el-divider>

      <el-form ref="sbAgentForm" :model="sbAgentForm">
        <el-table :data="sbAgentForm.list" style="width: 100%">
          <el-table-column label="子系统">
            <template v-slot="{ row, $index }">
              <el-form-item :prop="`list.${$index}.sbId`">
                <el-select v-model="row.sbId" placeholder="请选择子系统" filterable :rules="[{ required: true, message: '请选择', trigger: 'change' }]" @change="onSbIdChange($event, $index)">
                  <el-option v-for="item in sbIdList" :key="item.hySbId" :label="item.hySbName" :value="item.hySbId" />
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="网关">
            <template v-slot="{ row, $index }">
              <el-form-item :prop="`list.${$index}.agentId`" :rules="[{ required: true, message: '请选择', trigger: 'change' }]">
                <el-select v-model="row.agentId" placeholder="请选择网关" filterable :disabled="!!row.agentId">
                  <el-option v-for="item in row.sbAgentList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template v-slot="{ row, $index }">
              <el-form-item>
                <el-button type="danger" size="default" @click="delSbAgent(row, $index)">删除</el-button>
              </el-form-item>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
    </div>
    <span slot="footer">
      <div class="text-center">
        <el-button :loading="loading" type="primary" @click="submit">保存</el-button>
        <el-button @click="visible = false">取消</el-button>
      </div>
    </span>
  </el-dialog>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import loadmore from '@/directive/el-select-loadmore/loadmore'

export default {
  name: 'IcUppdate',
  directives: { loadmore },
  data() {
    return {
      loading: false,
      visible: false,
      form: {
        roomId: '',
        cardNo: '',
        ownerId: '',
        state: 1
      },
      rules: {
        cardNo: [{ required: true, trigger: 'blur', message: '请填写' }],
        ownerId: [{ required: true, trigger: 'change', message: '请选择' }]
      },
      id: '',
      room: [],
      owner: [],
      agentList: [],
      sbIdList: [],
      findEsOwnerQuery: {
        limit: 10,
        page: 1
      },
      sbAgentForm: {
        list: []
      }
    }
  },
  methods: {
    async open(id) {
      this.id = id || ''
      this.visible = true
      await this.$nextTick()
      await this.$nextTick()
      // await this.findHyitAgentSubsystem()
      await this.findEsOwner()
      await this.findEsRoom()
      await this.findHyitSubSystem()
      if (this.id) {
        await this.getEsCard(this.id)
        await this.findEsCardSystemAgent(this.form.cardId)
      }
    },
    onClose() {
      this.form = {}
      this.sbAgentForm.list = []
      this.visible = false
    },
    readCard() {},
    async submit() {
      try {
        await this.$refs.form.validate()
        await this.$refs.sbAgentForm.validate()
        if (this.sbAgentForm.list.length <= 0) return this.$message.error('请添加至少一条子系统网关数据')

        delete this.form.ctime
        delete this.form.utime
        let { code, msg, model } = await request({
          url: this.id ? api.powerEnv.updateEsCard : api.powerEnv.insertEsCard,
          data: { ...this.form, state: 1 }
        })
        if (code !== 1) return this.$message.error(msg)
        const cardId = model?.cardId ? model?.cardId : this.form.cardId

        for (const it of this.sbAgentForm.list) {
          if (it.id) {
            await this.updateEsCardSystemAgent(it)
          } else {
            await this.insertEsCardSystemAgent(cardId, it.agentId, it.sbId)
          }
        }
        this.$message.success(this.id ? '修改成功' : '新增成功')
        this.visible = false
        this.$emit('update')
      } catch (error) {
        console.log(error)
      }
    },
    async findHyitSubSystem() {
      let { code, data } = await request({
        url: api.powerEnv.findHyitSubSystem,
        data: { limit: -1 }
      })
      if (code !== 1) return
      this.sbIdList = data
    },
    // 添加删除子系统网关
    addsbAgent() {
      this.sbAgentForm.list.push({})
    },
    delSbAgent(row, index) {
      this.$confirm('确定删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        if (row.id) {
          await this.deleteEsCardSystemAgent(row.id)
          this.sbAgentForm.list.splice(index, 1)
        } else {
          this.sbAgentForm.list.splice(index, 1)
        }
      })
    },
    // 子系统改变时，查询网关
    async onSbIdChange(sbId, $index) {
      const data = await this.findHyitAgentSubsystem(sbId)
      this.$set(this.sbAgentForm['list'][$index], 'agentId', '')
      this.$set(this.sbAgentForm['list'][$index], 'sbAgentList', data)
    },
    async deleteEsCardSystemAgent(id) {
      const { code, msg } = await request({
        url: api.powerEnv.deleteEsCardSystemAgent,
        data: { id }
      })
      if (code !== 1) return this.$message.error(msg)
      else this.$message.success(msg)
    },
    async updateEsCardSystemAgent(form) {
      await request({
        url: api.powerEnv.updateEsCardSystemAgent,
        data: form
      })
    },
    // 子系统网关关联表
    async insertEsCardSystemAgent(cardId, agentId, sbId) {
      await request({
        url: api.powerEnv.insertEsCardSystemAgent,
        data: { cardId, agentId, sbId }
      })
    },
    async findEsCardSystemAgent(cardId) {
      const { data, code } = await request({
        url: api.powerEnv.findEsCardSystemAgent,
        data: { cardId }
      })
      if (code !== 1) return
      this.$set(this.sbAgentForm, 'list', data)
      console.log('data: ', data)
      for (let i = 0; i < data.length; i++) {
        const list = await this.findHyitAgentSubsystem(data[i]['sbId'])
        this.$set(this.sbAgentForm['list'][i], 'sbAgentList', list)
      }
    },
    async findHyitAgentSubsystem(sbId) {
      let { code, data } = await request({
        url: api.powerEnv.findHyitAgentSubsystem,
        data: { agentTypes: '2,4,5', limit: -1, sbId }
      })
      if (code !== 1) return
      const ids = data.map((it) => it.agentId)
      let { code: agentCode, data: agentData } = await request({
        url: api.itMonitor.findHyitAgent,
        data: { agentTypes: '2,4,5', limit: -1, ids }
      })
      if (agentCode !== 1) return
      return agentData
    },
    async getEsCard(cardId) {
      let { code, model } = await request({
        url: api.powerEnv.getEsCard,
        data: { cardId }
      })
      if (code !== 1) return
      this.form = { ...model, ownerId: +model.ownerId, roomId: +model.roomId }
    },
    async findEsRoom() {
      let { code, data } = await request({
        url: api.powerEnv.findEsRoom,
        data: { limit: -1 }
      })
      if (code !== 1) return
      this.room = data
    },
    async findEsOwner() {
      let { code, data } = await request({
        url: api.powerEnv.findEsOwner,
        data: this.findEsOwnerQuery
      })
      if (code !== 1) return
      this.owner = data
    },
    loadMore() {
      this.findEsOwnerQuery.page += 1
      this.this.findEsOwner()
    }
  }
}
</script>

<style>
.modu {
  color: aliceblue;
}
</style>
