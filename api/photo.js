import request from './request'
import request1 from './request1'

export const generateAlphaPhoto = (data) => request.post('/api/v1/photo/generate_alpha', data)
export const generateBase64AlphaPhoto = (data) => request.post('/api/v1/photo/generate_base64_alpha', data)
export const addBg = (data) => request.post('/api/v1/photo/add_bg', data)


/******************新写接口******************************/
/**
 * 测试接口 可以跑通
 */
export const test = () => request.get('/test')


export const idphoto = (data) => request1.post('/idphoto', data)