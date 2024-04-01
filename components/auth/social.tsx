"use client";

import { Button } from "@/components/ui/button";
import { GoogleIcon, GithubIcon } from "@/components/icons";
import { signIn } from "next-auth/react";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

export const Social = () => {
  const onCLick = (provider: "google" | "github") => () => {
    //Notice that this functions comes from next-auth/react in order to used it in client-component
    signIn(provider, {
      callbackUrl: DEFAULT_LOGIN_REDIRECT,
    });
  };

  return (
    <div className="flex items-center justify-center gap-x-2 w-full">
      <Button
        size={"lg"}
        variant={"outline"}
        className="w-full"
        onClick={onCLick("google")}
      >
        <GoogleIcon />
      </Button>

      <Button size={"lg"} variant={"outline"} className="w-full" onClick={onCLick("github")}>
        <GithubIcon />
      </Button>
    </div>
  );
};
