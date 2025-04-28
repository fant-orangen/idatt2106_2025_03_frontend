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
