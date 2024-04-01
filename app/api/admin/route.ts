import { currentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(){
  const user = await currentUser()
  const ROLE = user?.role

  const statusCode = ROLE === UserRole.ADMIN ? 200 : 403

  return new NextResponse(null,{status: statusCode})
}