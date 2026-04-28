const fs = require('fs');
const files = ['src/pages/AdminDashboard.jsx', 'src/utils/tokenManager.js'];
for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/window\.location\.origin/g, '"https://portail-ipfp.web.app"');
    fs.writeFileSync(file, content);
    console.log('Replaced in ' + file);
  }
}
