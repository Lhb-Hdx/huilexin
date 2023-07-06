<template>
  <div class="py-20">
    <el-divider content-position="left">
      动作源
      <el-button icon="el-icon-plus" class="ml-10" type="primary" size="small" @click="addDomain"> 添加动作源 </el-button>
    </el-divider>
    <el-form ref="actionform" inline :model="dynamicValidateForm" class="mb-0 mt-40">
      <!-- 动作列表 -->
      <div v-for="(domain, index) in dynamicValidateForm.domains" :key="domain.key" class="mt-20">
        <el-form-item label="动作类型：" :prop="`domains[${index}].hyActionClassId`" :rules="[{ required: true, trigger: 'change', message: '请选择' }]" class="mb-0">
          <el-select placeholder="请选择" :disabled="!!domain.hyId" :value="domain.hyActionClassId" style="width: 300px" @change="hyActionClassIdChange($event, domain)">
            <el-option v-for="item in actionTypeList" :key="item.hyActionClassId" :label="item.hyActionClassName" :value="item.hyActionClassId" />
          </el-select>
        </el-form-item>
        <el-form-item label="动作：" :prop="`domains[${index}].hyAid`" :rules="[{ required: true, trigger: 'change', message: '请选择' }]" class="mb-0">
          <el-select
            :value="domain.hyAid"
            placeholder="请选择"
            style="width: 300px"
            :disabled="!domain.hyActionClassId || !!domain.hyId"
            @change="hyAidChange($event, domain)"
            @click.native="checkActionList(domain)"
          >
            <el-option v-for="item in actions" :key="item.hyAid" :label="item.hyActionName" :value="item.hyAid" />
          </el-select>
        </el-form-item>
        <el-form-item label="动作源：" :prop="`domains[${index}].arr`" :rules="[{ required: true, trigger: 'change', message: '请选择' }]" class="mb-0">
          <el-button type="primary" size="small" @click="openAction(index, domain)">选择动作源</el-button>
          <el-button v-if="dynamicValidateForm.domains.length !== 1" icon="el-icon-minus" size="small" @click="removeDomain(domain, index)" />
        </el-form-item>

        <div />

        <div class="my-10">
          <!-- 通知类 -->
          <div v-if="domain.hyActionClassId === 1">
            <div v-for="(it, applicationIndex) in domain.arr" :key="it.applicationId" class="mb-10">
              <el-form-item>
                <div class="font-weight">{{ it.applicationName }}</div>
              </el-form-item>
              <el-form-item label="消息模板选择：" :prop="`domains[${index}][arr][${applicationIndex}].modelId`" :rules="[{ required: true, trigger: 'change', message: '请选择' }]">
                <el-select v-model="it.modelId" :disabled="!domain.hyAid" placeholder="请选择消息模板" clearable filterable value-key="tid" @change="changeActionMsg($event, it, domain)">
                  <el-option v-for="item in domain.messageList" :key="item.tid" :label="item.templateName" :value="item.tid" />
                </el-select>
              </el-form-item>
              <div class="pointer p-8 action-select-box" @click="openAction(index, domain)">
                <el-tag v-for="(item, listIndex) in it.list" :key="listIndex" closable type="success" class="ml-4 my-4" @close="deletedoMainTag(domain, index, applicationIndex, listIndex)">
                  {{ item.cname || item.hyDeviceName || item.nickname || item.realName || item.realname || item.hyDes }}
                </el-tag>
                <span v-if="!domain.arr.length" style="color: #999">请选择</span>
              </div>
            </div>
          </div>

          <!-- 非通知类 -->
          <div v-else class="pointer p-8 action-select-box" @click="openAction(index, domain)">
            <el-tag v-for="(item, arrindex) in domain.arr" :key="arrindex" closable type="success" class="ml-4 my-4" @close="deletedoMainTag(index, arrindex)">
              {{ item.cname || item.hyDeviceName || item.nickname || item.realName || item.realname || item.hyDes }}
            </el-tag>
            <span v-if="!domain.arr.length" style="color: #999">请选择</span>
          </div>
        </div>
        <el-divider />
      </div>
    </el-form>

    <!--    动作源弹窗-->
    <wxBookDialog
      v-if="wxbookShow"
      ref="wxbook"
      :dynamic-list="dynamicValidateForm.domains[actionIndex]['arr']"
      @uploadWxBookList="uploadWxBookList"
      @applicationId="dynamicValidateForm.domains[actionIndex]['applicationId'] = $event"
      @close="wxbookShow = false"
    />
    <deviceDialog v-if="actionDeviceShow" ref="dynamic" :dynamic-list.sync="dynamicValidateForm.domains[actionIndex]['arr']" @close="actionDeviceShow = false" />
    <videoChnDialog v-if="videochnShow" ref="videochn" :dynamic-list.sync="dynamicValidateForm.domains[actionIndex]['arr']" @close="videochnShow = false" />
    <userDialog v-if="userShow" ref="videochn" :dynamic-list.sync="dynamicValidateForm.domains[actionIndex]['arr']" @close="userShow = false" />
  </div>
</template>

<script>
import request from '@/utils/request'
import api from '@/api/api'
import { guid } from '@/utils/utils'
import wxBookDialog from '@/views-admin/activiti/components/wxBookDialog'
import videoChnDialog from '@/views-admin/activiti/components/videoChnDialog'
import userDialog from '@/views-admin/activiti/components/userDialog'
import deviceDialog from '@/views-admin/activiti/components/deviceDialog'

export default {
  name: 'Action',
  components: {
    wxBookDialog,
    videoChnDialog,
    userDialog,
    deviceDialog
  },
  data() {
    return {
      dynamicValidateForm: {
        domains: [
          {
            hyLinkId: '',
            hyActionClassId: '',
            hyAid: '',
            hyAsId: '',
            arr: [],
            key: guid()
          }
        ]
      },
      wxbookShow: false,
      actionDeviceShow: false,
      videochnShow: false,
      userShow: false,
      actions: [],
      messageTemplateList: [],
      actionClass: [],
      actionIndex: ''
    }
  },
  computed: {
    // 过滤消息模板
    filterMessageTemplateList() {
      return classify => {
        return this.messageTemplateList.filter(it => it.classify === classify)
      }
    },
    hyLinkSrcId() {
      return this.$route.query.hyLinkSrcId
    },
    hyLinkId() {
      return this.$route.query.hyLinkId
    },
    actionTypeList() {
      return this.actionClass.filter(it => it.pid === null || it.pid === 0)
    }
  },
  async created() {
    // await this.findPlatformMessageTemplate()
    await this.findHyitAction()
    await this.findHyitActionClass()
    if (this.hyLinkId) await this.findLinkageActionMap()
  },
  methods: {
    async validate() {
      try {
        await this.$refs.actionform.validate()
      } catch (error) {
        throw new Error(error)
      }
    },
    async submit(hyLinkId) {
      try {
        // 提交动作
        for (let i = 0; i < this.dynamicValidateForm.domains.length; i++) {
          const element = this.dynamicValidateForm.domains[i]
          delete this.dynamicValidateForm.domains[i].messageList
          // 通知类
          if (+element['hyActionClassId'] === 1) {
            for (const it of element.arr) {
              // return
              const hyAsIds = it['list'].map(it => it.userId).join(',')

              delete element['arr']
              delete element['aids']
              delete it['list']
              await request({
                url: api.linkageManage.changeLinkActionMap,
                data: {
                  ...it,
                  ...element,
                  hyLinkId: hyLinkId,
                  hyAsIds,
                  applicationId: it.applicationId
                }
              })
            }
          } else {
            // 非通知类型
            const hyAsIds = element['arr'].map(it => it.wid || it.cid || it.id || it.hyVid).join(',')
            delete element['arr']
            await request({
              url: api.linkageManage.changeLinkActionMap,
              data: {
                ...element,
                hyLinkId: hyLinkId,
                hyAsIds
              }
            })
          }
        }
      } catch (error) {
        throw new Error(error)
      }
    },
    async deleteLinkageActionMap(row) {
      for (const it of row.aids) {
        await this.$request({ url: this.api.linkageManage.deleteLinkageActionMap, data: { hyId: it, hyLinkId: row.hyLinkId, hyAid: row.hyAid } })
      }
    },
    async findLinkageActionMap() {
      let { data, code } = await request({
        url: api.linkageManage.findLinkageActionMap,
        data: { hyLinkId: this.hyLinkId, limit: -1 }
      })
      if (code !== 1) return

      const actionMapObj = {}
      // 匹配列表格式数据
      for (const it of data) {
        // 动作唯一，根据动作分类
        if (actionMapObj[it['hyAid']]) {
          // 根据是否通知类归类
          if (it['hyActionClassId'] === 1) {
            // 通知类根据applicationId分组
            const idx = actionMapObj[it['hyAid']]['arr'].findIndex(item => +item['applicationId'] === +it['applicationId'])
            if (idx !== -1) {
              actionMapObj[it['hyAid']]['arr'][idx]['hyAsIds'].push(it['hyAsId'])
            } else {
              // 找不到表示是一条新的
              actionMapObj[it['hyAid']]['arr'][actionMapObj[it['hyAid']]['arr'].length] = {
                applicationId: it.applicationId,
                modelId: it.modelId,
                templateCode: it.templateCode,
                list: [],
                hyAsIds: [it['hyAsId']]
              }
            }
          } else {
            actionMapObj[it['hyAid']]['hyAsIds'].push(it['hyAsId'])
          }
          actionMapObj[it['hyAid']]['aids'].push(it['hyId'])
        } else {
          if (it['hyActionClassId'] === 1) {
            const applicationId = it['applicationId']
            const modelId = it['modelId']
            const templateCode = it.templateCode
            delete it['templateCode']
            delete it['applicationId']
            delete it['modelId']
            actionMapObj[it['hyAid']] = {
              ...it,
              arr: [
                // 动作源展示
                {
                  applicationId,
                  modelId,
                  templateCode,
                  list: [it['hyAsId']],
                  hyAsIds: [it['hyAsId']]
                }
              ],
              aids: [it['hyId']], // 动作关联表所有id,删除动作用到
              hyActionTable: this.actions.find(item => it.hyAid === item.hyAid)?.hyActionTable || '',
              classify: this.actions.find(item => it.hyAid === item.hyAid)?.classify
            }
            delete actionMapObj[it['hyAid']]['hyAsId']
            delete actionMapObj[it['hyAid']]['hyId']
          } else {
            actionMapObj[it['hyAid']] = {
              ...it,
              hyAsIds: [it['hyAsId']], // 关联动作源ids
              arr: [], // 动作源展示
              aids: [it['hyId']],
              hyActionTable: this.actions.find(item => it.hyAid === item.hyAid)?.hyActionTable || ''
              // templateCode: this.actions.find((item) => it.hyAid === item.hyAid)
              //   ?.classify,
            }
          }
        }
      }

      // 取对应数据
      Object.values(actionMapObj).forEach(it => {
        // 循环hyasids数组
        this.findHyitAction('', it.hyActionClassId).then(res => {
          res.forEach(action => {
            if (it['hyAid'] === action['hyAid']) {
              if (action['hyActionTable'] === 'hyit_device') {
                this.findHyitDeviceValue(it.hyAsIds.join(',')).then(devicelist => {
                  it.arr = devicelist
                })
              }
              if (action['hyActionTable'] === 'video_chn') {
                this.findVideoChn(it.hyAsIds.join(',')).then(chnlist => {
                  it.arr = chnlist
                })
              }
              if (action['hyActionTable'] === 'hyit_book') {
                for (let wxBookUser of it['arr']) {
                  this.findPlatformUser(wxBookUser.applicationId, it.classify).then(platformUserlist => {
                    wxBookUser['list'] = platformUserlist.filter(platformUser => {
                      return wxBookUser['hyAsIds'].includes(+platformUser.userId) && +platformUser['applicationId'] === +wxBookUser['applicationId']
                    })
                  })
                  this.findPlatformMobileApplication(it.classify).then(data => {
                    const idx = data.find(item => +item.applicationId === +wxBookUser.applicationId)
                    if (idx) {
                      wxBookUser['applicationName'] = idx['applicationName']
                    }
                  })
                }
              }
              if (action['hyActionTable'] === 'sys_user') {
                this.findSysUser(it.hyAsIds.join(',')).then(users => {
                  it.arr = users
                })
              }
            }
          })
        })
      })

      let actionList = Object.values(actionMapObj)
      for (const it of actionList) {
        it['messageList'] = await this.findPlatformMessageTemplate(it.classify)
      }

      this.dynamicValidateForm.domains = actionList
    },
    async findPlatformMobileApplication(classify) {
      let res = await request({
        url: api.linkageManage.findPlatformMobileApplication,
        data: { classify, litmi: -1 }
      })
      res = JSON.parse(res)
      if (res.code === 1) return res.data
    },
    // 选择通知类
    uploadWxBookList({ allSelection, application }) {
      let applicationObj = Object.fromEntries(this.dynamicValidateForm.domains[this.actionIndex]['arr'].map(it => [it.applicationId, { ...it, list: [] }]))
      for (const it of allSelection) {
        if (!applicationObj[it.applicationId]) {
          applicationObj[it.applicationId] = {
            applicationId: it.applicationId,
            list: [it],
            applicationName: application.find(item => +item.applicationId === +it.applicationId)?.applicationName
          }
        } else {
          applicationObj[it.applicationId]['list'].push(it)
        }
      }
      this.dynamicValidateForm.domains[this.actionIndex]['arr'] = Object.values(applicationObj)
    },
    // 删除标签
    deletedoMainTag(domain, index, applicationIndex, listIndex) {
      if (+domain['hyActionClassId'] === 1) {
        this.dynamicValidateForm.domains[index]['arr'][applicationIndex]['list'].splice(listIndex, 1)
        if (!this.dynamicValidateForm.domains[index]['arr'][applicationIndex]['list'].length) {
          this.dynamicValidateForm.domains[index]['arr'].splice(applicationIndex, 1)
        }
      } else {
        this.dynamicValidateForm.domains[index]['arr'].splice(applicationIndex, 1)
      }
    },
    addDomain() {
      this.dynamicValidateForm.domains.push({
        hyLinkId: '',
        hyActionClassId: '',
        hyAid: '',
        hyAsId: '',
        arr: [],
        key: guid()
      })
    },
    removeDomain(domain, index) {
      this.$confirm('确认删除已保存的动作吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        if (domain.aids?.length) await this.deleteLinkageActionMap(domain)
        this.dynamicValidateForm.domains.splice(index, 1)
        this.$message.success('删除成功')
      })
    },
    async openAction(index, domain) {
      await this.findHyitAction('', domain.hyActionClassId)
      this.actionIndex = index
      if (!domain.hyAid) return this.$message.error('请先选择动作')
      if (domain.hyActionTable) {
        if (domain.hyActionTable === 'hyit_device') {
          this.actionDeviceShow = true
        }
        if (domain.hyActionTable === 'video_chn') this.videochnShow = true
        if (domain.hyActionTable === 'hyit_book') this.wxbookShow = true
        if (domain.hyActionTable === 'sys_user') this.userShow = true
      }
    },
    // 动作消息模板
    changeActionMsg(e, it, domain) {
      const idx = domain.messageList.find(it => +it.tid === +e)
      if (idx) it.templateCode = idx.templateCode
    },
    // 动作类型变更
    hyActionClassIdChange(e, item) {
      this.$set(item, 'hyActionClassId', e) // 赋值动作类型
      this.$set(item, 'hyAid', '') // 清空动作
      this.$set(item, 'arr', []) // 清空动作源
      this.findHyitAction('', item.hyActionClassId)
    },
    async hyAidChange(e, item) {
      // 动作变更
      if (this.dynamicValidateForm.domains.filter(it => it.hyAid === e).length >= 1) {
        return this.$message.error('请选择别的动作')
      }
      this.$set(item, 'hyAid', e)
      this.$set(item, 'arr', []) // 清空动作源
      this.$set(item, 'hyActionTable', this.actions.find(it => it.hyAid === item.hyAid).hyActionTable || '')
      if (item.hyActionTable === 'hyit_book') {
        item.classify = this.actions.find(it => it.hyAid === e).classify
      }
      if (item.classify) {
        const messageList = await this.findPlatformMessageTemplate(item.classify)
        this.$set(item, 'messageList', messageList)
      }
    },
    checkActionList(domain) {
      this.findHyitAction('', domain.hyActionClassId)
    },
    async findHyitDeviceValue(ids) {
      let { code, data } = await request({
        url: api.powerEnv.findHyitDeviceValue,
        data: { limit: -1, ids }
      })
      if (code === 1) return data
    },
    async findSysUser(ids) {
      let { data, code } = await request({
        url: api.sys.findSysUser,
        data: { limit: -1, ids, companyId: this.$auth.getUserSession().companyId }
      })
      if (code !== 1) return
      return data
    },
    async findPlatformUser(applicationId, classify) {
      let res = await request({
        url: api.linkageManage.findPlatformUser,
        data: { limit: -1, applicationId, classify }
      })
      res = JSON.parse(res)
      if (res.code !== 1) return
      return res.data
    },
    async findVideoChn(ids) {
      let { data, code } = await request({
        url: api.video.findVideoChn,
        data: { limit: -1, ids }
      })
      if (code !== 1) return
      return data
    },
    // 动作
    async findHyitAction(id, hyActionType) {
      let { data, code } = await request({
        url: api.linkageManage.findHyitAction,
        data: { hyActionClassId: id, limit: -1, hyActionType }
      })
      if (code !== 1) return
      this.actions = data
      return data
    },
    async findPlatformMessageTemplate(classify) {
      // 动作关联消息模板
      let res = await request({
        url: api.linkageManage.findPlatformMessageTemplate,
        data: { limit: -1, classify }
      })
      res = JSON.parse(res)

      if (res.code === 1) return res.data
      // this.messageTemplateList = res.data
    },
    async findHyitActionClass() {
      // 动作类型
      let { data, code } = await request({
        url: api.linkageManage.findHyitActionClass,
        data: { limit: -1 }
      })
      if (code !== 1) return
      this.actionClass = data
      return data
    }
  }
}
</script>

<style scoped lang="scss">
::v-deep .el-form-item {
  margin-bottom: 10px;
}
.action-select-box {
  border: 1px solid #0145ab;
  border-radius: 5px;
}
</style>
