import axios from '@/utils/axiosRequest'

export interface UpdateSlidesRequest {
  'prompt': string,
  'ppt_xml': string,
}

export const update_slides = (params: UpdateSlidesRequest) => {
  return axios.post<object>('/update_slides', params)
}