import fs from 'fs';
const data = fs.readFileSync('C:/Users/hp/.gemini/antigravity/brain/c1232d7f-20f0-4108-b321-a45b538b34b0/media__1777223368750.jpg');
const b64 = data.toString('base64');
fs.writeFileSync('src/utils/logoBase64.js', 'export const logoBase64 = "data:image/jpeg;base64,' + b64 + '";');
console.log('Done');
