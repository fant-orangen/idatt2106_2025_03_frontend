<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { PinInputGroup, PinInputInput, PinInput } from '@/components/ui/pin-input'
import { useUserStore } from '@/stores/UserStore'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'

const props = defineProps<{
  isOpen: boolean
  email: string
}>()

const emits = defineEmits(['close', 'verify'])
const userStore = useUserStore()

const { t } = useI18n()

// Local state for the dialog's open state
const localIsOpen = ref(props.isOpen)

// Watch for changes in the `isOpen` prop and update the local state
watch(
  () => props.isOpen,
  (newValue) => {
    localIsOpen.value = newValue
  },
)

const pinValue = ref<string[]>([])

async function handleComplete() {
  const pinAsNumber = Number(pinValue.value.join(''))
  console.log('Pin value:', pinAsNumber)
  emits('verify', pinAsNumber)
}

async function handleReSend2FAEmail() {
  try {
    await userStore.send2FACodeToEmail(props.email) // Call the store or service to send the email
    toast.success(t('login.2fa-email-sent'))
  } catch (error) {
    console.error('Failed to send 2FA email:', error)
    toast.error(t('errors.2fa-email-failed'))
  }
}
</script>

<template>
  <Dialog
    v-model:open="localIsOpen"
    @onOpenChange="
      (localIsOpen: boolean) => {
        if (!localIsOpen) emits('close')
      }
    "
  >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ $t('login.2fa-login-title') }}</DialogTitle>
        <DialogDescription>{{ $t('login.2fa-login-description') }}</DialogDescription>
      </DialogHeader>
      <PinInput
        id="pin-input"
        v-model="pinValue"
        placeholder="○"
        class="flex justify-center items-center gap-2"
        @complete="handleComplete"
      >
        <PinInputGroup>
          <PinInputInput v-for="(id, index) in 6" :key="id" :index="index" />
        </PinInputGroup>
      </PinInput>
      <DialogFooter>
        <Button @click="handleReSend2FAEmail()">
          {{ $t('login.resend-2fa-email', 'Send ny kode') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
