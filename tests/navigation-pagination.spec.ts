import { expect, test } from '@playwright/test'

const profile = { user: { id: '1', fullName: 'Ana Pérez', email: 'ana@example.test', role: 'OWNER' }, sessionId: 'session-1' }

test('login waits for the profile and private navigation keeps the verified session', async ({ page }) => {
  let profileRequests = 0
  let releaseProfile!: () => void
  const profileReady = new Promise<void>(resolve => { releaseProfile = resolve })
  await page.route('**/api/auth/login', route => route.fulfill({ json: { data: {} } }))
  await page.route('**/api/auth/me', async route => {
    profileRequests++
    await profileReady
    await route.fulfill({ json: { data: profile } })
  })
  await page.route('**/api/members?**', route => route.fulfill({ json: { data: { items: [], page: 1, limit: 20, total: 0 } } }))
  await page.route('**/api/payments?**', route => route.fulfill({ json: { data: { items: [], page: 1, limit: 20, total: 0 } } }))
  await page.route('**/api/auth/logout', route => route.fulfill({ status: 204 }))
  await page.goto('/auth/login')
  await page.getByLabel('Email').fill('ana@example.test')
  await page.getByLabel('Contraseña', { exact: true }).fill('TestPassword123')
  const request = page.waitForRequest('**/api/auth/me')
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()
  try {
    await request
    await expect(page).toHaveURL(/\/auth\/login$/)
  } finally {
    releaseProfile()
  }
  await expect(page).toHaveURL(/\/members$/)
  await page.getByRole('link', { name: 'Pagos', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Registrar pago' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Pagos', exact: true })).toHaveAttribute('aria-current', 'page')
  await page.getByRole('button', { name: 'Mi cuenta' }).click()
  await page.getByRole('link', { name: 'Configuración de mi cuenta' }).click()
  await expect(page.getByRole('heading', { name: 'Mi cuenta', exact: true })).toBeVisible()
  await expect(page.getByText('ana@example.test')).toBeVisible()
  await expect(page.getByText('Verificando sesión…')).toHaveCount(0)
  expect(profileRequests).toBe(1)
  await page.getByRole('button', { name: 'Mi cuenta' }).click()
  await page.getByRole('button', { name: 'Cerrar sesión' }).click()
  await expect(page).toHaveURL(/\/auth\/login$/)
})

test('member search requests the first page and clearing it keeps the first page', async ({ page }) => {
  const calls: string[] = []
  await page.route('**/api/auth/me', route => route.fulfill({ json: { data: profile } }))
  await page.route('**/api/members?**', route => {
    const params = new URL(route.request().url()).searchParams
    const current = Number(params.get('page'))
    const query = params.get('q') ?? ''
    calls.push(`${current}:${query}`)
    const items = Array.from({ length: query || current === 2 ? 1 : 20 }, (_, index) => ({
      id: String(index), name: query ? 'Socio encontrado' : `Socio ${index + 1}`, dni: '12345678',
      phone: '3515550000', email: 'test@example.test', registrationDate: '2026-11-01', membershipStatus: 'ACTIVE',
    }))
    return route.fulfill({ json: { data: { items, page: current, limit: 20, total: query ? 1 : 21 } } })
  })
  await page.goto('/members')
  await expect(page.getByText('Socios 1–20 de 21')).toBeVisible()
  await page.getByRole('button', { name: 'Siguiente' }).click()
  await expect(page.getByText('Socios 21–21 de 21')).toBeVisible()
  await page.getByLabel('Buscar socio').fill('encontrado')
  await expect(page.getByRole('cell', { name: 'Socio encontrado' })).toBeVisible()
  await page.getByLabel('Buscar socio').clear()
  await expect(page.getByText('Socios 1–20 de 21')).toBeVisible()
  expect(calls).toEqual(['1:', '2:', '1:encontrado', '1:'])
})
