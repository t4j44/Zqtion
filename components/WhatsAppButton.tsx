'use client';

import { motion } from 'framer-motion';

export default function WhatsAppButton() {
  const phoneNumber = '8801340347975';
  const message = encodeURIComponent('I want to execute a project.');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] rounded-full shadow-lg shadow-[#25D366]/20 cursor-pointer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      {/* Ping Animation */}
      <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75 animate-ping -z-10" />

      {/* WhatsApp Icon SVG */}
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
        className="fill-white"
      >
        <path
          d="M17.472 14.382C17.112 14.202 15.344 13.332 15.013 13.256C14.685 13.178 14.444 13.136 14.204 13.498C13.966 13.856 13.279 14.664 13.068 14.903C12.859 15.143 12.651 15.174 12.291 14.993C11.931 14.814 10.771 14.433 9.395 13.208C8.307 12.239 7.572 11.042 7.362 10.683C7.152 10.323 7.34 10.128 7.519 9.95C7.68 9.79 7.877 9.534 8.057 9.324C8.237 9.115 8.297 8.966 8.417 8.725C8.537 8.486 8.477 8.277 8.357 8.038C8.236 7.796 7.276 5.432 6.885 4.475C6.495 3.548 6.109 3.668 5.841 3.668C5.599 3.668 5.328 3.668 5.06 3.668C4.788 3.668 4.337 3.771 3.978 4.162C3.616 4.552 2.625 5.483 2.625 7.373C2.625 9.263 3.977 11.093 4.19 11.362C4.4 11.632 6.946 15.556 10.843 17.238C11.77 17.638 12.493 17.876 13.051 18.053C14.225 18.428 15.289 18.375 16.126 18.25C17.062 18.11 19.006 17.072 19.412 15.932C19.816 14.793 19.816 13.834 19.696 13.623C19.578 13.414 19.278 13.293 18.917 13.111H18.919V13.113H17.472V14.382Z"
          fill="white"
        />
      </svg>
    </motion.a>
  );
}
