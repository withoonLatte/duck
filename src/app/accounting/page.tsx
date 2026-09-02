'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/pos');
  }, [router]);

  return (
    <div className='flex-1 flex items-center justify-center p-12 text-slate-500 text-sm'>
      กำลังนำคุณไปยังหน้า POS หน้าร้าน...
    </div>
  );
}
