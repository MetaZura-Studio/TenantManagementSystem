import { NextResponse } from "next/server"

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "BAD_REQUEST"
  | "NOT_FOUND"

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, { status: 200, ...init })
}

export function jsonError(
  status: 400 | 401 | 403 | 404,
  code: ApiErrorCode,
  message: string,
  init?: ResponseInit
) {
  return NextResponse.json(
    { error: { code, message } },
    { status, ...init }
  )
}

