<template>
  <div class="min-h-screen p-6 bg-background text-foreground flex flex-col items-center dark">
    <div class="w-full max-w-5xl border border-blue-500 p-6 bg-card rounded-lg space-y-6">
      <!-- Header -->
      <div class="grid grid-cols-5 text-sm font-semibold text-foreground/80 px-1">
        <div>{{ t('item') }}</div>
        <div class="text-center">{{ $t('calories') }}</div>
        <div class="text-center">{{ $t('amount') }}</div>
        <div class="text-center">{{ $t('unit') }}</div>
        <div class="text-right">{{ $t('expires-in') }}</div>
        <div></div> <!-- Empty field for edit-button -->
      </div>

      <! -- Inventory list -->
      <div class="space-y-4">
        <
          v-for="(item, index) in items"
          :key="index"
          class="grid grid-cols-6 gap-3 items-center"
          >

          <!-- Item -->
          <div class="bg-secondary py-3 px-4 rounded-md">{{item.name}} </div>

          <!-- Calories -->
          <input
            v-if="item.edit"
            v-model="item.calories"
            class="bg-secondary text-foreground py-3 px-4 text-center rounded-md w-full"
            />
          <div v-else class="bg-secondary py-3 px-4 text-center rounded-md">{{item.calories}}</div>

          <!-- Amount -->
          <select
            v-if="item.edit"
            v-model="item.amount"
            class="bg-secondary text-foreground py-3 px-4 text-center rounded-md w-full">

            <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
          </select>
          <div v-else class="bg-secondary py-3 px-4 text-center rounded-md">{{ item.amount }}</div>

          <!-- Unit -->
          <select
            v-if="item-edit"
            v-model="item.unit"
            class="bg-secondary text-foreground py-3 px-4 text-center rounded-md w-full">
            <option value="L">L</option>
            <option value="kg">kg</option>
            <option value="stk">stk</option>
            <option value="poser">poser</option>
          </select>
          <div v-else class="bg-secondary py-3 px-4 text-center rounded-md">{{ item.unit }}</div>

          <!-- Expiration -->
          <input
            v-if="item.edit"
            v-model="item.expires"
            class="bg-secondary text-foreground py-3 px-4 text-center rounded-md w-full"
        />
        <div v-else class="bg-secondary py-3 px-4 text-center rounded-md">{{ item.expires }}</div>

        <!-- Edit/Save -->
        <div class="text-right">
          <button
            @click="toggleEdit(index)"
          class="text-white underline underline-offset-2"
            >
            {{ item.edit ? $t('save') : $t('edit')}}
          </button>
        </div>
      </div>
    </div>

    <!-- Add new item -->
    <div class="pt-6">
      <button @click="addNewItem" class="text-sm text-blue-400 hover:underline">
        + {{ $t('add-item')}}
      </button>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const items = ref([
  {
    name: 'Vann',
    calories: '0',
    amount: '8',
    unit: 'L',
    expires: '11mnd',
    edit: false
  },
  {
    name: 'Havregryn',
    calories: '389',
    amount: '2',
    unit: 'kg',
    expires: '1,4år',
    edit: false
  },
  {
    name: 'Bønner (hermetisert)',
    calories: '110',
    amount: '4',
    unit: 'stk',
    expires: '3år',
    edit: false
  }
])

function toggleEdit(index) {
  items.value[index].edit = !items.value[index].edit
}

function addNewItem() {
  items.value.push({
    name: 'Ny vare',
    calories: '',
    amount: '1',
    unit: 'stk',
    expires: '',
    edit: true
  })
}
</script>







