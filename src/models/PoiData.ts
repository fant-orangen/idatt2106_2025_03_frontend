/**
 * Interface representing Point of Interest data returned from the backend.
 * Based on the PoiItemDto.java DTO.
 */
export interface PoiData {
  id: number;
  poiTypeId: number;
  poiTypeName: string;
  name: string;
  description?: string | null; // Optional properties based on DTO
  latitude: number;
  longitude: number;
  address?: string | null;
  openFrom?: string;
  openTo?: string;
  contactInfo?: string;
  createdAt: string; // Typically ISO string format
  updatedAt: string; // Typically ISO string format
}

export interface PoiPreviewDto {
  id : number;
  name : string;
  type : string;
}

export interface UpdatePoiDto {
  name: string;
  latitude: number;
  longitude: number;
  description: string | null;
  openFrom?: string;
  openTo?: string;
  contactInfo: string;
  poiTypeId: number;
}
