// Minimal reader for OLE Compound File Binary (CFB) — the container behind
// legacy Office formats (.ppt, .doc, .xls). Pure Uint8Array/DataView, no Node
// APIs, so it runs in the browser where Kube does its extraction.
// Implements just enough of MS-CFB to enumerate streams and read them:
// header → DIFAT → FAT → directory → (mini)stream chains.

const MAGIC = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
const ENDOFCHAIN = 0xfffffffe;
const FREESECT = 0xffffffff;
const MAX_SECTORS = 1 << 22; // corruption guard: ~4M sectors

export interface CfbFile {
  /** Stream names (path-less; legacy Office keeps everything at root level). */
  streams: string[];
  readStream(name: string): Uint8Array | null;
}

export function isCfb(bytes: Uint8Array): boolean {
  return bytes.length > 512 && MAGIC.every((b, i) => bytes[i] === b);
}

export function openCfb(bytes: Uint8Array): CfbFile {
  if (!isCfb(bytes)) throw new Error("Not an OLE compound file.");
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  const sectorShift = dv.getUint16(30, true);
  const sectorSize = 1 << sectorShift; // 512 normally, 4096 for v4
  const miniShift = dv.getUint16(32, true);
  const miniSize = 1 << miniShift; // 64
  const numFatSectors = dv.getUint32(44, true);
  const firstDirSector = dv.getUint32(48, true);
  const miniCutoff = dv.getUint32(56, true); // 4096
  const firstMiniFatSector = dv.getUint32(60, true);
  const firstDifatSector = dv.getUint32(68, true);
  const numDifatSectors = dv.getUint32(72, true);

  const sectorOffset = (sector: number) => (sector + 1) * sectorSize;
  const u32At = (byteOffset: number) => dv.getUint32(byteOffset, true);

  // ---- DIFAT: the list of FAT sector numbers -------------------------------
  const difat: number[] = [];
  for (let i = 0; i < 109; i++) difat.push(u32At(76 + i * 4));
  let difatSector = firstDifatSector;
  const perDifatSector = sectorSize / 4 - 1;
  for (let n = 0; n < numDifatSectors && difatSector !== ENDOFCHAIN && difatSector !== FREESECT; n++) {
    const base = sectorOffset(difatSector);
    for (let i = 0; i < perDifatSector; i++) difat.push(u32At(base + i * 4));
    difatSector = u32At(base + perDifatSector * 4);
  }

  // ---- FAT: next-sector table ---------------------------------------------
  const entriesPerSector = sectorSize / 4;
  const fat = new Uint32Array(Math.min(numFatSectors * entriesPerSector, MAX_SECTORS));
  let fi = 0;
  for (const fs of difat) {
    if (fs === FREESECT || fs === ENDOFCHAIN) continue;
    const base = sectorOffset(fs);
    if (base + sectorSize > bytes.length) continue;
    for (let i = 0; i < entriesPerSector && fi < fat.length; i++) fat[fi++] = u32At(base + i * 4);
  }

  function readChain(start: number, size: number): Uint8Array {
    const out = new Uint8Array(size);
    let sector = start;
    let written = 0;
    let guard = 0;
    while (sector !== ENDOFCHAIN && sector !== FREESECT && written < size && guard++ < MAX_SECTORS) {
      const off = sectorOffset(sector);
      const take = Math.min(sectorSize, size - written, Math.max(0, bytes.length - off));
      if (take <= 0) break;
      out.set(bytes.subarray(off, off + take), written);
      written += take;
      sector = sector < fat.length ? fat[sector] : ENDOFCHAIN;
    }
    return out;
  }

  // ---- Directory entries (128 bytes each) ----------------------------------
  // Directory chain length isn't stored; walk the FAT chain sector by sector.
  const dirBytes: Uint8Array[] = [];
  {
    let sector = firstDirSector;
    let guard = 0;
    while (sector !== ENDOFCHAIN && sector !== FREESECT && guard++ < MAX_SECTORS) {
      const off = sectorOffset(sector);
      if (off + sectorSize > bytes.length) break;
      dirBytes.push(bytes.subarray(off, off + sectorSize));
      sector = sector < fat.length ? fat[sector] : ENDOFCHAIN;
    }
  }
  interface DirEntry { name: string; type: number; start: number; size: number }
  const entries: DirEntry[] = [];
  for (const chunk of dirBytes) {
    const cdv = new DataView(chunk.buffer, chunk.byteOffset, chunk.byteLength);
    for (let e = 0; e + 128 <= chunk.length; e += 128) {
      const nameLen = cdv.getUint16(e + 64, true);
      if (nameLen < 2 || nameLen > 64) continue;
      let name = "";
      for (let c = 0; c < nameLen - 2; c += 2) {
        name += String.fromCharCode(cdv.getUint16(e + c, true));
      }
      entries.push({
        name,
        type: cdv.getUint8(e + 66),
        start: cdv.getUint32(e + 116, true),
        size: cdv.getUint32(e + 120, true),
      });
    }
  }

  // ---- Mini stream + mini FAT ---------------------------------------------
  const root = entries.find((en) => en.type === 5);
  const miniStream = root ? readChain(root.start, root.size) : new Uint8Array(0);
  const miniFatEntries: number[] = [];
  {
    let sector = firstMiniFatSector;
    let guard = 0;
    while (sector !== ENDOFCHAIN && sector !== FREESECT && guard++ < MAX_SECTORS) {
      const off = sectorOffset(sector);
      if (off + sectorSize > bytes.length) break;
      for (let i = 0; i < entriesPerSector; i++) miniFatEntries.push(u32At(off + i * 4));
      sector = sector < fat.length ? fat[sector] : ENDOFCHAIN;
    }
  }

  function readMiniChain(start: number, size: number): Uint8Array {
    const out = new Uint8Array(size);
    let sector = start;
    let written = 0;
    let guard = 0;
    while (sector !== ENDOFCHAIN && sector !== FREESECT && written < size && guard++ < MAX_SECTORS) {
      const off = sector * miniSize;
      const take = Math.min(miniSize, size - written, Math.max(0, miniStream.length - off));
      if (take <= 0) break;
      out.set(miniStream.subarray(off, off + take), written);
      written += take;
      sector = sector < miniFatEntries.length ? miniFatEntries[sector] : ENDOFCHAIN;
    }
    return out;
  }

  return {
    streams: entries.filter((e) => e.type === 2).map((e) => e.name),
    readStream(name: string) {
      const entry = entries.find((e) => e.type === 2 && e.name === name);
      if (!entry) return null;
      return entry.size < miniCutoff
        ? readMiniChain(entry.start, entry.size)
        : readChain(entry.start, entry.size);
    },
  };
}
