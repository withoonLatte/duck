'use client';

import React, { useState } from 'react';
import { useRestaurant } from '@/lib/store/restaurant-store';
import { KDSTicketCard } from '@/components/kds/ticket-card';
import { ChefHat, Clock, Filter, History, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function KDSPage() {
  const { kdsTickets } = useRestaurant();
  const [selectedStation, setSelectedStation] = useState<string>('ALL');
  const [queueView, setQueueView] = useState<'ACTIVE' | 'COMPLETED'>('ACTIVE');

  const stations = [
    { code: 'ALL', label: '🍽️ ทุกสถานีครัว' },
    { code: 'NOODLE_STATION', label: '🍜 สถานีลวกเส้น' },
    { code: 'DUCK_STATION', label: '🦆 สถานีสับเป็ด & ข้าว' },
    { code: 'SOUP_STATION', label: '🍲 สถานีต้มซุปเปอร์' },
    { code: 'BAR_STATION', label: '🥤 สถานีเครื่องดื่ม' },
  ];

  const filteredTickets = kdsTickets.filter((t) => (selectedStation === 'ALL' ? true : t.station === selectedStation));
  const activeTickets = filteredTickets.filter((t) => t.status !== 'READY');
  const readyTickets = filteredTickets.filter((t) => t.status === 'READY');

  const displayedTickets = queueView === 'ACTIVE' ? activeTickets : readyTickets;

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col space-y-6'>
      {/* Header Banner with Geometric Background from Image 2 */}
      <div 
        className='relative rounded-3xl p-6 sm:p-7 text-white shadow-xl overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-cyan-300/40'
        style={{
          backgroundImage: "linear-gradient(to right, rgba(0, 30, 45, 0.72) 0%, rgba(0, 40, 50, 0.45) 50%, rgba(0, 0, 0, 0.2) 100%), url('/images/banner-bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className='relative z-10'>
          <div className='inline-flex items-center space-x-2 px-3 py-1 bg-black/35 backdrop-blur-md rounded-full text-xs font-bold text-[#84CC16] border border-white/20 mb-2 shadow-xs'>
            <ChefHat className='w-4 h-4 text-[#84CC16]' />
            <span>KITCHEN DISPLAY SYSTEM (KDS)</span>
          </div>
          <h2 className='text-xl sm:text-2xl font-bold tracking-tight text-white'>
            ระบบจอครัว & สถานีปรุงอาหาร
          </h2>
          <p className='text-white/85 text-xs sm:text-sm mt-1 font-normal max-w-2xl'>
            จอแสดงผลขนาดใหญ่สำหรับพ่อครัว แตะเลือกเมนูที่ปรุงเสร็จ และกด &quot;อาหารพร้อมเสิร์ฟ&quot; เพื่อส่งเสิร์ฟลูกค้า
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className='relative z-10 flex items-center space-x-2 bg-black/45 backdrop-blur-md p-1.5 rounded-2xl border border-white/25 text-xs shadow-md'>
          <button
            onClick={() => setQueueView('ACTIVE')}
            className={
              'px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer ' +
              (queueView === 'ACTIVE'
                ? 'bg-[#84CC16] text-[#072E20] shadow-md'
                : 'text-white hover:bg-white/15')
            }
          >
            <Clock className='w-3.5 h-3.5' />
            <span>คิวที่ต้องปรุง ({activeTickets.length})</span>
          </button>
          <button
            onClick={() => setQueueView('COMPLETED')}
            className={
              'px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer ' +
              (queueView === 'COMPLETED'
                ? 'bg-[#84CC16] text-[#072E20] shadow-sm'
                : 'text-white hover:bg-white/10')
            }
          >
            <History className='w-3.5 h-3.5' />
            <span>ทำเสร็จแล้ว ({readyTickets.length})</span>
          </button>
        </div>
      </div>

      {/* Station Selector Tabs */}
      <div className='flex items-center space-x-1.5 overflow-x-auto pb-2 bg-white p-2.5 rounded-3xl border border-slate-200 shadow-sm'>
        <span className='font-medium text-slate-500 text-xs px-2 flex items-center gap-1'>
          <Filter className='w-3.5 h-3.5 text-[#0C3B2E]' /> สถานีครัว:
        </span>
        {stations.map((st) => (
          <button
            key={st.code}
            onClick={() => setSelectedStation(st.code)}
            className={
              'px-4 py-2 rounded-2xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ' +
              (selectedStation === st.code
                ? 'bg-[#0C3B2E] text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100')
            }
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* Tickets Grid - WIDER & LARGER CARDS FOR HIGH VISIBILITY */}
      {displayedTickets.length === 0 ? (
        <div className='flex-1 bg-white rounded-3xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center shadow-xs'>
          {queueView === 'ACTIVE' ? (
            <>
              <div className='w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3 shadow-xs'>
                <Sparkles className='w-8 h-8' />
              </div>
              <h3 className='text-base font-semibold text-slate-900'>🎉 ทุกออเดอร์ในครัวปรุงเสร็จเรียบร้อยแล้ว!</h3>
              <p className='text-xs text-slate-500 mt-1 font-medium'>
                ไม่มีคิวอาหารค้างในสถานีนี้ หน้าจอพร้อมรับออเดอร์ใหม่เสมอ
              </p>
              <Link
                href='/pos'
                className='mt-4 px-5 py-2.5 bg-[#0C3B2E] hover:bg-[#072E20] text-white text-xs font-semibold rounded-2xl shadow-sm'
              >
                + ไปหน้า POS หน้าร้าน
              </Link>
            </>
          ) : (
            <>
              <History className='w-12 h-12 text-slate-300 mb-2' />
              <h3 className='text-sm font-bold text-slate-600'>ยังไม่มีประวัติออเดอร์ที่ทำเสร็จในสถานีนี้</h3>
            </>
          )}
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 flex-1'>
          {displayedTickets.map((ticket) => (
            <KDSTicketCard
              key={ticket.id}
              ticket={ticket}
              isCompletedView={queueView === 'COMPLETED'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
