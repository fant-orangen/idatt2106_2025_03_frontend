/**
 * Interface representing Point of Interest data returned from the backend.
 * Based on the PoiItemDto.java DTO.
 */
export interface PoiData {
  openFrom: string;
  openTo: string;
  id: number;
  poiTypeId: number;
  poiTypeName: string;
  name: string;
  description?: string | null; // Optional properties based on DTO
  latitude: number;
  longitude: number;
  address?: string | null;
  openingHours?: string | null;
  contactInfo?: string | null;
  createdAt: string; // Typically ISO string format
  updatedAt: string; // Typically ISO string format
}
