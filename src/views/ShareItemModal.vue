<!-- This is only a temporary file for sharing items. Will most likely not be needed. -->

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { groupService } from '@/services/api/GroupService';
const emit = defineEmits(['close', 'shared']);

// --- Types ---
interface Batch {
  id: string;
  amount: number;
  expiry: string;
}

interface Product {
  id: string;
  name: string;
  batches: Batch[];
}

// --- State ---
const inventory = ref<Product[]>([]);
const selectedProductId = ref('');
const selectedBatchId = ref('');
const amount = ref(1);

// --- Get inventory ---
onMounted(async () => {
  const res = await groupService.getHouseholdInventory();
  inventory.value = res.data; // Må ha denne strukturen!
});

// --- Choices ---
const selectedProductBatches = computed<Batch[]>(() => {
  const product = inventory.value.find((p) => p.id === selectedProductId.value);
  return product?.batches || [];
});

const selectedBatch = computed<Batch | undefined>(() =>
    selectedProductBatches.value.find((b: Batch) => b.id === selectedBatchId.value)
);

const maxAmount = computed(() => selectedBatch.value?.amount || 0);

const canShare = computed(() =>
    selectedProductId.value && selectedBatchId.value && amount.value > 0 && amount.value <= maxAmount.value
);

// --- Share ---
async function handleShare() {
  const groupId = await groupService.getUserGroups().then(res => res.data?.[0]?.groupId);
  if (!groupId) return;

  await groupService.shareItemToGroup(groupId, selectedProductId.value, selectedBatchId.value, amount.value);
  emit('shared');
  emit('close');
}
</script>
