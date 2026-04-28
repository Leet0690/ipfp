const fs = require('fs');
let content = fs.readFileSync('src/pages/TeacherPortal.jsx', 'utf8');

// 1. Add handleMarkAllPresent function around handleSave
const handleSaveStr = 'const handleSave = () => {';
const markAllPresentFn = `  const handleMarkAllPresent = async () => {
    if (!selectedSubject) return;
    try {
      const batchPromises = relevantStudents.map(student => {
        const docId = \`\${student.id}_\${selectedSubject.replace(/[^a-zA-Z0-9]/g, '_')}_\${selectedDate}\`;
        const record = studentAttendance.find(a => a.id === docId);
        if (!record || !['present', 'absent', 'retard'].includes(record.status)) {
          return updateStudentAttendance(student.id, selectedSubject, selectedDate, 'present', '', teacher.id);
        }
        return Promise.resolve();
      });
      await Promise.all(batchPromises);
      addNotification("Tous les stagiaires restants ont été marqués comme présents.");
    } catch (e) {
      addNotification("Erreur de sauvegarde.");
    }
  };\n\n  `;
content = content.replace(handleSaveStr, markAllPresentFn + handleSaveStr);

// 2. Change the header
const headerStr = `<th style={{ ...thStyle, textAlign: 'center', width: '220px' }}>Statut</th>`;
const newHeaderStr = `<th style={{ ...thStyle, textAlign: 'center', width: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <span>Statut</span>
                      <button onClick={handleMarkAllPresent} style={{ background: 'var(--primary-ultra-light)', color: 'var(--primary)', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', cursor: 'pointer' }} title="Marquer les restants comme présents">
                        TOUS PRÉSENTS
                      </button>
                    </div>
                  </th>`;
content = content.replace(headerStr, newHeaderStr);

// 3. Update the Validation Button to show the missing count
const btnStr = `<button 
                onClick={handleValidateAttendance} 
                className={\`btn-modern \${allAttended ? 'primary' : ''}\`} 
                style={{ padding: '10px 20px', fontSize: '13px', opacity: allAttended ? 1 : 0.6, cursor: allAttended ? 'pointer' : 'not-allowed' }}
              >
                Valider l'appel <i className="fa-solid fa-check" style={{ marginLeft: '4px', fontSize: '12px' }}></i>
              </button>`;
const newBtnStr = `{(() => {
                const missingCount = relevantStudents.filter(s => {
                  const docId = \`\${s.id}_\${selectedSubject?.replace(/[^a-zA-Z0-9]/g, '_')}_\${selectedDate}\`;
                  const record = studentAttendance.find(a => a.id === docId);
                  return !record || !['present', 'absent', 'retard'].includes(record.status);
                }).length;
                
                return (
                  <button 
                    onClick={handleValidateAttendance} 
                    className={\`btn-modern \${allAttended ? 'primary' : ''}\`} 
                    style={{ padding: '10px 20px', fontSize: '13px', opacity: allAttended ? 1 : 0.6, cursor: allAttended ? 'pointer' : 'not-allowed' }}
                    title={!allAttended ? \`Il reste \${missingCount} stagiaire(s) à pointer\` : "Valider"}
                  >
                    {allAttended ? "Valider l'appel" : \`Il reste \${missingCount} à pointer\`} <i className="fa-solid fa-check" style={{ marginLeft: '4px', fontSize: '12px' }}></i>
                  </button>
                );
              })()}`;
content = content.replace(btnStr, newBtnStr);

fs.writeFileSync('src/pages/TeacherPortal.jsx', content);
console.log('Fixed TeacherPortal.jsx');
