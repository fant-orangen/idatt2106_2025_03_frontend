export interface GroupSummary {
  id: number;
  name: string;
  createdByUserId: number;
  createdAt: string;
}

export interface Household {
  id: number;
  name: string;
  address: string;
  populationCount: number;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

export interface ContributedProductTypesRequest {
  groupId: number;
}

export interface ContributedProductBatchesRequest {
  groupId: number;
  productTypeId: number;
}

export interface AddBatchToGroupRequest {
  batchId: number;
  groupId: number;
}
