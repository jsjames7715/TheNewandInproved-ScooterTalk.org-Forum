import { createStorage, StorageValue, WatchEvent } from "unstorage";
import fsDriver from "unstorage/drivers/fs";
import cloudflareKVBindingDriver from "unstorage/drivers/cloudflare-kv-binding";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

const STORAGE_PATH = "./.storage"; // It is .gitignored

export function createKV<T extends StorageValue>(name: string) {
  const isCloudflare = typeof globalThis !== "undefined" && "KV" in globalThis;
  const storagePath = `${STORAGE_PATH}/${name}`;

  const storage = createStorage<T>({
    driver: isCloudflare
      ? cloudflareKVBindingDriver({ binding: "KV" })
      : fsDriver({ base: storagePath }),
  });

  // Ensure directory exists before creating storage (local only)
  if (!isCloudflare && !existsSync(storagePath)) {
    mkdir(storagePath, { recursive: true }).catch(() => {});
  }

  // Async generator to play work well with oRPC live queries
  async function* subscribe() {
    let resolve: (value: { event: WatchEvent; key: string }) => void;
    let promise = new Promise<{ event: WatchEvent; key: string }>(
      (r) => (resolve = r)
    );

    const unwatch = await storage.watch((event, key) => {
      resolve({ event, key });
      promise = new Promise<{ event: WatchEvent; key: string }>(
        (r) => (resolve = r)
      );
    });

    try {
      while (true) yield await promise;
    } finally {
      await unwatch();
    }
  }

  return {
    ...storage,
    getAllItems: async () => {
      const keys = await storage.getKeys();
      const values = await storage.getItems(keys);
      return values.map(({ value }) => value);
    },
    subscribe,
  };
}
