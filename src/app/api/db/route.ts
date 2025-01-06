import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const test = await prisma.$connect()
    return Response.json({success: true})
  } catch (error: any) {
    console.log(`Error when running db`, error)
    return Response.json({
      error: error.message,
      url: process.env.DATABASE_URL
    })
  }
}