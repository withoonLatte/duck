'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useRestaurant, checkRoleRoutePermission } from '@/lib/store/restaurant-store';
import { PinLockScreen } from './pin-lock-screen';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

export function AppAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, activeRole, currentStaff, logoutStaff } = useRestaurant();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Public customer ordering route is always accessible
  if (pathname.startsWith('/order')) {
    return <>{children}</>;
  }

  // Prevent SSR hydration mismatch by waiting for client mount
  if (!mounted) {
    return (
      <div className='min-h-screen bg-slate-900 flex items-center justify-center text-white'>
        <div className='w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin' />
      </div>
    );
  }

  // If not authenticated via 4-digit PIN, show PIN Lock Screen
  if (!isAuthenticated) {
    return (
      <>
        <PinLockScreen />
        <div className='flex-1 filter blur-md pointer-events-none opacity-40 select-none'>
          {children}
        </div>
      </>
    );
  }

  // Check role-based permission for current route
  const isAllowed = checkRoleRoutePermission(activeRole, pathname);

  if (!isAllowed) {
    return (
      <div className='flex-1 flex items-center justify-center p-6 bg-slate-100'>
        <div className='max-w-md w-full bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-red-200 text-center space-y-4 animate-in zoom-in-95'>
          <div className='w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-sm'>
            <ShieldAlert className='w-7 h-7' />
          </div>

          <div className='space-y-1'>
            <h3 className='font-black text-lg text-slate-900'>จำกัดสิทธิ์การเข้าถึง (Access Restricted)</h3>
            <p className='text-xs text-slate-600 leading-relaxed font-normal'>
              ตำแหน่งของคุณคือ <span className='font-bold text-[#0C3B2E]'>{currentStaff ? currentStaff.name : activeRole}</span> ไม่มีสิทธิ์เข้าใช้งานหน้านี้
            </p>
          </div>

          <div className='p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 text-left space-y-1'>
            <div className='font-bold'>📋 สิทธิ์การเข้าใช้งานของระบบ:</div>
            <div>• <b>เจ้าของร้าน (Owner)</b>: เข้าได้ทุกเมนู 100%</div>
            <div>• <b>ผู้จัดการ / แคชเชียร์</b>: เข้าได้ทุกเมนู ยกเว้นการตั้งค่าระบบ</div>
            <div>• <b>พนักงานเสิร์ฟ (Waiter)</b>: เข้าได้เฉพาะหน้า POS หน้าร้าน</div>
            <div>• <b>หัวหน้าครัว (Kitchen)</b>: เข้าได้เฉพาะหน้า จอครัว KDS</div>
          </div>

          <div className='pt-2 flex flex-col sm:flex-row gap-2'>
            <button
              type='button'
              onClick={() => {
                if (activeRole === 'KITCHEN') router.replace('/kds');
                else router.replace('/pos');
              }}
              className='flex-1 py-2.5 bg-[#0C3B2E] hover:bg-[#072E20] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md'
            >
              <ArrowLeft className='w-4 h-4' />
              <span>กลับสู่หน้าหลักของคุณ</span>
            </button>

            <button
              type='button'
              onClick={logoutStaff}
              className='py-2.5 px-4 bg-slate-100 hover:bg-red-50 text-red-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer'
            >
              <Lock className='w-3.5 h-3.5' />
              <span>สลับ PIN อื่น</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
