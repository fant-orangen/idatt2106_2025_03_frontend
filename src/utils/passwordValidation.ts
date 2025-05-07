import * as z from 'zod'

export const getPasswordValidationSchema = (t: (key: string) => string) =>
  z
    .string()
    .min(8, t('reset-password.password-req-len'))
    .regex(/[A-Z]/, t('reset-password.password-req-upper'))
    .regex(/[a-z]/, t('reset-password.password-req-lower'))
    .regex(/[0-9]/, t('reset-password.password-req-number'))
    .regex(/[\W_]/, t('reset-password.password-req-special'));
