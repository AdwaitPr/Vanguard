'use client';

import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

export default function UploadForm({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/bom', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        onUploadSuccess();
      } else {
        console.error('Failed to upload BOM');
      }
    } catch (error) {
      console.error('Error uploading BOM:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="border border-neutral-200 bg-white p-6 flex flex-col items-center justify-center min-h-[200px] cursor-pointer hover:bg-neutral-50 transition-colors" onClick={() => fileInputRef.current?.click()}>
      <input
        type="file"
        accept=".csv"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <Upload className="w-8 h-8 text-neutral-400 mb-4" />
      <p className="text-neutral-900 font-medium mb-1">
        {isUploading ? 'Uploading...' : 'Upload BOM'}
      </p>
      <p className="text-neutral-500 text-sm">
        CSV format
      </p>
    </div>
  );
}
