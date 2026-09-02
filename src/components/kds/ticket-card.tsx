'use client';

import React, { useState, useEffect } from 'react';
import { useRestaurant, StoreKDSTicket } from '@/lib/store/restaurant-store';
import { Clock, CheckCircle2, AlertCircle, Check, RotateCcw, QrCode } from 'lucide-react';

interface KDSTicketCardProps {
  ticket: StoreKDSTicket;
  isCompletedView?: boolean;
}

export function KDSTicketCard({ ticket, isCompletedView = false }: KDSTicketCardProps) {
  const { bumpKDSItem, bumpKDSTicket, recallKDSTicket } = useRestaurant();
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    const calculateElapsed = () => {
      const diff = Math.floor((Date.now() - new Date(ticket.createdAt).getTime()) / 60000);
      setElapsedMinutes(Math.max(0, diff));
    };
    calculateElapsed();
    const timer = setInterval(calculateElapsed, 30000);
    return () => clearInterval(timer);
  }, [ticket.createdAt]);

  const getTimerColor = (mins: number) => {
    if (mins < 5) return 'bg-emerald-100 text-emerald-950 border-emerald-300';
    if (mins < 10) return 'bg-amber-100 text-amber-950 border-amber-400 font-black';
    return 'bg-red-500 text-white border-red-600 animate-pulse font-black';
  };

  const getStationLabel = (station: string) => {
    switch (station) {
      case 'NOODLE_STATION':
        return '🍜 ลวกเส้น';
      case 'DUCK_STATION':
        return '🦆 สับเป็ด & ข้าว';
      case 'SOUP_STATION':
        return '🍲 ต้มซุปเปอร์';
      case 'BAR_STATION':
        return '🥤 เครื่องดื่ม';
      default:
        return station;
    }
  };

  const allItemsReady = ticket.items.every((i) => i.isReady);

  return (
    <div
      className={
        'bg-white rounded-3xl border-3 shadow-md flex flex-col justify-between overflow-hidden transition-all ' +
        (isCompletedView
          ? 'border-emerald-300 bg-emerald-50/20 opacity-75'
          : allItemsReady
          ? 'border-emerald-500 bg-emerald-50/40 ring-4 ring-emerald-100'
          : 'border-slate-300 hover:border-emerald-600 hover:shadow-xl')
      }
    >
      {/* Large Header for Kitchen Staff */}
      <div className='p-4 border-b-2 border-slate-200 bg-slate-50 flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          <span className='px-3.5 py-1.5 rounded-2xl bg-[#0C3B2E] text-white font-bold text-lg sm:text-xl tracking-tight shadow-sm'>
            {ticket.tableNumber}
          </span>
          <div>
            <div className='text-sm sm:text-base font-semibold text-slate-800 leading-tight'>
              {getStationLabel(ticket.station)}
            </div>
            {ticket.tableNumber.includes('(QR)') && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-[#0C3B2E] text-[10px] font-black border border-emerald-300 mt-0.5'>
                <QrCode className='w-3 h-3' />
                <span>สั่งจากโต๊ะ QR</span>
              </span>
            )}
          </div>
        </div>

        {/* Large Timer Badge */}
        <div
          className={'px-3 py-1.5 rounded-2xl border-2 text-xs sm:text-sm font-semibold flex items-center space-x-1.5 shadow-xs ' + getTimerColor(elapsedMinutes)}
        >
          <Clock className='w-4 h-4' />
          <span>{elapsedMinutes} นาที</span>
        </div>
      </div>

      {/* Large Ticket Items Checklist */}
      <div className='p-4 space-y-3.5 flex-1 overflow-y-auto'>
        {ticket.items.map((item) => (
          <div
            key={item.id}
            onClick={() => (!isCompletedView ? bumpKDSItem(ticket.id, item.id) : undefined)}
            className={
              'p-3.5 rounded-2xl border-2 transition-all flex items-start justify-between ' +
              (isCompletedView || item.isReady
                ? 'bg-emerald-100/70 border-emerald-400 text-emerald-950 opacity-75'
                : 'bg-white border-slate-200 text-slate-950 hover:border-[#0C3B2E] shadow-sm cursor-pointer active:scale-98')
            }
          >
            <div className='flex-1 pr-3'>
              <div className='flex items-center space-x-2.5'>
                <span className='font-bold text-sm sm:text-base text-[#072E20] bg-[#84CC16] px-2.5 py-0.5 rounded-xl shadow-xs shrink-0'>
                  {item.quantity}x
                </span>
                <span className={'font-medium text-base sm:text-lg leading-snug ' + (item.isReady || isCompletedView ? 'line-through text-slate-400' : 'text-slate-900')}>
                  {item.productName}
                </span>
              </div>

              {/* High-Visibility Modifiers (เส้น / พิเศษ / ความเผ็ด / ท็อปปิ้ง) */}
              {item.modifiers.length > 0 && (
                <div className='mt-2 pl-2 space-y-1'>
                  {item.modifiers.map((m, idx) => (
                    <div 
                      key={idx} 
                      className='inline-block mr-2 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs sm:text-sm font-normal text-slate-700'
                    >
                      {m}
                    </div>
                  ))}
                </div>
              )}

              {/* Large Special Note from Customer / Staff */}
              {item.notes && (
                <div className='mt-2.5 bg-amber-100 border-2 border-amber-300 text-amber-950 p-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-1.5 shadow-2xs'>
                  <AlertCircle className='w-4 h-4 text-amber-700 shrink-0' />
                  <span>หมายเหตุ: &quot;{item.notes}&quot;</span>
                </div>
              )}
            </div>

            {/* Checkbox for Single Item */}
            <div
              className={
                'w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center border-2 transition-colors shrink-0 ' +
                (item.isReady || isCompletedView
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                  : 'border-slate-300 bg-slate-50 hover:bg-slate-100')
              }
            >
              {(item.isReady || isCompletedView) && <Check className='w-5 h-5 font-black' />}
            </div>
          </div>
        ))}
      </div>

      {/* Action Footer (Removed "Bump ออกจากจอ") */}
      <div className='p-3.5 sm:p-4 border-t-2 border-slate-200 bg-slate-50'>
        {!isCompletedView ? (
          <button
            onClick={() => bumpKDSTicket(ticket.id)}
            className='w-full py-3.5 sm:py-4 rounded-2xl font-semibold text-sm sm:text-base flex items-center justify-center space-x-2 shadow-md transition-transform bg-[#0C3B2E] hover:bg-[#072E20] text-white active:scale-98 cursor-pointer'
          >
            <CheckCircle2 className='w-5 h-5 sm:w-6 sm:h-6 text-[#84CC16]' />
            <span>อาหารพร้อมเสิร์ฟ</span>
          </button>
        ) : (
          <button
            onClick={() => recallKDSTicket(ticket.id)}
            className='w-full py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 border-2 border-slate-300 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer active:scale-98'
          >
            <RotateCcw className='w-4 h-4 text-amber-600' />
            <span>เรียกคืนกลับมาคิวครัว (Recall)</span>
          </button>
        )}
      </div>
    </div>
  );
}
