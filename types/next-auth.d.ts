import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      firmName?: string | null
    }
  }
  interface User {
    firmName?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    firmName?: string | null
  }
}
