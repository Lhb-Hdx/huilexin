'use strict'

var entryFactory = require('../../../../factory/EntryFactory')
var cmdHelper = require('../../../../helper/CmdHelper')

module.exports = function(element, bpmnFactory, options, translate) {
  var getImplementationType = options.getImplementationType
  var getBusinessObject = options.getBusinessObject

  function isExternal(element) {
    return getImplementationType(element) === 'external'
  }

  var topicEntry = entryFactory.textField({
    id: 'externalTopic',
    label: translate('Topic'),
    modelProperty: 'externalTopic',

    get: function(element, node) {
      var bo = getBusinessObject(element)
      return { externalTopic: bo.get('activiti:topic') }
    },

    set: function(element, values, node) {
      var bo = getBusinessObject(element)
      return cmdHelper.updateBusinessObject(element, bo, {
        'activiti:topic': values.externalTopic
      })
    },

    validate: function(element, values, node) {
      return isExternal(element) && !values.externalTopic ? { externalTopic: translate('Must provide a value') } : {}
    },

    hidden: function(element, node) {
      return !isExternal(element)
    }

  })

  return [topicEntry]
}
