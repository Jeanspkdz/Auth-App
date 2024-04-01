import crypto from "crypto"
import { db } from "./db"
import { getVerificationTokenByEmail } from "@/data/verification-token"
import { getPasswordResetTokenByEmail } from "@/data/password-reset-token"
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token"

export const generateTwoFactorToken = async (email : string) => {
  const token = crypto.randomInt(100_000, 1_000_000).toString()

  //Expires in an hour
  const expires = new Date(new Date().getTime() + 3600 * 1000) 

  const existingToken = await getTwoFactorTokenByEmail(email)

  if(existingToken){

    await db.twoFactorToken.delete({
      where: {
        id: existingToken.id
      }
    })
  }

  const twoFactorToken =  await db.twoFactorToken.create({
    data: {
      email,
      expires,
      token      
    }
  })

  return twoFactorToken

}

export const generateVerificationToken = async (email: string) => {

  //Crete fields of the new verification token
  const token = crypto.randomUUID()
  const expires = new Date(new Date().getTime() + 3600 * 1000)

  const existingToken = await getVerificationTokenByEmail(email)

  if(existingToken){
    //Delete the current token if exists
    await db.verificationToken.delete({
      where: {
        id: existingToken.id
      }
    })
  }

  //Create a new token
  const verificationToken = await db.verificationToken.create({
    data: {
      email,
      token,
      expires,
    }
  })

  return verificationToken
} 

export const generatePasswordResetToken =  async (email : string) => {
    //Crete fields of the new verification token
    const token = crypto.randomUUID()
    const expires = new Date(new Date().getTime() + 3600 * 1000)
  
    const existingToken = await getPasswordResetTokenByEmail(email)
  
    if(existingToken){
      //Delete the current token if exists
      await db.verificationToken.delete({
        where: {
          id: existingToken.id
        }
      })
    }

    const passwordResetToken = db.passwordResetToken.create({
      data: {
        email,
        token,
        expires
      }
    })

    return passwordResetToken
}
