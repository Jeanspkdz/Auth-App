import "next-auth"
import { UserRole } from "@prisma/client"

declare module "next-auth" {
  interface User {
    role: UserRole 
    isTwoFactorEnabled: boolean
    isOAuth: boolean
  }

}

declare module "@auth/core/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    /** OpenID ID 'Token */
    role : UserRole,
    isTwoFactorEnabled: boolean
    isOAuth: boolean
  }
}
