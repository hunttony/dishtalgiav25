// Extend the Window interface to include the ethereum property
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      // Add other ethereum properties you might need
      [key: string]: any;
    };
  }
}

export {}; // This file needs to be a module
