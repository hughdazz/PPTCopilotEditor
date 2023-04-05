import axios from './index'

// ppt请求表单
export interface catalog_ReqForm {
  prompt: string;
  user_name: string;
}

// 返回的res
export interface catalog_ResData {
  data: string;
}

// // ppt请求表单
// export interface catalog_ReqForm {
//   prompt: string;
//   user_name: string;
// }

// // 返回的res
// export interface catalog_ResData {
//   data: string;
// }

// ppt向gpt请求
export const get_catalog = (params: catalog_ReqForm) => {
  // 返回的数据格式可以和服务端约定
  // let d: catalog_ResData = {
  //   data: 'none-receive-response'
  // }
  return axios.post<catalog_ResData>('/get_catalog', params)

  //   .then((response) => {
  //   res = response as unknown as catalog_ResData
  //   // console.log('1', response)
  // }).catch((error) => {
  //   console.error('An error occurred:', error)
  //   return error
  // })
  // return d
}

// // ppt向gpt请求
// export const get_detail = (params: pptTogpt_ReqForm) => {
//   // 返回的数据格式可以和服务端约定
//   return axios.post<gptToppt_ResData>('/get_detail', params)
// }

