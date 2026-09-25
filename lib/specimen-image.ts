const maxDimension = 1400;
const maxFileSize = 12 * 1024 * 1024;

function colorDistance(data: Uint8ClampedArray, index: number, background: number[]): number {
  const red = data[index] - background[0];
  const green = data[index + 1] - background[1];
  const blue = data[index + 2] - background[2];
  return Math.sqrt(red * red + green * green + blue * blue);
}

function median(values: number[]): number {
  values.sort((a, b) => a - b);
  return values[Math.floor(values.length / 2)];
}

export function removeBackground(data: Uint8ClampedArray, width: number, height: number): void {
  const pixels = width * height;
  let transparent = 0;
  for (let pixel = 0; pixel < pixels; pixel++) {
    if (data[pixel * 4 + 3] < 245) transparent++;
  }
  if (transparent > pixels * 0.01) return;

  const samples = [[], [], []] as number[][];
  const stride = Math.max(1, Math.floor(Math.min(width, height) / 40));
  for (let x = 0; x < width; x += stride) {
    for (const y of [0, height - 1]) {
      const index = (y * width + x) * 4;
      for (let channel = 0; channel < 3; channel++) samples[channel].push(data[index + channel]);
    }
  }
  for (let y = 0; y < height; y += stride) {
    for (const x of [0, width - 1]) {
      const index = (y * width + x) * 4;
      for (let channel = 0; channel < 3; channel++) samples[channel].push(data[index + channel]);
    }
  }
  const background = samples.map(median);
  const visited = new Uint8Array(pixels);
  const queue = new Int32Array(pixels);
  let head = 0;
  let tail = 0;
  const threshold = 58;

  function push(pixel: number) {
    if (visited[pixel] || colorDistance(data, pixel * 4, background) > threshold) return;
    visited[pixel] = 1;
    queue[tail++] = pixel;
  }
  for (let x = 0; x < width; x++) { push(x); push((height - 1) * width + x); }
  for (let y = 0; y < height; y++) { push(y * width); push(y * width + width - 1); }
  while (head < tail) {
    const pixel = queue[head++];
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    if (x > 0) push(pixel - 1);
    if (x + 1 < width) push(pixel + 1);
    if (y > 0) push(pixel - width);
    if (y + 1 < height) push(pixel + width);
  }
  if (tail < pixels * 0.025) {
    throw new Error("Không tách được nền ảnh này. Hãy chọn ảnh cá trên nền đơn sắc hoặc PNG nền trong suốt.");
  }
  if (tail > pixels * 0.97) {
    throw new Error("Không nhận ra chủ thể trong ảnh. Hãy chọn ảnh có cá rõ nét và nền tương phản.");
  }
  for (let pixel = 0; pixel < pixels; pixel++) {
    const alpha = pixel * 4 + 3;
    if (visited[pixel]) {
      data[alpha] = 0;
      data[pixel * 4] = 0;
      data[pixel * 4 + 1] = 0;
      data[pixel * 4 + 2] = 0;
    }
    else if (colorDistance(data, pixel * 4, background) < threshold + 24) {
      const x = pixel % width;
      const y = Math.floor(pixel / width);
      const nearBackground = (x > 0 && visited[pixel - 1]) || (x + 1 < width && visited[pixel + 1]) || (y > 0 && visited[pixel - width]) || (y + 1 < height && visited[pixel + width]);
      if (nearBackground) data[alpha] = Math.round(Math.min(1, Math.max(0, (colorDistance(data, pixel * 4, background) - threshold) / 24)) * 255);
    }
  }

  const foregroundVisited = new Uint8Array(pixels);
  const componentIds = new Int32Array(pixels);
  let componentId = 0;
  let largestId = 0;
  let largest = { size: 0, left: width, top: height, right: 0, bottom: 0 };
  for (let start = 0; start < pixels; start++) {
    if (foregroundVisited[start] || data[start * 4 + 3] < 32) continue;
    componentId++;
    let componentHead = 0;
    let componentTail = 0;
    let left = width, top = height, right = 0, bottom = 0;
    foregroundVisited[start] = 1;
    componentIds[start] = componentId;
    queue[componentTail++] = start;
    while (componentHead < componentTail) {
      const pixel = queue[componentHead++];
      const x = pixel % width;
      const y = Math.floor(pixel / width);
      left = Math.min(left, x); top = Math.min(top, y);
      right = Math.max(right, x); bottom = Math.max(bottom, y);
      const neighbors = [x > 0 ? pixel - 1 : -1, x + 1 < width ? pixel + 1 : -1, y > 0 ? pixel - width : -1, y + 1 < height ? pixel + width : -1];
      for (const neighbor of neighbors) {
        if (neighbor >= 0 && !foregroundVisited[neighbor] && data[neighbor * 4 + 3] >= 32) {
          foregroundVisited[neighbor] = 1;
          componentIds[neighbor] = componentId;
          queue[componentTail++] = neighbor;
        }
      }
    }
    if (componentTail > largest.size) {
      largestId = componentId;
      largest = { size: componentTail, left, top, right, bottom };
    }
  }
  if (largest.size < pixels * 0.005) throw new Error("Không nhận ra hình cá trong ảnh. Hãy chọn ảnh rõ nét trên nền đơn sắc.");
  const padding = Math.round(Math.max(width, height) * 0.025);
  const left = Math.max(0, largest.left - padding);
  const top = Math.max(0, largest.top - padding);
  const right = Math.min(width - 1, largest.right + padding);
  const bottom = Math.min(height - 1, largest.bottom + padding);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel = y * width + x;
      if (componentIds[pixel] === largestId && x >= left && x <= right && y >= top && y <= bottom) continue;
      const index = pixel * 4;
      data[index] = 0; data[index + 1] = 0; data[index + 2] = 0; data[index + 3] = 0;
    }
  }
}

export async function prepareSpecimenImage(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) throw new Error("Hãy chọn một tệp hình ảnh.");
  if (file.size > maxFileSize) throw new Error("Ảnh cần nhỏ hơn 12 MB.");
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Trình duyệt không hỗ trợ xử lý ảnh.");
    context.drawImage(bitmap, 0, 0, width, height);
    const image = context.getImageData(0, 0, width, height);
    removeBackground(image.data, width, height);
    context.putImageData(image, 0, 0);
    let left = width, top = height, right = 0, bottom = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (image.data[(y * width + x) * 4 + 3] < 32) continue;
        left = Math.min(left, x); top = Math.min(top, y);
        right = Math.max(right, x); bottom = Math.max(bottom, y);
      }
    }
    if (right <= left || bottom <= top) throw new Error("Ảnh không còn chủ thể sau khi tách nền.");
    const padding = Math.round(Math.max(right - left, bottom - top) * 0.04);
    left = Math.max(0, left - padding); top = Math.max(0, top - padding);
    right = Math.min(width - 1, right + padding); bottom = Math.min(height - 1, bottom + padding);
    const output = document.createElement("canvas");
    output.width = right - left + 1;
    output.height = bottom - top + 1;
    output.getContext("2d")?.drawImage(canvas, left, top, output.width, output.height, 0, 0, output.width, output.height);
    return await new Promise<Blob>((resolve, reject) => {
      output.toBlob(blob => blob ? resolve(blob) : reject(new Error("Không thể lưu ảnh đã xử lý.")), "image/png");
    });
  } finally {
    bitmap.close();
  }
}
