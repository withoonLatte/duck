'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRestaurant, RoleType, checkRoleRoutePermission } from '@/lib/store/restaurant-store';
import { 
  Utensils, 
  Store, 
  ChefHat, 
  Boxes, 
  Smartphone, 
  Settings, 
  UserCheck, 
  ShoppingBag, 
  Menu, 
  X, 
  Receipt, 
  ChevronRight,
  Sparkles,
  Lock
} from 'lucide-react';
import { FullscreenToggle } from './fullscreen-toggle';
import { PinPadModal } from '@/components/pos/pin-pad-modal';

export function AppHeader() {
  const pathname = usePathname();
  const { activeRole, setActiveRole, restaurantSettings, tables, kdsTickets, orders, payments, currentStaff, staffMembers, logoutStaff, isAuthenticated } = useRestaurant();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  const occupiedTables = tables.filter((t) => t.status === 'OCCUPIED' || t.status === 'BILL_REQUESTED').length;
  const availableTables = tables.filter((t) => t.status === 'AVAILABLE').length;
  const pendingTickets = kdsTickets.filter((k) => k.status !== 'READY').length;
  const pendingQROrders = orders.filter((o) => o.approvalStatus === 'PENDING_APPROVAL').length;
  const totalCartItems = orders.reduce((sum, o) => sum + o.items.filter((i) => i.status === 'PENDING').length, 0);
  const totalRevenue = payments.filter((p) => p.status === 'COMPLETED').reduce((s, p) => s + p.amount, 0);

  const allNavItems = [
    { 
      href: '/pos', 
      label: 'POS หน้าร้าน', 
      sublabel: 'ผังโต๊ะ, สั่งอาหาร & เช็คบิล', 
      icon: Store, 
      badge: pendingQROrders > 0 ? `🔔 ${pendingQROrders} QR` : (occupiedTables > 0 ? `${occupiedTables} โต๊ะ` : undefined) 
    },
    { 
      href: '/kds', 
      label: 'จอครัว KDS', 
      sublabel: 'สถานีปรุงอาหาร & ลวกเส้น', 
      icon: ChefHat, 
      badge: pendingTickets > 0 ? `${pendingTickets} คิว` : undefined 
    },
    { 
      href: '/inventory', 
      label: 'เมนู & สต็อกวัตถุดิบ', 
      sublabel: 'จัดการเมนู, วัตถุดิบ & สูตร BOM', 
      icon: Boxes 
    },
    { 
      href: '/order?table=T01', 
      label: 'QR สั่งอาหาร (ลูกค้า)', 
      sublabel: 'หน้าสั่งอาหารผ่านมือถือลูกค้า', 
      icon: Smartphone 
    },
    { 
      href: '/settings', 
      label: 'ตั้งค่าระบบ', 
      sublabel: 'ข้อมูลร้าน, ป้าย QR & บิล', 
      icon: Settings 
    },
  ];

  // Strictly filter visible navigation tabs based on staff role
  const navItems = allNavItems.filter((item) => checkRoleRoutePermission(activeRole, item.href));

  const roles: { role: RoleType; label: string }[] = [
    { role: 'OWNER', label: '👑 Owner (เจ้าของ)' },
    { role: 'MANAGER', label: '💼 Manager (ผู้จัดการ)' },
    { role: 'CASHIER', label: '💵 Cashier (แคชเชียร์)' },
    { role: 'WAITER', label: '📱 Waiter (เสิร์ฟ)' },
    { role: 'KITCHEN', label: '👨‍🍳 Kitchen (ครัว)' },
    { role: 'ACCOUNTANT', label: '📊 Accountant (บัญชี)' },
  ];

  return (
    <>
      <header 
        className='text-white sticky top-0 z-40 shadow-lg relative'
        style={{
          background: 'linear-gradient(135deg, #43c6ac 0%, #28546b 45%, #191654 100%)',
        }}
      >
        {/* Top Brand Bar */}
        <div className='max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 pb-2.5 flex items-center justify-between relative z-10'>
          {/* Logo & Store Name */}
          <Link href='/pos' className='flex items-center space-x-2.5 sm:space-x-3 group min-w-0'>
            <div className='w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#D9531E] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform overflow-hidden shrink-0'>
              {restaurantSettings.logoUrl ? (
                <img src={restaurantSettings.logoUrl} alt='Logo' className='w-full h-full object-cover' />
              ) : (
                <Utensils className='w-5 h-5' />
              )}
            </div>
            <div className='min-w-0'>
              <div className='font-bold text-white text-sm sm:text-base tracking-tight leading-tight flex items-center gap-1.5'>
                <span className='truncate max-w-[120px] sm:max-w-[220px] md:max-w-none'>{restaurantSettings.name}</span>
                <span className='px-2 py-0.5 rounded-full bg-[#84CC16] text-[#072E20] font-bold text-[9px] sm:text-[10px] tracking-wide shrink-0 shadow-xs'>
                  POS
                </span>
              </div>
              <div className='text-[10px] sm:text-[11px] text-teal-100/90 font-medium truncate max-w-[120px] sm:max-w-none'>
                {restaurantSettings.branchName}
              </div>
            </div>
          </Link>

          {/* Right Actions: Role Selector, Fullscreen, Cart, and Mobile 3-line Hamburger */}
          <div className='flex items-center space-x-1.5 sm:space-x-2.5 shrink-0'>
            {/* Quick PIN Staff Switch Button */}
            <button
              type='button'
              onClick={() => setShowPinModal(true)}
              title='แตะเพื่อสลับพนักงานด้วย PIN 4 หลัก'
              className='hidden sm:flex items-center space-x-2 bg-black/25 hover:bg-black/35 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/20 text-xs text-white shadow-sm transition-all active:scale-95 cursor-pointer'
            >
              <div className='w-2 h-2 rounded-full bg-[#84CC16] animate-pulse' />
              <span className='font-bold text-teal-100'>{currentStaff ? currentStaff.name.split(' ')[0] : activeRole}</span>
              <span className='px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] font-mono font-bold text-white'>PIN</span>
            </button>

            {/* Lock Screen / Logout Button */}
            <button
              type='button'
              onClick={logoutStaff}
              title='ล็อกหน้าจอ POS (Lock Screen)'
              className='flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-black/25 hover:bg-red-950/60 border border-white/20 text-xs text-white transition-all active:scale-95 cursor-pointer'
            >
              <Lock className='w-3.5 h-3.5 text-amber-300' />
              <span className='hidden sm:inline text-[11px] font-semibold'>ล็อก</span>
            </button>

            {/* Fullscreen Toggle Button */}
            <FullscreenToggle />

            {/* Quick Cart Pill Button */}
            <Link
              href='/pos'
              title='รายการสั่งอาหาร'
              className='relative w-9 h-9 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white transition-colors shadow-sm'
            >
              <ShoppingBag className='w-4 h-4' />
              {totalCartItems > 0 && (
                <span className='absolute -top-1 -right-1 w-5 h-5 bg-[#D9531E] text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-[#191654] animate-bounce'>
                  {totalCartItems}
                </span>
              )}
            </Link>

            {/* 3-LINE HAMBURGER MENU BUTTON (Visible on Tablet & Mobile: < lg) */}
            <button
              type='button'
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label='เปิดเมนูนำทาง'
              className='lg:hidden relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/20 hover:bg-white/30 active:scale-95 border border-white/25 flex items-center justify-center text-white transition-all cursor-pointer shadow-md'
            >
              <Menu className='w-5 h-5' />
              {(pendingQROrders > 0 || pendingTickets > 0) && (
                <span className='absolute -top-1 -right-1 w-3 h-3 bg-[#84CC16] rounded-full ring-2 ring-[#0C3B2E] animate-ping' />
              )}
            </button>
          </div>
        </div>

        {/* DESKTOP NAVIGATION PILLS (Visible on Desktop: >= lg) */}
        <div className='hidden lg:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-1 pb-3 relative z-10'>
          <div className='flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none'>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    'flex items-center space-x-2 px-3.5 py-2 rounded-2xl text-xs font-medium whitespace-nowrap transition-all ' +
                    (isActive
                      ? 'bg-[#84CC16] text-[#072E20] shadow-md font-bold'
                      : 'bg-white/15 text-white hover:bg-white/25 border border-white/10 backdrop-blur-xs')
                  }
                >
                  <Icon className={'w-4 h-4 ' + (isActive ? 'text-[#072E20]' : 'text-teal-200')} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={
                        'ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold ' +
                        (isActive ? 'bg-[#191654] text-white' : 'bg-[#D9531E] text-white')
                      }
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Organic Wave Bottom SVG */}
        <div className='w-full overflow-hidden leading-none -mb-[1px]'>
          <svg
            viewBox='0 0 1440 28'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            className='w-full h-3 sm:h-5 text-slate-100/70 block'
            preserveAspectRatio='none'
          >
            <path
              d='M0,0 C360,26 820,28 1440,2 L1440,28 L0,28 Z'
              fill='#F1F5F9'
              fillOpacity='0.7'
            />
          </svg>
        </div>
      </header>

      {/* PIN PAD MODAL */}
      {showPinModal && <PinPadModal onClose={() => setShowPinModal(false)} />}

      {/* ============================================================
          TABLET & MOBILE SLIDE-OVER NAVIGATION DRAWER (3-Line Menu)
      ============================================================ */}
      {isMobileMenuOpen && (
        <div className='fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200'>
          {/* Backdrop Blur Overlay */}
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className='fixed inset-0 bg-slate-950/75 backdrop-blur-sm'
          />

          {/* Drawer Content */}
          <div className='relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300 z-10'>
            {/* Drawer Header */}
            <div>
              <div 
                className='p-5 text-white shadow-md'
                style={{
                  background: 'linear-gradient(135deg, #43c6ac 0%, #28546b 45%, #191654 100%)',
                }}
              >
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-11 h-11 rounded-2xl bg-[#D9531E] flex items-center justify-center text-white font-bold shadow-md'>
                      {restaurantSettings.logoUrl ? (
                        <img src={restaurantSettings.logoUrl} alt='Logo' className='w-full h-full object-cover rounded-2xl' />
                      ) : (
                        <Utensils className='w-5 h-5' />
                      )}
                    </div>
                    <div>
                      <div className='font-bold text-sm text-white'>{restaurantSettings.name}</div>
                      <div className='text-[10px] text-teal-100 font-medium'>{restaurantSettings.branchName}</div>
                    </div>
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className='w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors active:scale-95'
                  >
                    <X className='w-5 h-5' />
                  </button>
                </div>

                {/* Staff & PIN Switcher in Drawer */}
                <div className='bg-black/30 backdrop-blur-md p-3 rounded-2xl border border-white/20 flex items-center justify-between text-xs'>
                  <div>
                    <span className='text-[10px] text-teal-100 block'>พนักงานประจำเครื่อง:</span>
                    <span className='font-bold text-white text-xs'>{currentStaff ? currentStaff.name : activeRole}</span>
                  </div>
                  <button
                    type='button'
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setShowPinModal(true);
                    }}
                    className='px-3 py-1.5 bg-[#84CC16] hover:bg-[#65A30D] text-[#072E20] font-bold rounded-xl text-xs transition-transform active:scale-95 cursor-pointer shadow-sm flex items-center gap-1'
                  >
                    <span>สลับ PIN</span>
                  </button>
                </div>
              </div>

              {/* Navigation Items List */}
              <div className='p-4 space-y-1.5'>
                <div className='text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2'>
                  เมนูการใช้งานระบบ
                </div>

                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={
                        'p-3.5 rounded-2xl flex items-center justify-between transition-all ' +
                        (isActive
                          ? 'bg-emerald-50 border-2 border-[#0C3B2E] text-[#0C3B2E] shadow-sm font-bold'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/80')
                      }
                    >
                      <div className='flex items-center space-x-3'>
                        <div className={
                          'w-10 h-10 rounded-xl flex items-center justify-center ' +
                          (isActive ? 'bg-[#0C3B2E] text-white shadow-xs' : 'bg-slate-200/80 text-slate-700')
                        }>
                          <Icon className='w-5 h-5' />
                        </div>
                        <div>
                          <div className='font-bold text-xs sm:text-sm text-slate-900'>{item.label}</div>
                          <div className='text-[10.5px] text-slate-500 font-normal'>{item.sublabel}</div>
                        </div>
                      </div>

                      <div className='flex items-center space-x-1.5'>
                        {item.badge !== undefined && (
                          <span className={
                            'px-2.5 py-0.5 rounded-full text-[10px] font-bold ' +
                            (isActive ? 'bg-[#0C3B2E] text-white' : 'bg-[#D9531E] text-white')
                          }>
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className='w-4 h-4 text-slate-400' />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Drawer Footer: Quick Store Status */}
            <div className='p-4 bg-slate-50 border-t border-slate-200 space-y-2.5 text-xs'>
              <div className='flex justify-between items-center text-slate-600'>
                <span>สถานะโต๊ะ:</span>
                <span className='font-bold text-slate-900'>
                  ว่าง {availableTables} / มีลูกค้า {occupiedTables}
                </span>
              </div>
              <div className='flex justify-between items-center text-slate-600'>
                <span>ยอดขายวันนี้:</span>
                <span className='font-bold text-emerald-700'>฿{totalRevenue.toFixed(0)}</span>
              </div>
              <button
                type='button'
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logoutStaff();
                }}
                className='w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 border border-red-200 transition-colors cursor-pointer'
              >
                <Lock className='w-4 h-4' />
                <span>🔒 ล็อกหน้าจอ / ออกจากระบบ (Lock Screen)</span>
              </button>

              <div className='text-center pt-1 text-[10px] text-slate-400 font-medium border-t border-slate-200/60'>
                Duck Noodle Restaurant OS v0.1.0 • PWA Kiosk Mode
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
