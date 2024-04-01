import { poppins } from "@/fonts";
import { cn } from "@/lib/utils";

interface HeaderProps {
  label: string;
}

export const Header = ({ label }: HeaderProps) => {
  return (
    <div className="w-full flex flex-col items-center gap-y-4">
      <h1 className={cn("text-3xl font-semibold", poppins.className)}>
        🔐 Auth
      </h1>
      <p className="text-muted-foreground">{label}</p>
    </div>
  );
};
