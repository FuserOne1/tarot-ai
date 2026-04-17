const fs = require("fs");
const path = require("path");

// Minimal valid 1x1 purple PNG (base64 encoded)
// We'll create a simple colored PNG using raw bytes
function createSimplePNG(size, r, g, b) {
  // Use a data URL approach - write a minimal PNG
  // This is a 1x1 PNG that browsers will scale
  const PNG_HEADER = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  function crc32(buf) {
    let crc = 0xffffffff;
    const table = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      table[i] = c;
    }
    for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeB = Buffer.from(type);
    const crcB = Buffer.alloc(4);
    crcB.writeUInt32BE(crc32(Buffer.concat([typeB, data])));
    return Buffer.concat([len, typeB, data, crcB]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(1, 0); // width=1
  ihdr.writeUInt32BE(1, 4); // height=1
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // IDAT - single pixel
  const zlib = require("zlib");
  const raw = Buffer.from([0, r, g, b]); // filter byte + RGB
  const compressed = zlib.deflateSync(raw);
  
  const iend = Buffer.alloc(0);
  
  return Buffer.concat([
    PNG_HEADER,
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", iend),
  ]);
}

const publicDir = path.join(__dirname, "../public");
const png = createSimplePNG(1, 13, 10, 26); // dark purple #0d0a1a

fs.writeFileSync(path.join(publicDir, "icon-192.png"), png);
fs.writeFileSync(path.join(publicDir, "icon-512.png"), png);

console.log("Placeholder icons created. Replace with real 192x192 and 512x512 PNG icons.");
