import { User } from "next-auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "./ui/badge";

interface UserInfoProps {
  user?: User;
  label: string;
}

export const UserInfo = ({ user, label }: UserInfoProps) => {
  return (
    <Card className="w-[600px] shadow-md">
      <CardHeader>
        <p className="text-2xl font-semibold text-center">{label}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* {Object.entries(user!).map(([key, value]) => {
          console.log(user);

          

          return (
            <div
              key={key + value}
              className="flex flex-row justify-between rounded-lg border p-3 shadow-sm"
            >
              <p className=" text-sm font-medium capitalize">{key}</p>
              <p className="truncate text-xs max-w-[180px] font-mono p-1 bg-slate-100 rounded-md">
                {value || "Empty"}
              </p>
            </div>
          );
        })} */}

        <div
          className="flex flex-row justify-between rounded-lg border p-3 shadow-sm"
        >
          <p className=" text-sm font-medium capitalize">ID</p>
          <p className="truncate text-xs max-w-[180px] font-mono p-1 bg-slate-100 rounded-md">
            {user?.id}
          </p>
        </div>

        <div
          className="flex flex-row justify-between rounded-lg border p-3 shadow-sm"
        >
          <p className=" text-sm font-medium capitalize">Name</p>
          <p className="truncate text-xs max-w-[180px] font-mono p-1 bg-slate-100 rounded-md">
            {user?.name}
          </p>
        </div>

        <div
          className="flex flex-row justify-between rounded-lg border p-3 shadow-sm"
        >
          <p className=" text-sm font-medium capitalize">Email</p>
          <p className="truncate text-xs max-w-[180px] font-mono p-1 bg-slate-100 rounded-md">
            {user?.email}
          </p>
        </div>


        <div
          className="flex flex-row justify-between rounded-lg border p-3 shadow-sm"
        >
          <p className=" text-sm font-medium capitalize">Role</p>
          <p className="truncate text-xs max-w-[180px] font-mono p-1 bg-slate-100 rounded-md">
            {user?.role}
          </p>
        </div>

        <div
          className="flex flex-row justify-between rounded-lg border p-3 shadow-sm"
        >
          <p className=" text-sm font-medium capitalize">Two Factor Authentication</p>
          <p className="truncate text-xs max-w-[180px] font-mono p-1 bg-slate-100 rounded-md">
              <Badge variant={user?.isTwoFactorEnabled ? "success" : "destructive"}>
              {user?.isTwoFactorEnabled ? "ON" : "OFF"}
              </Badge>
          </p>
        </div>


      </CardContent>
    </Card>
  );
};
