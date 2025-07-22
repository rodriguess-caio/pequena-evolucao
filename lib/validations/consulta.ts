import { z } from 'zod'

export const consultaSchema = z.object({
  bebe_id: z.string().uuid('ID do bebê deve ser um UUID válido'),
  medico_id: z.string().uuid('ID do médico deve ser um UUID válido'),
  data_consulta: z.string().refine((date) => {
    const parsedDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return parsedDate >= today
  }, 'Data da consulta deve ser hoje ou uma data futura'),
  hora_consulta: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora deve estar no formato HH:MM'),
  local: z.string().min(2, 'Local deve ter pelo menos 2 caracteres').max(200, 'Local deve ter no máximo 200 caracteres'),
  anotacoes: z.string().max(500, 'Anotações devem ter no máximo 500 caracteres').optional().or(z.literal('')),
  status: z.enum(['agendada', 'realizada', 'cancelada', 'remarcada']).default('agendada'),
})

export const consultaUpdateSchema = consultaSchema.extend({
  id: z.string().uuid('ID deve ser um UUID válido'),
})

export type ConsultaFormData = z.infer<typeof consultaSchema>
export type ConsultaUpdateFormData = z.infer<typeof consultaUpdateSchema> 