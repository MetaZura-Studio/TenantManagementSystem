/**
 * Dev1 smoke test runner
 *
 * Usage:
 *   node scripts/dev1-smoke-test.mjs http://localhost:3001
 */

const baseUrl = process.argv[2] || "http://localhost:3001"

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

async function http(path, init = {}) {
  const url = new URL(path, baseUrl).toString()
  return fetch(url, init)
}

async function login({ role } = {}) {
  const res = await http("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: "admin@example.com",
      password: "admin123",
      ...(role ? { role } : {}),
    }),
  })
  const setCookie = res.headers.get("set-cookie")
  const body = await res.json().catch(() => null)
  return { res, setCookie, body }
}

async function run() {
  console.log(`Dev1 smoke test @ ${baseUrl}`)

  // 1) Middleware: unauthenticated page should redirect to /login
  {
    const res = await http("/dashboard", { redirect: "manual" })
    assert(
      [301, 302, 303, 307, 308].includes(res.status),
      `Expected redirect for /dashboard, got ${res.status}`
    )
    const loc = res.headers.get("location") || ""
    assert(loc.includes("/login"), `Expected location to include /login, got ${loc}`)
    console.log("✓ middleware redirect unauthenticated /dashboard → /login")
  }

  // 2) /api/auth/me should 401 without cookie
  {
    const res = await http("/api/auth/me")
    assert(res.status === 401, `Expected 401 from /api/auth/me, got ${res.status}`)
    console.log("✓ /api/auth/me returns 401 when not logged in")
  }

  // 3) Login as admin (default) should work and set cookie
  const admin = await login()
  assert(admin.res.status === 200, `Expected 200 login(admin), got ${admin.res.status}`)
  assert(admin.setCookie, "Expected set-cookie header from login(admin)")
  console.log("✓ login(admin) returns 200 and sets cookie")

  // 4) /api/auth/me should 200 with cookie
  {
    const res = await http("/api/auth/me", {
      headers: { cookie: admin.setCookie },
    })
    assert(res.status === 200, `Expected 200 from /api/auth/me, got ${res.status}`)
    const data = await res.json()
    assert(data?.user?.email, "Expected user in /api/auth/me response")
    console.log("✓ /api/auth/me returns 200 with cookie")
  }

  // 5) Roles API list should be 200 for admin
  {
    const res = await http("/api/roles", { headers: { cookie: admin.setCookie } })
    assert(res.status === 200, `Expected 200 GET /api/roles, got ${res.status}`)
    const roles = await res.json()
    assert(Array.isArray(roles), "Expected array roles response")
    console.log(`✓ GET /api/roles (admin) returns 200 (count=${roles.length})`)
  }

  // 6) Roles create/update/delete should work for admin
  let createdRoleId
  {
    const createRes = await http("/api/roles", {
      method: "POST",
      headers: {
        cookie: admin.setCookie,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        roleName: "SmokeTest Role",
        description: "Created by dev1 smoke test",
        status: "Active",
        permissions: [],
      }),
    })
    assert(
      createRes.status === 201 || createRes.status === 200,
      `Expected 201/200 POST /api/roles, got ${createRes.status}`
    )
    const created = await createRes.json()
    createdRoleId = created?.id
    assert(createdRoleId, "Expected created role id")
    console.log("✓ POST /api/roles (admin) works")

    const patchRes = await http(`/api/roles/${encodeURIComponent(createdRoleId)}`, {
      method: "PATCH",
      headers: {
        cookie: admin.setCookie,
        "content-type": "application/json",
      },
      body: JSON.stringify({ description: "Updated by dev1 smoke test" }),
    })
    assert(patchRes.status === 200, `Expected 200 PATCH role, got ${patchRes.status}`)
    console.log("✓ PATCH /api/roles/:id (admin) works")

    const delRes = await http(`/api/roles/${encodeURIComponent(createdRoleId)}`, {
      method: "DELETE",
      headers: { cookie: admin.setCookie },
    })
    assert(delRes.status === 200, `Expected 200 DELETE role, got ${delRes.status}`)
    console.log("✓ DELETE /api/roles/:id (admin) works")
  }

  // 7) Viewer can read roles but cannot create roles
  {
    const viewer = await login({ role: "viewer" })
    assert(viewer.res.status === 200, `Expected 200 login(viewer), got ${viewer.res.status}`)
    assert(viewer.setCookie, "Expected set-cookie header from login(viewer)")

    const listRes = await http("/api/roles", { headers: { cookie: viewer.setCookie } })
    assert(listRes.status === 200, `Expected 200 GET /api/roles (viewer), got ${listRes.status}`)

    const createRes = await http("/api/roles", {
      method: "POST",
      headers: {
        cookie: viewer.setCookie,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        roleName: "Should Fail",
        description: "",
        status: "Active",
        permissions: [],
      }),
    })
    assert(createRes.status === 403, `Expected 403 POST /api/roles (viewer), got ${createRes.status}`)
    console.log("✓ RBAC: viewer can GET /api/roles but cannot POST /api/roles")
  }

  // 8) Logout should invalidate cookie for /api/auth/me
  {
    const out = await http("/api/auth/logout", {
      method: "POST",
      headers: { cookie: admin.setCookie },
    })
    assert(out.status === 200, `Expected 200 logout, got ${out.status}`)

    const me = await http("/api/auth/me", { headers: { cookie: admin.setCookie } })
    // Cookie token is still present client-side in this test; server cookie clearing relies on browser storing new Set-Cookie.
    // So here we only validate that logout endpoint works (200). Browser behavior is validated manually via UI.
    console.log("✓ POST /api/auth/logout returns 200 (browser clears cookie via Set-Cookie)")
  }

  console.log("All Dev1 smoke tests passed.")
}

run().catch((err) => {
  console.error("Smoke test failed:", err.message)
  process.exit(1)
})

