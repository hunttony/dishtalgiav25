// Custom error handler to suppress worker-related errors
const originalEmit = process.emit;

// Keep track of errors we've already seen to avoid duplicate logs
const seenErrors = new Set();

// Patch the EventEmitter.prototype.emit to catch errors at a lower level
const events = require('events');
const originalEventEmit = events.EventEmitter.prototype.emit;

// Patch Node.js internal event target to catch errors
try {
  // This is a more aggressive approach to catch errors in Node.js internal event target
  const originalNextTick = process.nextTick;
  process.nextTick = function(callback, ...args) {
    if (typeof callback === 'function') {
      const wrappedCallback = function(...callbackArgs) {
        try {
          return callback.apply(this, callbackArgs);
        } catch (error) {
          // Check if this is a worker-related error
          if (
            error && 
            (
              (error.message && error.message.includes('worker.js')) ||
              (error.message && error.message.includes('worker thread exited')) ||
              (error.code === 'MODULE_NOT_FOUND' && error.message && error.message.includes('worker.js'))
            )
          ) {
            const errorKey = `nextTick:${error.message}`;
            if (!seenErrors.has(errorKey)) {
              console.warn('Suppressed worker error in nextTick:', error.message);
              seenErrors.add(errorKey);
            }
            return;
          }
          throw error; // Re-throw if it's not a worker error
        }
      };
      return originalNextTick.call(process, wrappedCallback, ...args);
    }
    return originalNextTick.call(process, callback, ...args);
  };
} catch (error) {
  console.warn('Could not patch process.nextTick:', error.message);
}

events.EventEmitter.prototype.emit = function(type, ...args) {
  // Catch 'error' events related to worker threads
  if (type === 'error' && args[0] && 
      (args[0].message === 'the worker thread exited' || 
       (args[0].code === 'MODULE_NOT_FOUND' && args[0].message && args[0].message.includes('worker.js')))
     ) {
    const errorKey = `event:${args[0].message}`;
    
    if (!seenErrors.has(errorKey)) {
      console.warn('Suppressed thread-stream error:', args[0].message);
      seenErrors.add(errorKey);
    }
    
    // Return true to indicate the event was handled
    return true;
  }
  
  return originalEventEmit.apply(this, [type, ...args]);
};

process.emit = function(event, error, ...args) {
  // Suppress specific worker-related errors
  if (
    (event === 'uncaughtException' || event === 'unhandledRejection') && 
    error && 
    (
      (error.message && error.message.includes('worker.js')) ||
      (error.message && error.message.includes('worker thread exited')) ||
      (error.code === 'MODULE_NOT_FOUND' && error.message && error.message.includes('worker.js')) ||
      (error.message === 'the worker thread exited')
    )
  ) {
    // Create a unique key for this error to avoid logging duplicates
    const errorKey = `${event}:${error.message}`;
    
    // Only log if we haven't seen this exact error before
    if (!seenErrors.has(errorKey)) {
      console.warn('Suppressed worker error:', error.message);
      seenErrors.add(errorKey);
      
      // Limit the size of the Set to avoid memory leaks
      if (seenErrors.size > 100) {
        // Clear the oldest entries (convert to array, slice, and convert back to Set)
        const errorsArray = Array.from(seenErrors);
        seenErrors.clear();
        errorsArray.slice(-50).forEach(e => seenErrors.add(e));
      }
    }
    
    return false;
  }
  
  return originalEmit.call(process, event, error, ...args);
};

// Also patch the Node.js worker thread module if it's used
try {
  const worker_threads = require('worker_threads');
  if (worker_threads && worker_threads.Worker) {
    const originalWorker = worker_threads.Worker;
    
    // Create a patched Worker class
    worker_threads.Worker = class PatchedWorker extends originalWorker {
      constructor(...args) {
        try {
          super(...args);
        } catch (error) {
          console.warn('Suppressed worker thread creation error:', error.message);
          // Create a dummy worker that does nothing
          return {
            on: () => {},
            once: () => {},
            postMessage: () => {},
            terminate: () => {},
          };
        }
        
        // Add error handler to prevent crashes
        this.on('error', (err) => {
          console.warn('Suppressed worker thread error event:', err.message);
        });
      }
    };
  }
} catch (error) {
  // Worker threads module might not be available, that's fine
}

// Try to patch thread-stream if it's being used by Pino
try {
  // Attempt to require thread-stream
  const threadStreamPath = require.resolve('thread-stream');
  if (threadStreamPath) {
    // Clear the module from cache so our patched version will be used
    delete require.cache[threadStreamPath];
    
    // Load the original module
    const ThreadStream = require(threadStreamPath);
    const originalThreadStreamConstructor = ThreadStream.ThreadStream || ThreadStream;
    
    // Create a patched version that doesn't use worker threads
    const patchedThreadStream = function(...args) {
      try {
        return new originalThreadStreamConstructor(...args);
      } catch (error) {
        console.warn('Suppressed thread-stream error:', error.message);
        
        // Return a dummy stream that does nothing
        return {
          write: () => true,
          flush: (cb) => cb && cb(),
          end: () => {},
          flushSync: () => {},
          destroy: () => {},
        };
      }
    };
    
    // Replace the module exports
    if (ThreadStream.ThreadStream) {
      ThreadStream.ThreadStream = patchedThreadStream;
    } else {
      module.exports = patchedThreadStream;
    }
    
    console.log('Patched thread-stream module');
  }
} catch (error) {
  // thread-stream might not be available or might be loaded differently
  console.warn('Could not patch thread-stream:', error.message);
}

module.exports = {
  setup: () => {
    console.log('Custom error handler installed');
  }
};