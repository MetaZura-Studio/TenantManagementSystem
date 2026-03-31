import mysql from "mysql2/promise"

declare global {
  // eslint-disable-next-line no-var
  var __mysqlPool: mysql.Pool | undefined
}

function getEnv(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback
  if (!value) throw new Error(`Missing env var: ${name}`)
  return value
}

export function getMysqlPool() {
  if (global.__mysqlPool) return global.__mysqlPool

  const pool = mysql.createPool({
    host: getEnv("DB_HOST", "localhost"),
    port: Number(getEnv("DB_PORT", "3306")),
    user: getEnv("DB_USER", "root"),
    password: getEnv("DB_PASSWORD"),
    database: getEnv("DB_NAME", "dishdasha_management_system"),
    waitForConnections: true,
    connectionLimit: 10,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    namedPlaceholders: true,
    dateStrings: true, // keep DATETIME/DATE as strings
  })

  global.__mysqlPool = pool
  return pool
}

