export default {
  methods: {
    // 消息推送
    async messageSendToPlatform(query) {
      // applicationId,receiverIds,msg,title,type
      const data = {type: 'weixin', ...query }
      const {code, msg} = await this.$request({
        url: this.api.opm.messageSendToPlatform,
        header: 'application/json',
        data: JSON.stringify(data)
      })
      return {code, msg}
    }
  }
}
