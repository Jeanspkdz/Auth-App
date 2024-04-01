"use client";

import { admin } from "@/actions";
import { RoleGate } from "@/components/auth/role-gate";
import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/use-current-user";
import { UserRole } from "@prisma/client";
import { toast } from "sonner";

export default function AdminPage() {
  const user = useCurrentUser();
  const ROLE = user?.role;

  const onServerActionClick = () => {
      admin().then((data) => {
        if(data.error){
          toast.error(data.error)
        }
        if(data.success){
          toast.success(data.success)
        }
      })
  }

  const onApiRouteClick = () => {
    fetch("/api/admin").then((response) => {
      if(response.ok){
        toast.success("Allowed API Route")
      }else{
        toast.error("Forbidden API Route")
      }
    })
  }

  return (
    <Card className="w-[600px]">
      <CardHeader>
        <p className="text-2xl font-semibold text-center">🔑 Admin</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <RoleGate allowedRule={UserRole.ADMIN}>
          <FormSuccess message="You are allowd to see this contnet" />
        </RoleGate>

        <div className="flex items-center justify-between rounded-lg border p-3 shadow-md">
          <p className="text-sm font-medium">Admin-only API Route</p>
          
          <Button onClick={onApiRouteClick}>
            Click to Test
          </Button>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3 shadow-md">
          <p className="text-sm font-medium">Admin-only Server Action</p>
          
          <Button onClick={onServerActionClick}>
            Click to Test
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
