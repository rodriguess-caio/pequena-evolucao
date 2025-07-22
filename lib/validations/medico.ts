import { z } from 'zod'

export const medicoSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres'),
  especialidade: z.string().min(2, 'Especialidade deve ter pelo menos 2 caracteres').max(100, 'Especialidade deve ter no máximo 100 caracteres'),
  crm: z.string().optional(),
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos').max(15, 'Telefone deve ter no máximo 15 dígitos'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  endereco: z.string().max(200, 'Endereço deve ter no máximo 200 caracteres').optional().or(z.literal('')),
})

export const medicoUpdateSchema = medicoSchema.extend({
  id: z.string().uuid('ID deve ser um UUID válido'),
})

export type MedicoFormData = z.infer<typeof medicoSchema>
export type MedicoUpdateFormData = z.infer<typeof medicoUpdateSchema> 