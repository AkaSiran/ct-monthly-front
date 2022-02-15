import request from '@/utils/request'

// 查询pregnancy列表
export function listPregnancy(query) {
  return request({
    url: '/paper/pregnancy/list',
    method: 'get',
    params: query
  })
}

// 查询pregnancy详细
export function getPregnancy(id) {
  return request({
    url: '/paper/pregnancy/' + id,
    method: 'get'
  })
}

// 新增pregnancy
export function addPregnancy(data) {
  return request({
    url: '/paper/pregnancy',
    method: 'post',
    //headers: { "Content-Type": "multipart/form-data;boundary="+new Date().getTime()},
    data: data
  })
}

// 修改pregnancy
export function updatePregnancy(data) {
  return request({
    url: '/paper/pregnancy',
    method: 'put',
    data: data
  })
}

// 删除pregnancy
export function delPregnancy(id) {
  return request({
    url: '/paper/pregnancy/' + id,
    method: 'delete'
  })
}
