'use client';

import React, { useState } from 'react';
import { useRestaurant } from '@/lib/store/restaurant-store';
import { TableTentCard } from '@/components/pos/table-tent-card';
import { TableQRCode } from '@/components/pos/qr-code-canvas';
import { 
  Settings, 
  Store, 
  Receipt, 
  Image as ImageIcon, 
  QrCode, 
  Printer, 
  Save, 
  CheckCircle2, 
  Wifi, 
  Percent, 
  Phone, 
  MapPin, 
  FileText, 
  Sparkles,
  CreditCard,
  Building2,
  ExternalLink,
  Copy,
  Check,
  Users,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  Plus,
  Lock,
  X
} from 'lucide-react';
import { StaffMember, RoleType } from '@/lib/store/restaurant-store';
import { RevenueAnalyticsDashboard } from '@/components/dashboard/revenue-analytics-dashboard';
import { BarChart3 } from 'lucide-react';

export default function SettingsPage() {
  const { 
    restaurantSettings, 
    updateRestaurantSettings, 
    tables, 
    staffMembers, 
    addStaffMember, 
    updateStaffMember, 
    deleteStaffMember,
    auditLogs
  } = useRestaurant();

  // Audit filter state
  const [auditFilterAction, setAuditFilterAction] = useState('ALL');
  const [auditFilterStaff, setAuditFilterStaff] = useState('ALL');
  const [evidenceModal, setEvidenceModal] = useState<{ title: string; imageUrl: string; details?: string } | null>(null);

  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'GENERAL' | 'STAFF_PIN' | 'LOGO' | 'PAYMENT_QR' | 'TABLE_QR' | 'TAX_WIFI'>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam && ['DASHBOARD', 'GENERAL', 'STAFF_PIN', 'LOGO', 'PAYMENT_QR', 'TABLE_QR', 'TAX_WIFI'].includes(tabParam)) {
        return tabParam as any;
      }
    }
    return 'DASHBOARD';
  });

  // Sync tab with URL search parameter if changed
  const handleSelectTab = (tabId: 'DASHBOARD' | 'GENERAL' | 'STAFF_PIN' | 'LOGO' | 'PAYMENT_QR' | 'TABLE_QR' | 'TAX_WIFI') => {
    setActiveTab(tabId);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tabId);
      window.history.replaceState({}, '', url.toString());
    }
  };
  
  // Staff Modal State
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [showPinMap, setShowPinMap] = useState<{ [id: string]: boolean }>({});
  const [staffForm, setStaffForm] = useState<Omit<StaffMember, 'id'>>({
    name: '',
    role: 'CASHIER',
    pin: '',
    phone: '',
    isActive: true,
  });

  const handleOpenAddStaff = () => {
    setEditingStaff(null);
    setStaffForm({
      name: '',
      role: 'CASHIER',
      pin: '',
      phone: '',
      isActive: true,
    });
    setShowStaffModal(true);
  };

  const handleOpenEditStaff = (staff: StaffMember) => {
    setEditingStaff(staff);
    setStaffForm({
      name: staff.name,
      role: staff.role,
      pin: staff.pin,
      phone: staff.phone || '',
      isActive: staff.isActive,
    });
    setShowStaffModal(true);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name || staffForm.pin.length !== 4) {
      alert('กรุณากรอกชื่อและรหัส PIN ให้ครบ 4 หลัก');
      return;
    }
    if (editingStaff) {
      updateStaffMember(editingStaff.id, staffForm);
    } else {
      addStaffMember(staffForm);
    }
    setShowStaffModal(false);
  };

  const toggleShowPin = (id: string) => {
    setShowPinMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const [savedToast, setSavedToast] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: restaurantSettings.name,
    branchName: restaurantSettings.branchName,
    taxId: restaurantSettings.taxId,
    phone: restaurantSettings.phone,
    address: restaurantSettings.address,
    receiptHeader: restaurantSettings.receiptHeader,
    receiptFooter: restaurantSettings.receiptFooter,
    logoUrl: restaurantSettings.logoUrl,
    promptPayId: restaurantSettings.promptPayId,
    promptPayQrUrl: restaurantSettings.promptPayQrUrl || '',
    wifiSsid: restaurantSettings.wifiSsid,
    wifiPassword: restaurantSettings.wifiPassword,
    vatRate: restaurantSettings.vatRate,
    serviceChargeRate: restaurantSettings.serviceChargeRate,
    enableVat: restaurantSettings.enableVat,
    enableServiceCharge: restaurantSettings.enableServiceCharge,
  });

  // QR Hub controls
  const [baseUrl, setBaseUrl] = useState(
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  );
  const [styleMode, setStyleMode] = useState<'ACRYLIC' | 'STICKER'>('ACRYLIC');

  const handleSave = () => {
    updateRestaurantSettings(form);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const handlePrintAll = () => {
    window.print();
  };

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col space-y-6 pb-20'>
      {/* Header Banner with Geometric Background from user mockup */}
      <div 
        className='relative rounded-3xl p-6 sm:p-7 text-white shadow-xl overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-cyan-300/40 print:hidden'
        style={{
          backgroundImage: "linear-gradient(to right, rgba(0, 30, 45, 0.72) 0%, rgba(0, 40, 50, 0.45) 50%, rgba(0, 0, 0, 0.2) 100%), url('/images/banner-bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className='relative z-10'>
          <div className='inline-flex items-center space-x-2 px-3 py-1 bg-black/35 backdrop-blur-md rounded-full text-xs font-bold text-[#84CC16] border border-white/20 mb-2 shadow-xs'>
            <Settings className='w-4 h-4 text-[#84CC16]' />
            <span>RESTAURANT & BILLING CONFIGURATION</span>
          </div>
          <h2 className='text-xl sm:text-2xl font-bold tracking-tight text-white'>
            ตั้งค่าระบบร้าน & การออกบิล
          </h2>
          <p className='text-white/85 text-xs sm:text-sm mt-1 font-normal max-w-2xl'>
            กำหนดชื่อร้าน, ที่อยู่ออกใบกำกับภาษี, โลโก้, QR Code รับเงินพร้อมเพย์ และตัวจัดการพิมพ์ QR ประจำโต๊ะ
          </p>
        </div>

        <div className='relative z-10 flex items-center gap-2'>
          <button
            onClick={handleSave}
            className='px-6 py-3 bg-[#84CC16] hover:bg-[#65A30D] text-[#072E20] font-black rounded-2xl text-xs flex items-center gap-2 shadow-xl transition-transform active:scale-95 cursor-pointer'
          >
            <Save className='w-4 h-4' />
            <span>บันทึกการตั้งค่า (Save Settings)</span>
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {savedToast && (
        <div className='bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center justify-between animate-in slide-in-from-top print:hidden'>
          <div className='flex items-center space-x-2 font-bold text-xs'>
            <CheckCircle2 className='w-5 h-5 text-[#84CC16]' />
            <span>บันทึกข้อมูลการตั้งค่าร้านและบิลเรียบร้อยแล้ว! (Settings Saved)</span>
          </div>
          <button onClick={() => setSavedToast(false)} className='text-xs font-bold text-emerald-200 hover:text-white'>
            ปิด
          </button>
        </div>
      )}

      {/* Navigation Tabs Bar with High-Contrast Pill Buttons */}
      <div className='flex space-x-2 overflow-x-auto pb-1 bg-white p-2.5 rounded-3xl border border-slate-200 shadow-sm text-xs print:hidden scrollbar-none'>
        {[
          { id: 'DASHBOARD', label: '📊 แดชบอร์ดรายได้ & กราฟ', icon: BarChart3, badge: 'Analytics' },
          { id: 'GENERAL', label: 'ข้อมูลร้าน & หัวบิล', icon: Store, badge: undefined },
          { id: 'STAFF_PIN', label: 'พนักงาน & รหัส PIN 4 หลัก', icon: KeyRound, badge: `${staffMembers.length} คน` },
          { id: 'LOGO', label: 'โลโก้ร้าน', icon: ImageIcon, badge: undefined },
          { id: 'PAYMENT_QR', label: 'QR รับเงิน (PromptPay)', icon: CreditCard, badge: undefined },
          { id: 'TABLE_QR', label: 'พิมพ์ QR ทุกโต๊ะ', icon: QrCode, badge: `${tables.length} โต๊ะ` },
          { id: 'TAX_WIFI', label: 'Wi-Fi & ภาษี VAT', icon: Wifi, badge: undefined },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type='button'
              onClick={() => handleSelectTab(tab.id as any)}
              className={
                'px-4 py-3 rounded-2xl font-bold whitespace-nowrap flex items-center space-x-2 transition-all cursor-pointer shadow-xs active:scale-95 ' +
                (isActive
                  ? 'bg-[#0C3B2E] text-white shadow-md font-bold ring-2 ring-[#84CC16]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80')
              }
            >
              <Icon className={'w-4 h-4 ' + (isActive ? 'text-[#84CC16]' : 'text-slate-500')} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={
                  'ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ' +
                  (isActive ? 'bg-[#84CC16] text-[#072E20]' : 'bg-slate-200 text-slate-700')
                }>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 0: REVENUE ANALYTICS DASHBOARD */}
      {activeTab === 'DASHBOARD' && (
        <RevenueAnalyticsDashboard />
      )}

      {/* TAB 1: General & Receipt Info */}
      {activeTab === 'GENERAL' && (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4'>
            <h3 className='font-black text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3'>
              <Store className='w-5 h-5 text-[#0C3B2E]' />
              <span>ข้อมูลร้านค้าสำหรับหัวบิลและใบกำกับภาษี</span>
            </h3>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs'>
              <div className='space-y-1.5'>
                <label className='font-bold text-slate-700 block'>ชื่อร้าน (Restaurant Name):</label>
                <input
                  type='text'
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className='w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:bg-white focus:outline-[#0C3B2E]'
                />
              </div>

              <div className='space-y-1.5'>
                <label className='font-bold text-slate-700 block'>ชื่อสาขา (Branch Name):</label>
                <input
                  type='text'
                  value={form.branchName}
                  onChange={(e) => setForm({ ...form, branchName: e.target.value })}
                  className='w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:bg-white focus:outline-[#0C3B2E]'
                />
              </div>

              <div className='space-y-1.5'>
                <label className='font-bold text-slate-700 block'>เลขประจำตัวผู้เสียภาษี (Tax ID):</label>
                <input
                  type='text'
                  value={form.taxId}
                  onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                  placeholder='0105562001234'
                  className='w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono focus:bg-white focus:outline-[#0C3B2E]'
                />
              </div>

              <div className='space-y-1.5'>
                <label className='font-bold text-slate-700 block'>เบอร์โทรศัพท์ร้าน (Phone Number):</label>
                <input
                  type='text'
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder='081-234-5678'
                  className='w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:bg-white focus:outline-[#0C3B2E]'
                />
              </div>

              <div className='sm:col-span-2 space-y-1.5'>
                <label className='font-bold text-slate-700 block'>ที่อยู่ร้านสำหรับออกใบเสร็จ (Billing Address):</label>
                <textarea
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className='w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:bg-white focus:outline-[#0C3B2E]'
                />
              </div>

              <div className='space-y-1.5'>
                <label className='font-bold text-slate-700 block'>ข้อความหัวใบเสร็จ (Header Note):</label>
                <input
                  type='text'
                  value={form.receiptHeader}
                  onChange={(e) => setForm({ ...form, receiptHeader: e.target.value })}
                  className='w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:bg-white focus:outline-[#0C3B2E]'
                />
              </div>

              <div className='space-y-1.5'>
                <label className='font-bold text-slate-700 block'>ข้อความท้ายใบเสร็จ (Footer Note):</label>
                <input
                  type='text'
                  value={form.receiptFooter}
                  onChange={(e) => setForm({ ...form, receiptFooter: e.target.value })}
                  className='w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:bg-white focus:outline-[#0C3B2E]'
                />
              </div>
            </div>
          </div>

          {/* Receipt Preview */}
          <div className='bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between'>
            <div>
              <h3 className='font-black text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3 mb-4'>
                <Receipt className='w-4 h-4 text-[#D9531E]' />
                <span>ตัวอย่างใบเสร็จรับเงิน (Receipt Preview)</span>
              </h3>

              <div className='p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 font-mono text-[11px] space-y-2 text-center text-slate-800 shadow-inner'>
                <div className='font-black text-sm text-slate-900'>{form.name}</div>
                <div className='text-[10px] text-slate-500'>{form.branchName}</div>
                <div className='text-[10px] text-slate-600 leading-tight'>{form.address}</div>
                <div className='text-[10px] text-slate-600'>โทร: {form.phone} | TAX: {form.taxId}</div>
                <div className='border-t border-dashed border-slate-300 my-2' />
                <div className='text-[10px] text-slate-500 italic'>{form.receiptHeader}</div>
                <div className='flex justify-between font-bold text-left pt-1'>
                  <span>1x บะหมี่เป็ดย่างพิเศษ</span>
                  <span>80.00</span>
                </div>
                <div className='flex justify-between font-bold text-left'>
                  <span>1x ชาดำเย็น</span>
                  <span>25.00</span>
                </div>
                <div className='border-t border-dashed border-slate-300 my-2' />
                <div className='flex justify-between font-black text-xs text-slate-900'>
                  <span>ยอดสุทธิ (Total):</span>
                  <span>฿105.00</span>
                </div>
                <div className='border-t border-dashed border-slate-300 my-2' />
                <div className='text-[10px] text-slate-500'>{form.receiptFooter}</div>
              </div>
            </div>

            <button
              onClick={handleSave}
              className='mt-4 w-full py-3 bg-[#0C3B2E] text-white font-black rounded-2xl text-xs shadow-md transition-transform active:scale-95 cursor-pointer'
            >
              บันทึกข้อมูลทั่วไป
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Restaurant Logo */}
      {activeTab === 'LOGO' && (
        <div className='bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6'>
          <h3 className='font-black text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3'>
            <ImageIcon className='w-5 h-5 text-[#0C3B2E]' />
            <span>โลโก้ประจำร้าน (Restaurant Brand Logo)</span>
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 items-center'>
            <div className='space-y-4 text-xs'>
              <div className='space-y-1.5'>
                <label className='font-bold text-slate-700 block'>URL รูปภาพโลโก้ร้าน:</label>
                <input
                  type='text'
                  value={form.logoUrl}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  placeholder='https://images.unsplash.com/...'
                  className='w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono focus:bg-white focus:outline-[#0C3B2E]'
                />
              </div>

              {/* Preset Logos */}
              <div className='space-y-2'>
                <span className='font-bold text-slate-600 block'>หรือเลือกโลโก้แนะนำ:</span>
                <div className='grid grid-cols-3 gap-2'>
                  {[
                    { label: 'ก๋วยเตี๋ยวเป็ดคลาสสิก', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=150&auto=format&fit=crop&q=80' },
                    { label: 'เป็ดย่างฮ่องกง', url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=150&auto=format&fit=crop&q=80' },
                    { label: 'ชามก๋วยเตี๋ยวโบราณ', url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=150&auto=format&fit=crop&q=80' },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setForm({ ...form, logoUrl: preset.url })}
                      className='p-2 rounded-2xl border border-slate-200 bg-slate-50 hover:border-[#0C3B2E] text-[10px] font-bold text-slate-700 flex flex-col items-center gap-1.5 cursor-pointer'
                    >
                      <img src={preset.url} alt={preset.label} className='w-12 h-12 rounded-xl object-cover' />
                      <span className='truncate w-full text-center'>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Logo Live Preview */}
            <div className='flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-3'>
              <div className='w-28 h-28 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-white flex items-center justify-center'>
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt='Logo Preview' className='w-full h-full object-cover' />
                ) : (
                  <Store className='w-12 h-12 text-slate-300' />
                )}
              </div>
              <span className='font-black text-slate-900 text-sm'>{form.name}</span>
              <span className='text-xs text-slate-500 font-medium'>ตัวอย่างแสดงบนใบเสร็จและหน้าจอ QR สั่งอาหาร</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Payment QR Code */}
      {activeTab === 'PAYMENT_QR' && (
        <div className='bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6'>
          <h3 className='font-black text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3'>
            <CreditCard className='w-5 h-5 text-[#0C3B2E]' />
            <span>QR Code รับชำระเงิน (PromptPay & Bank Account)</span>
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 items-center'>
            <div className='space-y-4 text-xs'>
              <div className='space-y-1.5'>
                <label className='font-bold text-slate-700 block'>
                  เบอร์โทรศัพท์ / เลขนิติบุคคล PromptPay (PromptPay ID):
                </label>
                <input
                  type='text'
                  value={form.promptPayId}
                  onChange={(e) => setForm({ ...form, promptPayId: e.target.value })}
                  placeholder='เช่น 0812345678 หรือ 0105562001234'
                  className='w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-sm focus:bg-white focus:outline-[#0C3B2E]'
                />
                <p className='text-[11px] text-slate-500'>
                  ระบบจะใช้รหัสนี้สำหรับสร้าง Dynamic PromptPay QR Code ในหน้าเช็คบิลอัตโนมัติ
                </p>
              </div>

              <div className='space-y-1.5'>
                <label className='font-bold text-slate-700 block'>
                  URL รูปภาพ QR บัญชีธนาคาร (ทางเลือก):
                </label>
                <input
                  type='text'
                  value={form.promptPayQrUrl}
                  onChange={(e) => setForm({ ...form, promptPayQrUrl: e.target.value })}
                  placeholder='https://...'
                  className='w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono focus:bg-white focus:outline-[#0C3B2E]'
                />
              </div>
            </div>

            {/* Live PromptPay QR Preview */}
            <div className='flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50/50 to-slate-50 rounded-3xl border border-blue-200 text-center space-y-3'>
              <div className='px-4 py-1 rounded-full bg-[#003D6B] text-white font-black text-xs flex items-center gap-1.5 shadow-sm'>
                <span>พร้อมเพย์ • PromptPay</span>
              </div>
              
              <div className='p-3 bg-white rounded-2xl border border-slate-200 shadow-md'>
                <TableQRCode
                  value={`promptpay:${form.promptPayId || '0812345678'}`}
                  size={160}
                  tableNumber='PromptPay'
                  showDownload={false}
                />
              </div>

              <div className='text-xs font-black text-slate-900'>
                หมายเลขพร้อมเพย์: <span className='text-[#003D6B] font-mono'>{form.promptPayId || '081-234-5678'}</span>
              </div>
              <span className='text-[10px] text-slate-500 font-medium'>
                ลูกค้าสามารถใช้แอปธนาคารทุกแห่งสแกนชำระเงินได้ทันที
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Integrated Table QR Generator & Tent Cards */}
      {activeTab === 'TABLE_QR' && (
        <div className='space-y-6'>
          <div className='bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden'>
            <div className='flex-1 flex flex-col sm:flex-row sm:items-center gap-2.5'>
              <span className='text-xs font-black text-slate-800 flex items-center gap-1.5 shrink-0'>
                <QrCode className='w-4 h-4 text-[#0C3B2E]' />
                <span>Base URL (สำหรับสแกนในร้าน):</span>
              </span>
              <input
                type='text'
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder='http://localhost:3000 หรือ IP วงแลน'
                className='flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs text-slate-900 focus:bg-white focus:outline-[#0C3B2E]'
              />
            </div>

            <div className='flex items-center gap-2'>
              <div className='flex items-center bg-slate-100 p-1 rounded-2xl text-xs'>
                <button
                  onClick={() => setStyleMode('ACRYLIC')}
                  className={
                    'px-3.5 py-1.5 rounded-xl font-black transition-all ' +
                    (styleMode === 'ACRYLIC' ? 'bg-[#0C3B2E] text-white shadow-xs' : 'text-slate-600')
                  }
                >
                  ป้ายตั้งโต๊ะ (Tent Card)
                </button>
                <button
                  onClick={() => setStyleMode('STICKER')}
                  className={
                    'px-3.5 py-1.5 rounded-xl font-black transition-all ' +
                    (styleMode === 'STICKER' ? 'bg-[#0C3B2E] text-white shadow-xs' : 'text-slate-600')
                  }
                >
                  สติกเกอร์ (Sticker)
                </button>
              </div>

              <button
                onClick={handlePrintAll}
                className='px-4 py-2 bg-[#84CC16] hover:bg-[#65A30D] text-[#072E20] font-black rounded-2xl text-xs flex items-center gap-1.5 shadow-md transition-transform active:scale-95 cursor-pointer'
              >
                <Printer className='w-4 h-4' />
                <span>🖨️ สั่งพิมพ์ป้ายทุกโต๊ะ (A4)</span>
              </button>
            </div>
          </div>

          {/* Table Cards Grid */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center print:grid-cols-2 print:gap-4'>
            {tables.map((table) => {
              const qrUrl = `${baseUrl}/order?table=${table.number}`;
              return (
                <div key={table.id} className='flex flex-col items-center space-y-3 w-full max-w-xs'>
                  <TableTentCard table={table} baseUrl={baseUrl} styleMode={styleMode} />

                  <div className='w-full bg-white rounded-2xl p-2 border border-slate-200 shadow-sm flex items-center justify-between gap-1.5 print:hidden'>
                    <TableQRCode value={qrUrl} size={60} tableNumber={table.number} showDownload={true} />
                    <a
                      href={`/order?table=${table.number}`}
                      target='_blank'
                      rel='noreferrer'
                      className='flex-1 py-2 bg-[#84CC16] hover:bg-[#65A30D] text-[#072E20] font-black rounded-xl text-[11px] flex items-center justify-center gap-1 shadow-xs text-center'
                    >
                      <ExternalLink className='w-3 h-3' />
                      <span>ทดสอบสั่ง</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: Wi-Fi & VAT Settings */}
      {activeTab === 'TAX_WIFI' && (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Wi-Fi Settings */}
          <div className='bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs'>
            <h3 className='font-black text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3'>
              <Wifi className='w-5 h-5 text-[#0C3B2E]' />
              <span>ข้อมูล Wi-Fi ร้านสำหรับลูกค้า</span>
            </h3>

            <div className='space-y-1.5'>
              <label className='font-bold text-slate-700 block'>ชื่อสัญญาณ Wi-Fi (SSID):</label>
              <input
                type='text'
                value={form.wifiSsid}
                onChange={(e) => setForm({ ...form, wifiSsid: e.target.value })}
                className='w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:bg-white focus:outline-[#0C3B2E]'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='font-bold text-slate-700 block'>รหัสผ่าน Wi-Fi (Password):</label>
              <input
                type='text'
                value={form.wifiPassword}
                onChange={(e) => setForm({ ...form, wifiPassword: e.target.value })}
                className='w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono focus:bg-white focus:outline-[#0C3B2E]'
              />
            </div>
          </div>

          {/* Tax & Service Charge Settings */}
          <div className='bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs'>
            <h3 className='font-black text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3'>
              <Percent className='w-5 h-5 text-[#0C3B2E]' />
              <span>อัตราภาษีมูลค่าเพิ่ม (VAT) & Service Charge</span>
            </h3>

            <div className='flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200'>
              <div>
                <div className='font-black text-slate-900'>เปิดใช้งานภาษีมูลค่าเพิ่ม (VAT 7%)</div>
                <div className='text-[10px] text-slate-500'>คำนวณและแสดงในใบกำกับภาษีอย่างย่อ</div>
              </div>
              <input
                type='checkbox'
                checked={form.enableVat}
                onChange={(e) => setForm({ ...form, enableVat: e.target.checked })}
                className='w-5 h-5 accent-[#0C3B2E] cursor-pointer'
              />
            </div>

            <div className='flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200'>
              <div>
                <div className='font-black text-slate-900'>ค่าบริการ Service Charge (10%)</div>
                <div className='text-[10px] text-slate-500'>คำนวณบวกเพิ่มจากค่าอาหาร</div>
              </div>
              <input
                type='checkbox'
                checked={form.enableServiceCharge}
                onChange={(e) => setForm({ ...form, enableServiceCharge: e.target.checked })}
                className='w-5 h-5 accent-[#0C3B2E] cursor-pointer'
              />
            </div>
          </div>
        </div>
      )}
      {/* TAB: STAFF & PIN MANAGEMENT */}
      {activeTab === 'STAFF_PIN' && (
        <div className='space-y-6 animate-in fade-in'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-5 rounded-3xl border border-slate-200 shadow-sm gap-4'>
            <div>
              <h3 className='font-bold text-base text-slate-900 flex items-center gap-2'>
                <KeyRound className='w-5 h-5 text-[#0C3B2E]' />
                <span>จัดการพนักงาน & กำหนดรหัส PIN 4 หลัก</span>
              </h3>
              <p className='text-xs text-slate-500 mt-1 font-normal'>
                พนักงานใช้รหัส PIN 4 หลักในการสลับกะ/เข้าใช้งานเครื่อง POS ได้ทันทีโดยไม่ต้องจำรหัสผ่านยาวๆ
              </p>
            </div>

            <button
              type='button'
              onClick={handleOpenAddStaff}
              className='px-4 py-2.5 bg-[#0C3B2E] hover:bg-[#072E20] text-white font-semibold rounded-2xl text-xs flex items-center gap-1.5 shadow-md transition-transform active:scale-95 cursor-pointer whitespace-nowrap'
            >
              <Plus className='w-4 h-4 text-[#84CC16]' />
              <span>+ เพิ่มพนักงานใหม่</span>
            </button>
          </div>

          {/* Staff Cards Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {staffMembers.map((staff) => {
              const isShowingPin = !!showPinMap[staff.id];
              return (
                <div
                  key={staff.id}
                  className='bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3.5 hover:border-emerald-500 transition-all flex flex-col justify-between'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex items-center space-x-3'>
                      <div className='w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-base shadow-xs'>
                        {staff.role === 'OWNER' ? '👑' : staff.role === 'MANAGER' ? '💼' : staff.role === 'CASHIER' ? '💵' : staff.role === 'WAITER' ? '📱' : '👨‍🍳'}
                      </div>
                      <div>
                        <h4 className='font-bold text-slate-900 text-sm leading-tight'>{staff.name}</h4>
                        <div className='flex items-center gap-1.5 mt-1'>
                          <span className='px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700'>
                            {staff.role}
                          </span>
                          {staff.isActive ? (
                            <span className='text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5'>
                              ● ใช้งานอยู่
                            </span>
                          ) : (
                            <span className='text-[10px] text-slate-400 font-medium'>ระงับ</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center space-x-1'>
                      <button
                        type='button'
                        onClick={() => handleOpenEditStaff(staff)}
                        className='p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer'
                        title='แก้ไขข้อมูล'
                      >
                        <Edit3 className='w-4 h-4' />
                      </button>
                      <button
                        type='button'
                        onClick={() => {
                          if (confirm(`คุณต้องการลบพนักงาน "${staff.name}" หรือไม่?`)) {
                            deleteStaffMember(staff.id);
                          }
                        }}
                        className='p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer'
                        title='ลบพนักงาน'
                      >
                        <Trash2 className='w-4 h-4' />
                      </button>
                    </div>
                  </div>

                  {/* PIN Display Box */}
                  <div className='bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between'>
                    <div className='text-xs'>
                      <span className='text-slate-500 block text-[10px]'>รหัส PIN เข้าใช้งาน:</span>
                      <span className='font-mono font-bold text-base tracking-widest text-slate-900'>
                        {isShowingPin ? staff.pin : '••••'}
                      </span>
                    </div>

                    <button
                      type='button'
                      onClick={() => toggleShowPin(staff.id)}
                      className='px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs'
                    >
                      {isShowingPin ? (
                        <>
                          <EyeOff className='w-3.5 h-3.5 text-slate-400' />
                          <span className='text-[11px]'>ซ่อน</span>
                        </>
                      ) : (
                        <>
                          <Eye className='w-3.5 h-3.5 text-slate-600' />
                          <span className='text-[11px]'>ดูรหัส</span>
                        </>
                      )}
                    </button>
                  </div>

                  {staff.phone && (
                    <div className='text-[11px] text-slate-500 flex items-center gap-1 font-medium'>
                      <Phone className='w-3 h-3 text-slate-400' />
                      <span>{staff.phone}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ============================================================
              ANTI-FRAUD AUDIT TRAIL (บันทึกตรวจสอบป้องกันการทุจริต)
          ============================================================ */}
          <div className='bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3'>
              <div>
                <h3 className='font-bold text-base text-slate-900 flex items-center gap-2'>
                  <ShieldCheck className='w-5 h-5 text-[#0C3B2E]' />
                  <span>🛡️ บันทึกตรวจสอบความปลอดภัย & ตรวจสอบการทุจริต (Anti-Fraud Audit Trail)</span>
                </h3>
                <p className='text-xs text-slate-500 font-normal mt-0.5'>
                  ตรวจสอบย้อนหลังได้ทุกรายการ: ใครเป็นคนรับออเดอร์, ใครกดยกเลิกจานอาหาร, ใครให้ส่วนลด, และเวลาที่ทำรายการ
                </p>
              </div>

              {/* Filters */}
              <div className='flex items-center gap-2'>
                {/* Staff Filter */}
                <select
                  value={auditFilterStaff}
                  onChange={(e) => setAuditFilterStaff(e.target.value)}
                  className='px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer focus:outline-[#0C3B2E]'
                >
                  <option value='ALL'>พนักงานทุกคน</option>
                  {staffMembers.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>

                {/* Action Filter */}
                <select
                  value={auditFilterAction}
                  onChange={(e) => setAuditFilterAction(e.target.value)}
                  className='px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer focus:outline-[#0C3B2E]'
                >
                  <option value='ALL'>ทุกกิจกรรม</option>
                  <option value='VOID_ORDER_ITEM'>🚫 ยกเลิกรายการอาหาร (Void)</option>
                  <option value='APPLY_DISCOUNT'>💸 ให้ส่วนลด (Discount)</option>
                  <option value='PAYMENT'>💵 รับชำระเงิน (Payment)</option>
                  <option value='STAFF_LOGIN_PIN'>🔑 สลับพนักงานด้วย PIN</option>
                </select>
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className='overflow-x-auto'>
              <table className='w-full text-left text-xs'>
                <thead className='bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold'>
                  <tr>
                    <th className='p-3'>วัน-เวลา</th>
                    <th className='p-3'>พนักงานผู้ทำรายการ (Actor)</th>
                    <th className='p-3'>ประเภทกิจกรรม</th>
                    <th className='p-3'>รายละเอียดรายการ (Details)</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-100'>
                  {auditLogs
                    .filter((log) => {
                      const matchStaff = auditFilterStaff === 'ALL' || log.actor.includes(auditFilterStaff) || auditFilterStaff.includes(log.actor);
                      const matchAction = auditFilterAction === 'ALL' || log.action === auditFilterAction || (auditFilterAction === 'PAYMENT' && log.action.includes('PAYMENT'));
                      return matchStaff && matchAction;
                    })
                    .map((log) => {
                      const isVoid = log.action.includes('VOID') || log.action.includes('CANCEL') || log.action.includes('REJECT');
                      const isDiscount = log.action.includes('DISCOUNT');
                      const isPayment = log.action.includes('PAYMENT');
                      return (
                        <tr key={log.id} className='hover:bg-slate-50/80 transition-colors'>
                          <td className='p-3 text-slate-500 font-mono text-[11px] whitespace-nowrap'>
                            {new Date(log.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}{' '}
                            <span className='text-[10px] text-slate-400'>({new Date(log.timestamp).toLocaleDateString('th-TH')})</span>
                          </td>
                          <td className='p-3 font-semibold text-slate-900 whitespace-nowrap'>
                            <span className='px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-bold text-[11px] mr-1.5'>
                              {log.role}
                            </span>
                            {log.actor}
                          </td>
                          <td className='p-3 whitespace-nowrap'>
                            {isVoid ? (
                              <span className='px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 flex items-center gap-1 w-fit'>
                                🚫 ยกเลิกรายการ (Void)
                              </span>
                            ) : isDiscount ? (
                              <span className='px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1 w-fit'>
                                💸 ให้ส่วนลด
                              </span>
                            ) : isPayment ? (
                              <span className='px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit'>
                                💵 รับชำระเงิน
                              </span>
                            ) : (
                              <span className='px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700'>
                                {log.action}
                              </span>
                            )}
                          </td>
                          <td className='p-3 text-slate-700 font-medium'>
                            <div className='flex flex-wrap items-center gap-1.5'>
                              <span>{log.details}</span>
                              {log.photoUrl && (
                                <button
                                  type='button'
                                  onClick={() => setEvidenceModal({ title: '📸 รูปถ่ายจานอาหารที่ยกเลิก', imageUrl: log.photoUrl!, details: log.details })}
                                  className='px-2 py-0.5 bg-red-100 hover:bg-red-200 text-red-800 border border-red-300 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs'
                                >
                                  <span>📸 ดูรูปจาน</span>
                                </button>
                              )}
                              {log.signatureUrl && (
                                <button
                                  type='button'
                                  onClick={() => setEvidenceModal({ title: '✍️ ลายเซ็นผู้อนุมัติการยกเลิก', imageUrl: log.signatureUrl!, details: log.details })}
                                  className='px-2 py-0.5 bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-300 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs'
                                >
                                  <span>✍️ ดูลายเซ็น</span>
                                </button>
                              )}
                            </div>
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

      {/* EVIDENCE PREVIEW MODAL (PHOTO & SIGNATURE) */}
      {evidenceModal && (
        <div 
          onClick={() => setEvidenceModal(null)}
          className='fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in'
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className='bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-3 animate-in zoom-in-95'
          >
            <div className='flex items-center justify-between border-b border-slate-100 pb-2.5'>
              <h4 className='font-bold text-sm text-slate-900'>{evidenceModal.title}</h4>
              <button
                type='button'
                onClick={() => setEvidenceModal(null)}
                className='w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer'
              >
                <X className='w-4 h-4' />
              </button>
            </div>

            <div className='rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-h-80 flex items-center justify-center p-2'>
              <img src={evidenceModal.imageUrl} alt='Evidence Preview' className='max-h-72 w-auto object-contain rounded-xl' />
            </div>

            {evidenceModal.details && (
              <p className='text-[11px] text-slate-500 font-normal'>{evidenceModal.details}</p>
            )}

            <button
              type='button'
              onClick={() => setEvidenceModal(null)}
              className='w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer'
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT STAFF */}
      {showStaffModal && (
        <div className='fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in'>
          <div className='bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4'>
            <div className='flex items-center justify-between border-b border-slate-100 pb-3'>
              <h3 className='font-bold text-base text-slate-900 flex items-center gap-2'>
                <KeyRound className='w-5 h-5 text-[#0C3B2E]' />
                <span>{editingStaff ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานใหม่ & ตั้งรหัส PIN'}</span>
              </h3>
              <button
                type='button'
                onClick={() => setShowStaffModal(false)}
                className='w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer'
              >
                <X className='w-4 h-4' />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className='space-y-3.5 text-xs'>
              <div>
                <label className='block font-semibold text-slate-700 mb-1'>ชื่อ-นามสกุล หรือชื่อเล่น *</label>
                <input
                  type='text'
                  required
                  placeholder='เช่น สมชาย (แคชเชียร์ช่วงเช้า)'
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  className='w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-[#0C3B2E]'
                />
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='block font-semibold text-slate-700 mb-1'>ตำแหน่ง / บทบาท *</label>
                  <select
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value as RoleType })}
                    className='w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium cursor-pointer'
                  >
                    <option value='CASHIER'>💵 Cashier (แคชเชียร์)</option>
                    <option value='WAITER'>📱 Waiter (พนักงานเสิร์ฟ)</option>
                    <option value='KITCHEN'>👨‍🍳 Kitchen (พนักงานครัว)</option>
                    <option value='MANAGER'>💼 Manager (ผู้จัดการ)</option>
                    <option value='OWNER'>👑 Owner (เจ้าของร้าน)</option>
                  </select>
                </div>

                <div>
                  <label className='block font-semibold text-slate-700 mb-1'>รหัส PIN 4 หลัก *</label>
                  <input
                    type='password'
                    required
                    maxLength={4}
                    pattern='[0-9]{4}'
                    placeholder='เช่น 1234'
                    value={staffForm.pin}
                    onChange={(e) => setStaffForm({ ...staffForm, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    className='w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-center tracking-widest text-sm focus:outline-[#0C3B2E]'
                  />
                </div>
              </div>

              <div>
                <label className='block font-semibold text-slate-700 mb-1'>เบอร์โทรศัพท์ (ถ้ามี)</label>
                <input
                  type='tel'
                  placeholder='08X-XXX-XXXX'
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                  className='w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-[#0C3B2E]'
                />
              </div>

              <div className='flex items-center space-x-2 pt-1'>
                <input
                  type='checkbox'
                  id='staff-active'
                  checked={staffForm.isActive}
                  onChange={(e) => setStaffForm({ ...staffForm, isActive: e.target.checked })}
                  className='w-4 h-4 rounded text-[#0C3B2E] cursor-pointer'
                />
                <label htmlFor='staff-active' className='font-medium text-slate-700 cursor-pointer'>
                  เปิดใช้งานพนักงานคนนี้ในระบบ
                </label>
              </div>

              <div className='pt-3 flex items-center justify-end gap-2 border-t border-slate-100'>
                <button
                  type='button'
                  onClick={() => setShowStaffModal(false)}
                  className='px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl cursor-pointer'
                >
                  ยกเลิก
                </button>
                <button
                  type='submit'
                  className='px-5 py-2 bg-[#0C3B2E] hover:bg-[#072E20] text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer'
                >
                  <Save className='w-4 h-4 text-[#84CC16]' />
                  <span>บันทึกข้อมูล</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}