'use strict'

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject
var cmdHelper = require('../helper/CmdHelper')
var escapeHTML = require('../Utils').escapeHTML

var entryFieldDescription = require('./EntryFieldDescription')

var checkbox = function(options, defaultParameters) {
  var resource = defaultParameters
  var id = resource.id
  var label = options.label || id
  var canBeDisabled = !!options.disabled && typeof options.disabled === 'function'
  var canBeHidden = !!options.hidden && typeof options.hidden === 'function'
  var description = options.description

  resource.html =
    '<input id="activiti-' + escapeHTML(id) + '" ' +
         'type="checkbox" ' +
         'name="' + escapeHTML(options.modelProperty) + '" ' +
         (canBeDisabled ? 'data-disable="isDisabled"' : '') +
         (canBeHidden ? 'data-show="isHidden"' : '') +
         ' />' +
    '<label for="activiti-' + escapeHTML(id) + '" ' +
         (canBeDisabled ? 'data-disable="isDisabled"' : '') +
         (canBeHidden ? 'data-show="isHidden"' : '') +
         '>' + escapeHTML(label) + '</label>'

  // add description below checkbox entry field
  if (description) {
    resource.html += entryFieldDescription(description)
  }

  resource.get = function(element) {
    var bo = getBusinessObject(element)
    var res = {}

    res[options.modelProperty] = bo.get(options.modelProperty)

    return res
  }

  resource.set = function(element, values) {
    var res = {}

    res[options.modelProperty] = !!values[options.modelProperty]

    return cmdHelper.updateProperties(element, res)
  }

  if (typeof options.set === 'function') {
    resource.set = options.set
  }

  if (typeof options.get === 'function') {
    resource.get = options.get
  }

  if (canBeDisabled) {
    resource.isDisabled = function() {
      return options.disabled.apply(resource, arguments)
    }
  }

  if (canBeHidden) {
    resource.isHidden = function() {
      return !options.hidden.apply(resource, arguments)
    }
  }

  resource.cssClasses = ['bpp-checkbox']

  return resource
}

module.exports = checkbox
