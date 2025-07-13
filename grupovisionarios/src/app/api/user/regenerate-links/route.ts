import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'ID de usuario requerido' },
        { status: 400 }
      )
    }

    // Mock regenerated links - replace with actual database logic
    const timestamp = Date.now()
    const mockUser = {
      id: userId,
      inviteLink: `invite-${timestamp}`,
      statsLink: `stats-${timestamp}`,
      trainingLink: `training-${timestamp}`
    }

    return NextResponse.json({
      success: true,
      message: 'Enlaces regenerados exitosamente',
      user: mockUser
    })
  } catch (error) {
    console.error('Error regenerating links:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}