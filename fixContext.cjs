const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.jsx', 'utf8');

// The block to extract
const modulesBlock = `      const qModules = query(collection(db, 'modules'), orderBy('name', 'asc'));
      unsubModules = onSnapshot(qModules, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setModules(data);
      });`;

// Remove it from inside the if
content = content.replace(modulesBlock, '');

// Place it before let unsubNotifs...
const targetAnchor = '    let unsubNotifs';
const newPublicBlock = `    const unsubModules = onSnapshot(query(collection(db, 'modules'), orderBy('name', 'asc')), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setModules(data);
    });\n\n` + targetAnchor;

content = content.replace(targetAnchor, newPublicBlock);

// Remove the `setModules([])` from the else block
content = content.replace('setModules([]);', '');

// Remove unsubModules from the top declaration and from the inner cleanup
content = content.replace('unsubSalaries, unsubModules;', 'unsubSalaries;');
content = content.replace('if (unsubModules) unsubModules();', '');

// Add it to the public cleanup
content = content.replace('unsubSchedules();', 'unsubSchedules();\n      unsubModules();');

fs.writeFileSync('src/context/AppContext.jsx', content);
console.log('Fixed AppContext.jsx');
