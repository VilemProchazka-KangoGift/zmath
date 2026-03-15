export class AssetLoader {
  private images: Map<string, HTMLImageElement> = new Map();

  async loadAll(manifest: Record<string, string>): Promise<Map<string, HTMLImageElement>> {
    const entries = Object.entries(manifest);
    await Promise.all(
      entries.map(
        ([key, src]) =>
          new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              this.images.set(key, img);
              resolve();
            };
            img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
            img.src = src;
          }),
      ),
    );
    return this.images;
  }

  get(key: string): HTMLImageElement | undefined {
    return this.images.get(key);
  }

  async loadImage(key: string, src: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images.set(key, img);
        resolve();
      };
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }
}
