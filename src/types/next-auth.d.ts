import { DefaultSession } from "next-auth"
import { type AwraUser } from "@/lib/prisma"

declare module "next-auth" {
  interface Session {
    user: {}
      & DefaultSession["user"]
      & AwraUser
  }
}