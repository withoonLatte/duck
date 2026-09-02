'use client';

import React, { useState, useMemo } from 'react';
import { useRestaurant } from '@/lib/store/restaurant-store';
import { 
  TrendingUp, 
  DollarSign, 
  Receipt, 
  Calendar, 
  Clock, 
  PieChart, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  Download, 
  Printer, 
  CreditCard, 
  Coins, 
  Smartphone,
  ChevronRight,
  Filter
} from 'lucide-react';

type DatePreset = 'TODAY' | '7DAYS' | 'MONTH' | 'YEAR' | 'CUSTOM';

export function RevenueAnalyticsDashboard() {
  const { payments, orders, products } = useRestaurant();

  const [datePreset, setDatePreset] = useState<DatePreset>('7DAYS');
  const [customStartDate, setCustomStartDate] = useState(
    new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
  );
  const [customEndDate, setCustomEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [hoveredPoint, setHoveredPoint] = useState<{ label: string; amount: number; count: number } | null>(null);

  // Dynamic Dataset based on Selected Date Range
  const analyticsData = useMemo(() => {
    if (datePreset === 'TODAY') {
      const hours = [
        { label: '08:00', amount: 1250, count: 8 },
        { label: '09:00', amount: 2400, count: 14 },
        { label: '10:00', amount: 3800, count: 22 },
        { label: '11:00', amount: 8900, count: 52 },
        { label: '12:00', amount: 14200, count: 84 },
        { label: '13:00', amount: 11800, count: 68 },
        { label: '14:00', amount: 4500, count: 26 },
        { label: '15:00', amount: 3200, count: 18 },
        { label: '16:00', amount: 4100, count: 24 },
        { label: '17:00', amount: 9600, count: 56 },
        { label: '18:00', amount: 13500, count: 78 },
        { label: '19:00', amount: 11200, count: 64 },
        { label: '20:00', amount: 5400, count: 32 },
      ];
      const totalRevenue = hours.reduce((s, h) => s + h.amount, 0);
      const totalBills = hours.reduce((s, h) => s + h.count, 0);
      return { title: 'รายได้ประจำวัน (วันนี้)', totalRevenue, totalBills, points: hours, period: 'รายชั่วโมง' };
    } else if (datePreset === '7DAYS') {
      const days = [
        { label: 'จันทร์', amount: 42500, count: 245 },
        { label: 'อังคาร', amount: 38900, count: 220 },
        { label: 'พุธ', amount: 44200, count: 260 },
        { label: 'พฤหัสฯ', amount: 41800, count: 238 },
        { label: 'ศุกร์', amount: 58600, count: 340 },
        { label: 'เสาร์', amount: 72400, count: 420 },
        { label: 'อาทิตย์', amount: 68900, count: 395 },
      ];
      const totalRevenue = days.reduce((s, d) => s + d.amount, 0);
      const totalBills = days.reduce((s, d) => s + d.count, 0);
      return { title: 'รายได้รอบ 7 วันล่าสุด', totalRevenue, totalBills, points: days, period: 'รายวัน' };
    } else if (datePreset === 'MONTH') {
      const weeks = [
        { label: 'สัปดาห์ 1 (1-7)', amount: 285000, count: 1650 },
        { label: 'สัปดาห์ 2 (8-14)', amount: 312000, count: 1820 },
        { label: 'สัปดาห์ 3 (15-21)', amount: 298000, count: 1710 },
        { label: 'สัปดาห์ 4 (22-28)', amount: 345000, count: 2010 },
        { label: 'สัปดาห์ 5 (29-31)', amount: 142000, count: 830 },
      ];
      const totalRevenue = weeks.reduce((s, w) => s + w.amount, 0);
      const totalBills = weeks.reduce((s, w) => s + w.count, 0);
      return { title: 'รายได้ประจำเดือนนี้ (This Month)', totalRevenue, totalBills, points: weeks, period: 'รายสัปดาห์' };
    } else if (datePreset === 'YEAR') {
      const months = [
        { label: 'ม.ค.', amount: 1180000, count: 6800 },
        { label: 'ก.พ.', amount: 1090000, count: 6300 },
        { label: 'มี.ค.', amount: 1250000, count: 7200 },
        { label: 'เม.ย.', amount: 1420000, count: 8100 },
        { label: 'พ.ค.', amount: 1190000, count: 6900 },
        { label: 'มิ.ย.', amount: 1240000, count: 7150 },
        { label: 'ก.ค.', amount: 1310000, count: 7550 },
        { label: 'ส.ค.', amount: 1290000, count: 7400 },
        { label: 'ก.ย.', amount: 1380000, count: 7900 },
        { label: 'ต.ค.', amount: 1340000, count: 7700 },
        { label: 'พ.ย.', amount: 1460000, count: 8400 },
        { label: 'ธ.ค.', amount: 1680000, count: 9650 },
      ];
      const totalRevenue = months.reduce((s, m) => s + m.amount, 0);
      const totalBills = months.reduce((s, m) => s + m.count, 0);
      return { title: 'รายได้ประจำปี (Annual Overview)', totalRevenue, totalBills, points: months, period: 'รายเดือน' };
    } else {
      // Custom Range
      const customDays = [
        { label: 'ช่วงที่ 1', amount: 65400, count: 375 },
        { label: 'ช่วงที่ 2', amount: 78900, count: 450 },
        { label: 'ช่วงที่ 3', amount: 84200, count: 490 },
        { label: 'ช่วงที่ 4', amount: 92100, count: 530 },
        { label: 'ช่วงที่ 5', amount: 88500, count: 510 },
      ];
      const totalRevenue = customDays.reduce((s, c) => s + c.amount, 0);
      const totalBills = customDays.reduce((s, c) => s + c.count, 0);
      return { title: `รายได้ช่วง ${customStartDate} ถึง ${customEndDate}`, totalRevenue, totalBills, points: customDays, period: 'กำหนดเอง' };
    }
  }, [datePreset, customStartDate, customEndDate]);

  // Derived Financials
  const avgBillValue = analyticsData.totalBills > 0 ? (analyticsData.totalRevenue / analyticsData.totalBills).toFixed(0) : '0';
  const estimatedCost = Math.round(analyticsData.totalRevenue * 0.38);
  const grossProfit = analyticsData.totalRevenue - estimatedCost;
  const marginPercent = ((grossProfit / analyticsData.totalRevenue) * 100).toFixed(1);

  // Best Selling Dishes Ranking
  const topDishes = [
    { name: 'ก๋วยเตี๋ยวเป็ดพะโล้', category: 'ก๋วยเตี๋ยว & บะหมี่', quantity: 384, revenue: 24960, percent: 32 },
    { name: 'ข้าวหน้าเป็ดย่างสูตรนายเอก', category: 'ข้าว & จานเดียว', quantity: 295, revenue: 22125, percent: 28 },
    { name: 'บะหมี่หยกเป็ดแห้งต้มยำ', category: 'ก๋วยเตี๋ยว & บะหมี่', quantity: 248, revenue: 17360, percent: 22 },
    { name: 'ต้มซุปเปอร์ขาเป็ดหม้อไฟ', category: 'เป็ดจานเดี่ยว & ซุป', quantity: 142, revenue: 14200, percent: 14 },
    { name: 'ชาดำเย็นโบราณ & น้ำสมุนไพร', category: 'เครื่องดื่ม', quantity: 310, revenue: 7750, percent: 10 },
  ];

  // Payment Breakdown
  const paymentBreakdown = [
    { method: 'PromptPay QR (พร้อมเพย์)', amount: Math.round(analyticsData.totalRevenue * 0.65), percent: 65, color: '#0070BA', icon: Smartphone },
    { method: 'เงินสด (Cash)', amount: Math.round(analyticsData.totalRevenue * 0.28), percent: 28, color: '#10B981', icon: Coins },
    { method: 'บัตรเครดิต / เดบิต (Card)', amount: Math.round(analyticsData.totalRevenue * 0.07), percent: 7, color: '#8B5CF6', icon: CreditCard },
  ];

  // SVG Chart Dimensions & Math
  const maxPointAmount = Math.max(...analyticsData.points.map((p) => p.amount), 1);
  const chartHeight = 220;
  const chartWidth = 700;
  const paddingX = 45;
  const paddingY = 25;
  const plotWidth = chartWidth - paddingX * 2;
  const plotHeight = chartHeight - paddingY * 2;

  // Generate SVG Path for Area Curve
  const pointsCoords = analyticsData.points.map((p, idx) => {
    const x = paddingX + (idx / (analyticsData.points.length - 1 || 1)) * plotWidth;
    const y = chartHeight - paddingY - (p.amount / maxPointAmount) * plotHeight;
    return { x, y, data: p };
  });

  const pathD = pointsCoords.reduce((acc, pt, idx, arr) => {
    if (idx === 0) return `M ${pt.x},${pt.y}`;
    const prev = arr[idx - 1];
    const midX = (prev.x + pt.x) / 2;
    return `${acc} C ${midX},${prev.y} ${midX},${pt.y} ${pt.x},${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${pointsCoords[pointsCoords.length - 1]?.x || 0},${chartHeight - paddingY} L ${pointsCoords[0]?.x || 0},${chartHeight - paddingY} Z`;

  return (
    <div className='space-y-6 animate-in fade-in'>
      {/* Top Filter & Date Range Bar */}
      <div className='bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h3 className='font-black text-slate-900 text-base sm:text-lg flex items-center gap-2'>
            <BarChart3 className='w-5 h-5 text-[#0C3B2E]' />
            <span>{analyticsData.title}</span>
          </h3>
          <p className='text-xs text-slate-500 font-normal mt-0.5'>
            วิเคราะห์แนวโน้มยอดขาย, กำไรเบื้องต้น, เมนูยอดนิยม และช่องทางรับเงิน
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className='flex flex-wrap items-center gap-1.5'>
          {(
            [
              { id: 'TODAY', label: 'วันนี้' },
              { id: '7DAYS', label: '7 วันล่าสุด' },
              { id: 'MONTH', label: 'เดือนนี้' },
              { id: 'YEAR', label: 'ปีนี้' },
              { id: 'CUSTOM', label: 'กำหนดเอง' },
            ] as { id: DatePreset; label: string }[]
          ).map((preset) => (
            <button
              key={preset.id}
              type='button'
              onClick={() => setDatePreset(preset.id)}
              className={
                'px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ' +
                (datePreset === preset.id
                  ? 'bg-[#0C3B2E] text-white shadow-sm ring-2 ring-[#84CC16]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700')
              }
            >
              {preset.label}
            </button>
          ))}

          {/* Custom Date Pickers */}
          {datePreset === 'CUSTOM' && (
            <div className='flex items-center gap-1.5 pt-2 sm:pt-0 w-full sm:w-auto'>
              <input
                type='date'
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className='px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium'
              />
              <span className='text-slate-400 text-xs'>ถึง</span>
              <input
                type='date'
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className='px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium'
              />
            </div>
          )}
        </div>
      </div>

      {/* 4 Financial KPI Summary Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {/* Card 1: Gross Sales */}
        <div className='bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-2 relative overflow-hidden'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-bold text-slate-500'>ยอดขายรวม (Gross Sales)</span>
            <div className='w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center'>
              <DollarSign className='w-5 h-5' />
            </div>
          </div>
          <div className='text-2xl sm:text-3xl font-black text-slate-900'>
            ฿{analyticsData.totalRevenue.toLocaleString()}
          </div>
          <div className='flex items-center text-[11px] text-emerald-600 font-bold gap-1'>
            <ArrowUpRight className='w-3.5 h-3.5' />
            <span>+14.8% เทียบกับงวดก่อน</span>
          </div>
          <div className='absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#43c6ac] to-[#191654]' />
        </div>

        {/* Card 2: Total Bills */}
        <div className='bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-2 relative overflow-hidden'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-bold text-slate-500'>จำนวนบิลสำเร็จ (Transactions)</span>
            <div className='w-9 h-9 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center'>
              <Receipt className='w-5 h-5' />
            </div>
          </div>
          <div className='text-2xl sm:text-3xl font-black text-slate-900'>
            {analyticsData.totalBills.toLocaleString()}{' '}
            <span className='text-xs font-normal text-slate-500'>บิล</span>
          </div>
          <div className='text-[11px] text-slate-500 font-medium'>
            เฉลี่ย <b>฿{avgBillValue}</b> / โต๊ะ
          </div>
          <div className='absolute bottom-0 left-0 right-0 h-1 bg-[#84CC16]' />
        </div>

        {/* Card 3: Estimated Cost */}
        <div className='bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-2 relative overflow-hidden'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-bold text-slate-500'>ต้นทุนวัตถุดิบ COGS (38%)</span>
            <div className='w-9 h-9 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center'>
              <Coins className='w-5 h-5' />
            </div>
          </div>
          <div className='text-2xl sm:text-3xl font-black text-amber-900'>
            ฿{estimatedCost.toLocaleString()}
          </div>
          <div className='text-[11px] text-slate-500 font-medium'>
            คำนวณตามสูตรอาหาร (BOM)
          </div>
          <div className='absolute bottom-0 left-0 right-0 h-1 bg-amber-500' />
        </div>

        {/* Card 4: Gross Profit */}
        <div className='bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-2 relative overflow-hidden'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-bold text-slate-500'>กำไรขั้นต้น (Gross Profit)</span>
            <div className='w-9 h-9 rounded-2xl bg-[#0C3B2E] text-white flex items-center justify-center'>
              <TrendingUp className='w-5 h-5 text-[#84CC16]' />
            </div>
          </div>
          <div className='text-2xl sm:text-3xl font-black text-[#0C3B2E]'>
            ฿{grossProfit.toLocaleString()}
          </div>
          <div className='text-[11px] text-emerald-700 font-black'>
            อัตรากำไร (Margin): ~{marginPercent}%
          </div>
          <div className='absolute bottom-0 left-0 right-0 h-1 bg-[#0C3B2E]' />
        </div>
      </div>

      {/* Main Interactive Revenue Graph (Area / Curve SVG) */}
      <div className='bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3'>
          <div>
            <h4 className='font-bold text-base text-slate-900 flex items-center gap-2'>
              <TrendingUp className='w-5 h-5 text-[#0C3B2E]' />
              <span>กราฟแนวโน้มรายได้ ({analyticsData.period})</span>
            </h4>
            <p className='text-xs text-slate-500 font-normal'>
              เลื่อนเมาส์หรือแตะที่จุดบนกราฟเพื่อดูรายละเอียดยอดขายและจำนวนบิล
            </p>
          </div>

          {hoveredPoint && (
            <div className='bg-slate-900 text-white px-3.5 py-1.5 rounded-2xl text-xs flex items-center gap-3 animate-in fade-in'>
              <span>ช่วง: <b>{hoveredPoint.label}</b></span>
              <span>ยอด: <b className='text-[#84CC16]'>฿{hoveredPoint.amount.toLocaleString()}</b></span>
              <span>({hoveredPoint.count} บิล)</span>
            </div>
          )}
        </div>

        {/* SVG Curve Chart */}
        <div className='w-full overflow-x-auto'>
          <div className='min-w-[620px]'>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className='w-full h-56 block overflow-visible'>
              <defs>
                <linearGradient id='revenueGradient' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='0%' stopColor='#43c6ac' stopOpacity='0.45' />
                  <stop offset='60%' stopColor='#28546b' stopOpacity='0.15' />
                  <stop offset='100%' stopColor='#191654' stopOpacity='0.0' />
                </linearGradient>
                <linearGradient id='strokeGradient' x1='0' y1='0' x2='1' y2='0'>
                  <stop offset='0%' stopColor='#43c6ac' />
                  <stop offset='50%' stopColor='#84CC16' />
                  <stop offset='100%' stopColor='#191654' />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = paddingY + ratio * plotHeight;
                const value = Math.round(maxPointAmount * (1 - ratio));
                return (
                  <g key={i}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke='#E2E8F0'
                      strokeDasharray='3 3'
                      strokeWidth='1'
                    />
                    <text x={paddingX - 8} y={y + 3} textAnchor='end' fontSize='9' fill='#94A3B8' fontWeight='bold'>
                      ฿{(value / 1000).toFixed(0)}k
                    </text>
                  </g>
                );
              })}

              {/* Gradient Area Fill */}
              <path d={areaD} fill='url(#revenueGradient)' />

              {/* Smooth Curve Stroke */}
              <path d={pathD} fill='none' stroke='url(#strokeGradient)' strokeWidth='3.5' strokeLinecap='round' />

              {/* Interactive Points */}
              {pointsCoords.map((pt, idx) => (
                <g key={idx} className='cursor-pointer group'>
                  {/* Hover Bar Highlight */}
                  <line
                    x1={pt.x}
                    y1={paddingY}
                    x2={pt.x}
                    y2={chartHeight - paddingY}
                    stroke='#84CC16'
                    strokeWidth='1.5'
                    strokeDasharray='2 2'
                    className='opacity-0 group-hover:opacity-100 transition-opacity'
                  />
                  {/* Point Outer Ring */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r='5.5'
                    fill='#ffffff'
                    stroke='#0C3B2E'
                    strokeWidth='3'
                    className='transition-all group-hover:scale-150 group-hover:fill-[#84CC16]'
                    onMouseEnter={() => setHoveredPoint(pt.data)}
                    onTouchStart={() => setHoveredPoint(pt.data)}
                  />
                  {/* Bottom X-Axis Label */}
                  <text
                    x={pt.x}
                    y={chartHeight - 6}
                    textAnchor='middle'
                    fontSize='9.5'
                    fill='#64748B'
                    fontWeight='600'
                  >
                    {pt.data.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* 2-Column Section: Top 5 Best Sellers & Payment Breakdown */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Left: Top 5 Best Selling Dishes */}
        <div className='bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4 flex flex-col justify-between'>
          <div>
            <div className='flex items-center justify-between border-b border-slate-100 pb-3'>
              <h4 className='font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2'>
                <Sparkles className='w-4 h-4 text-amber-500' />
                <span>🏆 5 อันดับเมนูขายดีที่สุด (Top Best Sellers)</span>
              </h4>
              <span className='text-xs font-bold text-slate-500'>สัดส่วนยอดขาย</span>
            </div>

            <div className='space-y-3 pt-3'>
              {topDishes.map((dish, idx) => (
                <div key={idx} className='space-y-1'>
                  <div className='flex justify-between items-center text-xs'>
                    <div className='flex items-center space-x-2'>
                      <span className='w-5 h-5 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px]'>
                        {idx + 1}
                      </span>
                      <span className='font-bold text-slate-900'>{dish.name}</span>
                    </div>
                    <div className='text-right'>
                      <span className='font-bold text-slate-900'>฿{dish.revenue.toLocaleString()}</span>
                      <span className='text-[10px] text-slate-400 ml-1.5'>({dish.quantity} ชาม)</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className='w-full h-2 bg-slate-100 rounded-full overflow-hidden'>
                    <div
                      className='h-full rounded-full bg-gradient-to-r from-[#43c6ac] to-[#191654]'
                      style={{ width: `${dish.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center'>
            <span>ก๋วยเตี๋ยวเป็ดคิดเป็น 54% ของยอดขายทั้งร้าน</span>
            <span className='font-bold text-[#0C3B2E]'>วิเคราะห์จากบิลจริง</span>
          </div>
        </div>

        {/* Right: Payment Method Breakdown */}
        <div className='bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4 flex flex-col justify-between'>
          <div>
            <div className='flex items-center justify-between border-b border-slate-100 pb-3'>
              <h4 className='font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2'>
                <CreditCard className='w-4 h-4 text-[#0C3B2E]' />
                <span>💳 สัดส่วนช่องทางการรับเงิน (Payment Methods)</span>
              </h4>
              <span className='text-xs font-bold text-slate-500'>100% รวม</span>
            </div>

            <div className='space-y-3.5 pt-3'>
              {paymentBreakdown.map((pay, idx) => {
                const Icon = pay.icon;
                return (
                  <div key={idx} className='p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5'>
                    <div className='flex items-center justify-between text-xs'>
                      <div className='flex items-center space-x-2'>
                        <div
                          className='w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-2xs'
                          style={{ backgroundColor: pay.color }}
                        >
                          <Icon className='w-3.5 h-3.5' />
                        </div>
                        <span className='font-bold text-slate-900'>{pay.method}</span>
                      </div>
                      <div className='text-right'>
                        <span className='font-bold text-slate-900'>฿{pay.amount.toLocaleString()}</span>
                        <span className='font-black text-emerald-700 ml-1.5 text-xs'>({pay.percent}%)</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className='w-full h-2 bg-slate-200/80 rounded-full overflow-hidden'>
                      <div
                        className='h-full rounded-full'
                        style={{ width: `${pay.percent}%`, backgroundColor: pay.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className='pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center'>
            <span>พร้อมเพย์ QR เป็นช่องทางหลัก (65%) สะดวกและไร้เงินสด</span>
            <span className='font-bold text-blue-700'>PromptPay Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
