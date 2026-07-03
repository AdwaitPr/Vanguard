import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const partNumber = searchParams.get('partNumber');

  if (!partNumber) {
    return NextResponse.json({ error: 'Part number is required' }, { status: 400 });
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Generate deterministic mock data based on the part number
  const isRisky = partNumber.toUpperCase().includes('X') || partNumber.length % 3 === 0;

  return NextResponse.json({
    partNumber,
    stock: isRisky ? Math.floor(Math.random() * 50) : Math.floor(Math.random() * 10000) + 100,
    price: parseFloat((Math.random() * 10 + 0.1).toFixed(2)),
    inStock: !isRisky,
    supplier: Math.random() > 0.5 ? 'Digi-Key' : 'Mouser',
  });
}
