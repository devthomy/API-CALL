import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function PUT(request: Request) {
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
    const body = await request.json();

    // Validate required fields
    const { id, username, score } = body;

    if (!id || !username || score === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Ensure numeric types
    const numericId = Number(id);
    const numericScore = Number(score);

    if (isNaN(numericId) || isNaN(numericScore)) {
      return NextResponse.json(
        { error: 'Invalid ID or score' },
        { status: 400 }
      );
    }

    // Endpoint for updating user score
    const endpoint = `http://localhost:5000/api/leaderboard/${numericId}`;

    const updateDto = {
      id: numericId,
      username: username,
      score: numericScore
    };

    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateDto)
    });

    if (!response.ok) {
      // Get the error details from the response if possible
      const errorData = await response.json().catch(() => null);
      return NextResponse.json(
        { error: errorData?.error || 'Failed to update score', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('Error updating leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}