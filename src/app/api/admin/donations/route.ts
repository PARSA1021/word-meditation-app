import { NextResponse } from 'next/server';
import { listDonations, DonationStatus } from '@/lib/donations';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as DonationStatus | null;
    
    const donations = await listDonations(status || undefined);
    
    return NextResponse.json(donations);
  } catch (error) {
    console.error('Admin donations GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
