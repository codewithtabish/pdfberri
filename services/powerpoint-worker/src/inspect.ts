import { open, readFile } from "node:fs/promises";
import path from "node:path";
import yauzl from "yauzl";
import { config } from "./config.js";
import { JobError } from "./errors.js";

export type Container = "zip" | "ole" | "unknown";

const OLE_SIGNATURE = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);

export async function sniffContainer(filePath: string): Promise<Container> {
  const handle = await open(filePath, "r");
  try {
    const head = Buffer.alloc(8);
    const { bytesRead } = await handle.read(head, 0, 8, 0);
    if (bytesRead >= 4 && head[0] === 0x50 && head[1] === 0x4b && head[2] === 0x03 && head[3] === 0x04) return "zip";
    if (bytesRead === 8 && head.equals(OLE_SIGNATURE)) return "ole";
    return "unknown";
  } finally {
    await handle.close();
  }
}

/** Password-protected OOXML files are OLE containers holding an "EncryptedPackage" stream. */
export async function isEncryptedOoxml(filePath: string): Promise<boolean> {
  const data = await readFile(filePath);
  return data.includes(Buffer.from("EncryptedPackage", "utf16le"));
}

export interface PptxInfo {
  slideCount: number;
  /** 1-based slide numbers, in presentation order. */
  hiddenSlides: number[];
  widthPt: number | null;
  heightPt: number | null;
}

function openZip(filePath: string): Promise<yauzl.ZipFile> {
  return new Promise((resolve, reject) => {
    yauzl.open(filePath, { lazyEntries: true, autoClose: false }, (error, zip) =>
      error || !zip ? reject(new JobError("corrupt")) : resolve(zip),
    );
  });
}

/** Walks the central directory only (nothing is extracted) and enforces archive limits. */
function listEntries(zip: yauzl.ZipFile): Promise<Map<string, yauzl.Entry>> {
  return new Promise((resolve, reject) => {
    const entries = new Map<string, yauzl.Entry>();
    let total = 0;
    let compressed = 0;

    zip.on("entry", (entry: yauzl.Entry) => {
      if (entries.size >= config.maxZipEntries) return reject(new JobError("archive-too-large"));
      if (entry.isEncrypted()) return reject(new JobError("encrypted"));
      total += entry.uncompressedSize;
      compressed += entry.compressedSize;
      if (total > config.maxUncompressedBytes) return reject(new JobError("archive-too-large"));
      entries.set(entry.fileName, entry);
      zip.readEntry();
    });
    zip.on("end", () => {
      if (total > 50 * 1024 * 1024 && total / Math.max(compressed, 1) > config.maxExpansionRatio) {
        return reject(new JobError("archive-too-large"));
      }
      resolve(entries);
    });
    zip.on("error", () => reject(new JobError("corrupt")));
    zip.readEntry();
  });
}

/** Reads one entry with a hard byte cap, regardless of what the archive header claims. */
function readEntry(zip: yauzl.ZipFile, entry: yauzl.Entry, maxBytes: number): Promise<string> {
  return new Promise((resolve, reject) => {
    zip.openReadStream(entry, (error, stream) => {
      if (error || !stream) return reject(new JobError("corrupt"));
      const chunks: Buffer[] = [];
      let size = 0;
      stream.on("data", (chunk: Buffer) => {
        size += chunk.length;
        if (size > maxBytes) {
          stream.destroy();
          return reject(new JobError("archive-too-large"));
        }
        chunks.push(chunk);
      });
      stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      stream.on("error", () => reject(new JobError("corrupt")));
    });
  });
}

const XML_CAP = 8 * 1024 * 1024;

export async function inspectPptx(filePath: string): Promise<PptxInfo> {
  const zip = await openZip(filePath);
  try {
    const entries = await listEntries(zip);
    const presentation = entries.get("ppt/presentation.xml");
    const rels = entries.get("ppt/_rels/presentation.xml.rels");
    if (!entries.has("[Content_Types].xml") || !presentation || !rels) throw new JobError("invalid-file");

    const presentationXml = await readEntry(zip, presentation, XML_CAP);
    const relsXml = await readEntry(zip, rels, XML_CAP);

    const targets = new Map<string, string>();
    for (const match of relsXml.matchAll(/<Relationship\b[^>]*>/g)) {
      const id = /\bId="([^"]+)"/.exec(match[0])?.[1];
      const target = /\bTarget="([^"]+)"/.exec(match[0])?.[1];
      if (id && target) targets.set(id, target);
    }

    const slidePaths: string[] = [];
    for (const match of presentationXml.matchAll(/<(?:\w+:)?sldId\b[^>]*>/g)) {
      const rid = /\br:id="([^"]+)"/.exec(match[0])?.[1];
      const target = rid ? targets.get(rid) : undefined;
      if (!target) continue;
      slidePaths.push(target.startsWith("/") ? target.slice(1) : path.posix.normalize(`ppt/${target}`));
    }
    if (slidePaths.length === 0) throw new JobError("invalid-file");
    if (slidePaths.length > config.maxSlides) throw new JobError("too-many-slides");

    const hiddenSlides: number[] = [];
    for (const [index, slidePath] of slidePaths.entries()) {
      const entry = entries.get(slidePath);
      if (!entry) throw new JobError("invalid-file");
      const xml = await readEntry(zip, entry, XML_CAP);
      if (/<(?:\w+:)?sld\b[^>]*?\bshow\s*=\s*"(?:0|false)"/.test(xml)) hiddenSlides.push(index + 1);
    }

    const size = /<(?:\w+:)?sldSz\b[^>]*\bcx="(\d+)"[^>]*\bcy="(\d+)"/.exec(presentationXml);
    return {
      slideCount: slidePaths.length,
      hiddenSlides,
      widthPt: size ? Number(size[1]) / 12700 : null,
      heightPt: size ? Number(size[2]) / 12700 : null,
    };
  } finally {
    zip.close();
  }
}
