import request from './request'
import request1 from "./request1";

// export const login = (data) => request.post('/api/v1/login', data)

export const login = (data) => request1.get('/login', data)