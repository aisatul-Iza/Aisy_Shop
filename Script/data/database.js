import { openDB } from 'idb';

const DB_NAME = 'aisyshop-db';
const DB_VERSION = 1;
const OBJECT_STORE_NAME = 'products';

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
      db.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
    }
  },
});

const Database = {
  async putProduct(product) {
    return (await dbPromise).put(OBJECT_STORE_NAME, product);
  },
  async getProductById(id) {
    return (await dbPromise).get(OBJECT_STORE_NAME, id);
  },
  async getAllProducts() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },
  async removeProduct(id) {
    return (await dbPromise).delete(OBJECT_STORE_NAME, id);
  },
};

export default Database;
