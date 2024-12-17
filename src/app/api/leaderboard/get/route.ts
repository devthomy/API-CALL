import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    const response = await fetch('http://localhost:5000/api/leaderboard', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard data' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
