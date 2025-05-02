import axios from 'axios';

const API_URL = '/api/group';

export default {
    async getUserGroups() {
        return axios.get(`${API_URL}/user-groups`);
    },

    async getGroupInventory(groupId: string) {
        return axios.get(`${API_URL}/${groupId}/inventory`);
    },

    async getHouseholdInventory() {
        return axios.get(`/api/inventory`);
    },

    async shareItemToGroup(groupId: string, productId: string, batchId: string, amount: number) {
        return axios.post(`${API_URL}/${groupId}/share`, {
            productId,
            batchId,
            amount,
        });
    },

    async removeSharedItem(groupId: string, sharedItemId: string) {
        return axios.delete(`${API_URL}/${groupId}/shared/${sharedItemId}`);
    }
};
