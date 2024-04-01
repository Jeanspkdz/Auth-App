import { useCurrentUser } from "@/hooks/use-current-user"
import { UserRole } from "@prisma/client"
import { FormError } from "../form-error"

interface RoleGateProps {
  children: React.ReactNode,
  allowedRule : UserRole
}

export const RoleGate = ({children, allowedRule} : RoleGateProps) => {
  const user = useCurrentUser()
  const ROLE = user?.role

  if(ROLE !== allowedRule ){
    return (
      <FormError message="You do not have permission to view this content"/>
    )
  }

  return (
    <>
      {children}
    </>
  )
}
