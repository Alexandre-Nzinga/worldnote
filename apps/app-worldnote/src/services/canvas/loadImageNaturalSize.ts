export async function loadImageNaturalSize(
  src: string,
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      if (image.naturalWidth > 0 && image.naturalHeight > 0) {
        resolve({
          width: image.naturalWidth,
          height: image.naturalHeight,
        });
        return;
      }
      resolve(null);
    };
    image.onerror = () => resolve(null);
    image.src = src;
  });
}
