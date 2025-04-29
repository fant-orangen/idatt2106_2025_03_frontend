export interface ProductType {
  id: number;
  name: string;
  unit: string;
  caloriesPerUnit: number;
  isWater: boolean;
}

export interface ProductBatch {
  id: number;
  productTypeId: number;
  dateAdded: string;
  expirationTime: string;
  number: number;
}

export type ProductUnit = 'kg' | 'l' | 'stk' | 'gram' | 'dl';

export interface CreateProductTypeRequest {
  name: string;
  unit: ProductUnit;
  caloriesPerUnit: number;
  isWater: boolean;
}
