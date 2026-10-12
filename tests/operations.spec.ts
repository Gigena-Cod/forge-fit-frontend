import { test, expect, type Page } from '@playwright/test'

const users = [
  { _id: 'owner', fullName: 'Ana Propietaria', dni: '12345678', phone: '3511234567', email: 'ana@example.test', role: 'OWNER', accountStatus: 'ACTIVE' },
  { _id: 'reception', fullName: 'Luis Recepción', dni: '23456789', phone: '3517654321', email: 'luis@example.test', role: 'RECEPTIONIST', accountStatus: 'ACTIVE' },
]
async function mockApi(page: Page, role = 'OWNER') {
  await page.addInitScript(() => localStorage.setItem('forgefit_access_token', 'test-session'))
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname.replace('/api', '')
    const data: Record<string, unknown> = {
      '/auth/me': { user: { id: 'owner', fullName: 'Ana Propietaria', role } },
      '/users': users,
      '/roles': [{ code: 'OWNER', permissions: ['users:write'] }, { code: 'ADMIN', permissions: ['users:read'] }, { code: 'RECEPTIONIST', permissions: [] }],
      '/reports/members': { total: 40, active: 30, inactive: 10, registrations: 7 },
      '/reports/payments': { currency: 'ARS', paid: { count: 4, amount: 40000 }, pending: { count: 2, amount: 20000 }, overdue: { count: 1, amount: 10000 } },
      '/reports/attendance': { totalEntries: 3, uniqueMembers: 2, entriesByDay: [{ date: '2026-09-28', entries: 3 }] },
    }
    if (!(path in data)) return route.fulfill({ status: 404, json: { error: { message: `Unexpected request: ${path}` } } })
    await route.fulfill({ json: { data: data[path] } })
  })
}

test('check-in confirms access and locks further submissions until next entry', async ({ page }) => {
  await mockApi(page)
  const bodies: { qrPayload: string; requestId: string }[] = []
  await page.route('**/api/attendance/check-in', async route => {
    bodies.push(route.request().postDataJSON())
    await route.fulfill({ status: 201, json: { data: { allowed: true, reason: 'ACCESS_GRANTED', replayed: false, attendance: { memberId: 'member-1', entryAt: '2026-09-29T15:00:00Z' } } } })
  })
  await page.goto('/check-in')
  await page.getByLabel('Credencial QR').fill('forgefit-qr-example')
  await page.getByRole('button', { name: 'Verificar ingreso' }).click()
  await expect(page.getByRole('heading', { name: 'Ingreso permitido' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Ver socio' })).toHaveAttribute('href', '/members/member-1')
  await expect(page.getByRole('button', { name: 'Verificar ingreso' })).toBeDisabled()
  expect(bodies).toHaveLength(1)
  expect(bodies[0].requestId).toMatch(/^[0-9a-f-]{36}$/)
  await page.getByRole('button', { name: 'Siguiente ingreso' }).click()
  await expect(page.getByLabel('Credencial QR')).toHaveValue('')
  await page.getByLabel('Credencial QR').fill('forgefit-qr-example')
  await page.getByRole('button', { name: 'Verificar ingreso' }).click()
  await expect(page.getByRole('heading', { name: 'Ingreso permitido' })).toBeVisible()
  expect(bodies).toHaveLength(2)
  expect(bodies[1].requestId).not.toBe(bodies[0].requestId)
})

test('failed check-in retries using the same requestId and shows replay', async ({ page }) => {
  await mockApi(page)
  const bodies: unknown[] = []
  await page.route('**/api/attendance/check-in', async route => {
    bodies.push(route.request().postDataJSON())
    if (bodies.length === 1) return route.abort('failed')
    await route.fulfill({ json: { data: { allowed: true, reason: 'ACCESS_GRANTED', replayed: true, attendance: { memberId: 'member-1', entryAt: '2026-09-29T15:00:00Z' } } } })
  })
  await page.goto('/check-in')
  await page.getByLabel('Credencial QR').fill('forgefit-qr-example')
  await page.getByRole('button', { name: 'Verificar ingreso' }).click()
  await expect(page.getByText('El resultado no pudo confirmarse.', { exact: false })).toBeVisible()
  await expect(page.getByLabel('Credencial QR')).toHaveAttribute('readonly', '')
  await page.getByRole('button', { name: 'Reintentar el mismo ingreso' }).click()
  await expect(page.getByText('Este ingreso ya estaba registrado;', { exact: false })).toBeVisible()
  expect(bodies[1]).toEqual(bodies[0])
})

for (const [reason, message] of [
  ['QR_INVALID', 'El QR no es válido.'], ['MEMBER_INACTIVE', 'El socio está inactivo.'],
  ['PAYMENT_MISSING', 'No hay una cuota registrada'], ['PAYMENT_PENDING', 'La cuota está pendiente'],
  ['PAYMENT_OVERDUE', 'La cuota está vencida.'], ['PAYMENT_CONFLICT', 'Hay cuotas en conflicto.'],
]) {
  test(`check-in translates ${reason}`, async ({ page }) => {
    await mockApi(page)
    await page.route('**/api/attendance/check-in', route => route.fulfill({ json: { data: { allowed: false, reason, attendance: null, replayed: false } } }))
    await page.goto('/check-in')
    await page.getByLabel('Credencial QR').fill('forgefit-qr-example')
    await page.getByRole('button', { name: 'Verificar ingreso' }).click()
    await expect(page.getByRole('heading', { name: 'Ingreso rechazado' })).toBeVisible()
    await expect(page.getByText(message, { exact: false })).toBeVisible()
  })
}

test('camera failure leaves keyboard input available', async ({ page }) => {
  await mockApi(page)
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => { throw new DOMException('Denied', 'NotAllowedError') }
  })
  await page.goto('/check-in')
  await page.getByRole('button', { name: 'Usar cámara' }).click()
  await expect(page.getByText('No pudimos abrir la cámara.', { exact: false })).toBeVisible()
  await expect(page.getByLabel('Credencial QR')).not.toHaveAttribute('readonly', '')
})

test('owner creates a user and edits account status without sending password', async ({ page }) => {
  await mockApi(page)
  let created: Record<string, string> = {}
  let updated: Record<string, string> = {}
  await page.route('**/api/users', async route => {
    if (route.request().method() === 'GET') return route.fulfill({ json: { data: users } })
    created = route.request().postDataJSON()
    await route.fulfill({ status: 201, json: { data: { ...created, _id: 'new-user', accountStatus: 'ACTIVE' } } })
  })
  await page.route('**/api/users/new-user', async route => {
    updated = route.request().postDataJSON()
    await route.fulfill({ json: { data: { ...created, ...updated, _id: 'new-user' } } })
  })
  await page.goto('/users')
  await page.getByRole('button', { name: 'Nuevo usuario' }).click()
  await page.getByLabel('Nombre completo').fill('Sofía Nueva')
  await page.getByLabel('DNI', { exact: true }).fill('33333333')
  await page.getByLabel('Teléfono').fill('3515551234')
  await page.getByLabel('Email', { exact: true }).fill('sofia@example.test')
  await page.getByLabel('Contraseña inicial').fill('TestPassword123')
  await page.getByLabel('Rol', { exact: true }).selectOption('ADMIN')
  await page.getByRole('button', { name: 'Guardar usuario' }).click()
  await expect(page.getByText('Usuario guardado correctamente.')).toBeVisible()
  expect(created.role).toBe('ADMIN')
  expect(created.password).toBe('TestPassword123')
  await page.getByRole('button', { name: 'Editar Sofía Nueva' }).click()
  await expect(page.getByLabel('Contraseña inicial')).toHaveCount(0)
  await page.getByLabel('Estado', { exact: true }).selectOption('INACTIVE')
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Guardar usuario' }).click()
  await expect(page.getByText('Usuario guardado correctamente.')).toBeVisible()
  expect(updated.accountStatus).toBe('INACTIVE')
  expect(updated).not.toHaveProperty('password')
})

test('last owner conflict preserves editor and omits unchanged OWNER role', async ({ page }) => {
  await mockApi(page)
  let body: Record<string, string> = {}
  await page.route('**/api/users/owner', async route => {
    body = route.request().postDataJSON()
    await route.fulfill({ status: 409, json: { error: { code: 'LAST_OWNER' } } })
  })
  await page.goto('/users')
  await page.getByRole('button', { name: 'Editar Ana Propietaria' }).click()
  await page.getByLabel('Estado', { exact: true }).selectOption('INACTIVE')
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Guardar usuario' }).click()
  await expect(page.getByRole('alert')).toContainText('último propietario')
  await expect(page.getByLabel('Nombre completo')).toHaveValue('Ana Propietaria')
  expect(body).not.toHaveProperty('role')
})

test('admin can consult users but cannot edit', async ({ page }) => {
  await mockApi(page, 'ADMIN')
  await page.goto('/users')
  await expect(page.getByText('Luis Recepción', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Nuevo usuario' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /^Editar/ })).toHaveCount(0)
})

test('receptionist cannot open users/reports or see their navigation', async ({ page }) => {
  await mockApi(page, 'RECEPTIONIST')
  let protectedRequests = 0
  page.on('request', req => { if (/\/api\/(users|reports|roles)/.test(req.url())) protectedRequests++ })
  for (const path of ['/users', '/reports']) {
    await page.goto(path)
    await expect(page.getByRole('heading', { name: 'Acceso restringido' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Usuarios', exact: true })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Reportes', exact: true })).toHaveCount(0)
  }
  expect(protectedRequests).toBe(0)
})

test('reports validate date pairs and send separate date and period filters', async ({ page }) => {
  await mockApi(page)
  await page.goto('/reports')
  const members = page.getByRole('region', { name: 'Socios', exact: true })
  await expect(members.getByText('40', { exact: true })).toBeVisible()
  await members.getByLabel('Desde').fill('2026-09-01')
  await members.getByRole('button', { name: 'Aplicar' }).click()
  await expect(members.getByRole('alert')).toContainText('ambos extremos')
  await members.getByLabel('Hasta').fill('2026-08-01')
  await members.getByRole('button', { name: 'Aplicar' }).click()
  await expect(members.getByRole('alert')).toContainText('posterior')
  await members.getByLabel('Hasta').fill('2026-09-30')
  const dates = page.waitForRequest('**/reports/members?from=2026-09-01&to=2026-09-30')
  await members.getByRole('button', { name: 'Aplicar' }).click()
  await dates
  const payments = page.getByRole('region', { name: 'Pagos', exact: true })
  await payments.getByLabel('Desde').fill('2026-08')
  await payments.getByLabel('Hasta').fill('2026-09')
  const periods = page.waitForRequest('**/reports/payments?periodFrom=2026-08&periodTo=2026-09')
  await payments.getByRole('button', { name: 'Aplicar' }).click()
  await periods
  await expect(page.getByRole('cell', { name: '28/9/2026' })).toBeVisible()
})

test('report errors are independent and empty attendance is explicit', async ({ page }) => {
  await mockApi(page)
  await page.route('**/api/reports/payments', route => route.fulfill({ status: 500, json: { error: {} } }))
  await page.route('**/api/reports/attendance', route => route.fulfill({ json: { data: { totalEntries: 0, uniqueMembers: 0, entriesByDay: [] } } }))
  await page.goto('/reports')
  await expect(page.getByRole('region', { name: 'Pagos', exact: true }).getByRole('alert')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Socios', exact: true }).getByText('40', { exact: true })).toBeVisible()
  await expect(page.getByText('No hay ingresos autorizados en el rango consultado.')).toBeVisible()
})

test('expired session redirects to login', async ({ page }) => {
  await mockApi(page)
  await page.route('**/api/auth/me', route => route.fulfill({ status: 401, json: { error: { code: 'UNAUTHORIZED' } } }))
  await page.goto('/reports')
  await expect(page).toHaveURL(/\/auth\/login$/)
})

test('mobile pages keep the document within viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await mockApi(page)
  for (const path of ['/users', '/reports', '/check-in']) {
    await page.goto(path)
    await expect(page.locator('.operations-content h1')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375)
    await page.screenshot({ path: `test-results/mobile-${path.slice(1)}.png`, fullPage: true })
  }
})
