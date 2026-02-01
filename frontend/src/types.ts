export type UserRole = 'user' | 'manager' | 'administrator';

export interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  role: UserRole;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  category?: string;
  parent_id?: string;
  created_at: string;
}

export type LocationStatus = 'visited' | 'planned' | 'archived';

export interface Location {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  status: LocationStatus;
  visit_date?: string;
  created_at: string;
  updated_at: string;
  photos: Photo[];
  blog_entries: BlogEntry[];
  finds: Find[];
  tags: Tag[];
}

export interface LocationListItem {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: LocationStatus;
  visit_date?: string;
  photo_count: number;
  created_at: string;
  tags: Tag[];
}

export interface LocationCreate {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  status?: LocationStatus;
  visit_date?: string;
  tag_ids?: string[];
}

export interface Photo {
  id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  thumbnail_path?: string;
  file_size?: number;
  width?: number;
  height?: number;
  uploaded_at: string;
}

export interface BlogEntry {
  id: string;
  title?: string;
  content?: string;
  content_html?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogEntryCreate {
  location_id: string;
  title?: string;
  content: string;
  content_html?: string;
}

export interface Find {
  id: string;
  name: string;
  mineral_type?: string;
  description?: string;
  quantity: number;
  found_date?: string;
  created_at: string;
  tags: Tag[];
}

export interface FindCreate {
  location_id: string;
  name: string;
  mineral_type?: string;
  description?: string;
  quantity?: number;
  found_date?: string;
  tag_ids?: string[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  role?: UserRole;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  full_name?: string;
  is_active?: boolean;
  role?: UserRole;
}

export interface TagCreate {
  name: string;
  category?: string;
  parent_id?: string;
}

export interface TagUpdate {
  name?: string;
  category?: string;
  parent_id?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export type ExportFormat = 'geojson' | 'kml' | 'csv' | 'zip';

export interface ExportRequest {
  format: ExportFormat;
  status_filter?: LocationStatus[];
  date_from?: string;
  date_to?: string;
}
