const { PrismaClient } = require("@prisma/client")
const crypto = require("crypto")

const prisma = new PrismaClient()

function hashPassword(password) {
  const salt = crypto.randomBytes(16)
  const keyLen = 64
  const N = 16384
  const r = 8
  const p = 1

  const derived = crypto.scryptSync(password, salt, keyLen, { N, r, p })
  return `scrypt$N=${N},r=${r},p=${p}$${salt.toString("base64")}$${derived.toString("base64")}`
}

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase()
  const password = process.env.ADMIN_PASSWORD || "admin123"
  const fullName = process.env.ADMIN_NAME || "Super Admin"

  const existing = await prisma.super_admin_users.findFirst({
    where: { email },
    select: { id: true, email: true },
  })

  if (existing?.id) {
    console.log(`Super admin already exists: ${existing.email} (id=${existing.id})`)
    return
  }

  const passwordHash = hashPassword(password)
  const created = await prisma.super_admin_users.create({
    data: {
      full_name: fullName,
      email,
      mobile: null,
      password_hash: passwordHash,
      status: "ACTIVE",
      last_login_at: null,
    },
    select: { id: true, email: true },
  })

  console.log(`Created super admin: ${created.email} (id=${created.id})`)
  console.log(`Login with: ${email} / ${password}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

