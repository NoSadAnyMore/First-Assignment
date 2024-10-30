import request from '@/utils/request'

// 查询参数列表
export function getData() {
  return request({
    url: '/home/tj/data',
    method: 'get',
  })
}
 
