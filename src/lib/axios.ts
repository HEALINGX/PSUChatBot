import axios, { type AxiosInstance, AxiosError, type InternalAxiosRequestConfig } from 'axios';

// 1. ตรวจสอบชื่อตัวแปร Environment (Vite ต้องขึ้นต้นด้วย VITE_)
// เช่น VITE_DIFY_BASE_URL, VITE_DIFY_API_KEY
const baseURL = import.meta.env.VITE_DIFY_BASE_URL || 'https://api.dify.ai/v1';
const apiKey = import.meta.env.VITE_DIFY_API_KEY; 

const api: AxiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    // 2. ใส่ Dify API Key ตรงนี้ (และห้ามให้ Interceptor มาเปลี่ยน)
    'Authorization': `Bearer ${apiKey}` 
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    
    // ❌ ลบส่วนนี้ออก หรือ เช็คเงื่อนไข
    // ถ้าเรายิงไปหา Dify เราไม่ต้องการ User Token ใน Header Authorization
    // Dify ต้องการแค่ API Key เท่านั้น
    
    // แต่สิ่งที่เราต้องทำคือ "ส่ง User ID" ไปใน Body แทน (ในหน้าเรียกใช้ API)
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor (ส่วนนี้ใช้ได้ เก็บไว้ handle error)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle errors
    if (error.response?.status === 401) {
       console.error("Dify API Key ผิด หรือ หมดอายุ");
    }
    return Promise.reject(error);
  }
);

export default api;