'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRestaurant } from '@/lib/store/restaurant-store';
import { FIXTURE_CATEGORIES, FIXTURE_PRODUCTS, FixtureProduct } from '@/lib/store/fixtures';
import { ModifierModal } from '@/components/order/modifier-modal';
import { OrderCart } from '@/components/order/order-cart';
import { Smartphone, Plus, Search, Utensils, Star, Sparkles } from 'lucide-react';

function WaiterOrderingContent() {
  const searchParams = useSearchParams();
  const initialTableId = searchParams.get('tableId') || 't-01';

  const { tables, addOrderItem } = useRestaurant();
  const [selectedTableId, setSelectedTableId] = useState(initialTableId);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalProduct, setActiveModalProduct] = useState<FixtureProduct | null>(null);

  const filteredProducts = FIXTURE_PRODUCTS.filter((p) => {
    const matchCat = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col space-y-6'>
      {/* Top Search & Table Selector Bar */}
      <div className='bg-white p-3.5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3'>
        <div className='flex items-center space-x-3 w-full sm:w-auto'>
          <div className='w-9 h-9 rounded-2xl bg-[#0C3B2E] text-white flex items-center justify-center'>
            <Smartphone className='w-4 h-4 text-[#84CC16]' />
          </div>
          <div className='flex items-center space-x-2'>
            <span className='font-black text-slate-900 text-xs sm:text-sm'>เลือกโต๊ะ:</span>
            <select
              value={selectedTableId}
              onChange={(e) => setSelectedTableId(e.target.value)}
              aria-label='เลือกโต๊ะสั่งอาหาร'
              className='px-3.5 py-1.5 bg-slate-100 border border-slate-200 rounded-2xl font-black text-xs text-slate-900 cursor-pointer focus:outline-[#0C3B2E]'
            >
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.number} - {t.name} ({t.status === 'AVAILABLE' ? 'ว่าง' : 'มีลูกค้า'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* White Pill Search Input matching screenshot */}
        <div className='relative w-full sm:w-72'>
          <Search className='w-4 h-4 absolute left-3.5 top-3 text-slate-400' />
          <input
            type='text'
            placeholder='ค้นหาเมนูก๋วยเตี๋ยว, ข้าว, เครื่องดื่ม...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-full font-medium focus:bg-white focus:outline-[#0C3B2E]'
          />
        </div>
      </div>

      {/* Main Workspace: Product Grid (Left) & Cart Panel (Right) */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1'>
        {/* Menu Catalog (2 cols) */}
        <div className='lg:col-span-2 flex flex-col space-y-4'>
          {/* Category Tabs */}
          <div className='flex space-x-2 overflow-x-auto pb-1 scrollbar-none'>
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={
                'px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all ' +
                (selectedCategory === 'ALL'
                  ? 'bg-[#0C3B2E] text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50')
              }
            >
              ทั้งหมด (8 เมนู)
            </button>
            {FIXTURE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={
                  'px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all ' +
                  (selectedCategory === cat.id
                    ? 'bg-[#0C3B2E] text-white shadow-md'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50')
                }
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Dish Cards Grid with Food Images matching attached mockup */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 overflow-y-auto'>
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => setActiveModalProduct(product)}
                className='bg-white rounded-3xl border border-slate-200/90 p-4 shadow-sm hover:shadow-lg hover:border-[#0C3B2E] transition-all cursor-pointer flex flex-col justify-between group overflow-hidden'
              >
                <div>
                  {/* Food Image Container */}
                  <div className='w-full h-40 rounded-2xl overflow-hidden mb-3 bg-slate-100 relative shadow-inner'>
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                      loading='lazy'
                    />
                    <div className='absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-black text-[#D9531E] shadow-sm'>
                      ฿{product.price.toFixed(2)}
                    </div>
                    <span className='absolute bottom-2.5 left-2.5 bg-[#0C3B2E]/85 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-black text-white'>
                      {product.category}
                    </span>
                  </div>

                  <h4 className='font-black text-slate-900 text-sm group-hover:text-[#0C3B2E] transition-colors leading-tight mb-1'>
                    {product.name}
                  </h4>
                  <p className='text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3'>{product.description}</p>
                </div>

                <div className='flex justify-between items-center pt-2.5 border-t border-slate-100'>
                  <span className='text-[10px] font-bold text-slate-400 font-mono'>{product.sku}</span>
                  <button className='px-4 py-2 bg-[#84CC16] hover:bg-[#65A30D] text-[#072E20] text-xs font-black rounded-full flex items-center space-x-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer'>
                    <Plus className='w-3.5 h-3.5' />
                    <span>เลือกสั่งอาหาร</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Drawer Panel (1 col) */}
        <div className='lg:col-span-1 h-[680px] lg:h-auto'>
          <OrderCart selectedTableId={selectedTableId} />
        </div>
      </div>

      {/* Modifier Customization Modal */}
      {activeModalProduct && (
        <ModifierModal
          product={activeModalProduct}
          onClose={() => setActiveModalProduct(null)}
          onAddToCart={(qty, modifiers, notes) => {
            addOrderItem(selectedTableId, activeModalProduct, qty, modifiers, notes);
            setActiveModalProduct(null);
          }}
        />
      )}
    </div>
  );
}

export default function WaiterOrderingPage() {
  return (
    <Suspense fallback={<div className='p-8 text-center text-xs font-bold text-slate-500'>กำลังโหลดหน้าสั่งอาหาร...</div>}>
      <WaiterOrderingContent />
    </Suspense>
  );
}
