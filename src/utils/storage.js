// Move storage functions from your main file:
export const saveToIndexedDB = async (storeName, data) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PropertyProDB', 1);
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      store.clear(); // Clear existing data
      store.add({ id: 1, data: data });
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      const storeNames = ['properties', 'tenants', 'workOrders', 'transactions'];
    
      storeNames.forEach(name => {  
      if (!db.objectStoreNames.contains(name)) {
        db.createObjectStore(name, { keyPath: 'id' });
      }
    });

    if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' });
      }
    };
  });
};

export const loadFromIndexedDB = async (storeName) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PropertyProDB', 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(storeName)) {
        resolve([]); // Return empty array if store doesn't exist
        return;
      }

      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const getRequest = store.get(1);

      getRequest.onsuccess = () => {
        resolve(getRequest.result?.data || []);
      };

      getRequest.onerror = () => reject(getRequest.error);
    };

    request.onupgradeneeded = (event) => {  // ← Add event parameter
      const db = event.target.result;      // ← Fix: use event.target.result

      // Create object stores for each data type
      const storeNames = ['properties', 'tenants', 'workOrders', 'transactions'];

      storeNames.forEach(name => {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath: 'id' });
        }
      });
    };
  });
};


export const safeLocalStorage = {
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
      console.log(`✅ Saved ${key} to localStorage`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to save ${key}:`, error);
      return false;
    }
  },
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`❌ Failed to get ${key}:`, error);
      return null;
    }
  }
};