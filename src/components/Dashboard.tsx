'use client';

import React, { useState, useEffect } from 'react';
import UploadForm from './UploadForm';
import { AlertTriangle, CheckCircle, Package } from 'lucide-react';

type ComponentData = {
  id: string;
  partNumber: string;
  quantity: number;
  reference: string | null;
  stock: number;
  price: number;
  inStock: boolean;
  supplier: string | null;
};

type BOMData = {
  id: string;
  name: string;
  createdAt: string;
  components: ComponentData[];
};

export default function Dashboard() {
  const [boms, setBoms] = useState<BOMData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoms = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/bom');
        if (res.ok) {
          const data = await res.json();
          setBoms(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBoms();
  }, []);

  const refreshBoms = async () => {
    try {
      const res = await fetch('/api/bom');
      if (res.ok) {
        const data = await res.json();
        setBoms(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="text-neutral-500">Loading...</div>;

  const currentBom = boms[0]; // Show latest BOM

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-1 space-y-6">
        <UploadForm onUploadSuccess={refreshBoms} />
        {boms.length > 0 && (
          <div className="border border-neutral-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wider">BOM History</h2>
            <div className="space-y-3">
              {boms.map((bom) => (
                <div key={bom.id} className="text-sm">
                  <div className="text-neutral-900 font-medium truncate">{bom.name}</div>
                  <div className="text-neutral-500 text-xs">{new Date(bom.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="md:col-span-3">
        {currentBom ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <div className="border border-neutral-200 bg-white p-6">
                 <div className="text-neutral-500 text-xs uppercase tracking-wider mb-2">Total Parts</div>
                 <div className="text-2xl font-semibold text-neutral-900">{currentBom.components.length}</div>
               </div>
               <div className="border border-neutral-200 bg-white p-6">
                 <div className="text-neutral-500 text-xs uppercase tracking-wider mb-2">Total Cost (Qty 1)</div>
                 <div className="text-2xl font-semibold text-neutral-900">
                   ${currentBom.components.reduce((acc, c) => acc + (c.price * c.quantity), 0).toFixed(2)}
                 </div>
               </div>
               <div className="border border-red-200 bg-red-50 p-6">
                 <div className="text-red-500 text-xs uppercase tracking-wider mb-2">High Risk</div>
                 <div className="text-2xl font-semibold text-red-700">
                   {currentBom.components.filter(c => !c.inStock || c.stock < c.quantity).length}
                 </div>
               </div>
            </div>

            <div className="border border-neutral-200 bg-white overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500">
                  <tr>
                    <th className="px-6 py-3 font-medium">Part Number</th>
                    <th className="px-6 py-3 font-medium">Ref</th>
                    <th className="px-6 py-3 font-medium">Qty</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Stock</th>
                    <th className="px-6 py-3 font-medium">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {currentBom.components.map((c) => {
                    const isRisky = !c.inStock || c.stock < c.quantity;
                    return (
                      <tr key={c.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 font-medium text-neutral-900">{c.partNumber}</td>
                        <td className="px-6 py-4 text-neutral-500">{c.reference || '-'}</td>
                        <td className="px-6 py-4 text-neutral-900">{c.quantity}</td>
                        <td className="px-6 py-4">
                          {isRisky ? (
                            <span className="inline-flex items-center gap-1.5 text-red-600 font-medium">
                              <AlertTriangle className="w-4 h-4" /> Risk
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-emerald-600">
                              <CheckCircle className="w-4 h-4" /> OK
                            </span>
                          )}
                        </td>
                        <td className={`px-6 py-4 ${isRisky ? 'text-red-600 font-medium' : 'text-neutral-500'}`}>
                          {c.stock}
                        </td>
                        <td className="px-6 py-4 text-neutral-900">${c.price.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="border border-neutral-200 bg-white p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
             <Package className="w-12 h-12 text-neutral-300 mb-4" />
             <h3 className="text-lg font-medium text-neutral-900 mb-2">No BOM Data</h3>
             <p className="text-neutral-500 max-w-sm">Upload a CSV to instantly analyze your supply chain risks and component availability.</p>
          </div>
        )}
      </div>
    </div>
  );
}
