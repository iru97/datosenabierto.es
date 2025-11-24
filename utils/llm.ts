/**
 * LLM Utility - Abstracción para usar OpenAI o Anthropic
 *
 * Soporta ambos proveedores con la misma interfaz
 */

// ================================================================
// TIPOS
// ================================================================

export interface LLMResponse {
  contenido: string
  tokens_usados: number
  tokens_input: number
  tokens_output: number
  modelo_usado: string
}

export interface LLMConfig {
  model: string
  max_tokens: number
  temperature?: number
}

// ================================================================
// CONFIGURACIÓN
// ================================================================

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''

// Determinar qué proveedor usar
const USE_OPENAI = !!OPENAI_API_KEY
const USE_ANTHROPIC = !!ANTHROPIC_API_KEY && !USE_OPENAI

if (!USE_OPENAI && !USE_ANTHROPIC) {
  console.warn('⚠️ No LLM API key found. Set either OPENAI_API_KEY or ANTHROPIC_API_KEY')
}

// Modelos recomendados
export const MODELS = {
  OPENAI_MINI: 'gpt-4o-mini', // ~$0.15/1M input, $0.60/1M output (MÁS BARATO)
  OPENAI_STANDARD: 'gpt-4o', // ~$2.50/1M input, $10/1M output
  CLAUDE_HAIKU: 'claude-3-5-haiku-20241022', // ~$1/1M input, $5/1M output
  CLAUDE_SONNET: 'claude-3-5-sonnet-20241022', // ~$3/1M input, $15/1M output
} as const

// Default config
const DEFAULT_MODEL = USE_OPENAI ? MODELS.OPENAI_MINI : MODELS.CLAUDE_HAIKU
const DEFAULT_MAX_TOKENS = 1024

// ================================================================
// CLIENTE OPENAI
// ================================================================

async function generateWithOpenAI(
  prompt: string,
  config: LLMConfig
): Promise<LLMResponse> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: config.max_tokens,
      temperature: config.temperature || 0.7,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${response.status} - ${error}`)
  }

  const data = await response.json()

  return {
    contenido: data.choices[0].message.content,
    tokens_usados: data.usage.total_tokens,
    tokens_input: data.usage.prompt_tokens,
    tokens_output: data.usage.completion_tokens,
    modelo_usado: config.model,
  }
}

// ================================================================
// CLIENTE ANTHROPIC
// ================================================================

async function generateWithAnthropic(
  prompt: string,
  config: LLMConfig
): Promise<LLMResponse> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: config.max_tokens,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: config.temperature || 0.7,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Anthropic API error: ${response.status} - ${error}`)
  }

  const data = await response.json()

  return {
    contenido: data.content[0].text,
    tokens_usados: data.usage.input_tokens + data.usage.output_tokens,
    tokens_input: data.usage.input_tokens,
    tokens_output: data.usage.output_tokens,
    modelo_usado: config.model,
  }
}

// ================================================================
// FUNCIÓN PRINCIPAL
// ================================================================

/**
 * Genera texto con el LLM configurado (OpenAI o Anthropic)
 *
 * @example
 * const response = await generateText('Explica qué es el BOE')
 * console.log(response.contenido)
 */
export async function generateText(
  prompt: string,
  options: Partial<LLMConfig> = {}
): Promise<LLMResponse> {
  const config: LLMConfig = {
    model: options.model || DEFAULT_MODEL,
    max_tokens: options.max_tokens || DEFAULT_MAX_TOKENS,
    temperature: options.temperature,
  }

  if (USE_OPENAI) {
    return generateWithOpenAI(prompt, config)
  } else if (USE_ANTHROPIC) {
    return generateWithAnthropic(prompt, config)
  } else {
    throw new Error('No LLM API key configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY')
  }
}

/**
 * Obtiene información sobre el proveedor actual
 */
export function getLLMProvider() {
  if (USE_OPENAI) return 'OpenAI'
  if (USE_ANTHROPIC) return 'Anthropic'
  return 'None'
}

/**
 * Obtiene el modelo actual en uso
 */
export function getCurrentModel() {
  return DEFAULT_MODEL
}

/**
 * Calcula el costo estimado de una llamada
 */
export function estimateCost(
  tokens_input: number,
  tokens_output: number,
  model: string = DEFAULT_MODEL
): number {
  // Precios por 1M tokens
  const PRICING: Record<string, { input: number; output: number }> = {
    [MODELS.OPENAI_MINI]: { input: 0.15, output: 0.60 },
    [MODELS.OPENAI_STANDARD]: { input: 2.50, output: 10.00 },
    [MODELS.CLAUDE_HAIKU]: { input: 1.00, output: 5.00 },
    [MODELS.CLAUDE_SONNET]: { input: 3.00, output: 15.00 },
  }

  const pricing = PRICING[model] || PRICING[MODELS.OPENAI_MINI]

  const inputCost = (tokens_input / 1_000_000) * pricing.input
  const outputCost = (tokens_output / 1_000_000) * pricing.output

  return inputCost + outputCost
}

// ================================================================
// LOG DE CONFIGURACIÓN
// ================================================================

if (USE_OPENAI) {
  console.log(`✅ LLM Provider: OpenAI (${DEFAULT_MODEL})`)
  console.log(`💰 Cost: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens`)
} else if (USE_ANTHROPIC) {
  console.log(`✅ LLM Provider: Anthropic (${DEFAULT_MODEL})`)
  console.log(`💰 Cost: ~$1 per 1M input tokens, ~$5 per 1M output tokens`)
}
