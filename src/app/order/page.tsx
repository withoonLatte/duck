'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRestaurant } from '@/lib/store/restaurant-store';
import { FIXTURE_CATEGORIES, FIXTURE_PRODUCTS, FixtureProduct } from '@/lib/store/fixtures';
import { ModifierModal } from '@/components/order/modifier-modal';
import { 
  QrCode, 
  ShoppingBag, 
  Utensils, 
  Search, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  ArrowRight,
  AlertCircle,
  Mic,
  MicOff
} from 'lucide-react';

interface CartItem {
  id: string;
  product: FixtureProduct;
  quantity: number;
  modifiers: { groupName: string; optionName: string; price: number }[];
  notes?: string;
}

function CustomerQROrderContent() {
  const searchParams = useSearchParams();
  const tableParam = searchParams.get('table') || 'T01';

  const { tables, orders, kdsTickets, submitQROrder } = useRestaurant();
  const [selectedTable, setSelectedTable] = useState(tableParam);
  const [customerName, setCustomerName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);
  const [activeModalProduct, setActiveModalProduct] = useState<FixtureProduct | null>(null);

  const toggleVoiceSearch = () => {
    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      alert('เบราว์เซอร์ไม่รองรับการสั่งด้วยเสียง กรุณาใช้ Chrome หรือ Safari ครับ');
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
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);

  const activeSubmittedOrder = orders.find((o) => o.id === submittedOrderId);
  const kdsTicketForOrder = kdsTickets.filter((k) => k.orderId === submittedOrderId);
  const isKdsReady = kdsTicketForOrder.length > 0 && kdsTicketForOrder.every((k) => k.status === 'READY');

  const filteredProducts = FIXTURE_PRODUCTS.filter((p) => {
    const matchCat = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const cartTotal = cart.reduce((sum, item) => {
    const modTotal = item.modifiers.reduce((mSum, m) => mSum + m.price, 0);
    return sum + (item.product.price + modTotal) * item.quantity;
  }, 0);

  const handleAddToCart = (qty: number, modifiers: any[], notes: string) => {
    if (!activeModalProduct) return;
    const newItem: CartItem = {
      id: 'cart-' + Date.now() + '-' + Math.random(),
      product: activeModalProduct,
      quantity: qty,
      modifiers,
      notes,
    };
    setCart((prev) => [...prev, newItem]);
    setActiveModalProduct(null);
    setShowCartDrawer(true);
  };

  const handleRemoveCartItem = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSubmitOrder = () => {
    if (cart.length === 0) return;
    const orderId = submitQROrder(selectedTable, cart, customerName);
    setSubmittedOrderId(orderId);
    setCart([]);
    setShowCartDrawer(false);
  };

  return (
    <div className='max-w-md mx-auto min-h-screen bg-[#F4F6F5] flex flex-col shadow-2xl relative pb-28'>
      {/* Mobile Top Header */}
      <div 
        className='text-white p-4 pt-6 shadow-md sticky top-0 z-30 relative overflow-hidden'
        style={{
          background: 'linear-gradient(135deg, #43c6ac 0%, #28546b 45%, #191654 100%)',
        }}
      >
        <div className='flex items-center justify-between relative z-10'>
          <div className='flex items-center space-x-3'>
            <div className='w-10 h-10 rounded-2xl bg-[#D9531E] flex items-center justify-center text-white shadow-md'>
              <Utensils className='w-5 h-5' />
            </div>
            <div>
              <div className='font-bold text-sm tracking-tight flex items-center gap-1.5'>
                <span>ก๋วยเตี๋ยวเป็ดนายเอก</span>
                <span className='px-2 py-0.5 rounded-full bg-[#84CC16] text-[#072E20] font-bold text-[9px]'>
                  QR MENU
                </span>
              </div>
              <div className='text-[10px] text-teal-100/90 font-medium'>
                สาขา 1 บรรทัดทอง • สั่งผ่านมือถือ
              </div>
            </div>
          </div>

          {/* Table Pill */}
          <div className='flex items-center space-x-1.5 bg-black/25 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/20 text-xs font-semibold'>
            <QrCode className='w-3.5 h-3.5 text-[#84CC16]' />
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              aria-label='เลือกโต๊ะ'
              className='bg-transparent text-white font-semibold text-xs cursor-pointer focus:outline-none [&>option]:text-slate-900'
            >
              {tables.map((t) => (
                <option key={t.id} value={t.number}>
                  โต๊ะ {t.number}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Organic Wave Bottom SVG */}
        <div className='w-full overflow-hidden leading-none absolute bottom-0 left-0 right-0 -mb-[1px] pointer-events-none'>
          <svg
            viewBox='0 0 1440 28'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            className='w-full h-3 block'
            preserveAspectRatio='none'
          >
            <path
              d='M0,0 C360,26 820,28 1440,2 L1440,28 L0,28 Z'
              fill='#F4F6F5'
            />
          </svg>
        </div>
      </div>

      {/* Main Content: Tracking Screen OR Menu Ordering */}
      {submittedOrderId && activeSubmittedOrder ? (
        <div className='p-4 space-y-4 animate-in fade-in'>
          <div className='bg-white rounded-3xl p-5 border border-slate-200/90 shadow-md text-center space-y-4'>
            <div className='space-y-3 py-2'>
              {activeSubmittedOrder.approvalStatus === 'PENDING_APPROVAL' && (
                <div className='p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 space-y-2'>
                  <div className='w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto animate-pulse shadow-md'>
                    <Clock className='w-6 h-6' />
                  </div>
                  <h3 className='font-black text-base text-amber-950'>ส่งรายการแล้ว • รอ POS อนุมัติ</h3>
                  <p className='text-xs text-amber-800 leading-relaxed font-medium'>
                    พนักงานหน้าร้านกำลังตรวจสอบรายการอาหารที่โต๊ะ <b>{activeSubmittedOrder.tableNumber}</b> เพื่อส่งเข้าครัว
                  </p>
                </div>
              )}

              {activeSubmittedOrder.approvalStatus === 'APPROVED' && !isKdsReady && (
                <div className='p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 space-y-2'>
                  <div className='w-12 h-12 rounded-full bg-[#0C3B2E] text-white flex items-center justify-center mx-auto shadow-md animate-bounce'>
                    <ChefHat className='w-6 h-6 text-[#84CC16]' />
                  </div>
                  <h3 className='font-black text-base text-[#0C3B2E]'>POS อนุมัติแล้ว • ครัวกำลังปรุงอาหาร</h3>
                  <p className='text-xs text-emerald-800 leading-relaxed font-medium'>
                    พ่อครัวได้รับออเดอร์แล้ว กำลังลวกเส้นและปรุงอาหารให้ท่านอย่างพิถีพิถัน
                  </p>
                </div>
              )}

              {activeSubmittedOrder.approvalStatus === 'APPROVED' && isKdsReady && (
                <div className='p-4 bg-lime-50 rounded-2xl border border-lime-300 text-lime-950 space-y-2'>
                  <div className='w-12 h-12 rounded-full bg-[#84CC16] text-[#072E20] flex items-center justify-center mx-auto shadow-md'>
                    <CheckCircle2 className='w-6 h-6' />
                  </div>
                  <h3 className='font-black text-base text-slate-900'>อาหารพร้อมเสิร์ฟแล้ว!</h3>
                  <p className='text-xs text-slate-700 leading-relaxed font-medium'>
                    พนักงานกำลังนำอาหารไปเสิร์ฟที่โต๊ะ {activeSubmittedOrder.tableNumber} ขอให้อร่อยกับมื้อนี้ครับ
                  </p>
                </div>
              )}

              {activeSubmittedOrder.approvalStatus === 'REJECTED' && (
                <div className='p-4 bg-red-50 rounded-2xl border border-red-200 text-red-900 space-y-2'>
                  <div className='w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto shadow-md'>
                    <AlertCircle className='w-6 h-6' />
                  </div>
                  <h3 className='font-black text-base'>รายการถูกปฏิเสธ</h3>
                  <p className='text-xs text-red-700 leading-relaxed font-medium'>
                    กรุณาติดต่อพนักงานหน้าร้านหรือสั่งรายการใหม่อีกครั้ง
                  </p>
                </div>
              )}
            </div>

            <div className='bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left text-xs space-y-2'>
              <div className='flex justify-between items-center font-black border-b border-slate-200 pb-2 text-slate-900'>
                <span>รหัสออเดอร์: {activeSubmittedOrder.orderNumber}</span>
                <span className='text-[#D9531E]'>โต๊ะ {activeSubmittedOrder.tableNumber}</span>
              </div>
              <div className='space-y-1.5 pt-1'>
                {activeSubmittedOrder.items.map((it, idx) => (
                  <div key={idx} className='flex justify-between text-slate-700'>
                    <div>
                      <span className='font-semibold text-slate-800'>{it.productName} x{it.quantity}</span>
                      {it.modifiers.length > 0 && (
                        <div className='text-[10px] text-slate-500'>
                          {it.modifiers.map((m) => m.optionName).join(', ')}
                        </div>
                      )}
                    </div>
                    <span className='font-semibold text-slate-800'>฿{it.lineTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className='flex justify-between items-center font-black pt-2 border-t border-slate-200 text-slate-900 text-sm'>
                <span>ยอดรวมทั้งสิ้น:</span>
                <span className='text-[#D9531E] font-black'>฿{activeSubmittedOrder.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setSubmittedOrderId(null)}
              className='w-full py-3 bg-[#0C3B2E] text-white font-semibold rounded-2xl text-xs shadow-md transition-transform active:scale-95 cursor-pointer'
            >
              + สั่งอาหารเพิ่มอีกรายการ (Order More)
            </button>
          </div>
        </div>
      ) : (
        <div className='p-4 space-y-4'>
          <div 
            className='rounded-3xl p-5 text-white shadow-md relative overflow-hidden border border-cyan-300/30 bg-[#0C3B2E]'
            style={{
              backgroundImage: "url('/images/banner-bg.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className='absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent' />
            <div className='relative z-10'>
              <span className='inline-block px-2.5 py-0.5 rounded-full bg-[#84CC16] text-[#072E20] text-[10px] font-black mb-1'>
                ยินดีต้อนรับ โต๊ะ {selectedTable}
              </span>
              <h2 className='text-lg font-black'>สั่งอาหารง่ายๆ ด้วยตัวเอง</h2>
              <p className='text-[11px] text-white/90 font-medium'>
                เลือกเมนูพร้อมความเผ็ด/เส้น แล้วกดส่งเข้าระบบได้ทันที
              </p>
            </div>
          </div>

          {/* Sticky Search & Icon Categories */}
          <div className='sticky top-0 bg-[#F4F6F5] pt-1 pb-2 z-20 space-y-2.5 -mx-4 px-4 border-b border-slate-200/60 shadow-xs'>
            <div className='relative flex items-center'>
              <Search className='w-4 h-4 absolute left-3.5 text-slate-400' />
              <input
                type='text'
                placeholder='ค้นหาเมนู หรือกดไมค์เพื่อพูดชื่อเมนู...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={
                  'w-full pl-10 pr-16 py-2.5 bg-white border rounded-2xl text-xs font-medium focus:outline-[#0C3B2E] shadow-xs transition-all ' +
                  (isVoiceSearching ? 'border-red-400 ring-2 ring-red-200 bg-red-50/50 text-red-950 font-bold' : 'border-slate-200')
                }
              />
              <button
                type='button'
                onClick={toggleVoiceSearch}
                title='ค้นหาด้วยเสียง'
                className={
                  'absolute right-1.5 px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 transition-all cursor-pointer ' +
                  (isVoiceSearching ? 'bg-red-500 text-white animate-pulse' : 'bg-[#0C3B2E] text-white hover:bg-[#072E20]')
                }
              >
                {isVoiceSearching ? (
                  <>
                    <MicOff className='w-3 h-3 animate-spin' />
                    <span className='text-[9px]'>ฟัง...</span>
                  </>
                ) : (
                  <>
                    <Mic className='w-3 h-3 text-[#84CC16]' />
                    <span className='text-[9px]'>พูด</span>
                  </>
                )}
              </button>
            </div>

            <div className='flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-xs'>
              {[
                { id: 'ALL', icon: '🍽️', shortName: 'ทั้งหมด' },
                { id: 'cat-01', icon: '🍜', shortName: 'ก๋วยเตี๋ยว' },
                { id: 'cat-02', icon: '🍚', shortName: 'ข้าว' },
                { id: 'cat-03', icon: '🦆', shortName: 'เป็ด/ซุป' },
                { id: 'cat-04', icon: '🥤', shortName: 'เครื่องดื่ม' },
              ].map((cat) => (
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

          <div className='space-y-3'>
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => setActiveModalProduct(product)}
                className='bg-white rounded-3xl p-3.5 border border-slate-200 shadow-sm flex items-center space-x-3.5 cursor-pointer hover:border-[#0C3B2E] transition-all'
              >
                <div className='w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0 relative shadow-inner'>
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className='w-full h-full object-cover'
                    loading='lazy'
                  />
                  <span className='absolute bottom-1 right-1 bg-black/60 backdrop-blur-xs text-white text-[9px] px-1.5 py-0.5 rounded-lg font-black'>
                    ฿{product.price}
                  </span>
                </div>

                <div className='flex-1 min-w-0 flex flex-col justify-between h-24 py-0.5'>
                  <div>
                    <h4 className='font-semibold text-slate-800 text-xs truncate leading-snug'>
                      {product.name}
                    </h4>
                    <p className='text-[11px] text-slate-500 line-clamp-2 leading-relaxed mt-0.5'>
                      {product.description}
                    </p>
                  </div>

                  <div className='flex justify-between items-center pt-1 border-t border-slate-100'>
                    <span className='text-[10px] text-slate-400 font-semibold'>{product.category}</span>
                    <button className='px-3 py-1 bg-[#84CC16] text-[#072E20] font-black rounded-full text-[10px] flex items-center gap-1 shadow-xs'>
                      <Plus className='w-3 h-3' />
                      <span>เลือก</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {cart.length > 0 && !submittedOrderId && !activeModalProduct && (
        <div className='fixed bottom-4 left-0 right-0 max-w-md mx-auto px-4 z-40 animate-in slide-in-from-bottom'>
          <div className='bg-[#0C3B2E] text-white p-3.5 rounded-3xl shadow-2xl flex items-center justify-between border border-white/20'>
            <div className='flex items-center space-x-3 pl-2'>
              <div className='w-10 h-10 rounded-2xl bg-[#D9531E] flex items-center justify-center text-white font-black shadow-md'>
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </div>
              <div>
                <div className='text-xs font-black text-white'>ยอดรวมในตะกร้า</div>
                <div className='text-base font-black text-[#84CC16]'>฿{cartTotal.toFixed(2)}</div>
              </div>
            </div>

            <button
              onClick={() => setShowCartDrawer(true)}
              className='px-5 py-2.5 bg-[#84CC16] hover:bg-[#65A30D] text-[#072E20] font-semibold rounded-2xl text-xs flex items-center space-x-1.5 shadow-md transition-transform active:scale-95 cursor-pointer'
            >
              <span>ดูตะกร้า & ยืนยัน</span>
              <ArrowRight className='w-4 h-4' />
            </button>
          </div>
        </div>
      )}

      {showCartDrawer && (
        <div className='fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in'>
          <div className='bg-white rounded-t-4xl sm:rounded-4xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden'>
            <div className='p-4 pt-5 bg-[#0C3B2E] text-white arch-header flex items-center justify-between shadow-sm'>
              <div className='flex items-center space-x-2'>
                <ShoppingBag className='w-5 h-5 text-[#84CC16]' />
                <div>
                  <h3 className='font-black text-sm'>ตะกร้าสั่งอาหาร โต๊ะ {selectedTable}</h3>
                  <span className='text-[10px] text-emerald-200 font-medium'>
                    {cart.length} รายการที่เลือกไว้
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowCartDrawer(false)}
                className='px-3 py-1 bg-white/15 text-white rounded-full text-xs font-bold cursor-pointer'
              >
                ปิด
              </button>
            </div>

            <div className='p-4 overflow-y-auto flex-1 space-y-2.5 text-xs'>
              {cart.map((item) => (
                <div key={item.id} className='p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-start'>
                  <div>
                    <div className='font-semibold text-slate-800'>{item.product.name} x{item.quantity}</div>
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
                  </div>
                  <div className='flex items-center space-x-3'>
                    <span className='font-semibold text-[#D9531E]'>
                      ฿{(item.product.price + item.modifiers.reduce((s, m) => s + m.price, 0)) * item.quantity}
                    </span>
                    <button
                      onClick={() => handleRemoveCartItem(item.id)}
                      className='w-7 h-7 bg-red-50 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-100 cursor-pointer'
                    >
                      <Trash2 className='w-3.5 h-3.5' />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className='p-4 border-t border-slate-100 bg-slate-50 space-y-3'>
              <div className='flex justify-between items-center font-black text-sm text-slate-900'>
                <span>ยอดรวมที่ต้องชำระ:</span>
                <span className='text-lg font-semibold text-[#D9531E]'>฿{cartTotal.toFixed(2)}</span>
              </div>
              <button
                onClick={handleSubmitOrder}
                className='w-full py-3.5 bg-[#84CC16] hover:bg-[#65A30D] text-[#072E20] font-semibold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg transition-transform active:scale-95 cursor-pointer'
              >
                <CheckCircle2 className='w-4 h-4' />
                <span>ส่งออเดอร์เข้า POS (Submit Order)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModalProduct && (
        <ModifierModal
          product={activeModalProduct}
          onClose={() => setActiveModalProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
}

export default function CustomerQROrderPage() {
  return (
    <Suspense fallback={<div className='p-8 text-center text-xs font-bold text-slate-500'>กำลังโหลดเมนู QR...</div>}>
      <CustomerQROrderContent />
    </Suspense>
  );
}
