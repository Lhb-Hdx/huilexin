/**
 * @description dataSourceManage.js
 * @author linhaojia
 * @date 2022/10/11 12:36:25
 */
import { sessionStorageOperation } from '@/utils/browser-storage'

export default [
  {
    'api': '/admin/findHyitArea',
    'name': '区域',
    'dataSourceType': 'area',
    'label': 'hyAreaName',
    'value': 'hyAreaId',
    'query': {},
    'getApi': '/admin/getHyitArea',
    'getField': 'hyAreaId',
    'getQuery': {}
  },
  {
    'api': '/admin/findHyitOrg',
    'name': '组织机构',
    'dataSourceType': 'org',
    'label': 'hyOrgName',
    'value': 'hyOrgId',
    'query': {},
    'getApi': '/admin/getHyitOrg',
    'getField': 'hyOrgId',
    'getQuery': {}
  },
  {
    'api': '/admin/findSysDictionaryDetail',
    'name': 'IT设备类型',
    'dataSourceType': 'it_device_type',
    'label': 'dictdataName',
    'value': 'id',
    'query': { 'dictCode': 'it_dev_type' },
    'getApi': '/admin/getSysDictionaryDetail',
    'getField': 'id',
    'getQuery': {}
  },
  {
    'api': '/admin/findHyitHost',
    'name': 'IT设备',
    'dataSourceType': 'it_host',
    'label': 'hyMarkName',
    'value': 'hyHostId',
    'query': { 'hostType': '1', agents: sessionStorageOperation('get', 'agentId') },
    'getApi': '/admin/getHyitHost',
    'getField': 'hyHostId',
    'getQuery': {}
  }
]
