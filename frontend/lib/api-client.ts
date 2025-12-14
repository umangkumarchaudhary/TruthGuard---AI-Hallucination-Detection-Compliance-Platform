// Determine API URL:
// 1. Use NEXT_PUBLIC_API_URL if set (highest priority)
// 2. Use localhost if running on localhost
// 3. Otherwise use hosted backend
function getApiBaseUrl(): string {
  // Check environment variable first
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  
  // Check if we're in browser and on localhost
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8000'
    }
  }
  
  // Default to hosted backend for production
  return 'https://truthguard-ai-hallucination-detection.onrender.com'
}

const API_BASE_URL = getApiBaseUrl()

export interface ApiResponse<T> {
  data?: T
  error?: string
}

class ApiClient {
  private baseURL: string
  private apiKey: string | null = null

  constructor() {
    this.baseURL = API_BASE_URL
    // Get API key from localStorage or env
    if (typeof window !== 'undefined') {
      this.apiKey = localStorage.getItem('api_key') || null
    }
  }

  setApiKey(key: string) {
    this.apiKey = key
    if (typeof window !== 'undefined') {
      localStorage.setItem('api_key', key)
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }))
        const errorMessage = error.detail || error.message || 'Request failed'
        
        // Log helpful message for 401 errors
        if (response.status === 401) {
          console.warn('🔑 API Key Missing:', errorMessage)
          console.warn('💡 Solution: Set DEV_BYPASS_AUTH=true in backend/.env or create an API key')
        }
        
        return { error: errorMessage }
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' }
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()

