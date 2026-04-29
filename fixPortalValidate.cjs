const fs = require('fs');
const path = require('path');

let content = fs.readFileSync(path.join(__dirname, 'src/pages/TeacherPortal.jsx'), 'utf8');

// Replace the broken handleValidateAttendance
const broken = `  const handleValidateAttendance = async () => {
      addNotification("Appel enregistré et votre présence a été validée.");
      
      // Attempt to close the window after 1.5 seconds.
      setTimeout(() => {
        setIsFinished(true); // Show the success message in case window.close() is blocked
        try {
          window.close();
        } catch (e) {
          console.log("window.close() blocked by browser.");
        }
      }, 1500);
    } else {
      addNotification("Veuillez marquer l'état de présence de tous les stagiaires.");
    }
  };`;

const fixed = `  const handleValidateAttendance = async () => {
    if (allAttended) {
      setAttendanceSuccess(true);
      
      // Automatically mark teacher as present when they validate the students' attendance
      try {
        await updateTeacherAttendance(
          teacher.id, 
          selectedDate, 
          'present', 
          \`Appel validé pour le module: \${selectedSubject}\`,
          sessionDuration,
          selectedSubject,
          currentSession?.time || ''
        );
      } catch (e) {
        console.error("Error updating teacher presence:", e);
      }

      addNotification("Appel enregistré et votre présence a été validée.");
      
      // Attempt to close the window after 1.5 seconds.
      setTimeout(() => {
        setIsFinished(true);
        try {
          window.close();
        } catch (e) {
          console.log("window.close() blocked by browser.");
        }
      }, 1500);
    } else {
      addNotification("Veuillez marquer l'état de présence de tous les stagiaires.");
    }
  };`;

if (content.includes(broken)) {
  content = content.replace(broken, fixed);
  fs.writeFileSync(path.join(__dirname, 'src/pages/TeacherPortal.jsx'), content);
  console.log('✅ TeacherPortal.jsx fixed');
} else {
  console.log('❌ Pattern not found - checking...');
  // Try with \r\n
  const brokenCR = broken.replace(/\n/g, '\r\n');
  if (content.includes(brokenCR)) {
    content = content.replace(brokenCR, fixed.replace(/\n/g, '\r\n'));
    fs.writeFileSync(path.join(__dirname, 'src/pages/TeacherPortal.jsx'), content);
    console.log('✅ TeacherPortal.jsx fixed (CRLF)');
  } else {
    console.log('❌ Could not find pattern');
  }
}
