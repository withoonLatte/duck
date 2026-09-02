'use client';

import React, { useState, useEffect } from 'react';
import { Maximize, Minimize } from 'lucide-react';

export function FullscreenToggle() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (document.fullscreenElement) {
        setShowPrompt(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    // If not in fullscreen yet, show a subtle prompt once on load
    const dismissed = sessionStorage.getItem('pos_fs_prompt_dismissed');
    if (!document.fullscreenElement && !dismissed) {
      setShowPrompt(true);
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          await (document.documentElement as any).webkitRequestFullscreen();
        }
        setIsFullscreen(true);
        setShowPrompt(false);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  };

  const handleDismissPrompt = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pos_fs_prompt_dismissed', 'true');
  };

  return (
    <>
      {/* Topbar Fullscreen Button */}
      <button
        type='button'
        onClick={toggleFullscreen}
        title={isFullscreen ? 'ออกจากโหมดเต็มจอ (Exit Fullscreen)' : 'เปิดโหมดเต็มจอ POS (Enter Fullscreen)'}
        className={
          'flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95 ' +
          (isFullscreen
            ? 'bg-[#84CC16] text-[#072E20] border-[#84CC16]'
            : 'bg-white/15 hover:bg-white/25 text-white border-white/20')
        }
      >
        {isFullscreen ? (
          <>
            <Minimize className='w-3.5 h-3.5' />
            <span className='hidden sm:inline text-[11px]'>ย่อจอ</span>
          </>
        ) : (
          <>
            <Maximize className='w-3.5 h-3.5 text-[#84CC16]' />
            <span className='hidden sm:inline text-[11px]'>เต็มจอ</span>
          </>
        )}
      </button>

      {/* Floating Kiosk Banner Prompt on first open */}
      {showPrompt && !isFullscreen && (
        <div className='fixed bottom-4 right-4 z-50 bg-[#0C3B2E] text-white p-3.5 sm:p-4 rounded-3xl shadow-2xl border-2 border-emerald-400/60 flex items-center gap-3 animate-in slide-in-from-bottom duration-300 max-w-sm'>
          <div className='w-10 h-10 rounded-2xl bg-[#84CC16] text-[#072E20] flex items-center justify-center font-bold shadow-md shrink-0'>
            <Maximize className='w-5 h-5' />
          </div>
          <div className='flex-1 text-xs'>
            <div className='font-bold text-white leading-tight'>เปิดใช้งานโหมดเต็มจอ (Kiosk)</div>
            <div className='text-[10px] text-emerald-200/80 mt-0.5'>แตะเพื่อซ่อนแถบ Browser ให้เต็มจอ POS</div>
          </div>
          <div className='flex items-center gap-1.5'>
            <button
              onClick={toggleFullscreen}
              className='px-3 py-1.5 bg-[#84CC16] hover:bg-[#65A30D] text-[#072E20] font-bold rounded-xl text-xs transition-transform active:scale-95 cursor-pointer shadow-sm'
            >
              เต็มจอ
            </button>
            <button
              onClick={handleDismissPrompt}
              className='p-1.5 text-emerald-200 hover:text-white rounded-lg cursor-pointer text-xs'
              title='ปิดการแจ้งเตือน'
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
