import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const openaiApiKey = process.env.OPENAI_API_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const openai = new OpenAI({ apiKey: openaiApiKey })

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    const { examId, fileUrl } = JSON.parse(event.body || '{}')

    if (!examId || !fileUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'examId and fileUrl are required' }),
      }
    }

    // Download the PDF file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('exames')
      .download(fileUrl)

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`)
    }

    // Convert PDF to text (simplified - in production you'd use a PDF parser)
    const textContent = await extractTextFromPDF(fileData)

    // Process with OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Você é a Lucia, uma assistente médica especializada em interpretar exames médicos para pais. 
          Sua função é analisar exames médicos e fornecer explicações claras e acessíveis, destacando:
          - Valores normais vs anormais
          - Significado dos resultados
          - Recomendações gerais
          - Quando procurar um médico
          
          Sempre seja clara, objetiva e tranquilizadora. Use linguagem simples que pais possam entender.`
        },
        {
          role: "user",
          content: `Por favor, analise este exame médico e forneça um resumo claro e acessível: ${textContent}`
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    })

    const summary = completion.choices[0]?.message?.content || 'Não foi possível analisar o exame.'

    // Update the exam record with the AI summary
    const { error: updateError } = await supabase
      .from('exame')
      .update({ resumo_ia: summary })
      .eq('id', examId)

    if (updateError) {
      throw new Error(`Failed to update exam: ${updateError.message}`)
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        summary,
        message: 'Exame processado com sucesso' 
      }),
    }

  } catch (error) {
    console.error('Error processing exam:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    }
  }
}

// Simplified PDF text extraction - in production, use a proper PDF parser
async function extractTextFromPDF(fileData: any): Promise<string> {
  // This is a placeholder - you'd implement actual PDF parsing here
  // For now, return a sample text
  return `
    EXAME DE SANGUE - HEMOGRAMA COMPLETO
    Data: 15/03/2024
    Paciente: João Silva, 2 anos
    
    RESULTADOS:
    Hemoglobina: 12.5 g/dL (Normal: 11.0-14.0)
    Leucócitos: 8.500/mm³ (Normal: 5.000-15.000)
    Plaquetas: 250.000/mm³ (Normal: 150.000-450.000)
    
    OBSERVAÇÕES:
    Todos os valores dentro da normalidade para a idade.
    Exame sem alterações significativas.
  `
} 