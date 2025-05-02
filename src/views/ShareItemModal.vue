<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import GroupService from '@/services/api/GroupService';
const emit = defineEmits(['close', 'shared']);

// --- TYPPER ---
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

// --- STATE ---
const inventory = ref<Product[]>([]);
const selectedProductId = ref('');
const selectedBatchId = ref('');
const amount = ref(1);

// --- HENT INVENTAR ---
onMounted(async () => {
  const res = await GroupService.getHouseholdInventory();
  inventory.value = res.data; // Må ha denne strukturen!
});

// --- VALG ---
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

// --- DEL VARER ---
async function handleShare() {
  const groupId = await GroupService.getUserGroups().then(res => res.data?.[0]?.groupId);
  if (!groupId) return;

  await GroupService.shareItemToGroup(groupId, selectedProductId.value, selectedBatchId.value, amount.value);
  emit('shared');
  emit('close');
}
</script>
