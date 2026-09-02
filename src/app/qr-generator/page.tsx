'use client';

import React, { useState } from 'react';
import { useRestaurant } from '@/lib/store/restaurant-store';
import { TableTentCard } from '@/components/pos/table-tent-card';
import { TableQRCode } from '@/components/pos/qr-code-canvas';
import { 
  QrCode, 
  Printer, 
  Download, 
  ExternalLink, 
  Sparkles, 
  Settings2, 
  LayoutGrid, 
  Layers, 
  CheckCircle2, 
  Smartphone,
  ArrowRight,
  Wifi
} from 'lucide-react';
import Link from 'next/link';

export default function QRGeneratorPage() {
  const { tables } = useRestaurant();
  const [baseUrl, setBaseUrl] = useState(
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  );
  const [styleMode, setStyleMode] = useState<'ACRYLIC' | 'STICKER'>('ACRYLIC');
  const [selectedFloor, setSelectedFloor] = useState<string>('ALL');

  const filteredTables = tables.filter((t) => (selectedFloor === 'ALL' ? true : t.floor === selectedFloor));

  const handlePrintAll = () => {
    window.print();
  };

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col space-y-6'>
      {/* Header Banner with Geometric Background */}
      <div 
        className='relative rounded-3xl p-6 sm:p-7 text-white shadow-xl overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-cyan-300/40 print:hidden'
        style={{
          backgroundImage: "linear-gradient(to right, rgba(0, 30, 45, 0.72) 0%, rgba(0, 40, 50, 0.45) 50%, rgba(0, 0, 0, 0.2) 100%), url('/images/banner-bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className='relative z-10'>
          <div className='inline-flex items-center space-x-2 px-3 py-1 bg-black/35 backdrop-blur-md rounded-full text-xs font-black text-[#84CC16] border border-white/20 mb-2 shadow-xs'>
            <QrCode className='w-4 h-4 text-[#84CC16]' />
            <span>TABLE QR GENERATOR & PRINT HUB</span>
          </div>
          <h2 className='text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md'>
            ระบบสร้าง & พิมพ์ QR Code ประจำโต๊ะอาหาร
          </h2>
          <p className='text-white/90 text-xs sm:text-sm mt-1 font-semibold drop-shadow-sm max-w-2xl'>
            สร้าง QR Code อัตโนมัติแยกตามหมายเลขโต๊ะ (T01 - T08), ออกแบบป้ายตั้งโต๊ะสวยงาม พร้อมปุ่มสั่งพิมพ์ A4 รวมทุกโต๊ะ
          </p>
        </div>

        {/* Top Actions */}
        <div className='relative z-10 flex items-center gap-2 flex-wrap'>
          <button
            onClick={handlePrintAll}
            className='px-5 py-3 bg-[#84CC16] hover:bg-[#65A30D] text-[#072E20] font-black rounded-2xl text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer'
          >
            <Printer className='w-4 h-4' />
            <span>🖨️ สั่งพิมพ์ป้าย QR ทุกโต๊ะ (Print All A4)</span>
          </button>
        </div>
      </div>

      {/* Configuration & Controls Toolbar */}
      <div className='bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4 print:hidden'>
        <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
          {/* Base URL Input */}
          <div className='flex-1 flex flex-col sm:flex-row sm:items-center gap-2.5'>
            <span className='text-xs font-black text-slate-800 flex items-center gap-1.5 shrink-0'>
              <Settings2 className='w-4 h-4 text-[#0C3B2E]' />
              <span>Base URL (สำหรับสแกนในร้าน):</span>
            </span>
            <input
              type='text'
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder='เช่น http://192.168.1.100:3000 หรือ domain'
              className='flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs text-slate-900 focus:bg-white focus:outline-[#0C3B2E]'
            />
          </div>

          {/* Style Selector & Floor Filter */}
          <div className='flex items-center gap-2 flex-wrap'>
            <div className='flex items-center bg-slate-100 p-1 rounded-2xl text-xs'>
              <button
                onClick={() => setStyleMode('ACRYLIC')}
                className={
                  'px-3.5 py-1.5 rounded-xl font-black transition-all ' +
                  (styleMode === 'ACRYLIC'
                    ? 'bg-[#0C3B2E] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900')
                }
              >
                ป้ายตั้งโต๊ะ (Tent Card)
              </button>
              <button
                onClick={() => setStyleMode('STICKER')}
                className={
                  'px-3.5 py-1.5 rounded-xl font-black transition-all ' +
                  (styleMode === 'STICKER'
                    ? 'bg-[#0C3B2E] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900')
                }
              >
                สติกเกอร์ (Sticker)
              </button>
            </div>

            <div className='flex items-center space-x-1 text-xs'>
              {['ALL', '1', '2'].map((fl) => (
                <button
                  key={fl}
                  onClick={() => setSelectedFloor(fl)}
                  className={
                    'px-3 py-1.5 rounded-xl font-black transition-all ' +
                    (selectedFloor === fl
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200')
                  }
                >
                  {fl === 'ALL' ? 'ทุกชั้น' : 'ชั้น ' + fl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table QR Stand Cards Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center print:grid-cols-2 print:gap-4'>
        {filteredTables.map((table) => {
          const qrUrl = `${baseUrl}/order?table=${table.number}`;
          return (
            <div key={table.id} className='flex flex-col items-center space-y-3 w-full max-w-xs'>
              {/* Printable Standee Component */}
              <TableTentCard table={table} baseUrl={baseUrl} styleMode={styleMode} />

              {/* Action Toolbar under each card */}
              <div className='w-full bg-white rounded-2xl p-2 border border-slate-200 shadow-sm flex items-center justify-between gap-1.5 print:hidden'>
                <TableQRCode value={qrUrl} size={60} tableNumber={table.number} showDownload={true} />
                <Link
                  href={`/order?table=${table.number}`}
                  target='_blank'
                  className='flex-1 py-2 bg-[#84CC16] hover:bg-[#65A30D] text-[#072E20] font-black rounded-xl text-[11px] flex items-center justify-center gap-1 shadow-xs transition-transform active:scale-95 text-center'
                >
                  <ExternalLink className='w-3 h-3' />
                  <span>ทดสอบสั่ง</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
