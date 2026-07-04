'use client';

import React, { useState, useEffect } from 'react';
import UploadForm from './UploadForm';
import { AlertTriangle, CheckCircle, Package, AlertCircle } from 'lucide-react';

type BomItem = {
  id: string;
  partNumber: string;
  quantityRequired: number;
  reference: string | null;
  supplierStock: number;
  unitPrice: number;
  riskLevel: string;
};

type ProjectData = {
  id: string;
  name: string;
  createdAt: string;
  bomItems: BomItem[];
};

export default function Dashboard() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/bom');
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const refreshProjects = async () => {
    try {
      const res = await fetch('/api/bom');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="text-neutral-500">Loading...</div>;

  const currentProject = projects[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-1 space-y-6">
        <UploadForm onUploadSuccess={refreshProjects} />
        {projects.length > 0 && (
          <div className="border border-neutral-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wider">Projects History</h2>
            <div className="space-y-3">
              {projects.map((proj) => (
                <div key={proj.id} className="text-sm border-b border-neutral-100 pb-2 last:border-0">
                  <div className="text-neutral-900 font-medium truncate">{proj.name}</div>
                  <div className="text-neutral-500 text-xs">{new Date(proj.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="md:col-span-3">
        {currentProject ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <div className="border border-neutral-200 bg-white p-6">
                 <div className="text-neutral-500 text-xs uppercase tracking-wider mb-2">Total Unique Parts</div>
                 <div className="text-2xl font-semibold text-neutral-900">{currentProject.bomItems.length}</div>
               </div>
               <div className="border border-neutral-200 bg-white p-6">
                 <div className="text-neutral-500 text-xs uppercase tracking-wider mb-2">Total BOM Cost</div>
                 <div className="text-2xl font-semibold text-neutral-900">
                   ${currentProject.bomItems.reduce((acc, item) => acc + (item.unitPrice * item.quantityRequired), 0).toFixed(2)}
                 </div>
               </div>
               <div className="border border-red-200 bg-red-50 p-6">
                 <div className="text-red-500 text-xs uppercase tracking-wider mb-2">High-Risk Components</div>
                 <div className="text-2xl font-semibold text-red-700">
                   {currentProject.bomItems.filter(item => item.riskLevel === 'HIGH').length}
                 </div>
               </div>
            </div>

            <div className="border border-neutral-200 bg-white overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500">
                  <tr>
                    <th className="px-6 py-3 font-medium">Part Number</th>
                    <th className="px-6 py-3 font-medium">Qty Req</th>
                    <th className="px-6 py-3 font-medium">Stock</th>
                    <th className="px-6 py-3 font-medium">Unit Price</th>
                    <th className="px-6 py-3 font-medium">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {currentProject.bomItems.map((item) => {
                    const isHighRisk = item.riskLevel === 'HIGH';
                    const isMediumRisk = item.riskLevel === 'MEDIUM';
                    return (
                      <tr key={item.id} className={`${isHighRisk ? 'bg-red-50 hover:bg-red-100/50' : 'hover:bg-neutral-50'}`}>
                        <td className="px-6 py-4 font-medium text-neutral-900">{item.partNumber}</td>
                        <td className="px-6 py-4 text-neutral-900">{item.quantityRequired}</td>
                        <td className={`px-6 py-4 ${isHighRisk ? 'text-red-600 font-bold' : 'text-neutral-500'}`}>
                          {item.supplierStock}
                        </td>
                        <td className="px-6 py-4 text-neutral-900">${item.unitPrice.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          {isHighRisk && (
                            <span className="inline-flex items-center gap-1.5 text-red-600 font-medium text-xs uppercase tracking-wide">
                              <AlertTriangle className="w-4 h-4" /> High Risk
                            </span>
                          )}
                          {isMediumRisk && (
                            <span className="inline-flex items-center gap-1.5 text-amber-600 font-medium text-xs uppercase tracking-wide">
                              <AlertCircle className="w-4 h-4" /> Medium
                            </span>
                          )}
                          {!isHighRisk && !isMediumRisk && (
                            <span className="inline-flex items-center gap-1.5 text-emerald-600 text-xs uppercase tracking-wide">
                              <CheckCircle className="w-4 h-4" /> Low
                            </span>
                          )}
                        </td>
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
             <h3 className="text-lg font-medium text-neutral-900 mb-2">No Project Data</h3>
             <p className="text-neutral-500 max-w-sm">Upload a CSV to instantly analyze your supply chain risks and component availability.</p>
          </div>
        )}
      </div>
    </div>
  );
}
