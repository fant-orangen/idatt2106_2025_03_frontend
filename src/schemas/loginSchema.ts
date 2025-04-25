import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Ugyldig e-post"),
  password: z.string().min(6, "Passord for kort"),
})