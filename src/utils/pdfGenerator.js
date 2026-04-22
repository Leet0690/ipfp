import { jsPDF } from 'jspdf';

/* ── Constants ── */
const ACCREDITATION_TEXT = [
  'Institut de formation professionnelle « établissement privé »',
  'agréé par le ministère de l’Inclusion économique, de la Petite entreprise,',
  'de l’Emploi et des Compétences, sous le numéro 4/01/6/2022'
];

/**
 * Common header for all official documents
 */
const drawHeader = (doc, title) => {
  const w = doc.internal.pageSize.getWidth();
  const margin = 15;
  
  // Logo (Public folder)
  try { 
    doc.addImage('/logo.jpg', 'JPEG', margin, 8, 50, 22); 
  } catch(e) {
    console.error("Logo not found", e);
  }

  // Accreditation Text (Right side)
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  let textY = 12;
  ACCREDITATION_TEXT.forEach(line => {
    doc.text(line, w - margin, textY, { align: 'right' });
    textY += 4;
  });

  // Main Title
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(title, w / 2, 35, { align: 'center' });
  
  // Separator
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.line(margin, 40, w - margin, 40);

  return 45; // Returns next Y position
};

/* ════════════════════════════════════════════════════════════════════
 *  1. FICHE DE SIGNATURE — Par module / par CC
 * ════════════════════════════════════════════════════════════════════ */
export const generateFicheSignature = ({ students, filiere, niveau, module, ccNumber, formateur }) => {
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();
  const margin = 15;
  const tableW = w - margin * 2;

  let y = drawHeader(doc, 'FICHE DES NOTES');

  // ── Header Info ──
  const rowH = 10;
  y += 5;

  // Row 1: Filière | Niveau
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, tableW / 2, rowH);
  doc.rect(margin + tableW / 2, y, tableW / 2, rowH);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Filière : ', margin + 3, y + 7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(176, 104, 185);
  doc.text(filiere || '', margin + 22, y + 7);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'normal');
  doc.text('Niveau : ', margin + tableW / 2 + 3, y + 7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(176, 104, 185);
  doc.text(niveau || '', margin + tableW / 2 + 22, y + 7);
  doc.setTextColor(0);

  // Row 2: Formateur | UF N°
  y += rowH;
  doc.rect(margin, y, tableW / 2, rowH);
  doc.rect(margin + tableW / 2, y, tableW / 2, rowH);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Formateur :', margin + 3, y + 7);
  doc.setFont('helvetica', 'bold');
  doc.text(formateur || '', margin + 28, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.text('UF N° :', margin + tableW / 2 + 3, y + 7);
  doc.setFont('helvetica', 'bold');
  doc.text(module || '', margin + tableW / 2 + 20, y + 7);

  // Row 3: Séquence pédagogique | SQ. Intitulé
  y += rowH;
  doc.rect(margin, y, tableW / 2, rowH);
  doc.rect(margin + tableW / 2, y, tableW / 2, rowH);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Séquence pédagogique N°: `, margin + 3, y + 7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(176, 104, 185);
  doc.text(`CC${ccNumber}`, margin + 55, y + 7);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'normal');
  doc.text('SQ. Intitulé :', margin + tableW / 2 + 3, y + 7);

  // Row 4: Date | Durée
  y += rowH;
  doc.rect(margin, y, tableW / 2, rowH);
  doc.rect(margin + tableW / 2, y, tableW / 2, rowH);
  doc.setFont('helvetica', 'normal');
  doc.text('Date :', margin + 3, y + 7);
  doc.text("Durée de l'épreuve :", margin + tableW / 2 + 3, y + 7);

  // ── Table Header ──
  y += rowH + 4;
  const col1W = 35; 
  const col3W = 50; 
  const col2W = tableW - col1W - col3W; 

  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y, col1W, rowH, 'FD');
  doc.rect(margin + col1W, y, col2W, rowH, 'FD');
  doc.rect(margin + col1W + col2W, y, col3W, rowH, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('MATRICULE', margin + col1W / 2, y + 7, { align: 'center' });
  doc.text('NOM & PRENOM', margin + col1W + col2W / 2, y + 7, { align: 'center' });
  doc.text('NOTES /20', margin + col1W + col2W + col3W / 2, y + 7, { align: 'center' });

  // ── Table Rows ──
  y += rowH;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  students.forEach((student) => {
    if (y > 260) {
      doc.addPage();
      y = drawHeader(doc, 'FICHE DES NOTES (Suite)');
      y += 10;
    }
    doc.rect(margin, y, col1W, rowH);
    doc.rect(margin + col1W, y, col2W, rowH);
    doc.rect(margin + col1W + col2W, y, col3W, rowH);

    doc.setFont('helvetica', 'bold');
    doc.text(student.regNo || '', margin + 3, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(`${student.lastName || ''} ${student.firstName || ''}`, margin + col1W + 3, y + 7);
    doc.text('..................../20', margin + col1W + col2W + 5, y + 7);

    y += rowH;
  });

  // ── Footer ──
  y += 10;
  if (y > 250) { doc.addPage(); y = 40; }

  doc.rect(margin, y, tableW / 2, 30);
  doc.rect(margin + tableW / 2, y, tableW / 2, 30);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('SIGNATURE DU FORMATEUR', margin + tableW / 4, y + 8, { align: 'center' });
  doc.text('Visa du président du jury', margin + tableW * 3 / 4, y + 8, { align: 'center' });

  const safeMod = (module || 'module').replace(/[^a-z0-9]/gi, '_').substring(0, 20);
  doc.save(`Fiche_Notes_CC${ccNumber}_${safeMod}.pdf`);
};


/* ════════════════════════════════════════════════════════════════════
 *  2. FICHE DES NOTES — Par module, EFCFP & EFCFT seulement
 * ════════════════════════════════════════════════════════════════════ */
export const generateFicheNotes = ({ students, filiere, classe, anneeFormation, module, formateur }) => {
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();
  const margin = 15;
  const tableW = w - margin * 2;

  let y = drawHeader(doc, 'FICHE DES NOTES');

  // ── Header Info ──
  const rowH = 12;
  y += 5;

  const col1H = tableW * 0.5;
  const col2H = tableW * 0.25;
  const col3H = tableW * 0.25;
  
  doc.setDrawColor(0);
  doc.rect(margin, y, col1H, rowH);
  doc.rect(margin + col1H, y, col2H, rowH);
  doc.rect(margin + col1H + col2H, y, col3H, rowH);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Intitulé de la filière', margin + col1H / 2, y + 5, { align: 'center' });
  doc.text('Classe', margin + col1H + col2H / 2, y + 5, { align: 'center' });
  doc.text('Année de formation', margin + col1H + col2H + col3H / 2, y + 5, { align: 'center' });

  y += rowH;
  doc.rect(margin, y, col1H, rowH);
  doc.rect(margin + col1H, y, col2H, rowH);
  doc.rect(margin + col1H + col2H, y, col3H, rowH);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(filiere || '', margin + col1H / 2, y + 8, { align: 'center' });
  doc.text(classe || '', margin + col1H + col2H / 2, y + 8, { align: 'center' });
  doc.text(anneeFormation || '2025-2026', margin + col1H + col2H + col3H / 2, y + 8, { align: 'center' });

  y += rowH;
  doc.rect(margin, y, tableW / 2, rowH);
  doc.rect(margin + tableW / 2, y, tableW / 2, rowH);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text("Unité de Formation (Module)", margin + tableW / 4, y + 5, { align: 'center' });
  doc.text('Formateur', margin + tableW * 3 / 4, y + 5, { align: 'center' });

  y += rowH;
  doc.rect(margin, y, tableW / 2, rowH);
  doc.rect(margin + tableW / 2, y, tableW / 2, rowH);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(module || '', margin + tableW / 4, y + 8, { align: 'center' });
  doc.text(formateur || '', margin + tableW * 3 / 4, y + 8, { align: 'center' });

  // ── Table Header ──
  y += rowH + 4;
  const tCol1 = 35; 
  const tCol3 = 30; 
  const tCol4 = 30; 
  const tCol2 = tableW - tCol1 - tCol3 - tCol4; 

  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y, tCol1, rowH, 'FD');
  doc.rect(margin + tCol1, y, tCol2, rowH, 'FD');
  doc.rect(margin + tCol1 + tCol2, y, tCol3, rowH, 'FD');
  doc.rect(margin + tCol1 + tCol2 + tCol3, y, tCol4, rowH, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('MATRICULE', margin + tCol1 / 2, y + 7, { align: 'center' });
  doc.text('NOM ET PRENOM DU STAGIAIRE', margin + tCol1 + tCol2 / 2, y + 7, { align: 'center' });
  doc.text('EFCFP', margin + tCol1 + tCol2 + tCol3 / 2, y + 7, { align: 'center' });
  doc.text('EFCFT', margin + tCol1 + tCol2 + tCol3 + tCol4 / 2, y + 7, { align: 'center' });

  // ── Table Rows ──
  y += rowH;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  students.forEach((student) => {
    if (y > 255) {
      doc.addPage();
      y = drawHeader(doc, 'FICHE DES NOTES (Suite)');
      y += 15;
    }
    doc.rect(margin, y, tCol1, rowH);
    doc.rect(margin + tCol1, y, tCol2, rowH);
    doc.rect(margin + tCol1 + tCol2, y, tCol3, rowH);
    doc.rect(margin + tCol1 + tCol2 + tCol3, y, tCol4, rowH);

    doc.setFont('helvetica', 'bold');
    doc.text(student.regNo || '', margin + tCol1 / 2, y + 8, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text(`${student.lastName || ''} ${student.firstName || ''}`, margin + tCol1 + 3, y + 8);
    doc.text('........./20', margin + tCol1 + tCol2 + 5, y + 8);
    doc.text('........./20', margin + tCol1 + tCol2 + tCol3 + 5, y + 8);

    y += rowH;
  });

  // ── Footer ──
  y += 10;
  if (y > 250) { doc.addPage(); y = 40; }

  doc.rect(margin, y, tableW / 2, 25);
  doc.rect(margin + tableW / 2, y, tableW / 2, 25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('SIGNATURE DU FORMATEUR', margin + tableW / 4, y + 10, { align: 'center' });
  doc.text("SIGNATURE DU JURY D'EXAMEN", margin + tableW * 3 / 4, y + 10, { align: 'center' });

  const safeMod = (module || 'module').replace(/[^a-z0-9]/gi, '_').substring(0, 20);
  doc.save(`Fiche_Notes_EFC_${safeMod}.pdf`);
};


/* ════════════════════════════════════════════════════════════════════
 *  3. BULLETIN GLOBAL — Par stagiaire, toutes les notes
 * ════════════════════════════════════════════════════════════════════ */
export const generateBulletinGlobal = (student, allGrades, modules) => {
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();
  const margin = 15;
  const tableW = w - margin * 2;
  const grades = allGrades[student.id] || {};

  let y = drawHeader(doc, 'BULLETIN DE NOTES OFFICIEL');

  // ── Student Info ──
  y += 15;
  doc.setTextColor(176, 104, 185);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(`${student.lastName.toUpperCase()} ${student.firstName}`, margin, y);

  y += 8;
  doc.setTextColor(0);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Matricule: ${student.regNo}`, margin, y);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, w - margin, y, { align: 'right' });
  
  y += 6;
  doc.text(`Filière: ${student.major}`, margin, y);
  doc.text(`Niveau: ${student.diploma} · ${student.year}`, w - margin, y, { align: 'right' });

  // ── Table Header ──
  y += 12;
  const rH = 9;
  const cols = [70, 14, 14, 14, 20, 16, 16, 16]; 
  const headers = ['MATIÈRE', 'C1', 'C2', 'C3', 'MOY CC', 'EFCFP', 'EFCFT', 'MOY'];

  doc.setFillColor(245, 240, 250);
  let xPos = margin;
  cols.forEach((cw, i) => {
    doc.rect(xPos, y, cw, rH, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(headers[i], xPos + cw / 2, y + 6, { align: 'center' });
    xPos += cw;
  });

  // ── Table Body ──
  y += rH;
  let totalPoints = 0;
  let validCount = 0;

  modules.forEach((mod, index) => {
    if (y > 270) {
      doc.addPage();
      y = drawHeader(doc, 'BULLETIN DE NOTES (Suite)');
      y += 15;
    }

    const g = grades[mod] || {};
    const { c1 = '', c2 = '', c3 = '', efcfp = '', efcft = '' } = g;

    let moyCC = null;
    if (c1 !== '' && c2 !== '') {
      const n1 = parseFloat(c1), n2 = parseFloat(c2);
      if (!isNaN(n1) && !isNaN(n2)) {
        if (c3 !== '' && c3 !== undefined && c3 !== null) {
          const n3 = parseFloat(c3);
          moyCC = !isNaN(n3) ? (n1 + n2 + n3) / 3 : (n1 + n2) / 2;
        } else {
          moyCC = (n1 + n2) / 2;
        }
      }
    }

    let avg = null;
    if (moyCC !== null && efcfp !== '' && efcft !== '') {
      const nP = parseFloat(efcfp), nT = parseFloat(efcft);
      if (!isNaN(nP) && !isNaN(nT)) {
        const efc = (nP + nT) / 2;
        avg = moyCC * 0.4 + efc * 0.6;
        totalPoints += avg;
        validCount++;
      }
    }

    if (index % 2 === 0) {
      doc.setFillColor(252, 252, 255);
      let rx = margin;
      cols.forEach(cw => { doc.rect(rx, y, cw, rH, 'F'); rx += cw; });
    }

    xPos = margin;
    cols.forEach(cw => { doc.rect(xPos, y, cw, rH); xPos += cw; });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    const displayMod = mod.length > 35 ? mod.substring(0, 33) + '…' : mod;
    doc.text(displayMod, margin + 2, y + 6);

    const vals = [
      c1 || '—', c2 || '—', c3 || '—',
      moyCC !== null ? moyCC.toFixed(2) : '—',
      efcfp || '—', efcft || '—',
      avg !== null ? avg.toFixed(2) : '—'
    ];

    xPos = margin + cols[0];
    vals.forEach((v, i) => {
      doc.setFont('helvetica', i === 3 || i === 6 ? 'bold' : 'normal');
      doc.text(String(v), xPos + cols[i + 1] / 2, y + 6, { align: 'center' });
      xPos += cols[i + 1];
    });

    y += rH;
  });

  // ── Summary ──
  const finalAvg = validCount > 0 ? (totalPoints / validCount).toFixed(2) : '—';
  y += 10;
  if (y > 260) { doc.addPage(); y = 40; }

  doc.setDrawColor(176, 104, 185);
  doc.setLineWidth(1);
  doc.line(margin, y, w - margin, y);

  y += 12;
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.text('MOYENNE GÉNÉRALE:', margin, y);
  
  doc.setFontSize(18);
  doc.setTextColor(176, 104, 185);
  doc.text(`${finalAvg} / 20`, w - margin, y, { align: 'right' });

  // Footer
  y += 25;
  doc.setTextColor(150);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text("Cachet de l'Établissement", margin + 20, y);
  doc.text('Signature du Secrétariat', w - margin - 50, y);

  const safeName = student.lastName.replace(/[^a-z0-9]/gi, '_');
  doc.save(`Bulletin_${safeName}_${student.regNo.replace(/[^a-z0-9]/gi, '_')}.pdf`);
};


/* ════════════════════════════════════════════════════════════════════
 *  4. NOTE D'OBTENTION DE DIPLÔME
 * ════════════════════════════════════════════════════════════════════ */
export const generateNoteObtentionDiplome = (student, allGrades, modules) => {
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();
  const margin = 20;
  const grades = allGrades[student.id] || {};

  let y = drawHeader(doc, "NOTE D'OBTENTION DE DIPLÔME");

  y += 20;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text("L'Institut Polytechnique de la Formation Professionnelle atteste que :", margin, y);

  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(176, 104, 185);
  doc.text(`${student.lastName.toUpperCase()} ${student.firstName}`, w / 2, y, { align: 'center' });

  y += 10;
  doc.setTextColor(0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Né(e) le : ..................................................... à : .....................................................`, margin, y);

  y += 8;
  doc.text(`Titulaire du Matricule : `, margin, y);
  doc.setFont('helvetica', 'bold');
  doc.text(student.regNo, margin + 42, y);

  y += 12;
  doc.setFont('helvetica', 'normal');
  doc.text(`A suivi avec succès la formation de :`, margin, y);
  
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(student.major, margin, y);
  
  y += 8;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(11);
  doc.text(`Niveau : ${student.diploma}`, margin, y);

  // Results calculation
  let totalPoints = 0;
  let validCount = 0;
  modules.forEach(mod => {
    const g = grades[mod] || {};
    const { c1, c2, c3, efcfp, efcft } = g;
    if (c1 && c2 && efcfp && efcft) {
      const n1 = parseFloat(c1), n2 = parseFloat(c2);
      const n3 = c3 ? parseFloat(c3) : null;
      const moyCC = n3 !== null ? (n1 + n2 + n3) / 3 : (n1 + n2) / 2;
      const avg = moyCC * 0.4 + ((parseFloat(efcfp) + parseFloat(efcft)) / 2) * 0.6;
      totalPoints += avg;
      validCount++;
    }
  });

  const finalAvg = validCount > 0 ? (totalPoints / validCount).toFixed(2) : '—';
  const isPassed = validCount > 0 && parseFloat(finalAvg) >= 10;

  y += 20;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(`Moyenne Générale obtenue : `, margin, y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`${finalAvg} / 20`, margin + 55, y);

  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(`Décision du jury : `, margin, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isPassed ? 22 : 217, isPassed ? 163 : 119, isPassed ? 74 : 6); // Green or Amber
  doc.text(isPassed ? "ADMIS(E)" : "AJOURNÉ(E)", margin + 35, y);

  y += 30;
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fait à Marrakech, le ${new Date().toLocaleDateString()}`, w - margin, y, { align: 'right' });

  y += 20;
  doc.setFont('helvetica', 'bold');
  doc.text("Directeur de l'Établissement", margin + 20, y);
  doc.text("Le Président du Jury", w - margin - 45, y);

  const safeName = student.lastName.replace(/[^a-z0-9]/gi, '_');
  doc.save(`Note_Obtention_Diplome_${safeName}.pdf`);
};
