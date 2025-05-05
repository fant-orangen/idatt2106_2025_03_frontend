import api from '@/services/api/AxiosInstance';


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
