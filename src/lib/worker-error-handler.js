/**
 * This file contains a specialized error handler for worker thread errors
 * that are causing issues in Next.js development server.
 */

// This is a direct patch for the specific error we're seeing
process.on('uncaughtException', (error) => {
  // Check if this is the specific worker.js error
  if (
    error && 
    error.code === 'MODULE_NOT_FOUND' && 
    error.message && 
    error.message.includes('worker.js')
  ) {
    console.warn('Suppressed worker.js module not found error');
    return; // Prevent the error from crashing the app
  }
  
  // For other uncaught exceptions, let the default handler run
  throw error;
});

// Also handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  // Check if this is a worker-related error
  if (
    reason && 
    typeof reason === 'object' &&
    (
      (reason.message && reason.message.includes('worker.js')) ||
      (reason.message && reason.message.includes('worker thread exited')) ||
      (reason.code === 'MODULE_NOT_FOUND' && reason.message && reason.message.includes('worker.js'))
    )
  ) {
    console.warn('Suppressed worker-related unhandled rejection:', reason.message || reason);
    return; // Prevent the rejection from crashing the app
  }
  
  // For other unhandled rejections, let the default handler run
  throw reason;
});

module.exports = {
  setup: () => {
    console.log('Worker error handler installed');
  }
};