import { apiRequest } from '../../../shared/services/api.ts'

export async function login(email: string, password: string) {
  await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
}

export async function register(payload: { administrator: { fullName: string; dni: string; phone: string; email: string; password: string }; gym: { name: string; address: string; phone: string; contactEmail: string } }) {
  await apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) })
}

export async function logout() {
  await apiRequest('/auth/logout', { method: 'POST' })
  window.location.replace('/auth/login')
}
