import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LoginButton } from "@/components/auth/login-button";
import { poppins } from "@/fonts";

export default function Home() {
  return (
    <main className="flex h-full items-center justify-center bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-sky-400 to-blue-800 drop-shadow-md">
      <div className="space-y-6 text-center">
        <h1
          className={cn(
            "text-6xl text-white font-bold drop-shadow-md",
            poppins.className
          )}
        >
          🔐 Auth
        </h1>
        <p className="text-white text-lg">A simple authentication system</p>

        <div>
          <LoginButton mode="modal" asChild>
            <Button variant={"outline"}>Sing In</Button>
          </LoginButton>
        </div>
      </div>
    </main>
  );
}
