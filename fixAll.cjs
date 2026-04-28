const fs = require('fs');
const path = require('path');

// ═══ FIX 1: TeacherPortal — context info block must show session selector even when no session is selected ═══
let tp = fs.readFileSync(path.join(__dirname, 'src/pages/TeacherPortal.jsx'), 'utf8');

// Replace the context info block: show it when attendance tab is active AND sessions exist (not just when currentSession is truthy)
tp = tp.replace(
  /\{activeTab === 'attendance' && currentSession && \(/,
  "{activeTab === 'attendance' && todaysSessions.length > 0 && ("
);

// Replace the inner content to handle both states (session selected vs not selected)
tp = tp.replace(
  /<div style=\{\{ display: 'flex', gap: '32px' \}\}>\s*<div>\s*<label style=\{\{ \.\.\.lblStyle, color: 'var\(--primary\)' \}\}>Jour<\/label>\s*<p style=\{\{ fontSize: '15px', fontWeight: '800', color: 'var\(--text-primary\)' \}\}>\{dayOfWeek\}<\/p>\s*<\/div>\s*<div>\s*<label style=\{\{ \.\.\.lblStyle, color: 'var\(--primary\)' \}\}>Heure<\/label>\s*<p style=\{\{ fontSize: '15px', fontWeight: '800', color: 'var\(--text-primary\)' \}\}><i className="fa-regular fa-clock" style=\{\{ marginRight: '6px' \}\}><\/i>\{currentSession\.time\?\.replace\(\/\\s\/g, ''\)\.replace\(\/h\/gi, ':'\)\}<\/p>\s*<\/div>\s*<div>\s*<label style=\{\{ \.\.\.lblStyle, color: 'var\(--primary\)' \}\}>Groupe<\/label>\s*<p style=\{\{ fontSize: '15px', fontWeight: '800', color: 'var\(--text-primary\)' \}\}>\{currentSession\.filiere\} \(\{currentSession\.annee\}\)<\/p>\s*<\/div>\s*<div>\s*<label style=\{\{ \.\.\.lblStyle, color: 'var\(--primary\)' \}\}>Module<\/label>\s*<p style=\{\{ fontSize: '15px', fontWeight: '800', color: 'var\(--text-primary\)' \}\}>\{currentSession\.module\}<\/p>\s*<\/div>\s*<\/div>/,
  `{currentSession ? (
            <div style={{ display: 'flex', gap: '32px' }}>
              <div>
                <label style={{ ...lblStyle, color: 'var(--primary)' }}>Jour</label>
                <p style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>{dayOfWeek}</p>
              </div>
              <div>
                <label style={{ ...lblStyle, color: 'var(--primary)' }}>Heure</label>
                <p style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}><i className="fa-regular fa-clock" style={{ marginRight: '6px' }}></i>{currentSession.time?.replace(/\\s/g, '').replace(/h/gi, ':')}</p>
              </div>
              <div>
                <label style={{ ...lblStyle, color: 'var(--primary)' }}>Groupe</label>
                <p style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>{currentSession.filiere} ({currentSession.annee})</p>
              </div>
              <div>
                <label style={{ ...lblStyle, color: 'var(--primary)' }}>Module</label>
                <p style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>{currentSession.module}</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <i className="fa-solid fa-hand-pointer" style={{ fontSize: '20px', color: 'var(--primary)', opacity: 0.5 }}></i>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Sélectionnez une séance</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{todaysSessions.length} séance(s) disponible(s) aujourd'hui ({dayOfWeek})</p>
              </div>
            </div>
          )}`
);

// Fix the "Prise d'absence" placeholder — it should say "no sessions" only if todaysSessions is empty
tp = tp.replace(
  /\{activeTab === 'attendance' && !currentSession \? \(\n\s*<div style=\{\{ padding: '64px', textAlign: 'center' \}\}>\n\s*<i className="fa-solid fa-calendar-check"[^]*?Veuillez sélectionner l'une de vos séances d'aujourd'hui pour commencer\.<\/p>\n\s*<\/div>\n\s*\)/,
  `{activeTab === 'attendance' && !currentSession && todaysSessions.length === 0 ? (
          <div style={{ padding: '64px', textAlign: 'center' }}>
            <i className="fa-solid fa-calendar-xmark" style={{ fontSize: '42px', color: 'var(--border)', display: 'block', marginBottom: '16px', opacity: 0.5 }}></i>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px' }}>Aucune séance</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Aucune séance n'est planifiée pour vous ce jour ({dayOfWeek}).</p>
          </div>
        )`
);

fs.writeFileSync(path.join(__dirname, 'src/pages/TeacherPortal.jsx'), tp);
console.log('✅ TeacherPortal.jsx fixed');

// ═══ FIX 2: DashboardLayout — collapsible sidebar categories ═══
let dl = fs.readFileSync(path.join(__dirname, 'src/layouts/DashboardLayout.jsx'), 'utf8');

// Replace NAV_LINKS flat array with categorized structure
dl = dl.replace(
  /const NAV_LINKS = \[[\s\S]*?\];/,
  `const NAV_CATEGORIES = [
  {
    label: "Tableau de Bord",
    icon: "fa-chart-pie",
    items: [
      { to: "/", icon: "fa-chart-pie", label: "Dashboard" },
    ]
  },
  {
    label: "Pôle Académique",
    icon: "fa-graduation-cap",
    items: [
      { to: "/admin/modules", icon: "fa-cubes", label: "Gestion des Modules" },
      { to: "/admin/grades", icon: "fa-pen-ruler", label: "Notes & Rapports" },
      { to: "/admin/reports", icon: "fa-chart-line", label: "Rapports" },
      { to: "/admin/schedules", icon: "fa-calendar-days", label: "Emplois du Temps" },
    ]
  },
  {
    label: "Suivi de Présence",
    icon: "fa-user-clock",
    items: [
      { to: "/admin/attendance-students", icon: "fa-user-clock", label: "Absences Stagiaires" },
      { to: "/admin/attendance-teachers", icon: "fa-calendar-check", label: "Présences Formateurs" },
    ]
  },
  {
    label: "Administration",
    icon: "fa-gear",
    items: [
      { to: "/admin/students", icon: "fa-users", label: "Stagiaires" },
      { to: "/admin/teachers", icon: "fa-chalkboard-user", label: "Formateurs" },
      { to: "/admin/finance", icon: "fa-wallet", label: "Finance" },
    ]
  }
];`
);

// Replace the sidebar nav rendering for desktop
dl = dl.replace(
  /<nav style=\{\{ flex: 1, padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' \}\} className="no-scrollbar">\s*\{NAV_LINKS\.map\(item => renderNavLink\(item\)\)\}\s*<\/nav>/,
  `<nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }} className="no-scrollbar">
          {NAV_CATEGORIES.map((cat, ci) => (
            <SidebarCategory key={ci} cat={cat} isSidebarOpen={isSidebarOpen} renderNavLink={renderNavLink} location={location} />
          ))}
        </nav>`
);

// Replace the mobile nav rendering
dl = dl.replace(
  /<nav style=\{\{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' \}\}>\s*\{NAV_LINKS\.map\(item => renderNavLink\(item, true\)\)\}\s*<\/nav>/,
  `<nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
              {NAV_CATEGORIES.map((cat, ci) => (
                <SidebarCategory key={ci} cat={cat} isSidebarOpen={true} renderNavLink={(item) => renderNavLink(item, true)} location={location} isMobile={true} />
              ))}
            </nav>`
);

// Add SidebarCategory component before the export default function
dl = dl.replace(
  /export default function DashboardLayout/,
  `const SidebarCategory = ({ cat, isSidebarOpen, renderNavLink, location, isMobile }) => {
  // Dashboard has only 1 item, render directly
  if (cat.items.length === 1) {
    return renderNavLink(cat.items[0]);
  }
  
  const isAnyActive = cat.items.some(item => location.pathname === item.to);
  const [open, setOpen] = React.useState(isAnyActive);
  
  // Auto-open if navigating to a child
  React.useEffect(() => {
    if (isAnyActive) setOpen(true);
  }, [isAnyActive]);

  if (!isSidebarOpen && !isMobile) {
    // Collapsed: show only icons
    return cat.items.map(item => renderNavLink(item));
  }

  return (
    <div style={{ marginBottom: '4px' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 16px',
          borderRadius: 'var(--radius-lg)',
          fontSize: '11px',
          fontWeight: '800',
          color: isAnyActive ? 'var(--primary)' : 'var(--text-muted)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          transition: 'all 0.2s',
        }}
      >
        <i className={\`fa-solid \${cat.icon}\`} style={{ fontSize: '11px', width: '16px', textAlign: 'center' }}></i>
        <span style={{ flex: 1, textAlign: 'left' }}>{cat.label}</span>
        <i className={\`fa-solid fa-chevron-\${open ? 'up' : 'down'}\`} style={{ fontSize: '9px', opacity: 0.5 }}></i>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden', paddingLeft: '8px' }}
          >
            {cat.items.map(item => renderNavLink(item))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function DashboardLayout`
);

fs.writeFileSync(path.join(__dirname, 'src/layouts/DashboardLayout.jsx'), dl);
console.log('✅ DashboardLayout.jsx fixed');
console.log('Done!');
