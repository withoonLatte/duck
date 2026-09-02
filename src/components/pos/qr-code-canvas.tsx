'use client';

import React, { useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { Download, Copy, Check } from 'lucide-react';

interface QRCodeCanvasProps {
  value: string;
  size?: number;
  tableNumber?: string;
  showDownload?: boolean;
}

export function TableQRCode({
  value,
  size = 200,
  tableNumber,
  showDownload = true,
}: QRCodeCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  const downloadPNG = () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = `QR-Table-${tableNumber || 'DuckNoodle'}.png`;
    a.href = url;
    a.click();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='flex flex-col items-center space-y-2.5'>
      <div
        ref={canvasRef}
        className='p-3.5 bg-white rounded-2xl border-2 border-slate-200 shadow-sm flex items-center justify-center relative group hover:border-[#0C3B2E] transition-all'
      >
        <QRCodeCanvas
          value={value}
          size={size}
          level='H'
          fgColor='#0C3B2E'
          bgColor='#FFFFFF'
          marginSize={2}
          imageSettings={{
            src: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=100&auto=format&fit=crop&q=80',
            x: undefined,
            y: undefined,
            height: size * 0.22,
            width: size * 0.22,
            excavate: true,
          }}
        />
      </div>

      {showDownload && (
        <div className='flex items-center gap-1.5'>
          <button
            onClick={downloadPNG}
            className='px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[10px] flex items-center gap-1 transition-colors cursor-pointer'
          >
            <Download className='w-3 h-3' />
            <span>โหลด PNG</span>
          </button>
          <button
            onClick={handleCopy}
            className='px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[10px] flex items-center gap-1 transition-colors cursor-pointer'
          >
            {copied ? <Check className='w-3 h-3 text-emerald-600' /> : <Copy className='w-3 h-3' />}
            <span>{copied ? 'คัดลอกแล้ว' : 'Copy URL'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
