export interface SavedSpecimen {
  id: string;
  name: string;
  latin: string;
  tag: string;
  description: string;
  habitat: string;
  trait: string;
  note: string;
  imageBlob: Blob;
}

const databaseName = "sakana-collection";
const storeName = "specimens";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(storeName)) {
        request.result.createObjectStore(storeName, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadSpecimens(): Promise<SavedSpecimen[]> {
  const database = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const request = database.transaction(storeName, "readonly").objectStore(storeName).getAll();
      request.onsuccess = () => resolve(request.result as SavedSpecimen[]);
      request.onerror = () => reject(request.error);
    });
  } finally {
    database.close();
  }
}

export async function saveSpecimen(specimen: SavedSpecimen): Promise<void> {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(storeName, "readwrite");
      transaction.objectStore(storeName).put(specimen);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}
