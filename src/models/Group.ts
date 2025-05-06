export interface GroupSummary {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Household {
  id: number;
  name: string;
  memberCount: number;
}

export interface ContributedProductTypesRequest {
  groupId: number;
  category: 'food' | 'water' | 'medicine';
}

export interface ContributedProductBatchesRequest {
  groupId: number;
  productTypeId: number;
}

export interface AddBatchToGroupRequest {
  batchId: number;
  groupId: number;
}
