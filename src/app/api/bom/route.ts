import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import Papa from 'papaparse';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();

    // Parse CSV
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });

    const bomName = file.name.replace('.csv', '') || 'Untitled BOM';

    const bom = await prisma.bOM.create({
      data: {
        name: bomName,
      }
    });

    // We assume standard columns: PartNumber, Quantity, Reference, Description
    const componentsData = await Promise.all((parsed.data as Record<string, string>[]).map(async (row) => {
      const partNumber = row.PartNumber || row['Part Number'] || row.partNumber || row.PN || 'Unknown';
      const quantity = parseInt(row.Quantity || row.Qty || row.qty || '1', 10);

      // Fetch mock supplier data
      const protocol = request.headers.get('x-forwarded-proto') || 'http';
      const host = request.headers.get('host');
      const supplierUrl = new URL(`/api/supplier?partNumber=${encodeURIComponent(partNumber)}`, `${protocol}://${host}`);

      let supplierData = { stock: 0, price: 0.0, inStock: false, supplier: null };
      try {
        const res = await fetch(supplierUrl.toString());
        if (res.ok) {
          supplierData = await res.json();
        }
      } catch (e) {
        console.error('Error fetching supplier data for', partNumber, e);
      }

      return {
        bomId: bom.id,
        partNumber: partNumber,
        quantity: isNaN(quantity) ? 1 : quantity,
        reference: row.Reference || row.Designator || null,
        description: row.Description || row.Desc || null,
        stock: supplierData.stock,
        price: supplierData.price,
        inStock: supplierData.inStock,
        supplier: supplierData.supplier,
      };
    }));

    await prisma.component.createMany({
      data: componentsData
    });

    return NextResponse.json({ success: true, bomId: bom.id });
  } catch (error) {
    console.error('BOM upload error:', error);
    return NextResponse.json({ error: 'Failed to process BOM' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const boms = await prisma.bOM.findMany({
      include: {
        components: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json(boms);
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to fetch BOMs' }, { status: 500 });
  }
}
