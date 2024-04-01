"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import {
  LoginSchema,
  NewPasswordSchema,
  RegisterSchema,
  ResetSchema,
  SettingSchema,
} from "@/schemas";
import { getUserByEmail, getUserById } from "@/data/user";
import { db } from "@/lib/db";
import { signIn, signOut } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import {
  generatePasswordResetToken,
  generateVerificationToken,
  generateTwoFactorToken,
} from "@/lib/tokens";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendTwoFactorTokenEmail,
} from "@/lib/mail";
import { getVerificationTokenByToken } from "@/data/verification-token";
import { getPasswordResetTokenByToken } from "@/data/password-reset-token";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";
import { currentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  //Validate fields from the user input
  const validatedFields = LoginSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid Fields" };
  }

  const { email, password, code } = validatedFields.data;
  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Email does not exist" };
  }

  //We do this in case the user goes away from the register page and has not confirmed their account yet
  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email
    );

    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );

    return {
      success: "Confirmation Email Sent",
    };
  }

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    //If the user has one code for 2FA
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

      if (!twoFactorToken || twoFactorToken.token !== code) {
        return { error: "Invalid Code" };
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();

      if (hasExpired) {
        return { error: "Code Expired" };
      }

      //Remove two factor token
      await db.twoFactorToken.delete({
        where: {
          id: twoFactorToken.id,
        },
      });

      const existingConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id)

      if(existingConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: {
            id: existingConfirmation.id
          }
        })
      }

      await db.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id
        }
      })

    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);

      await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);

      return {
        twoFactor: true,
      };
    }
  }

  //Sign iN using authJS when the email user is verified
  try {
    //If it fails (returning null or trowing explicitly), it will throw an error
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT, //it throws an error to redirect
    });

    //SigIn function from the configuracion used with PrismaAdapter
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin": {
          return { error: "Invalid Credentials" };
        }

        default: {
          return { error: "Something went wrong!!" };
        }
      }
    }

    throw error; // Try to comment to see what happens
  }
};

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid Fields" };
  }

  const { email, name, password } = validatedFields.data;
  const hashPassword = await bcrypt.hash(password, 10);

  //Ensure the email is not taken
  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: "Email already in use" };
  }

  await db.user.create({
    data: {
      name,
      email,
      password: hashPassword,
    },
  });

  //Generate the verification token for this new user
  const verificationToken = await generateVerificationToken(email);

  //Send verificaiton token email
  await sendVerificationEmail(verificationToken.email, verificationToken.token);

  return { success: "Confirmation Email has been sent" };
};

//Action to verify an user account
export const newVerification = async (token: string) => {
  const existingToken = await getVerificationTokenByToken(token);

  if (!existingToken) {
    return { error: "Token does not exist" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired" };
  }

  const existingUser = await getUserByEmail(existingToken.email);

  if (!existingUser) {
    return { error: "User does not exist" };
  }

  //Verify user account
  await db.user.update({
    where: {
      id: existingUser.id,
    },
    data: {
      emailVerified: new Date(),
      email: existingToken.email,
    },
  });

  //Delete verication token
  await db.verificationToken.delete({
    where: {
      id: existingToken.id,
    },
  });

  return { success: "Email Verified" };
};

//Action to send an password reset token
export const reset = async (values: z.infer<typeof ResetSchema>) => {
  const validatedFields = ResetSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid Email" };
  }

  const { email } = validatedFields.data;

  //Find if user exist
  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return { error: "Email not Found" };
  }

  //Generate Token and send email
  const passwordResetToken = await generatePasswordResetToken(email);
  await sendPasswordResetEmail(
    passwordResetToken.email,
    passwordResetToken.token
  );

  return { success: "Reset Email sent!" };
};

//Action to replace a forget password
export const newPassword = async (
  values: z.infer<typeof NewPasswordSchema>,
  token?: string | null
) => {
  if (!token) {
    return { error: "Missing Token!" };
  }

  const validatedFields = NewPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid Fields" };
  }

  const { password } = validatedFields.data;

  const existingToken = await getPasswordResetTokenByToken(token);

  if (!existingToken) {
    return { error: "Invalid Token" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired" };
  }

  const existingUser = await getUserByEmail(existingToken.email);

  if (!existingUser) {
    return { error: "Email does not exist" };
  }

  const hashPassword = await bcrypt.hash(password, 10);

  await db.user.update({
    where: {
      id: existingUser.id,
    },
    data: {
      password: hashPassword,
    },
  });

  await db.passwordResetToken.delete({
    where: {
      token: existingToken.token,
    },
  });

  return { success: "Password Updated" };
};


export const logout = async () => {
  await signOut()
}


export const admin = async () => {
  const user = await currentUser()
  const ROLE = user?.role


  if(ROLE !== UserRole.ADMIN){
    return {error : "Forbidden Server Action"}
  }

  return {success: "Allowed Server Action"}
}


export const settings = async (values : z.infer<typeof SettingSchema>) => {
  const user = await currentUser()
  if(!user){
    return {error: "Unauthorized"}
  }

  //Verify if the user exists
  const existingUser = await getUserById(user?.id!)
  if(!existingUser){
    return {error : "Unauthorized"}
  }

  //Extra protection if client side fails in any way
  if(user.isOAuth){
    values.email = undefined
    values.password = undefined
    values.newPassword = undefined
    values.isTwoFactorEnabled = undefined
  }

  //In case the user want to modify their email 
  if(user.email && user.email !== values.email){
    const existingUser = await getUserByEmail(values.email!)
    
    if(existingUser){
      return {error: "Email already in use!!"}
    }

    //IF pass
    const verificationToken = await generateVerificationToken(values.email!)

    await sendVerificationEmail(verificationToken.email, verificationToken.token)

    return {success: "Verification Email Send"}
  }

  //In case the user want to modify their password
  //Remember that users who authehticate with an provider do not have a password saved  in the DB
  if(values.password && values.newPassword && existingUser.password ){
    const passwordMatch = await bcrypt.compare(values.password, existingUser.password)

    if(!passwordMatch){
      return {error: "Incorrect Password"}
    }

    const hashedPassword = await bcrypt.hash(values.newPassword, 10)
    values.password = hashedPassword
    values.newPassword = undefined // We dont have this field in our DB
  }

  await db.user.update({
    where : {
      id: existingUser.id
    },
    data : {
      ...values
    }
  })


  return {
    success: "Settings Updated"
  }
}