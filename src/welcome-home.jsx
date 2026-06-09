/* Veraglo ERP — post-login module home (bright sunlight workspace). */
(function (VG) {
  const { useState, useMemo, useEffect } = React;
  const { Icon } = VG.ui;
  const store = VG.store;
  const LOGO = "assets/veraglo-logo.png";

  function moduleHomeRank(id, homeOrder) {
    const idx = (homeOrder || []).indexOf(id);
    return idx >= 0 ? idx : 999;
  }

  function sortModulesForHome(mods, prefs) {
    const homeOrder = VG.MODULE_HOME_ORDER || [];
    const customOrder = prefs.moduleOrder || [];
    return mods.slice().sort((a, b) => {
      const ac = customOrder.indexOf(a.id);
      const bc = customOrder.indexOf(b.id);
      if (ac >= 0 && bc >= 0) return ac - bc;
      if (ac >= 0) return -1;
      if (bc >= 0) return 1;
      return moduleHomeRank(a.id, homeOrder) - moduleHomeRank(b.id, homeOrder);
    });
  }

  function ModuleHomeCard({ mod, onOpen, i, pinned, onTogglePin, highlight }) {
    return (
      <button
        type="button"
        onClick={() => onOpen(mod.id)}
        className={
          "group relative w-full h-full text-center rounded-2xl p-4 flex flex-col items-center justify-start transition-all duration-250 "
          + "hover:-translate-y-1 active:scale-[0.99] animate-fade-up overflow-hidden vg-home-module-card vg-home-sun-card "
          + (highlight ? "vg-home-sun-card--highlight" : "")
          + (pinned ? " vg-home-sun-card--pinned" : "")
        }
        style={{ animationDelay: Math.min(i, 14) * 30 + "ms", "--mod-accent": mod.accent, minHeight: "152px", maxHeight: "168px" }}
      >
        <div className="vg-home-sun-card-shine absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        {onTogglePin && (
          <span
            role="button"
            tabIndex={0}
            title={pinned ? "Remove from favorites" : "Add to favorites"}
            onClick={(e) => { e.stopPropagation(); onTogglePin(mod.id); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onTogglePin(mod.id); } }}
            className={
              "absolute top-2.5 right-2.5 p-1.5 rounded-lg transition z-10 "
              + (pinned ? "text-amber-500 bg-amber-50" : "text-slate-400 hover:text-amber-500 hover:bg-amber-50/80")
            }
          >
            <Icon name="star" size={14} />
          </span>
        )}
        <span
          className="relative grid place-items-center w-12 h-12 rounded-xl text-white shadow-md shrink-0 mt-1 mb-2.5 transition-transform group-hover:scale-105"
          style={{ background: mod.accent, boxShadow: "0 8px 20px color-mix(in srgb, " + mod.accent + " 35%, transparent)" }}
        >
          <Icon name={mod.icon} size={22} />
        </span>
        <div className="relative font-display font-semibold text-sm leading-snug text-slate-800 line-clamp-2 px-1 w-full">{mod.name}</div>
        {(mod.tagline || mod.category) && (
          <div className="relative mt-1 text-[11px] text-slate-500 leading-snug line-clamp-2 px-1 w-full">{mod.tagline || mod.category}</div>
        )}
      </button>
    );
  }

  function WelcomeHome({ roleKey, email, onOpen, onLogout, theme, setTheme, onOpenSearch }) {
    const dbTick = VG.useDB();
    const role = VG.ROLES[roleKey] || {};
    const company = store.company();
    const mods = VG.modulesForRole(roleKey);
    const prefs = store.dashboardPrefs(roleKey);
    const pinnedSet = useMemo(() => new Set(prefs.pinnedModules || []), [prefs.pinnedModules, roleKey]);
    const [query, setQuery] = useState("");
    const [entered, setEntered] = useState(false);

    useEffect(() => {
      const t = setTimeout(() => setEntered(true), 40);
      return () => clearTimeout(t);
    }, []);

    function togglePin(id) {
      const cur = prefs.pinnedModules || [];
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : cur.concat(id);
      store.saveDashboardPrefs(roleKey, { pinnedModules: next }, roleKey);
      VG.toast(next.includes(id) ? "Added to favorites" : "Removed from favorites");
    }

    const sortedMods = useMemo(() => sortModulesForHome(mods, prefs), [mods, prefs.moduleOrder, dbTick]);
    const modById = useMemo(() => {
      const map = {};
      mods.forEach((m) => { map[m.id] = m; });
      return map;
    }, [mods.length]);

    const filteredMods = useMemo(() => {
      const q = query.trim().toLowerCase();
      if (!q) return sortedMods;
      return sortedMods.filter((m) =>
        (m.name + " " + m.tagline + " " + m.category + " " + m.id).toLowerCase().includes(q)
      );
    }, [sortedMods, query]);

    const gridMods = useMemo(() => {
      if (query.trim()) return filteredMods;
      const pinned = filteredMods.filter((m) => pinnedSet.has(m.id));
      const rest = filteredMods.filter((m) => !pinnedSet.has(m.id));
      return pinned.concat(rest);
    }, [filteredMods, pinnedSet, query]);

    const recentMods = useMemo(() => {
      return (prefs.recentModules || [])
        .map((id) => modById[id])
        .filter(Boolean)
        .filter((m) => !query.trim() || filteredMods.some((x) => x.id === m.id))
        .slice(0, 5);
    }, [prefs.recentModules, modById, filteredMods, query]);

    const lastMod = prefs.lastModuleId && modById[prefs.lastModuleId] ? modById[prefs.lastModuleId] : null;
    const displayName = (email || "").split("@")[0].replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const pinnedCount = gridMods.filter((m) => pinnedSet.has(m.id)).length;

    return (
      <div className={"relative min-h-screen overflow-x-hidden vg-module-home vg-module-home-sunlight text-slate-800 " + (entered ? "vg-welcome-in" : "opacity-0")}>
        <div className="vg-sunlight-bg fixed inset-0" aria-hidden="true" />
        <div className="vg-sunlight-rays fixed inset-0 pointer-events-none" aria-hidden="true" />
        <div className="vg-sunlight-glow fixed inset-0 pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 min-h-screen flex flex-col">
          <header className="vg-sun-header shrink-0 flex items-center justify-between gap-3 px-4 sm:px-8 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <img src={company.logo || LOGO} alt="" className="h-8 w-auto shrink-0" />
              <div className="min-w-0 hidden sm:block">
                <div className="font-display font-semibold text-sm truncate text-slate-800">{company.tradeName || company.name || "Veraglo ERP"}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Connected workspace</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={onOpenSearch} className="vg-sun-chip hidden sm:flex items-center gap-2 rounded-xl px-3 py-2 text-xs">
                <Icon name="search" size={15} className="text-slate-500" />
                <span className="text-slate-600">Search ERP</span>
                <kbd className="text-slate-400 text-[10px]">⌘K</kbd>
              </button>
              <button type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="vg-sun-chip rounded-xl p-2" title="Toggle theme for modules">
                <Icon name={theme === "dark" ? "sun" : "moon"} size={17} className="text-slate-600" />
              </button>
              <button type="button" onClick={onLogout} className="vg-sun-chip rounded-xl p-2" title="Sign out">
                <Icon name="logout" size={17} className="text-slate-600" />
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 sm:py-7">
            <div className="max-w-[1440px] mx-auto space-y-6">
              <section className="vg-sun-welcome animate-fade-up">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-700/80 mb-1">Your ERP dashboard</p>
                    <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 leading-tight">
                      {VG.greeting()}, {displayName}
                    </h1>
                    <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl">
                      Welcome to your connected ERP workspace.
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {role.label} · {mods.length} module{mods.length === 1 ? "" : "s"} ready for you
                    </p>
                  </div>
                  {lastMod && !query && (
                    <button
                      type="button"
                      onClick={() => onOpen(lastMod.id)}
                      className="vg-sun-cta inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg transition"
                    >
                      <Icon name={lastMod.icon} size={16} />
                      Continue {lastMod.name}
                    </button>
                  )}
                </div>
              </section>

              {mods.length > 5 && (
                <div className="relative max-w-md">
                  <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Filter modules…"
                    className="w-full rounded-xl pl-10 pr-3 py-2.5 text-sm vg-sun-input"
                  />
                </div>
              )}

              {recentMods.length > 0 && !query && (
                <section>
                  <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-2">
                    <Icon name="clock" size={13} /> Recently used
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {recentMods.map((m) => (
                      <button
                        key={"recent-" + m.id}
                        type="button"
                        onClick={() => onOpen(m.id)}
                        className="vg-sun-chip inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm hover:shadow-md transition"
                      >
                        <span className="w-7 h-7 rounded-lg grid place-items-center text-white shrink-0" style={{ background: m.accent }}>
                          <Icon name={m.icon} size={14} />
                        </span>
                        <span className="font-medium text-slate-700">{m.name}</span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {query ? `Results (${gridMods.length})` : "Modules"}
                  </h2>
                  {!query && pinnedCount > 0 && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Icon name="star" size={11} className="text-amber-500" /> {pinnedCount} favorite{pinnedCount === 1 ? "" : "s"} shown first
                    </span>
                  )}
                </div>
                {gridMods.length === 0 ? (
                  <div className="vg-sun-empty rounded-2xl px-6 py-12 text-center text-sm text-slate-500">
                    No modules match your search.
                  </div>
                ) : (
                  <div
                    className="vg-home-module-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 w-full"
                    style={{ display: "grid" }}
                    data-layout="home-grid-sunlight"
                  >
                    {gridMods.map((m, i) => (
                      <ModuleHomeCard
                        key={m.id}
                        mod={m}
                        onOpen={onOpen}
                        i={i}
                        pinned={pinnedSet.has(m.id)}
                        onTogglePin={togglePin}
                        highlight={!query && m.id === prefs.lastModuleId}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          </main>
        </div>
      </div>
    );
  }

  VG.WelcomeHome = WelcomeHome;
  VG.sortModulesForHome = sortModulesForHome;
})(window.VG);
