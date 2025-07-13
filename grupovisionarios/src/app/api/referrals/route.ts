import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'ID de usuario requerido' },
        { status: 400 }
      )
    }

    // Mock referrals data - replace with actual database logic
    const mockReferrals = {
      success: true,
      referrals: [
        {
          id: '1',
          name: 'Ana García',
          email: 'ana@example.com',
          joinDate: '2024-01-15T10:30:00Z',
          status: 'active',
          level: 1,
          earnings: 50000,
          referralsCount: 3
        },
        {
          id: '2',
          name: 'Carlos López',
          email: 'carlos@example.com',
          joinDate: '2024-02-10T14:20:00Z',
          status: 'active',
          level: 1,
          earnings: 30000,
          referralsCount: 1
        },
        {
          id: '3',
          name: 'María Rodríguez',
          email: 'maria@example.com',
          joinDate: '2024-03-05T09:15:00Z',
          status: 'inactive',
          level: 1,
          earnings: 0,
          referralsCount: 0
        }
      ],
      pagination: {
        total: 3,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    }

    return NextResponse.json(mockReferrals)
  } catch (error) {
    console.error('Error fetching referrals:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}