const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '../src/static/icons');

const createPngIcon = (width, height, r, g, b, a = 255) => {
  const png = [];
  
  png.push(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
  
  const ihdr = [
    (width >> 24) & 0xFF, (width >> 16) & 0xFF, (width >> 8) & 0xFF, width & 0xFF,
    (height >> 24) & 0xFF, (height >> 16) & 0xFF, (height >> 8) & 0xFF, height & 0xFF,
    8, 6, 0, 0, 0
  ];
  
  const ihdrChunk = createChunk('IHDR', ihdr);
  png.push(...ihdrChunk);
  
  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0);
    for (let x = 0; x < width; x++) {
      rawData.push(r, g, b, a);
    }
  }
  
  const compressed = deflate(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  png.push(...idatChunk);
  
  const iendChunk = createChunk('IEND', []);
  png.push(...iendChunk);
  
  return Buffer.from(png);
};

const createChunk = (type, data) => {
  const length = [
    (data.length >> 24) & 0xFF,
    (data.length >> 16) & 0xFF,
    (data.length >> 8) & 0xFF,
    data.length & 0xFF
  ];
  
  const typeBytes = type.split('').map(c => c.charCodeAt(0));
  const crcData = [...typeBytes, ...data];
  const crc = crc32(crcData);
  
  const crcBytes = [
    (crc >> 24) & 0xFF,
    (crc >> 16) & 0xFF,
    (crc >> 8) & 0xFF,
    crc & 0xFF
  ];
  
  return [...length, ...typeBytes, ...data, ...crcBytes];
};

const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

const crc32 = (data) => {
  let crc = 0xFFFFFFFF;
  for (const byte of data) {
    crc = crcTable[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
};

const deflate = (data) => {
  const result = [0x78, 0x01];
  const blockSize = 65535;
  
  for (let i = 0; i < data.length; i += blockSize) {
    const block = data.slice(i, Math.min(i + blockSize, data.length));
    const isLast = i + blockSize >= data.length;
    
    result.push(isLast ? 1 : 0);
    result.push(block.length & 0xFF);
    result.push((block.length >> 8) & 0xFF);
    result.push((~block.length) & 0xFF);
    result.push(((~block.length) >> 8) & 0xFF);
    result.push(...block);
  }
  
  let a = 1, b = 0;
  for (const byte of data) {
    a = (a + byte) % 65521;
    b = (b + a) % 65521;
  }
  const adler = ((b << 16) | a) >>> 0;
  result.push((adler >> 24) & 0xFF);
  result.push((adler >> 16) & 0xFF);
  result.push((adler >> 8) & 0xFF);
  result.push(adler & 0xFF);
  
  return result;
};

const icons = [
  { name: 'contract.png', color: [107, 114, 128] },
  { name: 'contract-active.png', color: [37, 99, 235] },
  { name: 'approval.png', color: [107, 114, 128] },
  { name: 'approval-active.png', color: [37, 99, 235] },
  { name: 'claim.png', color: [107, 114, 128] },
  { name: 'claim-active.png', color: [37, 99, 235] },
  { name: 'reminder.png', color: [107, 114, 128] },
  { name: 'reminder-active.png', color: [37, 99, 235] }
];

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

icons.forEach(({ name, color }) => {
  const png = createPngIcon(48, 48, color[0], color[1], color[2]);
  fs.writeFileSync(path.join(iconsDir, name), png);
  console.log(`Created ${name}`);
});

console.log('All icons created successfully!');