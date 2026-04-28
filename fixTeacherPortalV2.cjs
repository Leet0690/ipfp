const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'TeacherPortal.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Hide button if no sessions today
content = content.replace(
  /\{activeTab === 'attendance' && \(\s*<>\s*<button/g,
  "{activeTab === 'attendance' && (\n            <>\n              {todaysSessions.length > 0 && (\n                <button"
);

content = content.replace(
  /Valider l'appel <i className="fa-solid fa-check" style=\{\{ marginLeft: '4px', fontSize: '12px' \}\}><\/i>\s*<\/button>/g,
  "Valider l'appel <i className=\"fa-solid fa-check\" style={{ marginLeft: '4px', fontSize: '12px' }}></i>\n                </button>\n              )}"
);

fs.writeFileSync(filePath, content);
console.log("TeacherPortal.jsx updated successfully.");
