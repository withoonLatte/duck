'use client';

import React, { useState } from 'react';
import { useRestaurant } from '@/lib/store/restaurant-store';
import { FixtureProduct, FixtureIngredient, FIXTURE_CATEGORIES, FIXTURE_MODIFIERS, FixtureModifierGroup } from '@/lib/store/fixtures';
import { 
  Boxes, 
  UtensilsCrossed, 
  BookOpen, 
  Plus, 
  Minus, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  DollarSign, 
  Layers, 
  X, 
  Save, 
  Sparkles,
  ArrowRight,
  RotateCcw,
  Camera,
  Upload,
  ImageIcon
} from 'lucide-react';

export default function InventoryAndMenuPage() {
  const { 
    products, 
    ingredients, 
    recipes, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    addIngredient, 
    updateIngredient, 
    deleteIngredient, 
    adjustStock, 
    recordWaste, 
    updateRecipe 
  } = useRestaurant();

  const [activeTab, setActiveTab] = useState<'MENU' | 'STOCK' | 'RECIPES'>('MENU');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modal States
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FixtureProduct | null>(null);
  const [productForm, setProductForm] = useState<Omit<FixtureProduct, 'id'>>({
    name: '',
    category: 'ก๋วยเตี๋ยว & บะหมี่เป็ด',
    categoryId: 'cat-01',
    description: '',
    price: 65,
    costPrice: 28,
    sku: 'PROD-' + Math.floor(1000 + Math.random() * 9000),
    station: 'NOODLE_STATION',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&auto=format&fit=crop&q=80',
  });

  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<FixtureIngredient | null>(null);
  const [ingredientForm, setIngredientForm] = useState<Omit<FixtureIngredient, 'id'>>({
    name: '',
    unit: 'กก.',
    stock: 10,
    minStock: 2,
    costPerUnit: 150,
  });

  const [showStockAdjustModal, setShowStockAdjustModal] = useState(false);
  const [adjustTargetIng, setAdjustTargetIng] = useState<FixtureIngredient | null>(null);
  const [adjustAmount, setAdjustAmount] = useState(1);
  const [adjustType, setAdjustType] = useState<'ADD' | 'WASTE'>('ADD');
  const [adjustReason, setAdjustReason] = useState('รับซื้อวัตถุดิบเข้าสต็อก');

  // Recipe Editor State
  const [selectedRecipeProduct, setSelectedRecipeProduct] = useState<string>(products[0]?.id || 'p-01');
  const [recipeItems, setRecipeItems] = useState<{ ingredientId: string; ingredientName: string; quantity: number; unit: string }[]>([]);

  // Update recipe items when selected product changes
  React.useEffect(() => {
    const currentRec = recipes.find((r) => r.productId === selectedRecipeProduct);
    if (currentRec) {
      setRecipeItems(currentRec.items);
    } else {
      setRecipeItems([]);
    }
  }, [selectedRecipeProduct, recipes]);

  // Product Modal Open Handlers
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: 'ก๋วยเตี๋ยว & บะหมี่เป็ด',
      categoryId: 'cat-01',
      description: '',
      price: 65,
      costPrice: 28,
      sku: 'PROD-' + Math.floor(1000 + Math.random() * 9000),
      station: 'NOODLE_STATION',
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&auto=format&fit=crop&q=80',
    });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod: FixtureProduct) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category: prod.category,
      categoryId: prod.categoryId,
      description: prod.description,
      price: prod.price,
      costPrice: prod.costPrice,
      sku: prod.sku,
      station: prod.station,
      imageUrl: prod.imageUrl,
      modifierGroupIds: prod.modifierGroupIds || (prod.category.includes('ก๋วยเตี๋ยว') ? ['mod-01', 'mod-02', 'mod-03', 'mod-04'] : ['mod-02', 'mod-04']),
      customModifiers: prod.customModifiers || [],
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name) return;
    if (editingProduct) {
      updateProduct(editingProduct.id, productForm);
    } else {
      addProduct(productForm);
    }
    setShowProductModal(false);
  };

  // Ingredient Modal Open Handlers
  const handleOpenAddIngredient = () => {
    setEditingIngredient(null);
    setIngredientForm({
      name: '',
      unit: 'กก.',
      stock: 10,
      minStock: 2,
      costPerUnit: 100,
    });
    setShowIngredientModal(true);
  };

  const handleOpenEditIngredient = (ing: FixtureIngredient) => {
    setEditingIngredient(ing);
    setIngredientForm({
      name: ing.name,
      unit: ing.unit,
      stock: ing.stock,
      minStock: ing.minStock,
      costPerUnit: ing.costPerUnit,
    });
    setShowIngredientModal(true);
  };

  const handleSaveIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredientForm.name) return;
    if (editingIngredient) {
      updateIngredient(editingIngredient.id, ingredientForm);
    } else {
      addIngredient(ingredientForm);
    }
    setShowIngredientModal(false);
  };

  const handleOpenStockAdjust = (ing: FixtureIngredient, type: 'ADD' | 'WASTE') => {
    setAdjustTargetIng(ing);
    setAdjustType(type);
    setAdjustAmount(type === 'ADD' ? 5 : 0.5);
    setAdjustReason(type === 'ADD' ? 'รับซื้อวัตถุดิบเข้าสต็อก' : 'วัตถุดิบเสียหาย / ทิ้ง');
    setShowStockAdjustModal(true);
  };

  const handleConfirmStockAdjust = () => {
    if (!adjustTargetIng || adjustAmount <= 0) return;
    if (adjustType === 'ADD') {
      adjustStock(adjustTargetIng.id, adjustAmount, adjustReason);
    } else {
      recordWaste(adjustTargetIng.id, adjustAmount, adjustReason);
    }
    setShowStockAdjustModal(false);
  };

  // Recipe BOM items manipulation
  const handleAddIngredientToRecipe = (ingId: string) => {
    const ing = ingredients.find((i) => i.id === ingId);
    if (!ing) return;
    if (recipeItems.some((r) => r.ingredientId === ingId)) return;
    setRecipeItems([...recipeItems, { ingredientId: ing.id, ingredientName: ing.name, quantity: 1, unit: ing.unit }]);
  };

  const handleUpdateRecipeItemQty = (ingId: string, qty: number) => {
    setRecipeItems(recipeItems.map((r) => (r.ingredientId === ingId ? { ...r, quantity: Math.max(0.01, qty) } : r)));
  };

  const handleRemoveRecipeItem = (ingId: string) => {
    setRecipeItems(recipeItems.filter((r) => r.ingredientId !== ingId));
  };

  const handleSaveRecipeBOM = () => {
    updateRecipe(selectedRecipeProduct, recipeItems);
    alert('บันทึกสูตรอาหาร BOM เรียบร้อยแล้ว!');
  };

  // Calculate selected recipe estimated cost
  const selectedProductObj = products.find((p) => p.id === selectedRecipeProduct);
  const calculatedFoodCost = recipeItems.reduce((sum, item) => {
    const ing = ingredients.find((i) => i.id === item.ingredientId);
    return sum + (ing ? ing.costPerUnit * item.quantity : 0);
  }, 0);

  const profitMargin = selectedProductObj && selectedProductObj.price > 0
    ? (((selectedProductObj.price - calculatedFoodCost) / selectedProductObj.price) * 100).toFixed(1)
    : '0.0';

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'ALL' || p.categoryId === selectedCategory || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Filtered Ingredients
  const filteredIngredients = ingredients.filter((i) => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.unit.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col space-y-6'>
      {/* Header Banner */}
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
            <Boxes className='w-4 h-4 text-[#84CC16]' />
            <span>MENU, INVENTORY & RECIPE BOM SYSTEM</span>
          </div>
          <h2 className='text-xl sm:text-2xl font-bold tracking-tight text-white'>
            ระบบจัดการเมนู & คลังสต็อกวัตถุดิบ
          </h2>
          <p className='text-white/85 text-xs sm:text-sm mt-1 font-normal max-w-2xl'>
            เพิ่ม/แก้ไข/ลบ เมนูอาหาร, ติดตามระดับสต็อกวัตถุดิบจริง และผูกสูตรอาหาร (BOM) เพื่อตัดสต็อกและคำนวณต้นทุน
          </p>
        </div>

        {/* Tab Navigation Hub */}
        <div className='relative z-10 flex items-center space-x-1.5 bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 text-xs shadow-md'>
          <button
            onClick={() => setActiveTab('MENU')}
            className={
              'px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer ' +
              (activeTab === 'MENU'
                ? 'bg-[#84CC16] text-[#072E20] shadow-md font-bold'
                : 'text-white hover:bg-white/15')
            }
          >
            <UtensilsCrossed className='w-3.5 h-3.5' />
            <span>🍜 รายการเมนู ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('STOCK')}
            className={
              'px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer ' +
              (activeTab === 'STOCK'
                ? 'bg-[#84CC16] text-[#072E20] shadow-md font-bold'
                : 'text-white hover:bg-white/15')
            }
          >
            <Boxes className='w-3.5 h-3.5' />
            <span>📦 สต็อกวัตถุดิบ ({ingredients.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('RECIPES')}
            className={
              'px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer ' +
              (activeTab === 'RECIPES'
                ? 'bg-[#84CC16] text-[#072E20] shadow-md font-bold'
                : 'text-white hover:bg-white/15')
            }
          >
            <BookOpen className='w-3.5 h-3.5' />
            <span>🧾 สูตรอาหาร & ต้นทุน</span>
          </button>
        </div>
      </div>

      {/* ============================================================
          TAB 1: MENU & PRODUCTS MANAGEMENT
      ============================================================ */}
      {activeTab === 'MENU' && (
        <div className='space-y-4 animate-in fade-in'>
          {/* Controls Bar */}
          <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-white p-3 rounded-3xl border border-slate-200 shadow-sm gap-3'>
            {/* Search Input */}
            <div className='relative flex-1'>
              <Search className='w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2' />
              <input
                type='text'
                placeholder='ค้นหาชื่อเมนู หรือคำอธิบาย...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-[#0C3B2E] transition-all'
              />
            </div>

            {/* Category Filter Pills */}
            <div className='flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none'>
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={
                  'px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ' +
                  (selectedCategory === 'ALL'
                    ? 'bg-[#0C3B2E] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
                }
              >
                ทั้งหมด ({products.length})
              </button>
              {FIXTURE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={
                    'px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ' +
                    (selectedCategory === cat.id
                      ? 'bg-[#0C3B2E] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
                  }
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Add Product Button */}
            <button
              onClick={handleOpenAddProduct}
              className='px-4 py-2 bg-[#0C3B2E] hover:bg-[#072E20] text-white font-semibold rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-transform active:scale-95 cursor-pointer whitespace-nowrap'
            >
              <Plus className='w-4 h-4 text-[#84CC16]' />
              <span>+ เพิ่มเมนูใหม่</span>
            </button>
          </div>

          {/* Product Cards Grid */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
            {filteredProducts.map((prod) => {
              const estimatedMargin = prod.price > 0 ? (((prod.price - prod.costPrice) / prod.price) * 100).toFixed(0) : '0';
              return (
                <div
                  key={prod.id}
                  className='bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-emerald-500 hover:shadow-md transition-all'
                >
                  {/* Image & Badges */}
                  <div className='relative h-36 w-full overflow-hidden bg-slate-100'>
                    <img src={prod.imageUrl} alt={prod.name} className='w-full h-full object-cover' />
                    <span className='absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium border border-white/20'>
                      {prod.category}
                    </span>
                    <span className='absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-xl bg-[#84CC16] text-[#072E20] font-black text-xs shadow-sm'>
                      ฿{prod.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className='p-4 space-y-2 flex-1 flex flex-col justify-between'>
                    <div>
                      <h4 className='font-semibold text-slate-900 text-sm sm:text-base leading-snug'>{prod.name}</h4>
                      <p className='text-[11px] text-slate-500 line-clamp-2 mt-1 font-normal'>{prod.description}</p>
                    </div>

                    <div className='pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500'>
                      <span>ต้นทุน: ฿{prod.costPrice.toFixed(2)}</span>
                      <span className='text-emerald-700 font-bold'>กำไร ~{estimatedMargin}%</span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className='p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2'>
                    <button
                      onClick={() => handleOpenEditProduct(prod)}
                      className='flex-1 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer active:scale-95'
                    >
                      <Edit3 className='w-3.5 h-3.5 text-blue-600' />
                      <span>แก้ไข</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`คุณแน่ใจว่าต้องการลบเมนู "${prod.name}" หรือไม่?`)) {
                          deleteProduct(prod.id);
                        }
                      }}
                      className='p-2 bg-white hover:bg-red-50 text-red-600 border border-slate-200 rounded-xl transition-colors cursor-pointer active:scale-95'
                      title='ลบเมนูนี้'
                    >
                      <Trash2 className='w-3.5 h-3.5' />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 2: RAW MATERIALS & INVENTORY MANAGEMENT
      ============================================================ */}
      {activeTab === 'STOCK' && (
        <div className='space-y-4 animate-in fade-in'>
          {/* Controls Bar */}
          <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-white p-3 rounded-3xl border border-slate-200 shadow-sm gap-3'>
            <div className='relative flex-1'>
              <Search className='w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2' />
              <input
                type='text'
                placeholder='ค้นหาชื่อวัตถุดิบ หรือหน่วยนับ...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-[#0C3B2E] transition-all'
              />
            </div>

            <button
              onClick={handleOpenAddIngredient}
              className='px-4 py-2 bg-[#0C3B2E] hover:bg-[#072E20] text-white font-semibold rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-transform active:scale-95 cursor-pointer whitespace-nowrap'
            >
              <Plus className='w-4 h-4 text-[#84CC16]' />
              <span>+ เพิ่มวัตถุดิบใหม่</span>
            </button>
          </div>

          {/* Ingredients Table Card */}
          <div className='bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full text-left text-xs'>
                <thead className='bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold'>
                  <tr>
                    <th className='p-3.5'>ชื่อวัตถุดิบ</th>
                    <th className='p-3.5'>คงเหลือ (Balance)</th>
                    <th className='p-3.5'>จุดสั่งซื้อขั้นต่ำ</th>
                    <th className='p-3.5'>ต้นทุน / หน่วย</th>
                    <th className='p-3.5 text-center'>สถานะ</th>
                    <th className='p-3.5 text-right'>จัดการสต็อก</th>
                    <th className='p-3.5 text-center'>แก้ไข / ลบ</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-100'>
                  {filteredIngredients.map((ing) => {
                    const isLow = ing.stock <= ing.minStock;
                    return (
                      <tr key={ing.id} className='hover:bg-slate-50/80 transition-colors'>
                        <td className='p-3.5 font-semibold text-slate-900'>{ing.name}</td>
                        <td className='p-3.5 font-bold text-sm text-slate-900'>
                          {ing.stock.toFixed(2)} <span className='text-[10px] font-normal text-slate-500'>{ing.unit}</span>
                        </td>
                        <td className='p-3.5 text-slate-500'>
                          {ing.minStock} {ing.unit}
                        </td>
                        <td className='p-3.5 text-slate-700 font-medium'>฿{ing.costPerUnit.toFixed(2)} / {ing.unit}</td>
                        <td className='p-3.5 text-center'>
                          {isLow ? (
                            <span className='px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-800 flex items-center gap-1 justify-center w-fit mx-auto'>
                              <AlertTriangle className='w-3 h-3' /> ใกล้หมด
                            </span>
                          ) : (
                            <span className='px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-[#0C3B2E]'>
                              ปกติ
                            </span>
                          )}
                        </td>
                        <td className='p-3.5 text-right space-x-1.5 whitespace-nowrap'>
                          <button
                            onClick={() => handleOpenStockAdjust(ing, 'ADD')}
                            className='px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-xl text-[11px] transition-colors cursor-pointer active:scale-95'
                          >
                            + เติมสต็อก
                          </button>
                          <button
                            onClick={() => handleOpenStockAdjust(ing, 'WASTE')}
                            className='px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-xl text-[11px] transition-colors cursor-pointer active:scale-95'
                          >
                            - ตัดของเสีย (Waste)
                          </button>
                        </td>
                        <td className='p-3.5 text-center space-x-1 whitespace-nowrap'>
                          <button
                            onClick={() => handleOpenEditIngredient(ing)}
                            className='p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer'
                            title='แก้ไขวัตถุดิบ'
                          >
                            <Edit3 className='w-4 h-4' />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`คุณต้องการลบวัตถุดิบ "${ing.name}" หรือไม่?`)) {
                                deleteIngredient(ing.id);
                              }
                            }}
                            className='p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer'
                            title='ลบวัตถุดิบ'
                          >
                            <Trash2 className='w-4 h-4' />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 3: RECIPE BOM & FOOD COSTING
      ============================================================ */}
      {activeTab === 'RECIPES' && (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in'>
          {/* Left: Product Selector List */}
          <div className='bg-white rounded-3xl border border-slate-200 shadow-sm p-4 space-y-3'>
            <span className='font-semibold text-slate-800 text-xs block'>เลือกเมนูเพื่อดู/แก้ไขสูตร BOM:</span>
            <div className='space-y-1.5 max-h-[500px] overflow-y-auto pr-1'>
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedRecipeProduct(p.id)}
                  className={
                    'w-full p-3 rounded-2xl text-left text-xs transition-all flex items-center justify-between cursor-pointer ' +
                    (selectedRecipeProduct === p.id
                      ? 'bg-[#0C3B2E] text-white shadow-md'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800')
                  }
                >
                  <div className='font-semibold'>{p.name}</div>
                  <span className='font-bold'>฿{p.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Recipe Ingredients Editor (2 cols) */}
          <div className='lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-5'>
            {selectedProductObj && (
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-3'>
                <div>
                  <h3 className='text-base sm:text-lg font-bold text-slate-900'>
                    สูตรวัตถุดิบ (BOM): {selectedProductObj.name}
                  </h3>
                  <p className='text-xs text-slate-500 font-normal'>
                    กำหนดปริมาณวัตถุดิบที่ใช้ตัดสต็อกจริงต่อ 1 ชาม / 1 เสิร์ฟ
                  </p>
                </div>

                {/* Costing Summary */}
                <div className='bg-emerald-50 rounded-2xl p-3 border border-emerald-200 flex items-center gap-4 text-xs'>
                  <div>
                    <span className='text-slate-500 block text-[10px]'>ต้นทุนวัตถุดิบ (Food Cost):</span>
                    <span className='text-base font-bold text-emerald-800'>฿{calculatedFoodCost.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className='text-slate-500 block text-[10px]'>กำไรเบื้องต้น (Margin):</span>
                    <span className='text-base font-bold text-emerald-800'>{profitMargin}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Recipe Ingredients List */}
            <div className='space-y-3'>
              <div className='flex justify-between items-center font-semibold text-xs text-slate-700'>
                <span>รายการวัตถุดิบในสูตร ({recipeItems.length} รายการ):</span>
              </div>

              {recipeItems.length === 0 ? (
                <div className='p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500'>
                  ยังไม่มีการผูกวัตถุดิบในเมนูนี้ เลือกวัตถุดิบด้านล่างเพื่อเพิ่มเข้าสูตร
                </div>
              ) : (
                <div className='space-y-2'>
                  {recipeItems.map((item) => {
                    const ing = ingredients.find((i) => i.id === item.ingredientId);
                    const itemCost = ing ? ing.costPerUnit * item.quantity : 0;
                    return (
                      <div
                        key={item.ingredientId}
                        className='p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs'
                      >
                        <div className='flex-1'>
                          <span className='font-semibold text-slate-900'>{item.ingredientName}</span>
                          <span className='text-slate-500 text-[10px] ml-2'>(฿{ing?.costPerUnit.toFixed(2)}/{item.unit})</span>
                        </div>

                        <div className='flex items-center space-x-2'>
                          <input
                            type='number'
                            step='0.01'
                            value={item.quantity}
                            onChange={(e) => handleUpdateRecipeItemQty(item.ingredientId, parseFloat(e.target.value) || 0)}
                            className='w-20 px-2.5 py-1 bg-white border border-slate-300 rounded-xl text-right font-semibold text-xs'
                          />
                          <span className='text-slate-600 font-medium w-8'>{item.unit}</span>
                          <span className='font-bold text-emerald-800 w-16 text-right'>฿{itemCost.toFixed(2)}</span>
                          <button
                            onClick={() => handleRemoveRecipeItem(item.ingredientId)}
                            className='p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer'
                          >
                            <Trash2 className='w-4 h-4' />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Add More Ingredients to Recipe Dropdown */}
            <div className='pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2'>
              <div className='flex items-center space-x-2 flex-1'>
                <select
                  id='add-recipe-ing'
                  className='flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium cursor-pointer focus:outline-[#0C3B2E]'
                  defaultValue=''
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddIngredientToRecipe(e.target.value);
                      e.target.value = '';
                    }
                  }}
                >
                  <option value='' disabled>
                    + เลือกวัตถุดิบเพื่อเพิ่มเข้าในสูตรนี้...
                  </option>
                  {ingredients
                    .filter((i) => !recipeItems.some((r) => r.ingredientId === i.id))
                    .map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({i.unit} - ฿{i.costPerUnit})
                      </option>
                    ))}
                </select>
              </div>

              <button
                onClick={handleSaveRecipeBOM}
                className='px-5 py-2.5 bg-[#0C3B2E] hover:bg-[#072E20] text-white font-semibold rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-transform active:scale-95 cursor-pointer'
              >
                <Save className='w-4 h-4 text-[#84CC16]' />
                <span>บันทึกสูตรอาหาร (Save BOM)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: ADD / EDIT PRODUCT
      ============================================================ */}
      {showProductModal && (
        <div className='fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in'>
          <div className='bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between border-b border-slate-100 pb-3'>
              <h3 className='font-bold text-base text-slate-900 flex items-center gap-2'>
                <UtensilsCrossed className='w-5 h-5 text-[#0C3B2E]' />
                <span>{editingProduct ? 'แก้ไขข้อมูลเมนูอาหาร' : 'เพิ่มเมนูอาหารใหม่'}</span>
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className='w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer'
              >
                <X className='w-4 h-4' />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className='space-y-3.5 text-xs'>
              <div>
                <label className='block font-semibold text-slate-700 mb-1'>ชื่อเมนูอาหาร *</label>
                <input
                  type='text'
                  required
                  placeholder='เช่น ก๋วยเตี๋ยวเป็ดตุ๋นยาจีน'
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className='w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-[#0C3B2E]'
                />
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='block font-semibold text-slate-700 mb-1'>หมวดหมู่อาหาร</label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => {
                      const sel = FIXTURE_CATEGORIES.find((c) => c.id === e.target.value);
                      const selName = sel ? sel.name : productForm.category;
                      let suggestedMods = ['mod-02', 'mod-04'];
                      let suggestedStation = productForm.station;
                      if (selName.includes('ก๋วยเตี๋ยว') || selName.includes('บะหมี่')) {
                        suggestedMods = ['mod-01', 'mod-02', 'mod-03', 'mod-04'];
                        suggestedStation = 'NOODLE_STATION';
                      } else if (selName.includes('เครื่องดื่ม')) {
                        suggestedMods = ['mod-05'];
                        suggestedStation = 'BAR_STATION';
                      } else if (selName.includes('ข้าว')) {
                        suggestedMods = ['mod-02', 'mod-04'];
                        suggestedStation = 'DUCK_STATION';
                      } else if (selName.includes('ซุป')) {
                        suggestedMods = ['mod-02', 'mod-03', 'mod-04'];
                        suggestedStation = 'SOUP_STATION';
                      }
                      setProductForm({
                        ...productForm,
                        categoryId: e.target.value,
                        category: selName,
                        station: suggestedStation,
                        modifierGroupIds: suggestedMods,
                      });
                    }}
                    className='w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium cursor-pointer'
                  >
                    {FIXTURE_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block font-semibold text-slate-700 mb-1'>สถานีครัวปรุง</label>
                  <select
                    value={productForm.station}
                    onChange={(e) => setProductForm({ ...productForm, station: e.target.value })}
                    className='w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium cursor-pointer'
                  >
                    <option value='NOODLE_STATION'>🍜 สถานีลวกเส้น</option>
                    <option value='DUCK_STATION'>🦆 สถานีสับเป็ด & ข้าว</option>
                    <option value='SOUP_STATION'>🍲 สถานีต้มซุปเปอร์</option>
                    <option value='BAR_STATION'>🥤 สถานีเครื่องดื่ม</option>
                  </select>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='block font-semibold text-slate-700 mb-1'>ราคาขายหน้าร้าน (฿) *</label>
                  <input
                    type='number'
                    required
                    min='0'
                    step='1'
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                    className='w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm focus:outline-[#0C3B2E]'
                  />
                </div>

                <div>
                  <label className='block font-semibold text-slate-700 mb-1'>ต้นทุนโดยประมาณ (฿)</label>
                  <input
                    type='number'
                    min='0'
                    step='1'
                    value={productForm.costPrice}
                    onChange={(e) => setProductForm({ ...productForm, costPrice: parseFloat(e.target.value) || 0 })}
                    className='w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-[#0C3B2E]'
                  />
                </div>
              </div>

              {/* Photo Camera & Gallery Picker */}
              <div>
                <label className='block font-semibold text-slate-700 mb-1.5 flex items-center justify-between'>
                  <span className='flex items-center gap-1.5'>
                    <Camera className='w-4 h-4 text-[#0C3B2E]' />
                    <span>รูปภาพอาหาร (ถ่ายจากกล้อง หรือเลือกจากเครื่อง)</span>
                  </span>
                  {productForm.imageUrl && (
                    <button
                      type='button'
                      onClick={() => setProductForm({ ...productForm, imageUrl: '' })}
                      className='text-[10px] text-red-600 hover:text-red-700 font-bold flex items-center gap-0.5 cursor-pointer'
                    >
                      <Trash2 className='w-3 h-3' />
                      <span>ลบรูปภาพ</span>
                    </button>
                  )}
                </label>

                {productForm.imageUrl ? (
                  <div className='relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-36 flex items-center justify-center group'>
                    <img
                      src={productForm.imageUrl}
                      alt='Product Preview'
                      className='w-full h-full object-cover'
                    />
                    <label className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white text-xs font-bold transition-opacity cursor-pointer'>
                      <Camera className='w-4 h-4' />
                      <span>แตะเพื่อถ่ายรูปใหม่ หรือเปลี่ยนรูป</span>
                      <input
                        type='file'
                        accept='image/*'
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setProductForm({ ...productForm, imageUrl: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className='hidden'
                      />
                    </label>
                  </div>
                ) : (
                  <label className='flex flex-col items-center justify-center border-2 border-dashed border-emerald-300 hover:border-[#0C3B2E] bg-emerald-50/40 hover:bg-emerald-50/80 rounded-2xl p-5 cursor-pointer transition-all active:scale-[0.99]'>
                    <div className='w-10 h-10 rounded-2xl bg-emerald-100 text-[#0C3B2E] flex items-center justify-center mb-1.5 shadow-2xs'>
                      <Camera className='w-5 h-5' />
                    </div>
                    <span className='font-bold text-[#0C3B2E] text-xs'>
                      📸 แตะเพื่อเปิดกล้องถ่ายรูป หรือเลือกรูปจากเครื่อง
                    </span>
                    <span className='text-[10px] text-slate-500 mt-0.5'>
                      รองรับทั้งกล้องมือถือ, แท็บเล็ต, iPad และไฟล์ในคอมพิวเตอร์
                    </span>
                    <input
                      type='file'
                      accept='image/*'
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            setProductForm({ ...productForm, imageUrl: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className='hidden'
                    />
                  </label>
                )}
              </div>

              {/* MODIFIERS & OPTIONS SELECTION SECTION */}
              <div className='p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3'>
                <div className='flex items-center justify-between'>
                  <label className='font-bold text-slate-800 text-xs flex items-center gap-1.5'>
                    <span>🍜 ตัวเลือกเสริม & ตัวเลือกเส้น (Options & Modifiers)</span>
                  </label>
                  <span className='text-[10px] text-slate-500 font-normal'>ติ๊กถูกเพื่อเปิดใช้งานตัวเลือกสำหรับเมนูนี้</span>
                </div>

                {/* Preset Modifier Toggles */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                  {FIXTURE_MODIFIERS.map((mod) => {
                    const isChecked = productForm.modifierGroupIds?.includes(mod.id);
                    return (
                      <label
                        key={mod.id}
                        className={
                          'p-2.5 rounded-xl border flex items-start space-x-2.5 cursor-pointer transition-all ' +
                          (isChecked
                            ? 'bg-emerald-50/80 border-emerald-400 text-[#0C3B2E] shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100')
                        }
                      >
                        <input
                          type='checkbox'
                          checked={isChecked}
                          onChange={(e) => {
                            const current = productForm.modifierGroupIds || [];
                            if (e.target.checked) {
                              setProductForm({ ...productForm, modifierGroupIds: [...current, mod.id] });
                            } else {
                              setProductForm({ ...productForm, modifierGroupIds: current.filter((id) => id !== mod.id) });
                            }
                          }}
                          className='mt-0.5 rounded text-[#0C3B2E] focus:ring-[#0C3B2E]'
                        />
                        <div className='flex-1 leading-tight'>
                          <div className='font-bold text-xs flex items-center justify-between'>
                            <span>{mod.name}</span>
                            {mod.required && (
                              <span className='text-[9px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded-full font-semibold'>
                                จำเป็นต้องเลือก
                              </span>
                            )}
                          </div>
                          <div className='text-[10px] text-slate-400 mt-1 truncate max-w-[200px]'>
                            {mod.options.map((o) => `${o.name}${o.price > 0 ? ` (+${o.price}฿)` : ''}`).join(', ')}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Custom Modifiers List & Add Button */}
                {productForm.customModifiers && productForm.customModifiers.length > 0 && (
                  <div className='space-y-2 pt-2 border-t border-slate-200/60'>
                    <span className='font-bold text-xs text-slate-700 block'>กลุ่มตัวเลือกที่สร้างเอง:</span>
                    {productForm.customModifiers.map((cMod, cIdx) => (
                      <div key={cIdx} className='p-2.5 bg-white rounded-xl border border-slate-200 space-y-2'>
                        <div className='flex items-center justify-between'>
                          <span className='font-bold text-slate-800 text-xs'>{cMod.name}</span>
                          <button
                            type='button'
                            onClick={() => {
                              const updated = productForm.customModifiers?.filter((_, idx) => idx !== cIdx);
                              setProductForm({ ...productForm, customModifiers: updated });
                            }}
                            className='text-red-500 hover:text-red-700 text-[10.5px] font-bold flex items-center gap-0.5 cursor-pointer'
                          >
                            <Trash2 className='w-3 h-3' />
                            <span>ลบกลุ่มนี้</span>
                          </button>
                        </div>
                        <div className='flex flex-wrap gap-1 text-[10px]'>
                          {cMod.options.map((opt, oIdx) => (
                            <span key={oIdx} className='px-2 py-0.5 bg-slate-100 rounded-lg text-slate-700 border border-slate-200 font-medium'>
                              {opt.name} {opt.price > 0 ? `(+฿${opt.price})` : '(+฿0)'}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Add Custom Option Group Button */}
                <button
                  type='button'
                  onClick={() => {
                    const groupName = prompt('ระบุชื่อกลุ่มตัวเลือกใหม่ (เช่น เลือกน้ำซุป, ขนาดแก้ว, ประเภทข้าว):');
                    if (!groupName) return;
                    const opt1 = prompt('ระบุตัวเลือกที่ 1 (เช่น น้ำใส):') || 'ตัวเลือก 1';
                    const opt2 = prompt('ระบุตัวเลือกที่ 2 (เช่น น้ำพะโล้เข้มข้น):') || 'ตัวเลือก 2';
                    const newCustomGroup: FixtureModifierGroup = {
                      id: 'custom-mod-' + Date.now(),
                      name: groupName,
                      required: false,
                      min: 0,
                      max: 1,
                      options: [
                        { id: 'opt-' + Date.now() + '-1', name: opt1, price: 0, isDefault: true },
                        { id: 'opt-' + Date.now() + '-2', name: opt2, price: 0 },
                      ],
                    };
                    setProductForm({
                      ...productForm,
                      customModifiers: [...(productForm.customModifiers || []), newCustomGroup],
                    });
                  }}
                  className='w-full py-2 bg-white hover:bg-slate-100 border border-dashed border-slate-300 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors'
                >
                  <Plus className='w-3.5 h-3.5 text-[#0C3B2E]' />
                  <span>+ สร้างกลุ่มตัวเลือกใหม่เอง (เช่น เลือกน้ำซุป, ประเภทข้าว, ขนาด)</span>
                </button>
              </div>

              <div>
                <label className='block font-semibold text-slate-700 mb-1'>คำอธิบายเมนู</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className='w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-[#0C3B2E]'
                />
              </div>

              <div className='pt-2 flex items-center justify-end gap-2 border-t border-slate-100'>
                <button
                  type='button'
                  onClick={() => setShowProductModal(false)}
                  className='px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl cursor-pointer'
                >
                  ยกเลิก
                </button>
                <button
                  type='submit'
                  className='px-5 py-2 bg-[#0C3B2E] hover:bg-[#072E20] text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer'
                >
                  <Save className='w-4 h-4 text-[#84CC16]' />
                  <span>บันทึกเมนู</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: ADD / EDIT INGREDIENT
      ============================================================ */}
      {showIngredientModal && (
        <div className='fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in'>
          <div className='bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4'>
            <div className='flex items-center justify-between border-b border-slate-100 pb-3'>
              <h3 className='font-bold text-base text-slate-900 flex items-center gap-2'>
                <Boxes className='w-5 h-5 text-[#0C3B2E]' />
                <span>{editingIngredient ? 'แก้ไขวัตถุดิบ' : 'เพิ่มวัตถุดิบใหม่'}</span>
              </h3>
              <button
                onClick={() => setShowIngredientModal(false)}
                className='w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer'
              >
                <X className='w-4 h-4' />
              </button>
            </div>

            <form onSubmit={handleSaveIngredient} className='space-y-3.5 text-xs'>
              <div>
                <label className='block font-semibold text-slate-700 mb-1'>ชื่อวัตถุดิบ *</label>
                <input
                  type='text'
                  required
                  placeholder='เช่น เนื้อเป็ดย่าง, บะหมี่ไข่'
                  value={ingredientForm.name}
                  onChange={(e) => setIngredientForm({ ...ingredientForm, name: e.target.value })}
                  className='w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-[#0C3B2E]'
                />
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='block font-semibold text-slate-700 mb-1'>หน่วยนับ</label>
                  <select
                    value={ingredientForm.unit}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, unit: e.target.value })}
                    className='w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium cursor-pointer'
                  >
                    <option value='กก.'>กิโลกรัม (กก.)</option>
                    <option value='กรัม'>กรัม (g)</option>
                    <option value='ชาม'>ชาม</option>
                    <option value='ฟอง'>ฟอง</option>
                    <option value='ขวด'>ขวด</option>
                    <option value='ห่อ'>ห่อ / ซอง</option>
                    <option value='ลิตร'>ลิตร</option>
                  </select>
                </div>

                <div>
                  <label className='block font-semibold text-slate-700 mb-1'>ต้นทุนต่อหน่วย (฿)</label>
                  <input
                    type='number'
                    required
                    min='0'
                    step='0.5'
                    value={ingredientForm.costPerUnit}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, costPerUnit: parseFloat(e.target.value) || 0 })}
                    className='w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-[#0C3B2E]'
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='block font-semibold text-slate-700 mb-1'>สต็อกตั้งต้น ({ingredientForm.unit})</label>
                  <input
                    type='number'
                    required
                    min='0'
                    step='0.1'
                    value={ingredientForm.stock}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, stock: parseFloat(e.target.value) || 0 })}
                    className='w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:outline-[#0C3B2E]'
                  />
                </div>

                <div>
                  <label className='block font-semibold text-slate-700 mb-1'>จุดเตือนขั้นต่ำ ({ingredientForm.unit})</label>
                  <input
                    type='number'
                    required
                    min='0'
                    step='0.1'
                    value={ingredientForm.minStock}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, minStock: parseFloat(e.target.value) || 0 })}
                    className='w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-[#0C3B2E]'
                  />
                </div>
              </div>

              <div className='pt-2 flex items-center justify-end gap-2 border-t border-slate-100'>
                <button
                  type='button'
                  onClick={() => setShowIngredientModal(false)}
                  className='px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl cursor-pointer'
                >
                  ยกเลิก
                </button>
                <button
                  type='submit'
                  className='px-5 py-2 bg-[#0C3B2E] hover:bg-[#072E20] text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer'
                >
                  <Save className='w-4 h-4 text-[#84CC16]' />
                  <span>บันทึกวัตถุดิบ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: STOCK ADJUSTMENT (IN / WASTE)
      ============================================================ */}
      {showStockAdjustModal && adjustTargetIng && (
        <div className='fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in'>
          <div className='bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4'>
            <div className='flex items-center justify-between border-b border-slate-100 pb-3'>
              <h3 className='font-bold text-sm text-slate-900 flex items-center gap-1.5'>
                {adjustType === 'ADD' ? (
                  <span className='text-emerald-700'>+ เติมสต็อก: {adjustTargetIng.name}</span>
                ) : (
                  <span className='text-red-700'>- ตัดของเสีย: {adjustTargetIng.name}</span>
                )}
              </h3>
              <button
                onClick={() => setShowStockAdjustModal(false)}
                className='w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer'
              >
                <X className='w-3.5 h-3.5' />
              </button>
            </div>

            <div className='space-y-3 text-xs'>
              <div className='bg-slate-50 p-2.5 rounded-2xl border border-slate-200 flex justify-between'>
                <span className='text-slate-500'>คงเหลือปัจจุบัน:</span>
                <span className='font-bold text-slate-900'>{adjustTargetIng.stock.toFixed(2)} {adjustTargetIng.unit}</span>
              </div>

              <div>
                <label className='block font-semibold text-slate-700 mb-1'>
                  จำนวนที่ต้องการ {adjustType === 'ADD' ? 'เติม (+)' : 'ตัดออก (-)'} ({adjustTargetIng.unit}):
                </label>
                <input
                  type='number'
                  min='0.01'
                  step='0.1'
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(parseFloat(e.target.value) || 0)}
                  className='w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-base focus:outline-[#0C3B2E]'
                />
              </div>

              <div>
                <label className='block font-semibold text-slate-700 mb-1'>หมายเหตุ / เหตุผล:</label>
                <input
                  type='text'
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className='w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-[#0C3B2E]'
                />
              </div>

              <div className='pt-2 flex items-center justify-end gap-2 border-t border-slate-100'>
                <button
                  type='button'
                  onClick={() => setShowStockAdjustModal(false)}
                  className='px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl cursor-pointer'
                >
                  ยกเลิก
                </button>
                <button
                  type='button'
                  onClick={handleConfirmStockAdjust}
                  className={
                    'px-4 py-2 font-semibold text-white rounded-xl shadow-md cursor-pointer transition-transform active:scale-95 ' +
                    (adjustType === 'ADD' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-red-600 hover:bg-red-700')
                  }
                >
                  ยืนยันบันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
