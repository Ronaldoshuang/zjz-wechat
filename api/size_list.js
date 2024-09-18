import request from './request'
import request1 from './request1'

export const listPhotoSize = (data) => request1.get('/photo_size', data)
export const listRecommendPhotoSize = () => request.get('/api/v1/photo_size/recommend', {})  
export const listCategoryPhotoSize = () => request.get('/api/v1/photo_size/category', {})



