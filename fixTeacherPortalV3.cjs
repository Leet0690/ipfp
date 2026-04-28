const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'TeacherPortal.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Simplified pattern matching for the table area
const pattern = /\) : relevantStudents\.length === 0 \? \([\s\S]*?\) : !selectedSubject \? \(/;
const replacement = `) : relevantStudents.length === 0 ? (
          <div style={{ padding: '64px', textAlign: 'center' }}>
            <i className="fa-solid fa-users-slash" style={{ fontSize: '42px', color: 'var(--border)', display: 'block', marginBottom: '16px', opacity: 0.5 }}></i>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px' }}>Liste vide</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Aucun stagiaire ne correspond aux critères actuels.</p>
          </div>
        ) : !selectedSubject ? (`;

content = content.replace(pattern, replacement);

fs.writeFileSync(filePath, content);
console.log("TeacherPortal.jsx table area updated successfully.");
