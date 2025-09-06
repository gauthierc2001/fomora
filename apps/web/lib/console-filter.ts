// Filter out Phantom wallet noise from console
if (typeof window !== 'undefined') {
  const originalError = console.error
  const originalWarn = console.warn
  
  console.error = (...args) => {
    const message = args.join(' ')
    
    // Filter out Phantom wallet errors
    if (
      message.includes('RPC router stream error') ||
      message.includes('disconnected port object') ||
      message.includes('api.phantom.app') ||
      message.includes('serviceWorker.js') ||
      message.includes('image-proxy')
    ) {
      return // Don't log these
    }
    
    originalError.apply(console, args)
  }
  
  console.warn = (...args) => {
    const message = args.join(' ')
    
    // Filter out Zustand deprecation warning
    if (message.includes('DEPRECATED') && message.includes('zustand')) {
      return // Don't log this
    }
    
    originalWarn.apply(console, args)
  }
}
