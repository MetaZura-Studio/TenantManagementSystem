// Mock session management
export interface Session {
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

export const mockSession: Session = {
  user: {
    id: "admin-1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
  },
}

export function getSession(): Session {
  return mockSession
}
