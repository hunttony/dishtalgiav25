/**
 * This file patches the Node.js module loader to handle missing worker.js module
 */

// Try to patch the internal module loader
try {
  const Module = require('module');
  const originalRequire = Module.prototype.require;
  
  // Create a mock worker module
  const createMockWorker = () => {
    const EventEmitter = require('events');
    
    class MockWorker extends EventEmitter {
      constructor() {
        super();
        this.threadId = Math.floor(Math.random() * 10000);
        this.postMessage = () => {};
        this.terminate = () => {};
        
        // Simulate successful initialization
        setTimeout(() => {
          this.emit('online');
        }, 0);
      }
    }
    
    return {
      Worker: MockWorker,
      isMainThread: true,
      parentPort: null,
      workerData: null,
    };
  };
  
  // Patch the require function
  Module.prototype.require = function(id) {
    // Check if this is the worker.js module that's causing issues
    if (id.endsWith('worker.js') || id === 'worker_threads') {
      try {
        return originalRequire.apply(this, arguments);
      } catch (error) {
        if (error.code === 'MODULE_NOT_FOUND') {
          console.warn(`Providing mock implementation for missing module: ${id}`);
          return createMockWorker();
        }
        throw error;
      }
    }
    
    // For all other modules, use the original require
    return originalRequire.apply(this, arguments);
  };
  
  console.log('Module loader patched to handle missing worker modules');
} catch (error) {
  console.warn('Could not patch module loader:', error.message);
}

module.exports = {
  setup: () => {
    console.log('Module loader patch installed');
  }
};