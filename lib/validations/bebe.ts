import { z } from 'zod'

export const bebeSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres'),
  data_nascimento: z.string().refine((date) => {
    const parsedDate = new Date(date)
    const today = new Date()
    return parsedDate <= today && parsedDate > new Date('1900-01-01')
  }, 'Data de nascimento deve ser uma data válida e não pode ser no futuro'),
  tipo_sanguineo: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], {
    errorMap: () => ({ message: 'Tipo sanguíneo deve ser um dos valores válidos' })
  }),
  local_nascimento: z.string().min(2, 'Local de nascimento deve ter pelo menos 2 caracteres').max(200, 'Local de nascimento deve ter no máximo 200 caracteres'),
  nome_pai: z.string().min(2, 'Nome do pai deve ter pelo menos 2 caracteres').max(100, 'Nome do pai deve ter no máximo 100 caracteres'),
  nome_mae: z.string().min(2, 'Nome da mãe deve ter pelo menos 2 caracteres').max(100, 'Nome da mãe deve ter no máximo 100 caracteres'),
  nome_avo_paterno: z.string().min(2, 'Nome do avô paterno deve ter pelo menos 2 caracteres').max(100, 'Nome do avô paterno deve ter no máximo 100 caracteres').optional(),
  nome_avo_materno: z.string().min(2, 'Nome da avó materna deve ter pelo menos 2 caracteres').max(100, 'Nome da avó materna deve ter no máximo 100 caracteres').optional(),
})

export const bebeUpdateSchema = bebeSchema.extend({
  id: z.string().uuid('ID deve ser um UUID válido'),
})

export type BebeFormData = z.infer<typeof bebeSchema>
export type BebeUpdateFormData = z.infer<typeof bebeUpdateSchema> 