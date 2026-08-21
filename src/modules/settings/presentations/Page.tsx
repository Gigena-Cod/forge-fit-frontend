import { useState, type FormEvent } from 'react'
import { Button } from '../../../shared/components/Button/index.ts'
import { Input, InputType } from '../../../shared/components/Input/index.ts'
import { Text, TextColor, TextWeight } from '../../../shared/components/Text/index.ts'
import type { UpdateSettingsPayload } from '../models/Settings.ts'
import { useGetSettings } from './hooks/useGetSettings.ts'
import { useUpdateSettings } from './hooks/useUpdateSettings.ts'
import { GymSettingsForm } from './subcomponents/GymSettingsForm/GymSettingsForm.tsx'
import { AdministratorSettingsForm } from './subcomponents/AdministratorSettingsForm/AdministratorSettingsForm.tsx'
import './Page.css'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
function getField(data: FormData, name: string) { return String(data.get(name) ?? '').trim() }

export function SettingsPage() {
  const { settings, isLoading, error } = useGetSettings()
  const { updateSettings, isLoading: isSaving, error: updateError } = useUpdateSettings()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaved, setIsSaved] = useState(false)
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget)
    const payload: UpdateSettingsPayload = { gym: { name: getField(data, 'gymName'), address: getField(data, 'gymAddress'), phone: getField(data, 'gymPhone'), contactEmail: getField(data, 'gymContactEmail') }, administrator: { fullName: getField(data, 'adminFullName'), dni: getField(data, 'adminDni'), phone: getField(data, 'adminPhone'), email: getField(data, 'adminEmail') } }
    const nextErrors: Record<string, string> = {}
    if (!payload.gym.name) nextErrors.gymName = 'El nombre del gimnasio es requerido.'
    if (!payload.gym.address) nextErrors.gymAddress = 'La dirección es requerida.'
    if (!payload.gym.phone) nextErrors.gymPhone = 'El teléfono es requerido.'
    if (!emailPattern.test(payload.gym.contactEmail)) nextErrors.gymContactEmail = 'Ingresa un email válido.'
    if (!payload.administrator.fullName) nextErrors.adminFullName = 'El nombre es requerido.'
    if (!payload.administrator.dni) nextErrors.adminDni = 'El DNI es requerido.'
    if (!payload.administrator.phone) nextErrors.adminPhone = 'El teléfono es requerido.'
    if (!emailPattern.test(payload.administrator.email)) nextErrors.adminEmail = 'Ingresa un email válido.'
    setErrors(nextErrors); setIsSaved(false); if (Object.keys(nextErrors).length) return
    if (await updateSettings(payload)) setIsSaved(true)
  }
  return <main className="settings-page"><section className="settings-page__content"><Text color={TextColor.Secondary}>Administra la información general de tu gimnasio y tu cuenta.</Text>{isLoading && <Text color={TextColor.Secondary}>Cargando configuración...</Text>}{error && <Text color={TextColor.Danger}>{error}</Text>}{settings && <form className="settings-page__form" onSubmit={handleSubmit} noValidate><GymSettingsForm gym={settings.gym} errors={errors} /><AdministratorSettingsForm administrator={settings.administrator} errors={errors} /><section className="settings-form" aria-labelledby="security-settings-title"><Text id="security-settings-title" as="h2" weight={TextWeight.Bold}>Seguridad</Text><div className="settings-form__security"><Input label="Contraseña" type={InputType.Password} value="************" readOnly /><Button type="button" disabled><Text as="span" weight={TextWeight.Bold}>Cambiar contraseña</Text></Button></div></section>{updateError && <Text color={TextColor.Danger}>{updateError}</Text>}{isSaved && <Text color={TextColor.Accent} weight={TextWeight.Bold}>Cambios guardados correctamente.</Text>}<div className="settings-page__actions"><Button type="submit" disabled={isSaving}><Text as="span" weight={TextWeight.Bold}>{isSaving ? 'Guardando...' : 'Guardar cambios'}</Text></Button></div></form>}</section></main>
}
