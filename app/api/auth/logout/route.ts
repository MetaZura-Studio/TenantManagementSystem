import { clearSessionCookie } from "@/app/api/_platform/auth"
import { jsonOk } from "@/app/api/_platform/http"

export async function POST() {
  clearSessionCookie()
  return jsonOk({ ok: true })
}

