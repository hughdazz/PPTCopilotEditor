/*
 * @Author: ljf@2054316
 * @Description: 
 * @Date: 2023-04-08 23:53:40
 * @LastEditTime: 2023-04-09 11:33:03
 * @FilePath: \PPTCopilot\src\api\ppt_Request_gpt.ts
 */
import axios from './index'

// ppt向gpt请求
export const get_catalog = (params: FormData) => {
  return axios.post<FormData>('/get_catalog', params)
}

export const update_slides = (params: FormData) => {
  return axios.post<object>('/update_slides', params)
}