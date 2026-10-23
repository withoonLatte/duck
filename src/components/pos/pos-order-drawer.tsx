'use client';

import React, { useState } from 'react';
import { useRestaurant, StoreOrderItem } from '@/lib/store/restaurant-store';
import { FIXTURE_PRODUCTS, FixtureProduct } from '@/lib/store/fixtures';
import { ModifierModal } from '@/components/order/modifier-modal';
import { VoidItemModal } from './void-item-modal';
import { GboardVoiceOrderModal } from './gboard-voice-order-modal';
import { 
  X, 
  UtensilsCrossed, 
  Search, 
  Plus, 
  Minus, 
  ChefHat, 
  Receipt, 
  ShoppingBag,
  ChevronUp,
  Mic,
  MicOff,
  Sparkles
} from 'lucide-react';

interface POSOrderDrawerProps {
  table: {
    id: string;
    number: string;
    name: string;
    status: string;
    currentOrderId?: string;
  };
  onClose: () => void;
  onProceedToBilling?: () => void;
}

const CATEGORIES_WITH_ICONS = [
  { id: 'ALL', icon: '🍽️', shortName: 'ทั้งหมด', name: 'ทั้งหมด' },
  { id: 'cat-01', icon: '🍜', shortName: 'ก๋วยเตี๋ยว', name: 'ก๋วยเตี๋ยว & บะหมี่เป็ด' },
  { id: 'cat-02', icon: '🍚', shortName: 'ข้าว', name: 'ข้าว & จานเดียว' },
  { id: 'cat-03', icon: '🦆', shortName: 'เป็ด/ซุป', name: 'เป็ดจานเดี่ยว & ต้มซุป' },
  { id: 'cat-04', icon: '🥤', shortName: 'เครื่องดื่ม', name: 'เครื่องดื่มสมุนไพร & น้ำ' },
];

export function POSOrderDrawer({ table, onClose, onProceedToBilling }: POSOrderDrawerProps) {
  const { 
    orders, 
    addOrderItem, 
    updateOrderItemQty, 
    removeOrderItem, 
    sendOrderToKitchen 
  } = useRestaurant();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);
  const [activeModalProduct, setActiveModalProduct] = useState<FixtureProduct | null>(null);
  const [showMobileCartSheet, setShowMobileCartSheet] = useState(false);
  const [voidTargetItem, setVoidTargetItem] = useState<StoreOrderItem | null>(null);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const toggleVoiceSearch = () => {
    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      alert('เบราว์เซอร์ไม่รองรับ Speech Recognition กรุณาใช้ Chrome หรือ Safari ครับ');
      return;
    }

    if (isVoiceSearching) {
      setIsVoiceSearching(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'th-TH';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsVoiceSearching(true);
      recognition.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        if (text) setSearchQuery(text);
        setIsVoiceSearching(false);
      };
      recognition.onerror = () => setIsVoiceSearching(false);
      recognition.onend = () => setIsVoiceSearching(false);

      recognition.start();
    } catch (err) {
      console.warn(err);
      setIsVoiceSearching(false);
    }
  };

  // Reliably find active order for this table by ID or tableNumber
  const activeOrder = orders.find(
    (o) => (o.tableId === table.id || o.tableNumber === table.number) && o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
  );

  const pendingItems = activeOrder ? activeOrder.items.filter((i) => i.status === 'PENDING') : [];
  const sentItems = activeOrder ? activeOrder.items.filter((i) => i.status !== 'PENDING') : [];
  const totalItemCount = activeOrder ? activeOrder.items.reduce((s, i) => s + i.quantity, 0) : 0;
  const currentTotal = activeOrder ? activeOrder.grandTotal : 0;

  const filteredProducts = FIXTURE_PRODUCTS.filter((p) => {
    const matchCat = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.menuCode && p.menuCode.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  const handleProductClick = (product: FixtureProduct) => {
    if (product.categoryId === 'cat-01') {
      setActiveModalProduct(product);
    } else {
      addOrderItem(table.id, product, 1, []);
      triggerAddedFeedback(product.id);
    }
  };

  const handleAddToCartWithModifiers = (qty: number, modifiers: any[], notes: string) => {
    if (!activeModalProduct) return;
    addOrderItem(table.id, activeModalProduct, qty, modifiers, notes);
    triggerAddedFeedback(activeModalProduct.id);
    setActiveModalProduct(null);
  };

  const triggerAddedFeedback = (id: string) => {
    setJustAddedId(id);
    setTimeout(() => setJustAddedId(null), 800);
  };

  const handleSendToKitchen = () => {
    sendOrderToKitchen(table.id);
    setShowMobileCartSheet(false);
  };

  return (
    <div className='fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-stretch justify-end z-50 animate-in fade-in duration-200'>
      <div className='bg-[#F4F6F5] w-full max-w-4xl h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300 relative'>
        {/* Top Header */}
        <div className='p-3.5 sm:p-4 bg-[#0C3B2E] text-white arch-header flex items-center justify-between shadow-md shrink-0 z-20'>
          <div className='flex items-center space-x-2.5 sm:space-x-3'>
            <div className='w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#D9531E] flex items-center justify-center text-white font-semibold text-sm shadow-md shrink-0'>
              {table.number}
            </div>
            <div>
              <h3 className='font-medium text-xs sm:text-base text-white flex items-center gap-1.5'>
                <span>สั่งอาหาร: {table.name}</span>
                <span className='px-2 py-0.5 rounded-full bg-[#84CC16] text-[#072E20] text-[9px] sm:text-[10px] font-black'>
                  {table.status === 'AVAILABLE' ? 'เปิดโต๊ะใหม่' : 'มีลูกค้า'}
                </span>
              </h3>
              <p className='text-[10px] sm:text-[11px] text-emerald-200/80 font-medium truncate max-w-[200px] sm:max-w-none'>
                แตะเลือกเมนูเพื่อเพิ่มรายการลงในบิล
              </p>
            </div>
          </div>

          <div className='flex items-center space-x-2'>
            {activeOrder && onProceedToBilling && (
              <button
                onClick={onProceedToBilling}
                className='px-3 py-1.5 sm:px-3.5 sm:py-2 bg-[#D9531E] hover:bg-[#B45309] text-white font-semibold rounded-2xl text-[11px] sm:text-xs flex items-center gap-1 shadow-md transition-transform active:scale-95 cursor-pointer'
              >
                <Receipt className='w-3.5 h-3.5' />
                <span>เช็คบิล</span>
              </button>
            )}
            <button
              onClick={onClose}
              className='w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25 cursor-pointer'
            >
              <X className='w-4 h-4 sm:w-5 sm:h-5' />
            </button>
          </div>
        </div>

        {/* 2-Column Desktop / Responsive Mobile View */}
        <div className='flex-1 flex flex-col md:flex-row overflow-hidden pb-20 md:pb-0 relative'>
          {/* Left: Product Catalog Panel */}
          <div className='flex-1 flex flex-col overflow-hidden border-r border-slate-200 bg-[#F4F6F5]'>
            {/* PINNED / FIXED TOP: Search & Compact Icon Category Bar */}
            <div className='p-3 sm:p-4 bg-[#F4F6F5] border-b border-slate-200/80 space-y-2.5 shrink-0 shadow-xs z-10'>
              {/* Clean Fast Search Box */}
              <div className='relative flex items-center'>
                <Search className='w-4 h-4 absolute left-3.5 text-slate-400' />
                <input
                  type='text'
                  placeholder='ค้นหาเมนู หรือแตะปุ่มไมค์เพื่อพูด...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full pl-10 pr-24 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-[#0C3B2E] shadow-xs transition-all'
                />
                <button
                  type='button'
                  onClick={() => setIsVoiceModalOpen(true)}
                  className='absolute right-1.5 px-2.5 py-1.5 bg-[#0C3B2E] hover:bg-[#072E20] text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer'
                  title='พูดสั่งรายการด้วยเสียงผ่านแป้นพิมพ์มือถือ (Gboard)'
                >
                  <Mic className='w-3.5 h-3.5 text-[#84CC16] animate-pulse' />
                  <span>พูดสั่ง</span>
                </button>
                {searchQuery && (
                  <button
                    type='button'
                    onClick={() => setSearchQuery('')}
                    className='absolute right-3 text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer'
                  >
                    <X className='w-3.5 h-3.5' />
                  </button>
                )}
              </div>

              {/* Category Filter Pills with Emojis & Compact Labels */}
              <div className='flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-xs'>
                {CATEGORIES_WITH_ICONS.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={
                      'px-3 py-1.5 rounded-2xl font-black whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 text-xs shrink-0 ' +
                      (selectedCategory === cat.id
                        ? 'bg-[#0C3B2E] text-white shadow-sm ring-1 ring-[#0C3B2E]'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50')
                    }
                  >
                    <span className='text-sm leading-none'>{cat.icon}</span>
                    <span>{cat.shortName}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SCROLLABLE PRODUCTS GRID ONLY */}
            <div className='flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 overscroll-contain'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3'>
                {filteredProducts.map((product) => {
                  const isJustAdded = justAddedId === product.id;
                  return (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className={
                        'bg-white rounded-3xl p-3 border transition-all cursor-pointer flex space-x-3 items-center relative select-none active:scale-98 ' +
                        (isJustAdded ? 'border-[#84CC16] ring-2 ring-[#84CC16] bg-lime-50/40' : 'border-slate-200/90 shadow-sm hover:border-[#0C3B2E]')
                      }
                    >
                      <div className='w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0 relative shadow-inner'>
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className='w-full h-full object-cover'
                          loading='lazy'
                        />
                        <span className='absolute bottom-0.5 right-0.5 bg-black/60 backdrop-blur-xs text-white text-[8px] px-1 rounded font-black'>
                          ฿{product.price}
                        </span>
                      </div>

                      <div className='flex-1 min-w-0'>
                        <h4 className='font-bold text-slate-800 text-xs truncate leading-tight flex items-center gap-1.5'>
                          {product.menuCode && (
                            <span className='px-1.5 py-0.5 rounded-md bg-[#0C3B2E] text-[#84CC16] font-mono font-black text-[10px] tracking-wide shrink-0 shadow-2xs'>
                              {product.menuCode}
                            </span>
                          )}
                          <span className='truncate'>{product.name}</span>
                        </h4>
                        <p className='text-[10px] text-slate-500 line-clamp-1 mt-0.5'>
                          {product.description}
                        </p>
                        <div className='flex items-center justify-between mt-1'>
                          <span className='text-[11px] font-semibold text-[#D9531E]'>฿{product.price}</span>
                          <span className='px-2.5 py-1 rounded-full bg-[#84CC16] text-[#072E20] font-black text-[10px] flex items-center gap-0.5 shadow-xs'>
                            <Plus className='w-3 h-3' />
                            <span>สั่ง</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Desktop Order Cart */}
          <div className='hidden md:flex w-80 bg-white flex-col justify-between shrink-0 shadow-lg border-l border-slate-200'>
            <div className='p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between'>
              <div className='font-medium text-xs text-slate-900 flex items-center gap-1.5'>
                <UtensilsCrossed className='w-4 h-4 text-[#0C3B2E]' />
                <span>รายการอาหารในบิล</span>
              </div>
              <span className='text-[11px] font-mono font-bold text-slate-500'>
                {activeOrder ? activeOrder.orderNumber : 'พร้อมสั่ง'}
              </span>
            </div>

            {/* Desktop Cart Items List */}
            <div className='p-3.5 overflow-y-auto flex-1 space-y-2.5 text-xs'>
              {/* Unsent (Pending) Items */}
              {pendingItems.length > 0 && (
                <div className='space-y-1.5'>
                  <div className='text-[10px] font-black text-amber-800 uppercase bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200'>
                    ● รายการใหม่ (รอส่งเข้าครัว):
                  </div>
                  {pendingItems.map((item) => (
                    <div key={item.id} className='p-2.5 bg-amber-50/40 rounded-2xl border border-amber-200 flex justify-between items-start'>
                      <div className='flex-1 pr-2'>
                        <div className='font-semibold text-slate-800 text-xs'>{item.productName}</div>
                        {item.modifiers.length > 0 && (
                          <div className='text-[10px] text-slate-500 mt-0.5'>
                            {item.modifiers.map((m) => m.optionName).join(', ')}
                          </div>
                        )}
                        {item.notes && (
                          <div className='text-[10px] text-amber-700 italic mt-0.5'>
                            &quot;{item.notes}&quot;
                          </div>
                        )}
                        <div className='font-semibold text-[#D9531E] mt-1'>฿{item.lineTotal.toFixed(2)}</div>
                      </div>

                      <div className='flex items-center space-x-1.5 bg-white px-2 py-1 rounded-xl border border-slate-200 shadow-xs'>
                        <button
                          onClick={() => updateOrderItemQty(table.id, item.id, -1)}
                          className='w-5 h-5 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 rounded cursor-pointer'
                        >
                          -
                        </button>
                        <span className='font-medium text-xs w-3 text-center'>{item.quantity}</span>
                        <button
                          onClick={() => updateOrderItemQty(table.id, item.id, 1)}
                          className='w-5 h-5 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 rounded cursor-pointer'
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Already Sent Items */}
              {sentItems.length > 0 && (
                <div className='space-y-1.5 pt-2'>
                  <div className='text-[10px] font-black text-emerald-800 uppercase bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200'>
                    ✓ รายการที่ส่งเข้าครัวแล้ว:
                  </div>
                  {sentItems.map((item) => (
                    <div key={item.id} className='p-2.5 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-slate-700 gap-2'>
                      <div className='flex-1'>
                        <span className='font-bold text-slate-900 text-xs'>{item.productName} x{item.quantity}</span>
                        {item.modifiers.length > 0 && (
                          <div className='text-[10px] text-slate-400'>+ {item.modifiers.map((m) => m.optionName).join(', ')}</div>
                        )}
                        {item.notes && (
                          <div className='text-[9.5px] text-amber-700'>* {item.notes}</div>
                        )}
                      </div>

                      <div className='flex items-center space-x-2'>
                        <span className='font-bold text-slate-800 text-xs'>฿{item.lineTotal.toFixed(2)}</span>
                        <button
                          type='button'
                          onClick={() => setVoidTargetItem(item)}
                          className='px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-[10px] font-bold flex items-center gap-0.5 cursor-pointer transition-colors'
                          title='ขอยกเลิกจานนี้ (Void Item)'
                        >
                          <span>🚫 ยกเลิกจาน</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(!activeOrder || (pendingItems.length === 0 && sentItems.length === 0)) && (
                <div className='p-8 text-center text-slate-400 space-y-2'>
                  <UtensilsCrossed className='w-8 h-8 mx-auto text-slate-300' />
                  <p className='text-xs font-bold'>ยังไม่มีรายการอาหารในโต๊ะนี้</p>
                  <p className='text-[10px] text-slate-400'>แตะเลือกเมนูด้านซ้ายเพื่อเพิ่มรายการ</p>
                </div>
              )}
            </div>

            {/* Desktop Cart Footer */}
            <div className='p-3.5 border-t border-slate-200 bg-slate-50 space-y-2.5'>
              <div className='flex justify-between items-center font-semibold text-sm text-slate-900'>
                <span>ยอดรวมทั้งสิ้น:</span>
                <span className='text-base font-semibold text-[#D9531E]'>฿{currentTotal.toFixed(2)}</span>
              </div>

              {pendingItems.length > 0 ? (
                <button
                  onClick={handleSendToKitchen}
                  className='w-full py-3 bg-[#84CC16] hover:bg-[#65A30D] text-[#072E20] font-semibold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg transition-transform active:scale-95 cursor-pointer'
                >
                  <ChefHat className='w-4 h-4' />
                  <span>ส่งเข้าครัวทันที ({pendingItems.length} รายการ)</span>
                </button>
              ) : activeOrder && sentItems.length > 0 && onProceedToBilling ? (
                <button
                  onClick={onProceedToBilling}
                  className='w-full py-3 bg-[#D9531E] hover:bg-[#B45309] text-white font-semibold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg transition-transform active:scale-95 cursor-pointer'
                >
                  <Receipt className='w-4 h-4' />
                  <span>เรียกเช็คบิล / รับชำระเงิน</span>
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Floating Mobile Bottom Cart Bar (Shows ONLY when NO MODAL IS OPEN) */}
        {!activeModalProduct && !showMobileCartSheet && (
          <div className='md:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl z-30 flex items-center justify-between gap-2'>
            <button
              onClick={() => setShowMobileCartSheet(true)}
              className='flex items-center space-x-2.5 text-left py-1 px-2 rounded-2xl active:bg-slate-100'
            >
              <div className='relative w-10 h-10 rounded-2xl bg-[#0C3B2E] text-white flex items-center justify-center font-medium text-xs shadow-md'>
                <ShoppingBag className='w-5 h-5 text-[#84CC16]' />
                {totalItemCount > 0 && (
                  <span className='absolute -top-1 -right-1 w-5 h-5 bg-[#D9531E] text-white rounded-full text-[10px] font-black flex items-center justify-center border border-white animate-bounce'>
                    {totalItemCount}
                  </span>
                )}
              </div>
              <div>
                <div className='text-[10px] text-slate-500 font-bold flex items-center gap-1'>
                  <span>ดูบิลโต๊ะ {table.number}</span>
                  <ChevronUp className='w-3 h-3 text-slate-400' />
                </div>
                <div className='text-sm font-semibold text-[#D9531E]'>฿{currentTotal.toFixed(2)}</div>
              </div>
            </button>

            <div className='flex items-center gap-1.5'>
              {pendingItems.length > 0 ? (
                <button
                  onClick={handleSendToKitchen}
                  className='px-4 py-2.5 bg-[#84CC16] hover:bg-[#65A30D] text-[#072E20] font-semibold rounded-2xl text-xs flex items-center gap-1.5 shadow-lg transition-transform active:scale-95 cursor-pointer'
                >
                  <ChefHat className='w-4 h-4' />
                  <span>ส่งครัว ({pendingItems.length})</span>
                </button>
              ) : activeOrder && sentItems.length > 0 && onProceedToBilling ? (
                <button
                  onClick={onProceedToBilling}
                  className='px-4 py-2.5 bg-[#D9531E] text-white font-semibold rounded-2xl text-xs flex items-center gap-1.5 shadow-lg transition-transform active:scale-95 cursor-pointer'
                >
                  <Receipt className='w-4 h-4' />
                  <span>เช็คบิล</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowMobileCartSheet(true)}
                  className='px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-2xl text-xs flex items-center gap-1'
                >
                  <span>ดูบิล</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mobile Cart Bottom Sheet Modal */}
        {showMobileCartSheet && (
          <div className='md:hidden fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 flex items-end animate-in fade-in'>
            <div className='bg-white rounded-t-4xl w-full max-h-[80vh] flex flex-col shadow-2xl border-t border-slate-200 overflow-hidden animate-in slide-in-from-bottom duration-200'>
              <div className='p-4 bg-[#0C3B2E] text-white flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <ShoppingBag className='w-5 h-5 text-[#84CC16]' />
                  <h4 className='font-semibold text-sm'>รายการอาหารในบิล: โต๊ะ {table.number}</h4>
                </div>
                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => setShowMobileCartSheet(false)}
                    className='px-3 py-1 bg-white/15 text-white rounded-full text-xs font-bold cursor-pointer'
                  >
                    ปิด
                  </button>
                </div>
              </div>

              {/* Items list */}
              <div className='p-4 overflow-y-auto flex-1 space-y-2.5 text-xs'>
                {pendingItems.length > 0 && (
                  <div className='space-y-1.5'>
                    <div className='text-[10px] font-black text-amber-800 uppercase bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200'>
                      ● รายการใหม่ (รอส่งเข้าครัว):
                    </div>
                    {pendingItems.map((item) => (
                      <div key={item.id} className='p-2.5 bg-amber-50/40 rounded-2xl border border-amber-200 flex justify-between items-start'>
                        <div className='flex-1 pr-2'>
                          <div className='font-semibold text-slate-800 text-xs'>{item.productName}</div>
                          {item.modifiers.length > 0 && (
                            <div className='text-[10px] text-slate-500 mt-0.5'>
                              {item.modifiers.map((m) => m.optionName).join(', ')}
                            </div>
                          )}
                          {item.notes && (
                            <div className='text-[10px] text-amber-700 italic mt-0.5'>
                              &quot;{item.notes}&quot;
                            </div>
                          )}
                          <div className='font-semibold text-[#D9531E] mt-1'>฿{item.lineTotal.toFixed(2)}</div>
                        </div>

                        <div className='flex items-center space-x-1.5 bg-white px-2 py-1 rounded-xl border border-slate-200 shadow-xs'>
                          <button
                            onClick={() => updateOrderItemQty(table.id, item.id, -1)}
                            className='w-6 h-6 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 rounded cursor-pointer'
                          >
                            -
                          </button>
                          <span className='font-medium text-xs w-4 text-center'>{item.quantity}</span>
                          <button
                            onClick={() => updateOrderItemQty(table.id, item.id, 1)}
                            className='w-6 h-6 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 rounded cursor-pointer'
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {sentItems.length > 0 && (
                  <div className='space-y-1.5 pt-2'>
                    <div className='text-[10px] font-black text-emerald-800 uppercase bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200'>
                      ✓ ส่งเข้าครัวแล้ว:
                    </div>
                    {sentItems.map((item) => (
                      <div key={item.id} className='p-2 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-slate-700'>
                        <div>
                          <span className='font-bold text-slate-900'>{item.productName} x{item.quantity}</span>
                          {item.modifiers.length > 0 && (
                            <div className='text-[9px] text-slate-400'>{item.modifiers.map((m) => m.optionName).join(', ')}</div>
                          )}
                        </div>
                        <span className='font-semibold text-slate-800'>฿{item.lineTotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {(!activeOrder || (pendingItems.length === 0 && sentItems.length === 0)) && (
                  <div className='p-8 text-center text-slate-400'>
                    <p className='text-xs font-bold'>ยังไม่มีรายการในบิล</p>
                  </div>
                )}
              </div>

              {/* Sheet footer */}
              <div className='p-4 border-t border-slate-100 bg-slate-50 space-y-2.5'>
                <div className='flex justify-between items-center font-semibold text-sm text-slate-900'>
                  <span>ยอดรวมทั้งสิ้น:</span>
                  <span className='text-base font-semibold text-[#D9531E]'>฿{currentTotal.toFixed(2)}</span>
                </div>

                {pendingItems.length > 0 && (
                  <button
                    onClick={handleSendToKitchen}
                    className='w-full py-3 bg-[#84CC16] hover:bg-[#65A30D] text-[#072E20] font-semibold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg transition-transform active:scale-95 cursor-pointer'
                  >
                    <ChefHat className='w-4 h-4' />
                    <span>ส่งเข้าครัวทันที ({pendingItems.length} รายการ)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* GBOARD VOICE TO POS MODAL */}
        <GboardVoiceOrderModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          targetTable={table}
        />

        {/* MODIFIER MODAL */}
        {activeModalProduct && (
          <ModifierModal
            product={activeModalProduct}
            onClose={() => setActiveModalProduct(null)}
            onAddToCart={handleAddToCartWithModifiers}
          />
        )}

        {/* HIGH-SECURITY VOID ITEM MODAL WITH PHOTO & SIGNATURE */}
        {voidTargetItem && (
          <VoidItemModal
            tableId={table.id}
            tableNumber={table.number}
            item={voidTargetItem}
            onClose={() => setVoidTargetItem(null)}
            onSuccess={() => {
              setVoidTargetItem(null);
            }}
          />
        )}


      </div>
    </div>
  );
}
