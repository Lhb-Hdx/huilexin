<template>
  <div class="wrp">
    <el-card shadow="never">
      <el-page-header @back="$router.back()" />
    </el-card>
    <el-card shadow="never" class="p-20">
      <div style="width: 80%">
        <div class="clearFix">
          <Rules
            ref="rules"
            hy-link-src-id="hyLinkSrcId"
            hy-link-id="hyLinkId"
            @emitRulesForm="rulesForm = $event"
          />
          <Event ref="event" />
        </div>
        <KeywordFilter ref="KeywordFilter" />
        <EventSource
          :rules-form.sync="rulesForm"
          hy-link-src-id="hyLinkSrcId"
          hy-link-id="hyLinkId"
        />
        <Action
          ref="action"
          hy-link-src-id="hyLinkSrcId"
          hy-link-id="hyLinkId"
        />
      </div>

      <div class="flex-v-center">
        <el-button type="primary" class="mt-60" @click="submit">提交</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import Rules from './components/rules'
import Event from './components/event'
import EventSource from './components/event-source'
import Action from './components/action'
import KeywordFilter from './components/keyword-filter'
import request from '@/utils/request'
import api from '@/api/api'
export default {
  name: 'AddLinkAge',
  components: { Rules, Event, EventSource, Action, KeywordFilter },
  data() {
    return {
      rulesForm: {}
    }
  },
  computed: {
    hyLinkSrcId() {
      return this.$route.query.hyLinkSrcId
    },
    hyLinkId() {
      return this.$route.query.hyLinkId
    }
  },
  methods: {
    async submit() {
      try {
        await this.$refs.event.validate()
        await this.$refs.rules.validate()
        await this.$refs.action.validate()

        const hyLinkId = await this.$refs.event.submit()
        await this.$refs.rules.submit(hyLinkId)
        await this.$refs.action.submit(hyLinkId)
        await this.$refs.KeywordFilter.submit(hyLinkId)

        await request({
          url: api.linkageManage.updateLocalCache,
          data: { b: false }
        })
        this.$message.success('提交成功')
        this.$router.back()
      } catch (error) {
        console.error('error: ', error)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.clearFix{
  &::after{
    content: '';
    display:block;
    height: 0;
    clear:both;
  }
}
.content {
  margin: auto;
}
.time-plan-list {
  width: 100%;
  background: #f5f7fa;
  padding: 4px 0;
  .plan-list-item {
    padding: 10px;
    .label {
      font-size: 14px;
      width: 60px;
    }
    .label-block {
      background: #e4e4e4;
      width: calc(100% - 60px);
      height: 20px;
      position: relative;
      .block-item {
        position: absolute;
        background: #0866e2;
        height: 20px;
      }
    }
  }
}
::v-deep .dynamic-tag-box {
  border: 1px solid #0145ab;
  min-height: 100px;
  padding: 10px;
  border-radius: 5px;
}
.typeWrap {
  width: 88px;
  margin: 0 0px 0 0;
}
</style>
