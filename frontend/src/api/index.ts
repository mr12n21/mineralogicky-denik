import api from './axios';
import { API_ENDPOINTS } from '../config';
import {
  LoginCredentials,
  UserCreate,
  UserUpdate,
  AuthResponse,
  User,
  Location,
  LocationCreate,
  LocationListItem,
  Photo,
  BlogEntry,
  BlogEntryCreate,
  Find,
  FindCreate,
  ExportRequest,
  Tag,
  TagCreate,
  TagUpdate,
} from '../types';

// Auth API
export const authAPI = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>(API_ENDPOINTS.LOGIN, credentials),
  
  getMe: () =>
    api.get<User>(API_ENDPOINTS.ME),
};

// Users API (Admin only)
export const usersAPI = {
  list: () =>
    api.get<User[]>('/api/auth/users'),
  
  create: (data: UserCreate) =>
    api.post<User>('/api/auth/users', data),
  
  update: (id: string, data: UserUpdate) =>
    api.patch<User>(`/api/auth/users/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/api/auth/users/${id}`),
};

// Tags API
export const tagsAPI = {
  list: (category?: string) =>
    api.get<Tag[]>('/api/tags', { params: { category } }),
  
  create: (data: TagCreate) =>
    api.post<Tag>('/api/tags', data),
  
  get: (id: string) =>
    api.get<Tag>(`/api/tags/${id}`),
  
  update: (id: string, data: TagUpdate) =>
    api.patch<Tag>(`/api/tags/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/api/tags/${id}`),
};

// Locations API
export const locationsAPI = {
  list: (params?: any) =>
    api.get<LocationListItem[]>(API_ENDPOINTS.LOCATIONS, { params }),
  
  create: (data: LocationCreate) =>
    api.post<Location>(API_ENDPOINTS.LOCATIONS, data),
  
  get: (id: string) =>
    api.get<Location>(API_ENDPOINTS.LOCATION_DETAIL(id)),
  
  update: (id: string, data: Partial<LocationCreate>) =>
    api.put<Location>(API_ENDPOINTS.LOCATION_DETAIL(id), data),
  
  delete: (id: string) =>
    api.delete(API_ENDPOINTS.LOCATION_DETAIL(id)),
  
  nearby: (lat: number, lon: number, radius: number) =>
    api.get<Location[]>(API_ENDPOINTS.NEARBY_LOCATIONS, {
      params: { lat, lon, radius_km: radius },
    }),
};

// Photos API
export const photosAPI = {
  upload: (locationId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<Photo>(`${API_ENDPOINTS.PHOTOS}?location_id=${locationId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  get: (id: string) =>
    api.get<Photo>(API_ENDPOINTS.PHOTO_DETAIL(id)),
  
  delete: (id: string) =>
    api.delete(API_ENDPOINTS.PHOTO_DETAIL(id)),
  
  listByLocation: (locationId: string) =>
    api.get<Photo[]>(API_ENDPOINTS.LOCATION_PHOTOS(locationId)),
};

// Blogs API
export const blogsAPI = {
  create: (data: BlogEntryCreate) =>
    api.post<BlogEntry>(API_ENDPOINTS.BLOGS, data),
  
  get: (id: string) =>
    api.get<BlogEntry>(API_ENDPOINTS.BLOG_DETAIL(id)),
  
  update: (id: string, data: Partial<BlogEntryCreate>) =>
    api.put<BlogEntry>(API_ENDPOINTS.BLOG_DETAIL(id), data),
  
  delete: (id: string) =>
    api.delete(API_ENDPOINTS.BLOG_DETAIL(id)),
  
  listByLocation: (locationId: string) =>
    api.get<BlogEntry[]>(API_ENDPOINTS.LOCATION_BLOGS(locationId)),
};

// Finds API
export const findsAPI = {
  create: (data: FindCreate) =>
    api.post<Find>(API_ENDPOINTS.FINDS, data),
  
  get: (id: string) =>
    api.get<Find>(API_ENDPOINTS.FIND_DETAIL(id)),
  
  update: (id: string, data: Partial<FindCreate>) =>
    api.put<Find>(API_ENDPOINTS.FIND_DETAIL(id), data),
  
  delete: (id: string) =>
    api.delete(API_ENDPOINTS.FIND_DETAIL(id)),
  
  listByLocation: (locationId: string) =>
    api.get<Find[]>(API_ENDPOINTS.LOCATION_FINDS(locationId)),
};

// Exports API
export const exportsAPI = {
  export: (data: ExportRequest) =>
    api.post(API_ENDPOINTS.EXPORTS, data, {
      responseType: 'blob',
    }),
};
