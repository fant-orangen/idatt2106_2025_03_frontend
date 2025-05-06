import type { Page } from '../../types/Page';
import api from './AxiosInstance';
import type { GroupSummary, ContributedProductTypesRequest, ContributedProductBatchesRequest, AddBatchToGroupRequest } from '@/models/Group';
import type { Household } from '@/models/Household';
import type { ProductType, ProductBatch } from '@/models/Product';
import type { AxiosError } from 'axios';

// TODO: check that all these API functions are using the correct models
class GroupService {
  /**
   * Get all groups associated with the current user's household (paginated)
   * @param page page number (0-based)
   * @param size page size
   * @returns Promise containing a page of group summaries
   */
  async getCurrentUserGroups(page: number = 0, size: number = 20): Promise<Page<GroupSummary>> {
    try {
      const response = await api.get('/user/groups/current', {
        params: {
          page,
          size
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching current user groups:', error);
      throw error;
    }
  }

  /**
   * Remove the current user's household from a group
   * @param groupId The ID of the group to leave
   */
  async leaveGroup(groupId: number): Promise<void> {
    try {
      await api.patch(`/user/groups/leave/${groupId}`);
    } catch (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
  }

  /**
   * Get all households that are currently members of a group
   * @param groupId The ID of the group
   * @returns Promise containing a list of households
   */
  async getCurrentHouseholdsInGroup(groupId: number): Promise<Household[]> {
    try {
      const response = await api.get(`/user/groups/${groupId}/households`);
      return response.data;
    } catch (error) {
      console.error('Error fetching households in group:', error);
      throw error;
    }
  }

  /**
   * Get all product types with batches contributed to a group and category
   * @param request Object containing groupId and category
   * @param page page number (0-based)
   * @param size page size
   * @returns Promise containing a page of product types
   */
  async getContributedProductTypes(
    request: ContributedProductTypesRequest,
    page: number = 0,
    size: number = 20
  ): Promise<Page<ProductType>> {
    try {
      const response = await api.get('/user/groups/inventory/product-types', {
        params: {
          groupId: request.groupId,
          category: request.category,
          page,
          size
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching contributed product types:', error);
      throw error;
    }
  }

  /**
   * Get all product batches for a given product type that are contributed to a group
   * @param request Object containing groupId and productTypeId
   * @param page page number (0-based)
   * @param size page size
   * @returns Promise containing a page of product batches
   */
  async getContributedProductBatches(
    request: ContributedProductBatchesRequest,
    page: number = 0,
    size: number = 20
  ): Promise<Page<ProductBatch>> {
    try {
      const response = await api.get('/user/groups/inventory/product-types/batches', {
        params: {
          groupId: request.groupId,
          productTypeId: request.productTypeId,
          page,
          size
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching contributed product batches:', error);
      throw error;
    }
  }

  /**
   * Remove a contributed product batch from a group
   * @param productBatchId The ID of the product batch to remove
   * @returns Promise that resolves when the batch is removed
   * @throws Error if the batch is contributed to more than one group
   */
  async removeContributedBatch(productBatchId: number): Promise<void> {
    try {
      await api.patch(`/user/groups/inventory/product-batches/${productBatchId}`);
    } catch (error) {
      if ((error as AxiosError)?.response?.status === 409) {
        throw new Error('This product batch is being contributed to more than one group.');
      }
      console.error('Error removing contributed batch:', error);
      throw error;
    }
  }

  /**
   * Add a product batch to a group
   * @param request Object containing batchId and groupId
   * @returns Promise that resolves when the batch is added
   * @throws Error if the user is not a member of the group or if the batch cannot be added
   */
  async addBatchToGroup(request: AddBatchToGroupRequest): Promise<void> {
    try {
      await api.post('/user/groups/inventory', request);
    } catch (error) {
      if ((error as AxiosError)?.response?.status === 403) {
        throw new Error('You are not a member of this group.');
      } else if ((error as AxiosError)?.response?.status === 409) {
        throw new Error('Batch could not be added to group.');
      }
      console.error('Error adding batch to group:', error);
      throw error;
    }
  }

  /**
   * Search for product types that have at least one batch contributed to the specified group by the current user's household.
   * @param groupId The ID of the group to search within
   * @param search The search term to filter product types by name
   * @param page page number (0-based)
   * @param size page size
   * @returns Promise containing a page of product types matching the search criteria
   */
  async searchContributedProductTypes(
    groupId: number,
    search: string,
    page: number = 0,
    size: number = 20
  ): Promise<Page<ProductType>> {
    try {
      const response = await api.get('/user/groups/inventory/product-types/search', {
        params: {
          groupId,
          search,
          page,
          size
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching contributed product types:', error);
      throw error;
    }
  }
}

export const groupService = new GroupService();

// TODO: remove this when everything is set up
export default {
  async getUserGroups() {
      return api.get(`/user/user-groups`);
  },

  async getGroupInventory(groupId: string) {
      return api.get(`/user/${groupId}/inventory`);
  },

  async getHouseholdInventory() {
      return api.get(`/user/api/inventory`);
  },

  async shareItemToGroup(groupId: string, productId: string, batchId: string, amount: number) {
      return api.post(`/user/${groupId}/share`, {
          productId,
          batchId,
          amount,
      });
  },

  async removeSharedItem(groupId: string, sharedItemId: string) {
      return api.delete(`/user/${groupId}/shared/${sharedItemId}`);
  }
};
