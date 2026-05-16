import axios, { AxiosInstance, AxiosResponse } from 'axios';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface User {
  id: string;
  email: string;
  name: string;
}

interface CreateRoomResponse {
  roomId: string;
}

interface FileUploadResponse {
  url: string;
  fileId: string;
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor to handle token refresh if needed
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            await this.refreshToken();
            return this.api(originalRequest);
          } catch (refreshError) {
            // Redirect to login page
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  async login(credentials: LoginCredentials): Promise<User> {
    const response: AxiosResponse<User> = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async register(data: RegisterData): Promise<User> {
    const response: AxiosResponse<User> = await this.api.post('/auth/register', data);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
  }

  async refreshToken(): Promise<void> {
    await this.api.post('/auth/refresh');
  }

  async getProfile(): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get('/users/profile');
    return response.data;
  }

  async createRoom(): Promise<CreateRoomResponse> {
    const response: AxiosResponse<CreateRoomResponse> = await this.api.post('/rooms');
    return response.data;
  }

  async joinRoom(roomId: string): Promise<void> {
    await this.api.post(`/rooms/${roomId}/join`);
  }

  async leaveRoom(roomId: string): Promise<void> {
    await this.api.post(`/rooms/${roomId}/leave`);
  }

  async uploadFile(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response: AxiosResponse<FileUploadResponse> = await this.api.post(
      '/files/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data;
  }

  async getFileDownloadUrl(fileId: string): Promise<string> {
    const response: AxiosResponse<{ url: string }> = await this.api.get(`/files/${fileId}`);
    return response.data.url;
  }
}

export default new ApiService();
