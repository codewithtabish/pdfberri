/// <reference lib="webworker" />
import { generateNumberedPdf } from './add-page-numbers-generator';

self.onmessage = async (e: MessageEvent) => {
  const { originalBytes, config, selectedPages } = e.data;

  try {
    self.postMessage({ type: 'PROGRESS', message: 'Applying page numbers...' });
    const resultBytes = await generateNumberedPdf(originalBytes, config, selectedPages);
    
    self.postMessage(
      { type: 'SUCCESS', bytes: resultBytes },
      { transfer: [resultBytes.buffer] }
    );
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      message: error instanceof Error ? error.message : 'Generation failed',
    });
  }
};