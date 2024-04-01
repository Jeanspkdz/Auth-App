"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { UserButton } from "@/components/auth/user-button";

const buttons = [
  {
    href: "/server",
    label: "Server",
  },
  {
    href: "/client",
    label: "Client",
  },
  {
    href: "/admin",
    label: "Admin",
  },
  {
    href: "/settings",
    label: "Settings",
  },
];

export const NavBar = () => {
  const pathname = usePathname();

  return (
    <nav className="bg-secondary flex justify-between items-center p-4 rounded-lg w-[600px] sha dow-sm">
      <div className="flex gap-x-2">
        {buttons.map((btn, index) => {
          return (
            <Button
              key={index}
              asChild
              variant={pathname === btn.href ? "default" : "outline"}
            >
              <Link href={btn.href}>{btn.label}</Link>
            </Button>
          );
        })}
      </div>

      <UserButton/>
    </nav>
  );
};
