<template>
  <div>
    <!-- Label -->
    <label v-if="label">
      {{ label }} <span v-if="required">*</span>
    </label>

    <!-- Regular Text Input or Password Input -->
    <div v-if="type !== 'textarea'">
      <input
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :maxlength="maxlength"
        :min="min"
        :max="max"
        :pattern="pattern"
        :class="[class, { 'invalid': showError }]"
        @input="handleInput"
        @blur="handleBlur"
      />

      <!-- Password Toggle Button -->
      <button
        v-if="type === 'password'"
        type="button"
        @click.prevent="togglePasswordVisibility"
        :disabled="disabled"
      >
        {{ passwordVisible ? 'Hide' : 'Show' }}
      </button>
    </div>

    <!-- Textarea -->
    <div v-else>
      <textarea
        :id="id"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :maxlength="maxlength"
        :rows="rows"
        :class="[class, { 'invalid': showError }]"
        @input="handleInput"
        @blur="handleBlur"
      ></textarea>

      <!-- Character Count -->
      <div v-if="maxlength">
        {{ modelValue.length }} / {{ maxlength }}
      </div>
    </div>

    <!-- Validation Error Message -->
    <div v-if="showError" class="error-message">{{ validationError }}</div>

    <!-- Custom Error Message -->
    <div v-else-if="error" class="error-message">{{ error }}</div>

    <!-- Password Strength Indicator -->
    <div v-if="type === 'password' && modelValue && showPasswordStrength">
      <div>
        <div
          :style="{ width: `${passwordStrength}%` }"
        ></div>
      </div>
      <p>
        {{ passwordStrengthText }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface TextInputProps {
  modelValue?: string;
  label?: string;
  class?: string | string[] | Record<string, boolean>;
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'textarea';
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  maxlength?: number | null;
  error?: string;
  rows?: number;
  showPasswordStrength?: boolean;
  min?: number | string | null;
  max?: number | string | null;
  pattern?: string | null;
  validateOnInput?: boolean;
  validateOnBlur?: boolean;
  id?: string; // Added this as it's used in the template
}

const props = withDefaults(defineProps<TextInputProps>(), {
  modelValue: '',
  label: '',
  class: '',
  type: 'text',
  placeholder: '',
  disabled: false,
  required: false,
  maxlength: null,
  error: '',
  rows: 4,
  showPasswordStrength: true,
  min: null,
  max: null,
  pattern: null,
  validateOnInput: false,
  validateOnBlur: true
});

interface TextInputEmits {
  (e: 'update:modelValue', value: string): void;
  (e: 'blur', event: Event): void;
  (e: 'validation-error', message: string): void;
  (e: 'validation-success'): void;
}

const emit = defineEmits<TextInputEmits>();

const passwordVisible = ref(false)
const validationError = ref('')
const showError = ref(false)
const touched = ref(false)

const inputType = computed(() => {
  if (props.type === 'password') {
    return passwordVisible.value ? 'text' : 'password'
  }
  return props.type
})

const validateInput = () => {
  validationError.value = ''

  // Required validation
  if (props.required && (!props.modelValue || props.modelValue.trim() === '')) {
    validationError.value = `${props.label || 'Field'} is required`
    emit('validation-error', validationError.value)
    return false
  }

  // Skip validation if empty and not required
  if (!props.modelValue || props.modelValue.trim() === '') {
    return true
  }

  // Type-specific validations
  switch (props.type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(props.modelValue)) {
        validationError.value = 'Please enter a valid email address'
        emit('validation-error', validationError.value)
        return false
      }
      break

    case 'number':
      if (isNaN(Number(props.modelValue))) {
        validationError.value = 'Please enter a valid number'
        emit('validation-error', validationError.value)
        return false
      }

      const numValue = Number(props.modelValue)

      if (props.min !== null && numValue < props.min) {
        validationError.value = `Value must be at least ${props.min}`
        emit('validation-error', validationError.value)
        return false
      }

      if (props.max !== null && numValue > props.max) {
        validationError.value = `Value must be at most ${props.max}`
        emit('validation-error', validationError.value)
        return false
      }
      break

    case 'tel':
      const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/
      if (!phoneRegex.test(props.modelValue)) {
        validationError.value = 'Please enter a valid phone number'
        emit('validation-error', validationError.value)
        return false
      }
      break
  }

  // Custom pattern validation
  if (props.pattern) {
    try {
      const patternRegex = new RegExp(props.pattern)
      if (!patternRegex.test(props.modelValue)) {
        validationError.value = `Please match the requested format`
        emit('validation-error', validationError.value)
        return false
      }
    } catch (e) {
      console.error('Invalid regex pattern:', e)
    }
  }

  // Validation passed
  emit('validation-success')
  return true
}

const togglePasswordVisibility = () => {
  if (!props.disabled) {
    passwordVisible.value = !passwordVisible.value
  }
}

const handleInput = (e) => {
  const value = e.target.value
  emit('update:modelValue', value)

  if (props.validateOnInput && touched.value) {
    validateInput()
    showError.value = !!validationError.value
  }
}

const handleBlur = (e) => {
  touched.value = true
  emit('blur', e)

  if (props.validateOnBlur) {
    validateInput()
    showError.value = !!validationError.value
  }
}

// Password strength calculation
const passwordStrength = computed(() => {
  if (!props.modelValue || props.type !== 'password') return 0

  const password = props.modelValue
  let strength = 0

  // Length check
  if (password.length >= 8) strength += 20

  // Contains lowercase
  if (/[a-z]/.test(password)) strength += 20

  // Contains uppercase
  if (/[A-Z]/.test(password)) strength += 20

  // Contains number
  if (/[0-9]/.test(password)) strength += 20

  // Contains special character
  if (/[^A-Za-z0-9]/.test(password)) strength += 20

  return strength
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength < 40) return 'Weak'
  if (strength < 60) return 'Fair'
  if (strength < 80) return 'Good'
  return 'Strong'
})
</script>

<style scoped>
.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.invalid {
  border-color: #dc3545 !important;
  background-color: #fff8f8;
}
</style>
