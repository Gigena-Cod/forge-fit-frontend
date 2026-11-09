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

async function openMemberFixture(page: Page, role?: string) {
  await mockApi(page, role)
  await page.route(/\/api\/members\/member-1$/, route => route.fulfill({ json: { data: {
    id: 'member-1', name: 'Socio Demo', dni: '12345678', phone: '3515550000',
    email: 'socio@example.test', registrationDate: '2026-09-01', membershipStatus: 'ACTIVE',
  } } }))
  await page.route(/\/api\/members\/member-1\/(payments|attendance)$/, route => route.fulfill({ json: { data: [] } }))
}

for (const existing of [false, true]) {
  test(`register payment ${existing ? 'updates pending dues' : 'creates missing dues'}`, async ({ page }) => {
    await mockApi(page, 'RECEPTIONIST')
    let saved: Record<string, unknown> | undefined
    const member = { id: 'member-1', name: 'Socio Demo', dni: '12345678' }
    await page.route('**/api/members', route => route.fulfill({ json: { data: [member] } }))
    await page.route('**/api/members/member-1/payments', route => route.fulfill({ json: {
      data: existing ? [{ id: 'payment-1', period: '2026-11', status: 'PENDING' }] : [],
    } }))
    await page.route(/\/api\/payments(?:\/payment-1)?(?:\?.*)?$/, async route => {
      if (route.request().method() === 'GET') {
        const items = saved ? [{ ...saved, id: 'payment-1', memberId: member }] : []
        return route.fulfill({ json: { data: { items, page: 1, limit: 20, total: items.length } } })
      }
      expect(route.request().method()).toBe(existing ? 'PUT' : 'POST')
      saved = route.request().postDataJSON()
      await route.fulfill({ json: { data: saved } })
    })
    await page.goto('/payments')
    await page.getByRole('button', { name: 'Registrar pago' }).click()
    await expect(page.getByRole('dialog', { name: 'Registrar pago' })).toBeVisible()
    await page.getByLabel('Socio', { exact: true }).selectOption('member-1')
    await page.getByLabel('Período', { exact: true }).fill('2026-11')
    await page.getByLabel('Importe (ARS)').fill('30000')
    await page.getByLabel('Fecha de pago').fill('2026-11-08')
    await page.getByLabel('Medio de pago').selectOption('CASH')
    await page.getByRole('button', { name: 'Guardar pago' }).click()
    await expect(page.getByText('Pago registrado.')).toBeVisible()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.getByRole('cell', { name: 'Pagado' })).toBeVisible()
    expect(saved).toEqual({ memberId: 'member-1', period: '2026-11', amount: 30000, paymentDate: '2026-11-08', paymentMethod: 'CASH', status: 'PAID' })
  })
}

test('payments paginate in server order and search from page one', async ({ page }) => {
  await mockApi(page)
  const payment = (id: string, name: string, paymentDate: string) => ({
    id, memberId: { id, name }, paymentDate, period: '2026-11', amount: 30000, status: 'PAID', paymentMethod: 'CASH',
  })
  await page.route(/\/api\/payments\?/, route => {
    const params = new URL(route.request().url()).searchParams
    const number = Number(params.get('page'))
    const limit = Number(params.get('limit'))
    const query = params.get('q')
    const items = query ? [payment('old', 'Socio antiguo', '2026-11-01')]
      : number === 2 ? [payment('old', 'Socio antiguo', '2026-11-01')]
      : Array.from({ length: 20 }, (_, index) =>
        payment(String(index), `Socio ${index + 1}`, `2026-11-${String(30 - index).padStart(2, '0')}`))
    return route.fulfill({ json: { data: { items, page: number, limit, total: query ? 1 : 21 } } })
  })
  await page.goto('/payments')
  await expect(page.getByText('Pagos 1–20 de 21')).toBeVisible()
  await expect(page.getByRole('row').nth(1)).toContainText('Socio 1')
  await expect(page.getByRole('button', { name: 'Anterior' })).toBeDisabled()
  await page.getByRole('button', { name: 'Siguiente' }).click()
  await expect(page.getByText('Pagos 21–21 de 21')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Siguiente' })).toBeDisabled()
  const search = page.waitForRequest(request => {
    const url = new URL(request.url())
    return url.pathname === '/api/payments' && url.searchParams.get('q') === 'antiguo' && url.searchParams.get('page') === '1'
  })
  await page.getByLabel('Buscar pago').fill('antiguo')
  await search
  await expect(page.getByText('Pagos 1–1 de 1')).toBeVisible()
  await expect(page.getByRole('cell', { name: 'Socio antiguo' })).toBeVisible()
})

test('public landing is available on mobile and dashboard requires sign-in', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Gestioná tu gimnasio desde un solo lugar.' })).toBeVisible()
  await page.getByRole('link', { name: 'Experiencias', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Pulso Norte' })).toBeVisible()
  await page.getByRole('button', { name: 'Experiencia siguiente' }).click()
  await expect(page.getByRole('heading', { name: 'Umbral Fuerza' })).toBeVisible()
  await page.getByRole('button', { name: 'Experiencia anterior' }).click()
  await expect(page.getByRole('heading', { name: 'Pulso Norte' })).toBeVisible()
  await page.getByRole('link', { name: 'Preguntas frecuentes' }).click()
  await expect(page.getByRole('heading', { name: 'Preguntas frecuentes' })).toBeInViewport()
  await page.getByText('¿Necesito una cuenta para usar el panel?', { exact: true }).click()
  await expect(page.getByText('Sí. Iniciá sesión con tu cuenta', { exact: false })).toBeVisible()
  await page.getByRole('main').getByRole('link', { name: 'Iniciar sesión' }).last().click()
  await expect(page).toHaveURL(/\/auth\/login$/)
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/auth\/login$/)

  await mockApi(page)
  await page.goto('/dashboard')
  await expect(page.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page')
})

test('experience cards advance automatically and support pausing', async ({ page }) => {
  await page.clock.install()
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Pulso Norte' })).toBeVisible()
  await page.clock.runFor(6000)
  await expect(page.getByRole('heading', { name: 'Umbral Fuerza' })).toBeVisible()
  await page.getByRole('button', { name: 'Pausar' }).click()
  await page.mouse.move(0, 0)
  await page.locator('body').click({ position: { x: 1, y: 1 } })
  await page.clock.runFor(12000)
  await expect(page.getByRole('heading', { name: 'Umbral Fuerza' })).toBeVisible()
})

test('owner generates, reloads and renews a member QR', async ({ page }) => {
  await openMemberFixture(page)
  const writes: unknown[] = []
  let credential: { qrPayload: string; issuedAt: string } | undefined
  await page.route('**/api/members/member-1/qr', async route => {
    if (route.request().method() === 'POST') {
      writes.push(route.request().postDataJSON())
      credential = { qrPayload: `ffq_v1_demo_credential_${writes.length}`, issuedAt: '2026-09-01T12:00:00Z' }
      if (writes.length === 2) return route.abort()
    }
    if (!credential) return route.fulfill({ status: 404, json: { error: { code: 'QR_NOT_ASSIGNED' } } })
    await route.fulfill({ json: { data: credential } })
  })
  await page.goto('/members/member-1')
  await page.getByRole('button', { name: 'Generar QR' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Credencial generada.' })).toBeVisible()
  const qr = page.getByRole('img', { name: 'Código QR de ingreso del socio' })
  await expect(qr).toHaveAttribute('src', /^data:image\/png;base64,/)
  const firstImage = await qr.getAttribute('src')
  await page.reload()
  await expect(qr).toHaveAttribute('src', firstImage!)
  page.once('dialog', dialog => dialog.dismiss())
  await page.getByRole('button', { name: 'Renovar QR' }).click()
  expect(writes).toEqual([{}])
  page.once('dialog', dialog => dialog.accept())
  await page.getByRole('button', { name: 'Renovar QR' }).click()
  await expect(page.getByText(/No pudimos confirmar el cambio/)).toBeVisible()
  await expect(qr).toBeVisible()
  await expect(qr).not.toHaveAttribute('src', firstImage!)
  expect(writes).toEqual([{}, { rotate: true }])
})

test('reception does not request or display member QR', async ({ page }) => {
  await openMemberFixture(page, 'RECEPTIONIST')
  const requests: string[] = []
  page.on('request', request => {
    if (request.url().endsWith('/member-1/qr')) requests.push(request.url())
  })
  await page.goto('/members/member-1')
  await expect(page.getByRole('heading', { name: 'Datos personales' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Credencial QR' })).toHaveCount(0)
  expect(requests).toEqual([])
})

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

test('USB entry shows receipt, validation and the identified member on rejection', async ({ page }) => {
  await mockApi(page)
  let respond!: () => void
  const waitForValidation = new Promise<void>(resolve => { respond = resolve })
  await page.route('**/api/attendance/check-in', async route => {
    await waitForValidation
    await route.fulfill({ json: { data: {
      allowed: false, reason: 'PAYMENT_MISSING', attendance: null, replayed: false,
      member: { id: 'member-1', name: 'Socio Demo', dni: '12345678', membershipStatus: 'ACTIVE' },
      payment: { period: '2026-09', status: 'MISSING' },
    } } })
  })
  await page.goto('/check-in')
  const input = page.getByLabel('Credencial QR')
  await expect(input).toBeFocused()
  await expect(page.getByText('Esperando lectura')).toBeVisible()
  await input.fill('forgefit-qr-example')
  await expect(page.getByText('Recibiendo código…')).toBeVisible()
  await input.press('Enter')
  try {
    await expect(page.getByText('Validando ingreso…')).toBeVisible()
  } finally {
    respond()
  }
  await expect(page.getByRole('heading', { name: 'Ingreso rechazado' })).toBeVisible()
  await expect(page.getByText('Socio Demo')).toBeVisible()
  await expect(page.getByText('Sin registrar', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Siguiente ingreso' }).click()
  await expect(input).toBeFocused()
  await expect(page.getByText('Último código recibido', { exact: false })).toBeVisible()
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
  await page.clock.setFixedTime(new Date(2028, 1, 15, 12))
  const initialRequests = [
    '**/reports/members?from=2028-02-01&to=2028-02-29',
    '**/reports/attendance?from=2028-02-01&to=2028-02-29',
    '**/reports/payments?periodFrom=2028-02&periodTo=2028-02',
  ].map(url => page.waitForRequest(url))
  await page.goto('/reports')
  await Promise.all(initialRequests)
  const members = page.getByRole('region', { name: 'Socios', exact: true })
  await expect(members.getByText('40', { exact: true })).toBeVisible()
  await expect(members.getByLabel('Desde')).toHaveValue('2028-02-01')
  await expect(members.getByLabel('Hasta')).toHaveValue('2028-02-29')
  await members.getByLabel('Hasta').fill('')
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
  await page.route(/\/api\/reports\/payments\?/, route => route.fulfill({ status: 500, json: { error: {} } }))
  await page.route(/\/api\/reports\/attendance\?/, route => route.fulfill({ json: { data: { totalEntries: 0, uniqueMembers: 0, entriesByDay: [] } } }))
  await page.goto('/reports')
  await expect(page.getByRole('region', { name: 'Pagos', exact: true }).getByRole('alert')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Socios', exact: true }).getByText('40', { exact: true })).toBeVisible()
  await expect(page.getByText('No hay ingresos autorizados en el rango consultado.')).toBeVisible()
})

test('protected navigation reuses the verified session', async ({ page }) => {
  await mockApi(page)
  const sessionRequests: string[] = []
  page.on('request', request => {
    if (request.url().endsWith('/auth/me')) sessionRequests.push(request.url())
  })
  await page.goto('/dashboard')
  const reports = page.getByRole('link', { name: 'Reportes', exact: true })
  await expect(reports).toBeVisible()
  const initialRequests = sessionRequests.length
  expect(initialRequests).toBeGreaterThan(0)
  await reports.click()
  await expect(page.getByRole('heading', { name: 'Reportes administrativos' })).toBeVisible()
  expect(sessionRequests).toHaveLength(initialRequests)
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
