import { apiRequest } from '../../../shared/services/api.ts'
import type { Role } from '../../auth/session.ts'

export type User = { _id: string; fullName: string; dni: string; phone: string; email: string; role: Role; accountStatus: 'ACTIVE' | 'INACTIVE' }
export type RoleDefinition = { code: Role; permissions: string[] }
export const roleLabels: Record<Role, string> = { OWNER: 'Propietario', ADMIN: 'Administrador', RECEPTIONIST: 'Recepcionista' }
export const getUsers = (signal?: AbortSignal) => apiRequest<User[]>('/users', { signal })
export const getRoles = (signal?: AbortSignal) => apiRequest<RoleDefinition[]>('/roles', { signal })
export const saveUser = (id: string | undefined, body: Record<string, string>) => apiRequest<User>(id ? `/users/${encodeURIComponent(id)}` : '/users', { method: id ? 'PATCH' : 'POST', body: JSON.stringify(body) })
