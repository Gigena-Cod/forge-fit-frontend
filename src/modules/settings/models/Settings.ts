import type { Administrator } from './Administrator.ts'
import type { Gym } from './Gym.ts'

export interface Settings {
  gym: Gym
  administrator: Administrator
}

export type UpdateSettingsPayload = {
  gym: Omit<Gym, 'id'>
  administrator: Omit<Administrator, 'id'>
}
