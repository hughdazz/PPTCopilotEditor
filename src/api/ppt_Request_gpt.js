import axios from '@/utils/axiosRequest';
export const update_slides = (params) => {
    return axios.post('/gpt/update_slide', params);
};
export const guide_slide = (params) => {
    return axios.post('/gpt/guide_slide', params);
};
//# sourceMappingURL=ppt_Request_gpt.js.map