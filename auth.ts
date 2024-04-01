import NextAuth from "next-auth";
import { db } from "@/lib/db";
import { PrismaAdapter } from "@auth/prisma-adapter";
import authConfig from "@/auth.config";
import { getUserById } from "@/data/user";
import { getTwoFactorConfirmationByUserId } from "./data/two-factor-confirmation";
import { getAccountByUserId } from "./data/account";

export const {
  handlers: { GET, POST },
  auth,
  signOut,
  signIn,
} = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error"
  },
  events: {
    async linkAccount({user}) {
        await db.user.update({
          where: {
            id: user.id
          },
          data: {
            emailVerified: new Date()
          }
        })
    },
    async signIn(message) {
    console.log("SIGN IN EVENT" , message);
      
    },
    async updateUser(message) {
      console.log("UPDATEING USER" , message);
    },
    async session(message) {
      console.log("SESSIOON EVENT" );
      
    },
  },
  callbacks: {
    async signIn(params) {
      console.log("SIG-IN");
      const { account, user } = params
      
      //Allow OAuth without email verification
      if(account?.provider !== "credentials")return true

      //Otherwise check if the user verified their account
      const existingUser = await getUserById(user.id!)

      if(!existingUser?.emailVerified)return false
      
      //?
      if(existingUser.isTwoFactorEnabled){
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id)

        if(!twoFactorConfirmation)return false

        //Delete two factor confirmation for next sign in
        await db.twoFactorConfirmation.delete({
          where: {
            id : twoFactorConfirmation.id
          }
        })
      }

      return true;
    },
    async jwt(params) {
      console.log("JWT");
      const { token } = params;
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);
      if(!existingUser) return token

      //Get an existing account to verify if the user has created their accpunt with an Provider
      const existingAccount = await getAccountByUserId(existingUser.id)

      //Assign values when updating user information
      token.isOAuth = !!existingAccount
      token.name = existingUser.name
      token.email = existingUser.email

      token.role = existingUser.role
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled

      return token;
    },
    async session(params) {
      // console.log("SESSION ");
      const {token, session} = params
      

      if(token.sub && session.user){
        session.user.id  = token.sub
      }

      if(token.role && session.user){
        session.user.role = token.role
      }

      if( session.user){
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled

        session.user.name = token.name
        session.user.email = token.email!
        //Add field to verify if the user is using an OAuth Provider
        session.user.isOAuth = token.isOAuth
      }
      
      return session;
    },
  },
  session: { strategy: "jwt" },
  adapter: PrismaAdapter(db),
  ...authConfig,
});
