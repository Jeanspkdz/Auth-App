"use client";

import { newVerification } from "@/actions";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";

export const NewVerificationForm = () => {
  //TODO Create customHook 

  const searchParams = useSearchParams();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const token = searchParams.get("token");

  useEffect(() => {
    //Flag
    let ignore = false

    const onSubmit = () => {
      if (!token) {
        setError("Missing Token");
        return;
      }
  
      newVerification(token)
        .then((data) => {
          if(ignore){
            setSuccess(data.success);
            setError(data.error);
          }
        })
        .catch((err) => {
          setError("something went wrong");
        });
    };

    onSubmit()
    
      return () => {
        ignore = true
      }
  }, [token]);

  return (
    <CardWrapper
      headerLabel="Confirmin your verification"
      backButtonLabel="Back to Login"
      backButtonHref="/auth/login"
    >
      <div className="flex items-center justify-center w-full">
        {!success && !error && <BeatLoader />}

        <FormSuccess message={success} />
        <FormError message={error} />
      </div>
    </CardWrapper>
  );
};
