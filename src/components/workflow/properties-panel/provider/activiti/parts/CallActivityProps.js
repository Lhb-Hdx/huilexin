'use strict'

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject
var is = require('bpmn-js/lib/util/ModelUtil').is

var entryFactory = require('../../../factory/EntryFactory')

var callable = require('./implementation/Callable')

var cmdHelper = require('../../../helper/CmdHelper')

var flattenDeep = require('lodash/flattenDeep')
var assign = require('lodash/assign')

function getCallableType(element) {
  var bo = getBusinessObject(element)

  var boCalledElement = bo.get('calledElement')
  var boCaseRef = bo.get('activiti:caseRef')

  var callActivityType = ''
  if (typeof boCalledElement !== 'undefined') {
    callActivityType = 'bpmn'
  } else

  if (typeof boCaseRef !== 'undefined') {
    callActivityType = 'cmmn'
  }

  return callActivityType
}

var DEFAULT_PROPS = {
  calledElement: undefined,
  'activiti:calledElementBinding': 'latest',
  'activiti:calledElementVersion': undefined,
  'activiti:calledElementTenantId': undefined,
  'activiti:variableMappingClass': undefined,
  'activiti:variableMappingDelegateExpression': undefined,
  'activiti:caseRef': undefined,
  'activiti:caseBinding': 'latest',
  'activiti:caseVersion': undefined,
  'activiti:caseTenantId': undefined
}

module.exports = function(group, element, bpmnFactory, translate) {
  if (!is(element, 'activiti:CallActivity')) {
    return
  }

  group.entries.push(entryFactory.selectBox({
    id: 'callActivity',
    label: translate('CallActivity Type'),
    selectOptions: [
      { name: 'BPMN', value: 'bpmn' },
      { name: 'CMMN', value: 'cmmn' }
    ],
    emptyParameter: true,
    modelProperty: 'callActivityType',

    get: function(element, node) {
      return {
        callActivityType: getCallableType(element)
      }
    },

    set: function(element, values, node) {
      var type = values.callActivityType

      var props = assign({}, DEFAULT_PROPS)

      if (type === 'bpmn') {
        props.calledElement = ''
      } else if (type === 'cmmn') {
        props['activiti:caseRef'] = ''
      }

      return cmdHelper.updateProperties(element, props)
    }

  }))

  group.entries.push(callable(element, bpmnFactory, {
    getCallableType: getCallableType
  }, translate))

  group.entries = flattenDeep(group.entries)
}
