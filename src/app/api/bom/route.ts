import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import Papa from 'papaparse';

// Mock function to simulate fetching data from a supplier API
async function fetchMockSupplierData(partNumber: string, quantityRequired: number) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 50));

  const isRiskyPart = partNumber.toUpperCase().includes('X') || partNumber.length % 3 === 0;
  const supplierStock = isRiskyPart ? Math.floor(Math.random() * (quantityRequired + 10)) : Math.floor(Math.random() * 10000) + quantityRequired;
  const unitPrice = parseFloat((Math.random() * 10 + 0.1).toFixed(2));

  let riskLevel = 'LOW';
  if (supplierStock < quantityRequired) {
    riskLevel = 'HIGH';
  } else if (supplierStock < quantityRequired * 2) {
    riskLevel = 'MEDIUM';
  }

  return { supplierStock, unitPrice, riskLevel };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });

    const projectName = file.name.replace('.csv', '') || 'Untitled Project';

    // Get or create a mock user for the MVP
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'demo@vanguard.local',
          name: 'Demo User',
        }
      });
    }

    const project = await prisma.project.create({
      data: {
        name: projectName,
        userId: user.id,
      }
    });

    const componentsData = await Promise.all((parsed.data as Record<string, string>[]).map(async (row) => {
      const partNumber = row.PartNumber || row['Part Number'] || row.partNumber || row.PN || 'Unknown';
      const quantityRequired = parseInt(row.Quantity || row.Qty || row.qty || '1', 10);
      const safeQty = isNaN(quantityRequired) ? 1 : quantityRequired;

      const supplierData = await fetchMockSupplierData(partNumber, safeQty);

      return {
        projectId: project.id,
        partNumber: partNumber,
        quantityRequired: safeQty,
        reference: row.Reference || row.Designator || null,
        description: row.Description || row.Desc || null,
        supplierStock: supplierData.supplierStock,
        unitPrice: supplierData.unitPrice,
        riskLevel: supplierData.riskLevel,
      };
    }));

    await prisma.bomItem.createMany({
      data: componentsData
    });

    return NextResponse.json({ success: true, projectId: project.id });
  } catch (error) {
    console.error('BOM upload error:', error);
    return NextResponse.json({ error: 'Failed to process BOM' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        bomItems: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json(projects);
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to fetch Projects' }, { status: 500 });
  }
}
