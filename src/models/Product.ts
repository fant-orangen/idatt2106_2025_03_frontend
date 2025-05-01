export interface ProductType {
  id: number;
  name: string;
  unit: string;
  caloriesPerUnit: number;
  category: 'food' | 'water' | 'medicine';
}

export interface ProductBatch {
  id: number;
  productTypeId: number;
  dateAdded: string;
  expirationTime: string;
  number: number;
}

export type ProductUnit = 'kg' | 'l' | 'stk' | 'gram' | 'dl' | 'mcg' | 'mg' | 'dose';

export interface CreateProductTypeRequest {
  name: string;
  unit: ProductUnit;
  caloriesPerUnit: number;
  category: 'food' | 'water' | 'medicine';
}
