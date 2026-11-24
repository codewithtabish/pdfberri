/// <reference lib="webworker" />
import { generateWatermarkedPdf } from './add-watermark-generator';

self.onmessage = async (e: MessageEvent) => {
  const { originalBytes, config, selectedPages } = e.data;
  try {
    self.postMessage({ type: 'PROGRESS', message: 'Applying watermark...' });
    const resultBytes = await generateWatermarkedPdf(originalBytes, config, selectedPages);
    self.postMessage({ type: 'SUCCESS', bytes: resultBytes }, { transfer: [resultBytes.buffer] });
  } catch (error) {
    self.postMessage({ type: 'ERROR', message: error instanceof Error ? error.message : 'Generation failed' });
  }
};