import { apiRequest, setAccessToken } from '../../../shared/services/api.ts'
type AuthResponse = { token: string }
export async function login(email: string, password: string) { const response = await apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); setAccessToken(response.token) }
export async function register(payload: { administrator: { fullName: string; dni: string; phone: string; email: string; password: string }; gym: { name: string; address: string; phone: string; contactEmail: string } }) { const response = await apiRequest<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }); setAccessToken(response.token) }
