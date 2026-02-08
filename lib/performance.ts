/**
 * Performance monitoring utilities for development
 */

export function logPerformance() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return
  }

  // Log Web Vitals
  if ('performance' in window) {
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      console.log('⚡ Performance Metrics:')
      console.log(`├─ DNS Lookup: ${Math.round(perfData.domainLookupEnd - perfData.domainLookupStart)}ms`)
      console.log(`├─ TCP Connection: ${Math.round(perfData.connectEnd - perfData.connectStart)}ms`)
      console.log(`├─ First Byte: ${Math.round(perfData.responseStart - perfData.requestStart)}ms`)
      console.log(`├─ DOM Interactive: ${Math.round(perfData.domInteractive - perfData.fetchStart)}ms`)
      console.log(`└─ Page Load: ${Math.round(perfData.loadEventEnd - perfData.fetchStart)}ms`)
    })
  }

  // Monitor FPS
  let lastTime = performance.now()
  let frames = 0
  
  function measureFPS() {
    frames++
    const currentTime = performance.now()
    
    if (currentTime >= lastTime + 1000) {
      const fps = Math.round((frames * 1000) / (currentTime - lastTime))
      
      if (fps < 30) {
        console.warn(`⚠️ Low FPS: ${fps}`)
      }
      
      frames = 0
      lastTime = currentTime
    }
    
    requestAnimationFrame(measureFPS)
  }
  
  requestAnimationFrame(measureFPS)
}

// Memory usage tracker
export function logMemoryUsage() {
  if (typeof window === 'undefined' || !('memory' in performance)) {
    return
  }

  const memory = (performance as any).memory
  
  console.log('💾 Memory Usage:')
  console.log(`├─ Used: ${Math.round(memory.usedJSHeapSize / 1048576)}MB`)
  console.log(`├─ Total: ${Math.round(memory.totalJSHeapSize / 1048576)}MB`)
  console.log(`└─ Limit: ${Math.round(memory.jsHeapSizeLimit / 1048576)}MB`)
}
