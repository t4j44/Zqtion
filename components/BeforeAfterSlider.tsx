'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function BeforeAfterSlider() {
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-2xl overflow-hidden cursor-col-resize">
      {/* After Image (Full) */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center">
        <span className="text-white text-2xl font-bold">After ✓</span>
      </div>

      {/* Before Image (Clipped) */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-red-900 to-orange-900 flex items-center justify-center"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <span className="text-white text-2xl font-bold">Before ✗</span>
      </div>

      {/* Slider Line */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
          <div className="flex gap-1">
            <div className="w-0.5 h-4 bg-neutral-800" />
            <div className="w-0.5 h-4 bg-neutral-800" />
          </div>
        </div>
      </div>

      {/* Invisible Slider Input */}
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={handleSliderChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-col-resize z-20"
      />
    </div>
  );
}
