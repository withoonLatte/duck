'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface VoiceInputFieldProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
  quickPresets?: string[];
  className?: string;
}

export function VoiceInputField({
  value,
  onChange,
  placeholder = 'พิมพ์ หรือกดปุ่มไมค์เพื่อพูดสั่ง...',
  label,
  quickPresets = [
    'ไม่ใส่ถั่วงอก',
    'ไม่ใส่กระเทียมเจียว',
    'แยกน้ำซุป',
    'ผักชีเยอะๆ',
    'ขอน้ำจิ้มเพิ่ม',
  ],
  className = '',
}: VoiceInputFieldProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'th-TH';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setStatusMessage('🎙️ กำลังฟังเสียงพูดภาษาไทย...');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          onChange(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setStatusMessage('⚠️ กรุณาอนุญาตการใช้ไมโครโฟนในเบราว์เซอร์');
        } else {
          setStatusMessage('⚠️ ไม่ได้ยินเสียงพูด ลองใหม่อีกครั้ง');
        }
        setTimeout(() => setStatusMessage(null), 3000);
      };

      recognition.onend = () => {
        setIsListening(false);
        setStatusMessage(null);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('SpeechRecognition init error:', err);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, [onChange]);

  const toggleListening = () => {
    if (!isSupported) {
      alert('เบราว์เซอร์ของคุณยังไม่รองรับ Web Speech API กรุณาใช้ Chrome หรือ Safari ครับ');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (_) {}
      setIsListening(false);
      setStatusMessage(null);
    } else {
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    }
  };

  const handleAddPreset = (preset: string) => {
    if (!value.trim()) {
      onChange(preset);
    } else if (!value.includes(preset)) {
      onChange(value + ', ' + preset);
    }
  };

  return (
    <div className={'space-y-2 ' + className}>
      {label && (
        <div className='flex items-center justify-between'>
          <label className='font-black text-slate-900 text-xs flex items-center gap-1.5'>
            <Volume2 className='w-3.5 h-3.5 text-[#0C3B2E]' />
            <span>{label}</span>
          </label>
          <span className='text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1'>
            <Mic className='w-3 h-3 text-[#0C3B2E]' /> พูดสั่งได้
          </span>
        </div>
      )}

      {/* Input Box with Integrated Microphone Button */}
      <div className='relative flex items-center'>
        <input
          type='text'
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={
            'w-full pl-3.5 pr-20 py-2.5 bg-slate-50 border rounded-2xl text-xs focus:bg-white focus:outline-[#0C3B2E] font-medium transition-all shadow-xs ' +
            (isListening
              ? 'border-red-400 ring-2 ring-red-200 bg-red-50/40 text-red-950 font-bold'
              : 'border-slate-200 text-slate-900')
          }
        />

        {/* Mic Voice Button */}
        <button
          type='button'
          onClick={toggleListening}
          title={isListening ? 'กดเพื่อหยุดฟัง' : 'กดปุ่มเพื่อพูดสั่งอาหารด้วยเสียง'}
          className={
            'absolute right-1.5 px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95 ' +
            (isListening
              ? 'bg-red-500 text-white animate-pulse shadow-md ring-2 ring-red-300'
              : 'bg-[#0C3B2E] text-white hover:bg-[#072E20]')
          }
        >
          {isListening ? (
            <>
              <MicOff className='w-3.5 h-3.5 animate-spin' />
              <span className='text-[10px]'>กำลังฟัง...</span>
            </>
          ) : (
            <>
              <Mic className='w-3.5 h-3.5 text-[#84CC16]' />
              <span className='text-[10px]'>พูด</span>
            </>
          )}
        </button>
      </div>

      {/* Live Voice Status Indicator */}
      {statusMessage && (
        <div className='text-[11px] font-bold text-red-600 bg-red-50 px-3 py-1 rounded-xl border border-red-200 animate-in fade-in flex items-center gap-1.5'>
          <span className='w-2 h-2 rounded-full bg-red-500 animate-ping' />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Quick 1-Tap Voice Presets */}
      {quickPresets && quickPresets.length > 0 && (
        <div className='space-y-1 pt-0.5'>
          <div className='text-[10px] font-bold text-slate-400'>แตะเพิ่มคำขอด่วน:</div>
          <div className='flex flex-wrap gap-1.5'>
            {quickPresets.map((preset) => (
              <button
                key={preset}
                type='button'
                onClick={() => handleAddPreset(preset)}
                className='px-2.5 py-1 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold transition-colors cursor-pointer active:scale-95 shadow-2xs'
              >
                +{preset}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
