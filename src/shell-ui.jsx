/* Veraglo ERP — global shell: module banners, dropdown nav, theme helpers. */
(function (VG) {
  const { useState, useEffect, useRef, useMemo } = React;
  const { Icon } = VG.ui;

  VG.MODULE_BANNER_IMG = {
    sales: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1400&q=75&auto=format&fit=crop",
    enquiry: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1400&q=75&auto=format&fit=crop",
    inventory: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1400&q=75&auto=format&fit=crop",
    purchase: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&q=75&auto=format&fit=crop",
    supplier: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=1400&q=75&auto=format&fit=crop",
    production: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1400&q=75&auto=format&fit=crop",
    quality: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1400&q=75&auto=format&fit=crop",
    hr: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400&q=75&auto=format&fit=crop",
    attendance: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=75&auto=format&fit=crop",
    dispatch: "https://images.unsplash.com/photo-1601584111127-372b9b68d90b?w=1400&q=75&auto=format&fit=crop",
    accounts: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1400&q=75&auto=format&fit=crop",
    reports: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&q=75&auto=format&fit=crop",
    admin: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1400&q=75&auto=format&fit=crop",
    documents: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1400&q=75&auto=format&fit=crop",
    support: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1400&q=75&auto=format&fit=crop",
  };

  function buildGroups(sections) {
    const rest = sections.filter((s) => s.id !== "dashboard");
    const groups = [];
    rest.forEach((s) => {
      const gname = s.group || "More";
      let g = groups.find((x) => x.name === gname);
      if (!g) { g = { name: gname, items: [] }; groups.push(g); }
      g.items.push(s);
    });
    return groups;
  }

  function ModuleNav({ sections, section, setSection, mod }) {
    const accent = mod?.accent || "#6366f1";
    const dash = sections.find((s) => s.id === "dashboard");
    const groups = useMemo(() => buildGroups(sections), [sections]);
    const current = sections.find((s) => s.id === section);
    const [openGroup, setOpenGroup] = useState(null);
    const [q, setQ] = useState("");
    const navRef = useRef(null);
    const tabStyle = { "--tab-accent": accent };

    useEffect(() => {
      document.documentElement.style.setProperty("--accent", accent);
    }, [accent]);

    useEffect(() => {
      if (!openGroup) return;
      const onDoc = (e) => { if (navRef.current && !navRef.current.contains(e.target)) { setOpenGroup(null); setQ(""); } };
      const onKey = (e) => { if (e.key === "Escape") { setOpenGroup(null); setQ(""); } };
      document.addEventListener("mousedown", onDoc);
      document.addEventListener("keydown", onKey);
      return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
    }, [openGroup]);

    function pick(id) {
      setSection(id);
      setOpenGroup(null);
      setQ("");
    }

    const openItems = groups.find((g) => g.name === openGroup)?.items || [];
    const filtered = q.trim()
      ? openItems.filter((s) => (s.label + " " + s.id).toLowerCase().includes(q.toLowerCase()))
      : openItems;

    return (
      <nav ref={navRef} className="vg-module-nav vg-workspace-inset sticky top-0 z-30 mb-3 rounded-lg vg-panel p-2 sm:p-3" style={tabStyle}>
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {dash && (
            <button type="button" onClick={() => pick("dashboard")}
              className={"vg-tab vg-tab-dash shrink-0 " + (section === "dashboard" ? "is-active" : "")} style={tabStyle}>
              <Icon name="chart" size={15} />
              <span>Dashboard</span>
            </button>
          )}
          {groups.map((g) => {
            const activeInGroup = g.items.some((x) => x.id === section);
            const single = g.items.length === 1;
            return (
              <div key={g.name} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (single) pick(g.items[0].id);
                    else setOpenGroup(openGroup === g.name ? null : g.name);
                  }}
                  className={"vg-tab-group flex items-center gap-1.5 " + (activeInGroup || openGroup === g.name ? "is-active" : "")}
                  style={(activeInGroup || openGroup === g.name) ? tabStyle : undefined}
                  aria-expanded={openGroup === g.name}
                >
                  {g.name}
                  {!single && <Icon name="chevron" size={13} className={openGroup === g.name ? "rotate-180" : ""} />}
                </button>
                {openGroup === g.name && !single && (
                  <div className="vg-dropdown-menu animate-fade-up" role="menu">
                    {g.items.length > 6 && (
                      <div className="p-2 border-b border-white/10">
                        <div className="relative">
                          <Icon name="search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50" />
                          <input
                            type="search"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search pages…"
                            className="vg-input w-full rounded-lg pl-8 pr-2 py-2 text-sm"
                            autoFocus
                          />
                        </div>
                      </div>
                    )}
                    <ul className="max-h-64 overflow-y-auto py-1">
                      {filtered.length === 0 ? (
                        <li className="px-3 py-2 text-xs opacity-50">No matches</li>
                      ) : filtered.map((s) => (
                        <li key={s.id}>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => pick(s.id)}
                            className={"vg-dropdown-item w-full " + (s.id === section ? "is-active" : "")}
                          >
                            <Icon name={s.icon || "grid"} size={15} />
                            <span>{s.label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {section !== "dashboard" && current && (
          <div className="mt-2 pt-2 border-t border-white/5 flex flex-wrap gap-1.5">
            {groups.find((g) => g.items.some((x) => x.id === section))?.items.map((s) => (
              <button key={s.id} type="button" onClick={() => pick(s.id)}
                className={"vg-tab shrink-0 text-xs " + (s.id === section ? "is-active" : "")}
                style={s.id === section ? tabStyle : undefined}>
                <Icon name={s.icon} size={13} />
                {s.label}
              </button>
            ))}
          </div>
        )}
      </nav>
    );
  }

  VG.ModuleNav = ModuleNav;
})(window.VG);
