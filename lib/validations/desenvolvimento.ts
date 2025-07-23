import { z } from 'zod'

export const desenvolvimentoSchema = z.object({
  bebe_id: z.string().uuid('ID do bebê deve ser um UUID válido'),
  data_medicao: z.string().refine((date) => {
    const parsedDate = new Date(date)
    const today = new Date()
    today.setHours(23, 59, 59, 999) // End of today
    return parsedDate <= today
  }, 'Data da medição deve ser hoje ou uma data passada'),
  peso_kg: z.number().min(0.5, 'Peso deve ser pelo menos 0.5 kg').max(50.0, 'Peso deve ser no máximo 50.0 kg'),
  comprimento_cm: z.number().min(30, 'Comprimento deve ser pelo menos 30 cm').max(200, 'Comprimento deve ser no máximo 200 cm'),
  observacoes: z.string().max(500, 'Observações devem ter no máximo 500 caracteres').optional().or(z.literal('')),
})

export const desenvolvimentoUpdateSchema = desenvolvimentoSchema.extend({
  id: z.string().uuid('ID deve ser um UUID válido'),
})

export type DesenvolvimentoFormData = z.infer<typeof desenvolvimentoSchema>
export type DesenvolvimentoUpdateFormData = z.infer<typeof desenvolvimentoUpdateSchema> 