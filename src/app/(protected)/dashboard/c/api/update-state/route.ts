import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    state
  } = body
  try {
    const session = await auth()

    const updateUser = await prisma.user.update({
      where: { id: session?.user.id as string },
      data: { state }
    })
    if (updateUser.id) {
      return NextResponse.json( {
        success: true
      }, {status: 200});
    }
    return NextResponse.json( {
      success: false
    }, {status: 202});
  } catch (error) {

    return NextResponse.json({
      success: false
    }, {status: 404});
  }
}