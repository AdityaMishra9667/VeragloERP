/* Veraglo ERP — post-login welcome workspace (vibrant, readable module cards). */
(function (VG) {
  const { useState, useMemo, useEffect } = React;
  const { Icon, Pill, useClock } = VG.ui;
  const store = VG.store;
  const HERO = "assets/happy-employees.png";
  const LOGO = "assets/veraglo-logo.png";

  function ModuleQuickCard({ mod, onOpen, i, pinned, onTogglePin, suggested }) {
    return (
      <button
        type="button"
        onClick={() => onOpen(mod.id)}
        className="group relative text-left rounded-2xl p-5 sm:p-6 min-h-[148px] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl active:scale-[0.98] animate-fade-up overflow-hidden vg-module-card"
        style={{ animationDelay: i * 40 + "ms", "--mod-accent": mod.accent }}
      >
        <div className="vg-quick-card-glow" />
        <div className="relative flex items-start justify-between gap-3">
          <span className="grid place-items-center w-14 h-14 rounded-2xl text-white shadow-lg transition-transform group-hover:scale-105 shrink-0" style={{ background: mod.accent }}>
            <Icon name={mod.icon} size={26} />
          </span>
          {onTogglePin && (
            <span
              role="button"
              tabIndex={0}
              title={pinned ? "Unpin" : "Pin"}
              onClick={(e) => { e.stopPropagation(); onTogglePin(mod.id); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onTogglePin(mod.id); } }}
              className={"p-2 rounded-xl transition " + (pinned ? "text-amber-400 bg-amber-400/10" : "opacity-40 hover:opacity-100 chrome-hover")}
            >
              <Icon name="star" size={16} />
            </span>
          )}
        </div>
        <div className="relative mt-4 flex-1">
          <div className="font-display font-semibold text-base sm:text-lg leading-snug text-balance break-words">{mod.name}</div>
          <div className="mt-1.5 text-sm opacity-65 leading-relaxed">{mod.tagline || mod.category}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill color={mod.accent}>{mod.category}</Pill>
            {suggested && <Pill color="#fbbf24">Suggested</Pill>}
          </div>
        </div>
        <div className="relative mt-3 flex items-center gap-1 text-xs font-medium opacity-50 group-hover:opacity-90 transition">
          Open module <Icon name="chevronRight" size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </button>
    );
  }

  function WelcomeHome({ roleKey, email, onOpen, onLogout, theme, setTheme, onOpenSearch }) {
    const dbTick = VG.useDB();
    const role = VG.ROLES[roleKey] || {};
    const company = store.company();
    const now = useClock();
    const mods = VG.modulesForRole(roleKey);
    const prefs = store.dashboardPrefs(roleKey);
    const pinnedSet = useMemo(() => new Set(prefs.pinnedModules || []), [prefs.pinnedModules, roleKey]);
    const allowed = useMemo(() => new Set(mods.map((m) => m.id)), [mods.length]);
    const tasks = useMemo(
      () => (store.openTasks ? store.openTasks() : []).filter((t) => allowed.has(t.module)).slice(0, 8),
      [allowed, dbTick]
    );
    const taskTotal = tasks.reduce((s, t) => s + t.count, 0);
    const [entered, setEntered] = useState(false);

    useEffect(() => {
      const t = setTimeout(() => setEntered(true), 50);
      return () => clearTimeout(t);
    }, []);

    function togglePin(id) {
      const cur = prefs.pinnedModules || [];
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : cur.concat(id);
      store.saveDashboardPrefs(roleKey, { pinnedModules: next }, roleKey);
      VG.toast(next.includes(id) ? "Pinned" : "Unpinned");
    }

    const displayName = (email || "").split("@")[0].replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const suggestedId = role.home && allowed.has(role.home) ? role.home : null;
    const pinnedMods = mods.filter((m) => pinnedSet.has(m.id));
    const otherMods = mods.filter((m) => !pinnedSet.has(m.id));

    return (
      <div className={"relative min-h-screen overflow-x-hidden text-slate-100 " + (entered ? "vg-welcome-in" : "opacity-0")}>
        <div className="fixed inset-0 vg-welcome-bg" />
        <img src={HERO} alt="" className="fixed inset-0 w-full h-full object-cover opacity-[0.18]" />
        <div className="fixed inset-0 bg-gradient-to-br from-indigo-950/95 via-slate-950/92 to-cyan-950/88" />

        <div className="relative z-10 min-h-screen flex flex-col">
          <header className="shrink-0 flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/10 backdrop-blur-md bg-black/20">
            <div className="flex items-center gap-3 min-w-0">
              <img src={company.logo || LOGO} alt="" className="h-9 w-auto shrink-0" />
              <div className="min-w-0 hidden sm:block">
                <div className="font-display font-semibold text-base truncate">{company.tradeName || company.name || "Veraglo"}</div>
                <div className="text-[11px] opacity-55 uppercase tracking-wider">Enterprise workspace</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={onOpenSearch} className="hidden sm:flex items-center gap-2 glass rounded-xl px-3 py-2.5 text-sm opacity-90 hover:opacity-100">
                <Icon name="search" size={16} />
                <span>Search</span>
                <kbd className="opacity-40 text-xs">⌘K</kbd>
              </button>
              <button type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="glass rounded-xl p-2.5 hover:bg-white/10" title="Toggle theme">
                <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
              </button>
              <button type="button" onClick={onLogout} className="glass rounded-xl p-2.5 hover:bg-white/10" title="Sign out">
                <Icon name="logout" size={18} />
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-8">
            <div className="max-w-7xl mx-auto space-y-8">
              <section className="rounded-2xl p-6 sm:p-8 vg-welcome-hero animate-fade-up">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Pill color="#a5b4fc">{role.tag || "Workspace"}</Pill>
                    <h1 className="mt-3 text-3xl sm:text-4xl font-display font-bold text-white text-balance">
                      {VG.greeting()}, {displayName}
                    </h1>
                    <p className="mt-2 text-base text-white/75">
                      Signed in as <b className="text-white">{role.label}</b> · {email}
                    </p>
                  </div>
                  <div className="glass rounded-xl px-5 py-4 text-right shrink-0">
                    <div className="text-[11px] uppercase tracking-wider opacity-55">Now</div>
                    <div className="text-2xl font-display font-semibold tabular-nums">{now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
                    <div className="text-sm opacity-70 mt-0.5">{now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}</div>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  {[
                    { label: "Modules", value: mods.length, icon: "grid" },
                    { label: "Pending tasks", value: taskTotal, icon: "check", warn: taskTotal > 0 },
                    { label: "Role", value: role.label, icon: "shield" },
                  ].map((k) => (
                    <div key={k.label} className="glass rounded-xl px-4 py-3 flex items-center gap-3 min-w-[120px]">
                      <Icon name={k.icon} size={18} className={k.warn ? "text-amber-400" : "opacity-65"} />
                      <div>
                        <div className="text-[11px] uppercase opacity-50">{k.label}</div>
                        <div className="font-semibold text-base" style={k.warn ? { color: "#fbbf24" } : undefined}>{k.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="grid lg:grid-cols-12 gap-6">
                <section className="lg:col-span-8 space-y-6">
                  <div>
                    <h2 className="text-lg font-display font-semibold mb-1">Your modules</h2>
                    <p className="text-sm opacity-60">Select a module to open — full names shown, no clipping</p>
                  </div>
                  {pinnedMods.length > 0 && (
                    <div>
                      <div className="text-xs uppercase tracking-wider opacity-50 mb-3 flex items-center gap-2">
                        <Icon name="star" size={14} className="text-amber-400" /> Pinned modules
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {pinnedMods.map((m, i) => (
                          <ModuleQuickCard key={m.id} mod={m} onOpen={onOpen} i={i} pinned onTogglePin={togglePin} suggested={m.id === suggestedId} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {otherMods.map((m, i) => (
                      <ModuleQuickCard key={m.id} mod={m} onOpen={onOpen} i={i} pinned={pinnedSet.has(m.id)} onTogglePin={togglePin} suggested={m.id === suggestedId} />
                    ))}
                  </div>
                </section>

                <section className="lg:col-span-4 rounded-2xl glass-dark p-5 h-fit animate-fade-up" style={{ animationDelay: "80ms" }}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold flex items-center gap-2">
                      <Icon name="bell" size={18} /> Notifications
                    </h2>
                    {taskTotal > 0 && <Pill color="#f87171">{taskTotal}</Pill>}
                  </div>
                  <ul className="space-y-2 max-h-[420px] overflow-y-auto no-scrollbar">
                    {tasks.length === 0 ? (
                      <li className="text-sm opacity-50 py-8 text-center">All caught up</li>
                    ) : tasks.map((t, i) => (
                      <li key={i}>
                        <button type="button" onClick={() => VG.goTo(t.module, t.section)}
                          className="w-full flex items-center gap-3 text-left text-sm rounded-xl p-3 vg-notif-row transition">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: t.tone }} />
                          <span className="flex-1 min-w-0 leading-snug">{t.label}</span>
                          <Pill color={t.tone}>{t.count}</Pill>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  VG.WelcomeHome = WelcomeHome;
})(window.VG);
