import request from '@/utils/request'

// 查询用户金币流水记录列表
export function listUserAccountFlow(query) {
  return request({
    url: '/system/userAccountFlow/list',
    method: 'get',
    params: query
  })
}

// 查询用户金币流水记录详细
export function getUserAccountFlow(id) {
  return request({
    url: '/system/userAccountFlow/' + id,
    method: 'get'
  })
}

// 新增用户金币流水记录
export function addUserAccountFlow(data) {
  return request({
    url: '/system/userAccountFlow',
    method: 'post',
    data: data
  })
}

// 修改用户金币流水记录
export function updateUserAccountFlow(data) {
  return request({
    url: '/system/userAccountFlow',
    method: 'put',
    data: data
  })
}

// 删除用户金币流水记录
export function delUserAccountFlow(id) {
  return request({
    url: '/system/userAccountFlow/' + id,
    method: 'delete'
  })
}
