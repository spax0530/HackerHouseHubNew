/**
 * OpenAI API utility functions for enhancing house listings
 */

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || ''

interface EnhanceTextOptions {
  text: string
  context?: 'description' | 'amenities'
}

/**
 * Enhances house listing text using OpenAI API
 */
export async function enhanceText({ text, context = 'description' }: EnhanceTextOptions): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your environment variables.')
  }

  if (!text.trim()) {
    throw new Error('Text cannot be empty')
  }

  const prompt = context === 'description'
    ? `You are helping a host write a compelling description for their hacker house listing. Improve and expand the following description to make it more engaging, professional, and appealing to potential residents. Keep it authentic and don't add false information. Return only the improved description, no additional commentary:\n\n${text}`
    : `You are helping a host write amenities for their hacker house listing. Improve and expand the following amenities list to make it more comprehensive and appealing. Keep it accurate and don't add amenities that don't exist. Return only the improved amenities list, formatted as a clear list:\n\n${text}`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const enhancedText = data.choices?.[0]?.message?.content?.trim()

    if (!enhancedText) {
      throw new Error('No response from OpenAI API')
    }

    return enhancedText
  } catch (error: any) {
    if (error.message.includes('API key')) {
      throw error
    }
    throw new Error(`Failed to enhance text: ${error.message || 'Unknown error'}`)
  }
}

