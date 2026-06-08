/* Veraglo ERP — unified premium module dashboard + section navigation. */
(function (VG) {
  const { useState, useMemo, useEffect, useRef } = React;
  const { Icon, Button, Pill, Card, Sparkline, SectionTitle } = VG.ui;
  const store = VG.store;
  const inr = VG.fmt.inr;
  const today = VG.fmt.todayISO;

  const STOCK_HEALTH = {
    ok: { label: "In stock", color: "#34d399" },
    low: { label: "Low stock", color: "#f59e0b" },
    critical: { label: "Critical", color: "#f87171" },
    over: { label: "Overstock", color: "#a78bfa" },
  };

  function stockHealth(item) {
    const qty = Number(item.qty) || 0;
    const reorder = Number(item.reorder) || 0;
    const min = Number(item.minStock) || 0;
    if (qty <= 0) return "critical";
    if (qty < min) return "critical";
    if (qty < reorder) return "low";
    if (reorder > 0 && qty > reorder * 3) return "over";
    return "ok";
  }

  function moduleDashPrefs(roleKey, modId) {
    const all = store.dashboardPrefs(roleKey);
    const per = (all.moduleDashboard && all.moduleDashboard[modId]) || {};
    return {
      tab: per.tab || "overview",
      hiddenPanels: per.hiddenPanels || [],
      collapsed: per.collapsed || {},
    };
  }

  function saveModuleDashPrefs(roleKey, modId, patch) {
    const all = store.dashboardPrefs(roleKey);
    const md = { ...(all.moduleDashboard || {}) };
    md[modId] = { ...(md[modId] || {}), ...patch };
    store.saveDashboardPrefs(roleKey, { moduleDashboard: md }, roleKey);
  }

  function KpiTile({ kpi, onClick, delay }) {
    return (
      <button type="button" onClick={onClick} disabled={!onClick} className="text-left w-full group">
        <Card className="p-5 h-full transition-all duration-200 group-hover:shadow-glow group-disabled:opacity-90 animate-fade-up" style={{ animationDelay: (delay || 0) + "ms" }}>
          <div className="flex items-start justify-between gap-3">
            <span className="grid place-items-center w-11 h-11 rounded-2xl shrink-0 text-white shadow" style={{ background: kpi.color || "var(--accent)" }}>
              <Icon name={kpi.icon || "chart"} size={20} />
            </span>
            {kpi.badge != null && <Pill color={kpi.badgeColor || "#f59e0b"}>{kpi.badge}</Pill>}
          </div>
          <div className="mt-4 text-3xl sm:text-4xl font-display font-bold tracking-tight">{kpi.value}</div>
          <div className="mt-1 text-sm font-medium opacity-90">{kpi.label}</div>
          {kpi.hint && <div className="mt-1 text-[11px] opacity-50">{kpi.hint}</div>}
        </Card>
      </button>
    );
  }

  function QuickActionsBar({ actions, can }) {
    if (!actions || !actions.length) return null;
    return (
      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Quick actions</h3>
          <span className="text-[11px] opacity-45">One click to common tasks</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {actions.map((a) => (
            <button key={a.label} type="button" disabled={a.perm && !can(a.perm)} onClick={a.onClick}
              className={"inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition " + (a.primary ? "text-white shadow" : "glass chrome-hover") + (a.perm && !can(a.perm) ? " opacity-40 cursor-not-allowed" : "")}
              style={a.primary ? { background: "var(--accent)" } : undefined}>
              <Icon name={a.icon || "plus"} size={16} />
              {a.label}
            </button>
          ))}
        </div>
      </Card>
    );
  }

  function Panel({ id, title, icon, action, children, collapsed, onToggle, hidden }) {
    if (hidden) return null;
    return (
      <Card className="overflow-hidden">
        <button type="button" onClick={onToggle} className="w-full flex items-center gap-3 p-4 sm:p-5 text-left chrome-hover transition">
          <span className="grid place-items-center w-9 h-9 rounded-xl shrink-0" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
            <Icon name={icon || "grid"} size={17} />
          </span>
          <span className="flex-1 font-semibold text-sm">{title}</span>
          {action}
          <Icon name={collapsed ? "chevron" : "chevron"} size={16} className={"opacity-50 transition-transform " + (collapsed ? "" : "rotate-180")} />
        </button>
        {!collapsed && <div className="px-4 sm:px-5 pb-5 pt-0 border-t border-white/5">{children}</div>}
      </Card>
    );
  }

  function EmptyState({ icon, title, desc }) {
    return (
      <div className="text-center py-10 px-4">
        <Icon name={icon || "inbox"} size={40} className="mx-auto opacity-25 mb-3" />
        <div className="text-sm font-medium opacity-70">{title}</div>
        {desc && <div className="text-xs opacity-45 mt-1 max-w-sm mx-auto">{desc}</div>}
      </div>
    );
  }

  function TaskPanel({ tasks, go }) {
    if (!tasks || !tasks.length) {
      return <EmptyState icon="check" title="No pending tasks" desc="You're up to date for this module." />;
    }
    return (
      <ul className="space-y-2">
        {tasks.map((t, i) => (
          <li key={i}>
            <button type="button" onClick={() => go && go(t.section)} className="w-full flex items-center gap-3 text-sm glass rounded-xl p-3 text-left chrome-hover transition">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: t.tone || "var(--accent)" }} />
              <span className="flex-1 min-w-0">{t.label}</span>
              <Pill color={t.tone || "var(--accent)"}>{t.count}</Pill>
            </button>
          </li>
        ))}
      </ul>
    );
  }

  function ActivityTimeline({ rows }) {
    if (!rows || !rows.length) return <EmptyState icon="activity" title="No recent activity" />;
    return (
      <ul className="space-y-3">
        {rows.map((a) => (
          <li key={a.id} className="flex gap-3 text-sm">
            <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ background: "var(--accent)" }} />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Pill color="var(--accent)">{a.action}</Pill>
                <span className="opacity-80 truncate">{a.summary}</span>
              </div>
              <div className="text-[11px] opacity-45 mt-0.5">{a.time}</div>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  function StockHealthGrid({ items, go, can }) {
    const [q, setQ] = useState("");
    const [loc, setLoc] = useState("");
    const [cat, setCat] = useState("");
    const ql = q.toLowerCase();
    const filtered = useMemo(() => {
      let list = items || [];
      if (cat) list = list.filter((i) => i.categoryId === cat);
      if (loc) list = list.filter((i) => i.locationId === loc);
      if (ql) list = list.filter((i) => (i.sku + " " + i.name).toLowerCase().includes(ql));
      return list.slice(0, 12);
    }, [items, cat, loc, ql]);

    const counts = useMemo(() => {
      const c = { ok: 0, low: 0, critical: 0, over: 0 };
      (items || []).forEach((it) => { c[stockHealth(it)] = (c[stockHealth(it)] || 0) + 1; });
      return c;
    }, [items]);

    const categories = store.list("categories");
    const locations = store.list("locations");

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.keys(STOCK_HEALTH).map((k) => (
            <div key={k} className="rounded-xl glass p-3 text-center">
              <div className="text-2xl font-display font-bold" style={{ color: STOCK_HEALTH[k].color }}>{counts[k] || 0}</div>
              <div className="text-[11px] opacity-55 mt-0.5">{STOCK_HEALTH[k].label}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[140px]">
            <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-45" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search SKU or item…" className="w-full rounded-xl glass pl-9 pr-3 py-2 text-sm bg-transparent outline-none" />
          </div>
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-xl glass px-3 py-2 text-sm bg-transparent outline-none max-w-[160px]">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={loc} onChange={(e) => setLoc(e.target.value)} className="rounded-xl glass px-3 py-2 text-sm bg-transparent outline-none max-w-[160px]">
            <option value="">All locations</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon="box" title="No items match filters" />
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((it) => {
              const h = stockHealth(it);
              const meta = STOCK_HEALTH[h];
              const pct = it.reorder > 0 ? Math.min(100, Math.round((it.qty / it.reorder) * 100)) : 100;
              return (
                <div key={it.id} className="rounded-xl glass p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="font-mono text-[11px] opacity-55">{it.sku}</div>
                      <div className="text-sm font-medium truncate">{it.name}</div>
                    </div>
                    <Pill color={meta.color}>{meta.label}</Pill>
                  </div>
                  <div className="flex items-baseline justify-between text-xs mb-2">
                    <span>On hand <b className="text-base">{it.qty}</b></span>
                    <span className="opacity-50">Reorder {it.reorder}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: pct + "%", background: meta.color }} />
                  </div>
                  {go && (
                    <button type="button" onClick={() => go("ledger")} className="mt-3 text-[11px] font-medium opacity-60 hover:opacity-100" style={{ color: "var(--accent)" }}>
                      View ledger →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  function InsightCards({ insights }) {
    if (!insights || !insights.length) return <EmptyState icon="chart" title="No insights yet" desc="Insights appear as you record transactions." />;
    return (
      <div className="grid sm:grid-cols-2 gap-3">
        {insights.map((ins, i) => (
          <div key={i} className="rounded-xl glass p-4 flex gap-3">
            <span className="grid place-items-center w-10 h-10 rounded-xl shrink-0 text-white" style={{ background: ins.color || "var(--accent)" }}>
              <Icon name={ins.icon || "sparkle"} size={18} />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold">{ins.title}</div>
              <div className="text-xs opacity-55 mt-0.5">{ins.desc}</div>
              {ins.value != null && <div className="text-lg font-display font-bold mt-2">{ins.value}</div>}
            </div>
          </div>
        ))}
      </div>
    );
  }

  function SuggestedActions({ items, go }) {
    if (!items || !items.length) return null;
    return (
      <Card className="p-4 border border-dashed border-white/10" style={{ background: "var(--accent-soft)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Icon name="sparkle" size={16} style={{ color: "var(--accent)" }} />
          <h3 className="text-sm font-semibold">Suggested next steps</h3>
        </div>
        <ul className="space-y-2">
          {items.map((s, i) => (
            <li key={i}>
              <button type="button" onClick={() => s.onClick ? s.onClick() : go && go(s.section)} className="w-full text-left text-sm rounded-lg px-3 py-2 glass chrome-hover">
                {s.text}
              </button>
            </li>
          ))}
        </ul>
      </Card>
    );
  }

  /* ----- Per-module data builders ----- */
  const auditRows = (entities, limit) => store.list("auditLog")
    .filter((a) => entities.includes(a.entity))
    .slice(-(limit || 8))
    .reverse()
    .map((a) => ({
      id: a.id,
      action: a.action,
      summary: a.summary,
      time: new Date(a.ts).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
    }));

  VG.dashboardBuilders = {
    inventory(ctx) {
      const { go, can, roleKey } = ctx;
      const summary = store.stockSummary();
      const low = summary.filter((s) => s.reorderNeeded);
      const value = summary.reduce((s, x) => s + x.value, 0);
      const pendingReturns = store.list("materialIssues").filter((m) => m.pendingReturn);
      const tasks = store.tasksFor("inventory");
      return {
        title: "Inventory Dashboard",
        subtitle: "Stock position, movements and reorder control",
        opsTabLabel: "Stock",
        opsTabIcon: "box",
        quickActions: [
          { label: "New item", icon: "plus", primary: true, perm: "add", onClick: () => go("items") },
          { label: "Material receipt", icon: "download", perm: "add", onClick: () => go("receipt") },
          { label: "Material issue", icon: "logout", perm: "add", onClick: () => go("issue") },
          { label: "Stock ledger", icon: "activity", onClick: () => go("ledger") },
          { label: "Reorder alerts", icon: "alert", onClick: () => go("alerts") },
        ],
        kpis: [
          { label: "Total SKUs", value: summary.length, icon: "box", color: "#059669", go: "items" },
          { label: "Stock value", value: inr(value), icon: "rupee", color: "#0d9488", hint: "At standard rate", go: "reports" },
          { label: "Reorder due", value: low.length, icon: "alert", color: "#f59e0b", badge: low.length ? "Action" : null, go: "alerts" },
          { label: "Pending returns", value: pendingReturns.length, icon: "truck", color: "#6366f1", go: "returns" },
        ],
        tasks,
        priorityTitle: "Reorder alerts",
        priorityContent: low.length === 0 ? <EmptyState icon="check" title="All items above reorder level" /> : (
          <ul className="space-y-2">{low.slice(0, 8).map((s) => (
            <li key={s.id} className="flex items-center gap-3 text-sm glass rounded-xl p-3">
              <Icon name="alert" size={16} style={{ color: "#f59e0b" }} />
              <span className="flex-1 min-w-0 truncate">{s.sku} — {s.name}</span>
              <span className="text-xs opacity-55 shrink-0">{s.qty} / {s.reorder}</span>
              {can("add") && <Button variant="soft" className="!py-1 shrink-0" onClick={() => go("alerts")}>View</Button>}
            </li>
          ))}</ul>
        ),
        stockItems: summary,
        opsTitle: "Stock health by item",
        insights: [
          { title: "Fast-moving SKUs", desc: "Highest issue volume this month", value: summary.filter((s) => s.qty < s.reorder).length + " below reorder", icon: "trending", color: "#34d399" },
          { title: "Critical stock", desc: "At or below minimum level", value: summary.filter((s) => stockHealth(s) === "critical").length, icon: "alert", color: "#f87171" },
          { title: "Pending QC hold", desc: "Receipts awaiting quality", value: store.list("materialReceipts").filter((r) => r.qcStatus === "Pending").length, icon: "shield", color: "#8b5cf6" },
        ],
        series: summary.slice(0, 12).map((s) => s.qty),
        suggestions: low.length ? [{ text: "Review " + low.length + " reorder alerts and raise purchase requests", section: "alerts" }] : [{ text: "Post a material receipt for incoming goods", section: "receipt" }],
        activity: auditRows(["stockLedger", "materialReceipts", "materialIssues", "items"], 8),
        reports: [
          { label: "Stock summary report", desc: "Printable register", icon: "chart", onClick: () => go("reports") },
          { label: "Batch / lot tracking", desc: "Traceability", icon: "box", onClick: () => go("batches") },
        ],
        workflowSteps: ["Receipt", "QC (if required)", "Stock ledger", "Issue / Transfer"],
      };
    },
    sales(ctx) {
      const { go, can } = ctx;
      const leads = store.list("leads").filter((l) => l.status === "Open");
      const enqStats = VG.enquiryStats ? VG.enquiryStats() : null;
      const td = today();
      const overdue = store.list("followups").filter((f) => f.status === "Pending" && (f.date || "") <= td);
      const enquiryOverdue = overdue.filter((f) => f.refType === "Enquiry");
      const pendingApprovals = store.list("quotations").filter((q) => q.status === "Pending Approval");
      const orders = store.list("salesOrders");
      const stageOf = (o) => o.stage || o.status || "Created / Saved";
      const createdSaved = orders.filter((o) => stageOf(o) === "Created / Saved");
      const sent = orders.filter((o) => stageOf(o) === "Sent to Production");
      const underProd = orders.filter((o) => ["Accepted by Production", "Material Required", "Material Partially Issued", "Material Fully Issued", "Production In Progress"].includes(stageOf(o)));
      const pendingMaterial = orders.filter((o) => ["Material Required", "Material Partially Issued"].includes(stageOf(o)));
      const underQc = orders.filter((o) => ["Sent to Quality", "QC Pending"].includes(stageOf(o)));
      const readyDispatch = orders.filter((o) => stageOf(o) === "Ready for Dispatch");
      const dispatched = orders.filter((o) => ["Partially Dispatched", "Fully Dispatched"].includes(stageOf(o)));
      const closed = orders.filter((o) => stageOf(o) === "Closed");
      const delayed = orders.filter((o) => o.deliveryDate && o.deliveryDate < today() && !["Closed", "Fully Dispatched", "Cancelled"].includes(stageOf(o)));
      const pendingQuotes = store.list("quotations").filter((q) => ["Draft", "Pending Approval", "Sent"].includes(q.status)).length;
      return {
        title: "Sales & CRM Dashboard",
        subtitle: "Pipeline, orders and customer follow-ups",
        opsTabLabel: "Pipeline",
        opsTabIcon: "users",
        quickActions: [
          { label: "New sales order", icon: "cart", primary: true, perm: "add", onClick: () => { VG._pendingSalesOrderCreate = true; go("orders"); } },
          { label: "Create quotation", icon: "edit", perm: "add", onClick: () => go("quotations") },
          { label: "Order tracking", icon: "chart", onClick: () => go("tracking") },
          { label: "Add enquiry", icon: "inbox", perm: "add", onClick: () => go("enquiries") },
          { label: "Add customer", icon: "users", perm: "add", onClick: () => go("customers") },
          { label: "Proforma invoice", icon: "rupee", perm: "add", onClick: () => go("proformas") },
          { label: "Tax invoices", icon: "rupee", perm: "add", onClick: () => go("invoices") },
          { label: "Follow-ups", icon: "bell", onClick: () => go("followups") },
        ],
        kpis: [
          { label: "Saved not sent", value: createdSaved.length, icon: "save", color: "#94a3b8", go: "orders" },
          { label: "Sent to production", value: sent.length, icon: "factory", color: "#60a5fa", go: "orders" },
          { label: "Under production", value: underProd.length, icon: "factory", color: "#f59e0b", go: "tracking" },
          { label: "Pending material", value: pendingMaterial.length, icon: "box", color: "#a78bfa", go: "tracking" },
          { label: "Under QC", value: underQc.length, icon: "shield", color: "#8b5cf6", go: "tracking" },
          { label: "Ready dispatch", value: readyDispatch.length, icon: "truck", color: "#06b6d4", go: "tracking" },
          { label: "Dispatched", value: dispatched.length, icon: "send", color: "#22c55e", go: "tracking" },
          { label: "Closed orders", value: closed.length, icon: "check", color: "#64748b", go: "history" },
          { label: "Delayed", value: delayed.length, icon: "alert", color: "#ef4444", go: "tracking" },
        ],
        tasks: store.tasksFor("sales"),
        priorityTitle: enqStats && enqStats.overdueFollowups ? "Overdue enquiry follow-ups" : "Follow-ups due today",
        priorityContent: (enquiryOverdue.length || overdue.length) === 0 ? <EmptyState icon="check" title="All follow-ups on track" /> : (
          <ul className="space-y-2">{(enquiryOverdue.length ? enquiryOverdue : overdue).slice(0, 6).map((f) => {
            const enq = f.refType === "Enquiry" && f.refId ? store.get("enquiries", f.refId) : null;
            return (
              <li key={f.id} className="flex items-center gap-3 text-sm glass rounded-xl p-3">
                <Icon name="bell" size={16} style={{ color: (f.date || "") < td ? "#ef4444" : "#f59e0b" }} />
                <span className="flex-1 min-w-0 truncate">{(store.get("customers", f.customerId) || {}).name}{enq ? " · " + enq.no : ""} — {f.note}</span>
                <span className="text-xs opacity-50 shrink-0">{f.date}{f.time ? " " + f.time : ""}</span>
                {f.refType === "Enquiry" && <Button variant="soft" className="!py-1 shrink-0" onClick={() => { VG._pendingEnquiryFilter = "overdue"; go("enquiries"); }}>View</Button>}
              </li>
            );
          })}</ul>
        ),
        approvals: pendingApprovals.slice(0, 5).map((q) => ({ title: q.no + " — discount approval", meta: (store.get("customers", q.customerId) || {}).name })),
        opsContent: enqStats ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {[
                { label: "New enquiries", n: enqStats.new, color: "#60a5fa", filter: "New Enquiry" },
                { label: "Under review", n: enqStats.underReview, color: "#818cf8", filter: "Under Review" },
                { label: "Quotation prep", n: enqStats.quotationPrep, color: "#a78bfa", filter: "Quotation Under Preparation" },
                { label: "Offers sent", n: enqStats.offerSent, color: "#34d399", filter: "Offer Sent" },
                { label: "Follow-ups today", n: enqStats.followupsDueToday, color: "#fbbf24", filter: "followups_today" },
                { label: "Overdue follow-ups", n: enqStats.overdueFollowups, color: "#ef4444", filter: "overdue" },
                { label: "Won", n: enqStats.won, color: "#22c55e", filter: "Won / Converted to Sales Order" },
                { label: "Lost", n: enqStats.lost, color: "#f87171", filter: "Lost" },
                { label: "Conversion %", n: enqStats.conversionRatio + "%", color: "#6366f1", filter: "conversion" },
              ].map((t) => (
                <button key={t.label} type="button" onClick={() => { if (t.filter && t.filter !== "conversion") { VG._pendingEnquiryFilter = t.filter; go("enquiries"); } else go("enquiries"); }} className="rounded-xl glass p-3 text-left chrome-hover">
                  <div className="text-xl font-display font-bold" style={{ color: t.color }}>{t.n}</div>
                  <div className="text-[11px] opacity-55 mt-0.5">{t.label}</div>
                </button>
              ))}
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {[{ label: "Leads", go: "leads", icon: "inbox", n: leads.length }, { label: "All enquiries", go: "enquiries", icon: "message", n: enqStats.all.length }, { label: "Quotations", go: "quotations", icon: "file", n: store.list("quotations").length }, { label: "Invoices", go: "invoices", icon: "rupee", n: store.list("invoices").length }].map((x) => (
                <button key={x.label} type="button" onClick={() => go(x.go)} className="rounded-xl glass p-4 text-left chrome-hover">
                  <Icon name={x.icon} size={20} className="opacity-60 mb-2" />
                  <div className="text-2xl font-display font-bold">{x.n}</div>
                  <div className="text-sm opacity-55">{x.label}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[{ label: "Leads", go: "leads", icon: "inbox", n: leads.length }, { label: "Enquiries", go: "enquiries", icon: "message", n: store.list("enquiries").length }, { label: "Quotations", go: "quotations", icon: "file", n: store.list("quotations").length }, { label: "Invoices", go: "invoices", icon: "rupee", n: store.list("invoices").length }].map((x) => (
              <button key={x.label} type="button" onClick={() => go(x.go)} className="rounded-xl glass p-4 text-left chrome-hover">
                <Icon name={x.icon} size={20} className="opacity-60 mb-2" />
                <div className="text-2xl font-display font-bold">{x.n}</div>
                <div className="text-sm opacity-55">{x.label}</div>
              </button>
            ))}
          </div>
        ),
        insights: [
          { title: "Enquiry conversion", desc: "Won vs lost ratio", value: enqStats ? enqStats.conversionRatio + "%" : "—", icon: "chart", color: "#6366f1" },
          { title: "Offers pending follow-up", desc: "Overdue enquiry touch-points", value: enqStats ? enqStats.overdueFollowups : overdue.length, icon: "bell", color: "#f59e0b" },
          { title: "Orders awaiting dispatch", desc: "Ready for dispatch", value: readyDispatch.length, icon: "truck", color: "#f97316" },
        ],
        series: [12, 18, 15, 22, 28, 24, 30, 26, 32, 35, 38, 42],
        suggestions: (enqStats && enqStats.overdueFollowups) ? [{ text: "Complete " + enqStats.overdueFollowups + " overdue enquiry follow-ups", section: "followups" }] : overdue.length ? [{ text: "Complete " + overdue.length + " overdue follow-ups", section: "followups" }] : [{ text: "Create a quotation from an open enquiry", section: "enquiries" }],
        activity: auditRows(["enquiries", "quotations", "salesOrders", "invoices", "leads", "customers"], 8),
        reports: [
          { label: "Sales reports", desc: "Quotations & orders", onClick: () => go("reports") },
          { label: "Enquiry reports", desc: "Status, offers, follow-ups", onClick: () => go("enquiries") },
        ],
      };
    },
    purchase(ctx) {
      const { go, can, roleKey } = ctx;
      const prs = store.list("purchaseRequests");
      const pos = store.list("purchaseOrders");
      const low = store.stockSummary().filter((s) => s.reorderNeeded);
      const pendingPR = prs.filter((x) => x.status === "Pending");
      const openPO = pos.filter((x) => x.status === "Open" || x.status === "Approved");
      return {
        title: "Purchase Dashboard",
        subtitle: "Requests, orders and supplier follow-through",
        opsTabLabel: "Procurement",
        opsTabIcon: "cart",
        quickActions: [
          { label: "New request", icon: "plus", primary: true, perm: "add", onClick: () => go("requests") },
          { label: "Purchase orders", icon: "cart", onClick: () => go("orders") },
          { label: "Material receipt", icon: "download", onClick: () => VG.goTo("inventory", "receipt") },
          { label: "Reports", icon: "chart", onClick: () => go("reports") },
        ],
        kpis: [
          { label: "Pending requests", value: pendingPR.length, icon: "inbox", color: "#d97706", go: "requests" },
          { label: "Open POs", value: openPO.length, icon: "cart", color: "#f59e0b", go: "orders" },
          { label: "Awaiting receipt", value: openPO.length, icon: "download", color: "#0d9488" },
          { label: "Below reorder", value: low.length, icon: "alert", color: "#ef4444" },
        ],
        tasks: store.tasksFor("purchase"),
        priorityTitle: "Items below reorder — raise PR",
        priorityContent: low.length === 0 ? <EmptyState icon="check" title="Stock levels healthy" /> : (
          <ul className="space-y-2">{low.slice(0, 6).map((s) => (
            <li key={s.id} className="flex items-center gap-3 text-sm glass rounded-xl p-3">
              <span className="flex-1 truncate">{s.sku} — {s.name}</span>
              {can("add") && <Button variant="soft" className="!py-1" onClick={() => { store.raisePRFromItem(s.id, Math.max(1, s.reorder - s.qty), roleKey); VG.toast("PR raised"); }}>Raise PR</Button>}
            </li>
          ))}</ul>
        ),
        opsContent: (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl glass p-4">
              <div className="text-[11px] uppercase opacity-50 mb-2">Purchase requests</div>
              <div className="text-3xl font-display font-bold">{prs.length}</div>
              <div className="text-xs opacity-55 mt-1">{pendingPR.length} pending approval</div>
            </div>
            <div className="rounded-xl glass p-4">
              <div className="text-[11px] uppercase opacity-50 mb-2">Purchase orders</div>
              <div className="text-3xl font-display font-bold">{pos.length}</div>
              <div className="text-xs opacity-55 mt-1">{openPO.length} open</div>
            </div>
          </div>
        ),
        insights: [
          { title: "Delayed approvals", desc: "PRs pending > 3 days", value: pendingPR.length, icon: "clock", color: "#f59e0b" },
          { title: "POs awaiting GRN", desc: "Open orders not received", value: openPO.length, icon: "download", color: "#22d3ee" },
        ],
        series: [8, 10, 9, 14, 12, 16, 15, 18, 20, 17, 22, 19],
        activity: auditRows(["purchaseRequests", "purchaseOrders"], 8),
        reports: [{ label: "Purchase reports", onClick: () => go("reports") }],
        workflowSteps: ["Request", "Approve", "Purchase order", "Goods receipt"],
      };
    },
    quality(ctx) {
      const { go } = ctx;
      const insp = store.list("qcInspections");
      const pending = insp.filter((x) => x.status === "Pending");
      const ncrs = store.list("ncrs").filter((x) => x.status !== "Closed");
      return {
        title: "Quality Dashboard",
        subtitle: "Inspections, NCRs and material release",
        opsTabLabel: "Inspections",
        opsTabIcon: "shield",
        quickActions: [
          { label: "Pending inspections", icon: "shield", primary: true, onClick: () => go("inspections") },
          { label: "NCR register", icon: "alert", onClick: () => go("ncr") },
          { label: "Reports", icon: "chart", onClick: () => go("reports") },
        ],
        kpis: [
          { label: "Pending inspections", value: pending.length, icon: "shield", color: "#7c3aed", go: "inspections" },
          { label: "Open NCRs", value: ncrs.length, icon: "alert", color: "#ef4444", go: "ncr" },
          { label: "Accepted (MTD)", value: insp.filter((x) => x.status === "Accepted").length, icon: "check", color: "#34d399" },
          { label: "Total logged", value: insp.length, icon: "activity", color: "#6366f1" },
        ],
        tasks: store.tasksFor("quality"),
        priorityTitle: "Pending material inspections",
        priorityContent: pending.length === 0 ? <EmptyState icon="check" title="No inspections pending" /> : (
          <ul className="space-y-2">{pending.slice(0, 6).map((q) => (
            <li key={q.id} className="flex items-center gap-3 text-sm glass rounded-xl p-3">
              <span className="flex-1 truncate">GRN {q.receiptNo}</span>
              <Button variant="soft" className="!py-1" onClick={() => go("inspections")}>Inspect</Button>
            </li>
          ))}</ul>
        ),
        insights: [
          { title: "Rejected material", desc: "NCRs this month", value: ncrs.length, icon: "alert", color: "#f87171" },
          { title: "Pending QC from stores", desc: "Incoming GRN queue", value: pending.length, icon: "shield", color: "#8b5cf6" },
        ],
        series: [4, 6, 5, 8, 7, 9, 6, 10, 8, 11, 9, 12],
        activity: auditRows(["qcInspections", "ncrs"], 8),
        reports: [{ label: "Quality reports", onClick: () => go("reports") }],
      };
    },
    production(ctx) {
      const { go, can, roleKey } = ctx;
      const wos = store.list("workOrders");
      const sos = store.list("salesOrders");
      const pendingBom = wos.filter((w) => w.status === "BOM Pending" || w.status === "BOM Under Review");
      const pendingMaterial = wos.filter((w) => ["Material Requirement Generated", "Material Partially Issued"].includes(w.status) || (w.materialRequirementId && !w.materialsIssuedAt));
      const shortage = wos.filter((w) => w.issueStatus === "Shortage Pending" || w.issueStatus === "Awaiting Purchase");
      const readyForProd = wos.filter((w) => w.status === "Material Fully Issued" || w.status === "Production Planned");
      const running = wos.filter((w) => w.status === "Production In Progress" || w.status === "Running" || w.status === "Released");
      const completed = wos.filter((w) => w.status === "Production Completed" || w.status === "Completed");
      const custName = (id) => (store.get("customers", id) || {}).name || "—";
      return {
        title: "Production Dashboard",
        subtitle: "Work orders, BOM and shop floor",
        opsTabLabel: "Shop floor",
        opsTabIcon: "factory",
        quickActions: [
          { label: "Work orders", icon: "factory", primary: true, onClick: () => go("orders") },
          { label: "Issue materials", icon: "logout", onClick: () => go("mrp") },
          { label: "BOM register", icon: "flow", onClick: () => go("bom") },
        ],
        kpis: [
          { label: "WO pending BOM", value: pendingBom.length, icon: "flow", color: "#dc2626", go: "orders" },
          { label: "WO pending material", value: pendingMaterial.length, icon: "box", color: "#8b5cf6", go: "mrp" },
          { label: "WO with shortage", value: shortage.length, icon: "alert", color: "#ef4444", go: "mrp" },
          { label: "WO ready for production", value: readyForProd.length, icon: "check", color: "#22c55e", go: "orders" },
          { label: "WO in progress", value: running.length, icon: "factory", color: "#f97316", go: "orders" },
          { label: "WO completed", value: completed.length, icon: "check", color: "#34d399" },
        ],
        tasks: store.tasksFor("production"),
        priorityTitle: "Work orders pending BOM",
        priorityContent: pendingBom.length === 0 ? <EmptyState icon="check" title="No work orders waiting for BOM" /> : (
          <ul className="space-y-2">{pendingBom.slice(0, 6).map((s) => (
            <li key={s.id} className="flex items-center gap-3 text-sm glass rounded-xl p-3">
              <span className="font-mono text-xs">{s.no}</span>
              <span className="flex-1 truncate">{s.product || "—"}</span>
              {can && can("edit") && <Button variant="soft" className="!py-1" onClick={() => go("orders")}>Open WO</Button>}
            </li>
          ))}</ul>
        ),
        opsContent: (
          <ul className="space-y-2">{running.slice(0, 6).map((w) => (
            <li key={w.id} className="glass rounded-xl p-3 text-sm flex justify-between">
              <span className="font-mono text-xs">{w.no}</span>
              <Pill color="#f59e0b">{w.status}</Pill>
            </li>
          ))}{running.length === 0 && <EmptyState title="No active work orders" />}</ul>
        ),
        insights: [
          { title: "Production efficiency", desc: "Completed vs planned", value: wos.filter((w) => w.status === "Completed").length + " done", icon: "chart", color: "#34d399" },
        ],
        series: [20, 22, 18, 25, 28, 24, 30, 27, 32, 29, 35, 33],
        activity: auditRows(["workOrders", "boms"], 8),
        reports: [{ label: "Production reports", onClick: () => go("reports") }],
        workflowSteps: ["Sales order", "Work order", "Material issue", "QC", "Complete"],
      };
    },
    dispatch(ctx) {
      const { go } = ctx;
      const sh = store.list("shipments");
      const sos = store.list("salesOrders").filter((s) => s.stage === "Ready to Dispatch" || s.stage === "Dispatch Planned");
      const pending = sh.filter((s) => s.status === "Pending" || s.status === "Packing");
      const transit = sh.filter((s) => s.status === "In-transit");
      const custName = (id) => (store.get("customers", id) || {}).name || "—";
      return {
        title: "Dispatch Dashboard",
        subtitle: "Packing, loading and delivery tracking",
        quickActions: [
          { label: "New shipment", icon: "plus", primary: true, perm: "add", onClick: () => go("shipments") },
          { label: "Pending dispatch", icon: "truck", onClick: () => go("shipments") },
          { label: "Generate invoice", icon: "rupee", onClick: () => VG.goTo("accounts", "receivables") },
        ],
        kpis: [
          { label: "SOs ready to ship", value: sos.length, icon: "inbox", color: "#ea580c", go: "shipments" },
          { label: "Pending dispatch", value: pending.length, icon: "box", color: "#f97316", go: "shipments" },
          { label: "In transit", value: transit.length, icon: "truck", color: "#22d3ee" },
          { label: "Delivered (MTD)", value: sh.filter((s) => s.status === "Delivered").length, icon: "check", color: "#34d399" },
        ],
        tasks: store.tasksFor("dispatch"),
        priorityTitle: "Orders ready for shipment",
        priorityContent: sos.length === 0 ? <EmptyState icon="check" title="Complete production before dispatch" /> : (
          <ul className="space-y-2">{sos.slice(0, 6).map((s) => (
            <li key={s.id} className="flex items-center gap-3 text-sm glass rounded-xl p-3">
              <span className="font-mono text-xs">{s.no}</span>
              <span className="flex-1 truncate">{custName(s.customerId)}</span>
              <Button variant="soft" className="!py-1" onClick={() => go("shipments")}>Ship</Button>
            </li>
          ))}</ul>
        ),
        opsContent: <EmptyState icon="truck" title="Select a shipment to pack and dispatch" desc="Use the Shipments section for full detail." />,
        insights: [{ title: "Delayed deliveries", desc: "In-transit > 5 days", value: transit.length, icon: "clock", color: "#f59e0b" }],
        series: [5, 8, 7, 10, 12, 9, 14, 11, 15, 13, 16, 18],
        activity: auditRows(["shipments"], 8),
        reports: [{ label: "Dispatch reports", onClick: () => go("reports") }],
      };
    },
    accounts(ctx) {
      const { go } = ctx;
      const inv = store.list("invoices");
      const overdue = inv.filter((x) => x.status !== "Paid" && x.dueDate && x.dueDate < today());
      const unpaid = inv.filter((x) => x.status !== "Paid");
      const receivable = unpaid.reduce((s, i) => s + ((Number(i.amount) || 0) - (Number(i.amountPaid) || 0)), 0);
      return {
        title: "Accounts Dashboard",
        subtitle: "Receivables, invoicing and collections",
        quickActions: [
          { label: "Create invoice", icon: "rupee", primary: true, perm: "add", onClick: () => go("receivables") },
          { label: "Record payment", icon: "check", onClick: () => go("receivables") },
          { label: "Approve pending", icon: "shield", onClick: () => go("receivables") },
        ],
        kpis: [
          { label: "Receivables", value: inr(receivable), icon: "rupee", color: "#0e7490", go: "receivables" },
          { label: "Open invoices", value: unpaid.length, icon: "inbox", color: "#6366f1", go: "receivables" },
          { label: "Overdue", value: overdue.length, icon: "alert", color: "#ef4444", badge: overdue.length || null, go: "receivables" },
          { label: "Collected (MTD)", value: inr(store.list("payments").reduce((s, p) => s + (Number(p.amount) || 0), 0)), icon: "check", color: "#34d399" },
        ],
        tasks: store.tasksFor("accounts"),
        workflowSteps: ["Sales order", "Dispatch", "Invoice", "Payment"],
        insights: [
          { title: "Collection focus", desc: "Overdue invoices", value: overdue.length, icon: "rupee", color: "#f87171" },
          { title: "Ready to invoice", desc: "Dispatched orders", value: store.list("salesOrders").filter((s) => (s.stage === "Dispatched" || s.stage === "Ready to Dispatch") && !inv.some((i) => i.salesOrderId === s.id)).length, icon: "file", color: "#0891b2" },
        ],
        series: [40, 45, 42, 50, 48, 55, 52, 58, 60, 57, 62, 65],
        activity: auditRows(["invoices", "payments"], 8),
        reports: [{ label: "Accounts reports", onClick: () => go("reports") }],
      };
    },
    hr(ctx) {
      const { go } = ctx;
      const leave = store.list("leaveRequests").filter((l) => l.status === "Pending");
      const month = new Date().toISOString().slice(0, 7);
      const payrollDone = store.list("payrollRuns").some((p) => p.month === month);
      return {
        title: "HR Dashboard",
        subtitle: "People, leave and payroll readiness",
        quickActions: [
          { label: "Employees", icon: "users", onClick: () => go("employees") },
          { label: "Leave requests", icon: "calendar", onClick: () => go("leave") },
          { label: "Run payroll", icon: "rupee", onClick: () => go("payroll") },
        ],
        kpis: [
          { label: "Active employees", value: store.list("employees").filter((e) => e.status === "Active").length, icon: "users", color: "#db2777", go: "employees" },
          { label: "Leave pending", value: leave.length, icon: "calendar", color: "#f59e0b", badge: leave.length || null, go: "leave" },
          { label: "Payroll " + month, value: payrollDone ? "Done" : "Pending", icon: "rupee", color: payrollDone ? "#34d399" : "#f59e0b", go: "payroll" },
          { label: "Salary slips", value: store.list("salarySlips").filter((s) => s.month === month).length, icon: "check", color: "#6366f1" },
        ],
        tasks: store.tasksFor("hr"),
        priorityTitle: "Leave awaiting approval",
        priorityContent: leave.length === 0 ? <EmptyState icon="check" title="No leave pending" /> : (
          <ul className="space-y-2">{leave.map((l) => (
            <li key={l.id} className="glass rounded-xl p-3 text-sm">{(store.get("employees", l.employeeId) || {}).name} · {l.type} · {l.days} day(s)</li>
          ))}</ul>
        ),
        workflowSteps: ["Leave request", "HR approval", "Attendance", "Payroll", "Salary slip"],
        insights: [{ title: "Leave approvals", desc: "Awaiting manager", value: leave.length, icon: "calendar", color: "#ec4899" }],
        activity: auditRows(["leaveRequests", "employees", "payrollRuns"], 8),
        reports: [{ label: "HR reports", onClick: () => go("reports") }],
      };
    },
    attendance(ctx) {
      const { go } = ctx;
      const month = new Date().toISOString().slice(0, 7);
      const recs = store.list("attendanceRecords").filter((a) => a.month === month);
      const present = recs.reduce((s, a) => s + (Number(a.present) || 0), 0);
      const onLeave = recs.reduce((s, a) => s + (Number(a.leave) || 0), 0);
      return {
        title: "Attendance Dashboard",
        subtitle: "Monthly registers feed HR payroll",
        quickActions: [
          { label: "Monthly register", icon: "clock", primary: true, onClick: () => go("register") },
          { label: "HR payroll", icon: "rupee", onClick: () => VG.goTo("hr", "payroll") },
        ],
        kpis: [
          { label: "Records this month", value: recs.length, icon: "users", color: "#16a34a", go: "register" },
          { label: "Total present days", value: present, icon: "check", color: "#22c55e" },
          { label: "Leave days logged", value: onLeave, icon: "clock", color: "#f59e0b" },
          { label: "Locked records", value: recs.filter((a) => a.locked).length, icon: "shield", color: "#94a3b8" },
        ],
        workflowSteps: ["Daily mark", "Monthly lock", "Payroll run"],
        activity: auditRows(["attendanceRecords"], 6),
        reports: [{ label: "Attendance reports", onClick: () => go("reports") }],
      };
    },
    admin(ctx) {
      const { go, can } = ctx;
      const stats = store.adminStats ? store.adminStats() : {};
      const live = store.settings().backup || {};
      const due = live.lastBackupAt && (Date.now() - live.lastBackupAt > (live.intervalHours || 24) * 3600000);
      const fmtB = (n) => { const x = Number(n) || 0; if (x < 1024) return x + " B"; if (x < 1048576) return (x / 1024).toFixed(1) + " KB"; return (x / 1048576).toFixed(1) + " MB"; };
      const lic = stats.license || {};
      return {
        title: "Admin Dashboard",
        subtitle: "System overview, access control and health",
        quickActions: [
          { label: "Add user", icon: "users", primary: true, onClick: () => go("users") },
          { label: "Permissions", icon: "lock", onClick: () => go("permissions") },
          { label: "Company profile", icon: "grid", onClick: () => go("company") },
          { label: "Backup", icon: "cloud", onClick: () => go("backup") },
          { label: "Audit trail", icon: "activity", onClick: () => go("audit") },
        ],
        kpis: [
          { label: "Active users", value: stats.activeUsers || 0, icon: "users", color: "#34d399", go: "users" },
          { label: "Pending approvals", value: stats.pendingApprovals || 0, icon: "inbox", color: "#6366f1", badge: stats.pendingApprovals ? "!" : null },
          { label: "Failed logins", value: stats.failedLogins || 0, icon: "alert", color: "#ef4444" },
          { label: "Storage", value: fmtB(stats.storageBytes), icon: "database", color: "#475569" },
        ],
        tasks: [],
        priorityTitle: "System alerts",
        priorityContent: (
          <ul className="space-y-2">
            {due && <li className="flex gap-2 text-sm glass rounded-xl p-3"><Icon name="alert" size={16} style={{ color: "#f59e0b" }} />Backup is due</li>}
            {(stats.pendingApprovals || 0) > 0 && <li className="flex gap-2 text-sm glass rounded-xl p-3"><Icon name="inbox" size={16} style={{ color: "#6366f1" }} />{stats.pendingApprovals} approvals across modules</li>}
            {!due && !(stats.pendingApprovals) && <EmptyState icon="check" title="No system alerts" />}
          </ul>
        ),
        opsContent: (
          <div className="text-sm space-y-2">
            <div className="glass rounded-xl p-3 flex justify-between"><span>License</span><b>{lic.plan || (store.isLicensed && store.isLicensed() ? "Active" : "Trial")}</b></div>
            <div className="glass rounded-xl p-3 flex justify-between"><span>Last backup</span><b>{live.lastBackupAt ? new Date(live.lastBackupAt).toLocaleString("en-IN") : "Never"}</b></div>
            {can && can("export") && <Button variant="soft" icon="cloud" onClick={() => go("backup")}>Manage backup</Button>}
          </div>
        ),
        insights: [
          { title: "Logins today", desc: "Successful sign-ins", value: stats.loginToday || 0, icon: "activity", color: "#22d3ee" },
          { title: "License seats", desc: lic.seats || "Enterprise", value: lic.status || "Active", icon: "shield", color: "#64748b" },
        ],
        activity: auditRows(["erpUsers", "settings", "licenseKeys"], 8),
        reports: [
          { label: "Admin reports", onClick: () => go("reports") },
          { label: "System health", onClick: () => go("health") },
        ],
      };
    },
  };

  function ModuleDashboard({ modId, mod, roleKey, can, go }) {
    VG.useDB();
    const tick = VG.useDB();
    const builder = VG.dashboardBuilders && VG.dashboardBuilders[modId];
    const cfg = useMemo(() => (builder ? builder({ roleKey, can, go, store, mod, inr, today }) : null), [modId, roleKey, tick]);
    const prefs = moduleDashPrefs(roleKey, modId);
    const [tab, setTab] = useState(prefs.tab);
    const [collapsed, setCollapsed] = useState(prefs.collapsed || {});

    useEffect(() => {
      saveModuleDashPrefs(roleKey, modId, { tab });
    }, [tab]);

    if (!cfg) {
      return <div className="opacity-60 p-8 text-center">Dashboard configuration not available.</div>;
    }

    const tabs = [
      { id: "overview", label: "Overview", icon: "grid" },
      { id: "operations", label: cfg.opsTabLabel || "Operations", icon: cfg.opsTabIcon || "activity" },
      { id: "insights", label: "Insights", icon: "chart" },
    ];

    const togglePanel = (id) => setCollapsed((c) => {
      const next = { ...c, [id]: !c[id] };
      saveModuleDashPrefs(roleKey, modId, { collapsed: next });
      return next;
    });

    const isHidden = (id) => (prefs.hiddenPanels || []).includes(id);

    return (
      <div className="space-y-4 w-full max-w-none vg-module-dashboard vg-full-width-workspace">
        <div className="flex items-center justify-end gap-2 text-[11px] opacity-45 -mt-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live · refreshes automatically
        </div>

        <QuickActionsBar actions={cfg.quickActions} can={can} />

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              className={"vg-tab shrink-0 " + (tab === t.id ? "is-active" : "")}
              style={tab === t.id ? { "--tab-accent": mod?.accent || "var(--accent)" } : undefined}>
              <Icon name={t.icon} size={15} />{t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="space-y-6 animate-fade-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {(cfg.kpis || []).map((k, i) => (
                <KpiTile key={k.label} kpi={k} delay={i * 50} onClick={k.go ? () => go(k.go) : undefined} />
              ))}
            </div>
            <div className="grid lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 space-y-5">
                {!isHidden("priority") && (
                  <Panel id="priority" title={cfg.priorityTitle || "Priority queue"} icon="alert" collapsed={collapsed.priority} onToggle={() => togglePanel("priority")}>
                    {cfg.priorityContent || <EmptyState icon="check" title="Nothing urgent" />}
                  </Panel>
                )}
                {!isHidden("workflow") && cfg.workflowSteps && (
                  <Card className="p-5">
                    <SectionTitle icon="flow" title="Workflow status" />
                    <div className="flex flex-wrap gap-2 mt-3">
                      {cfg.workflowSteps.map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                          <span className="rounded-xl px-3 py-2 glass text-xs font-medium flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full text-[10px] grid place-items-center text-white" style={{ background: "var(--accent)" }}>{i + 1}</span>
                            {s}
                          </span>
                          {i < cfg.workflowSteps.length - 1 && <Icon name="chevronRight" size={14} className="opacity-30" />}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
              <div className="space-y-5">
                {!isHidden("tasks") && (
                  <Panel id="tasks" title="Pending tasks" icon="check" action={<Pill color="var(--accent)">{(cfg.tasks || []).length}</Pill>} collapsed={collapsed.tasks} onToggle={() => togglePanel("tasks")}>
                    <TaskPanel tasks={cfg.tasks} go={go} />
                  </Panel>
                )}
                {!isHidden("approvals") && cfg.approvals && (
                  <Panel id="approvals" title="Approvals" icon="shield" collapsed={collapsed.approvals} onToggle={() => togglePanel("approvals")}>
                    {cfg.approvals.length === 0 ? <EmptyState title="No approvals waiting" /> : (
                      <ul className="space-y-2">{cfg.approvals.map((a, i) => (
                        <li key={i} className="glass rounded-xl p-3 text-sm">
                          <div className="font-medium">{a.title}</div>
                          <div className="text-[11px] opacity-55 mt-1">{a.meta}</div>
                        </li>
                      ))}</ul>
                    )}
                  </Panel>
                )}
              </div>
            </div>
            <SuggestedActions items={cfg.suggestions} go={go} />
            {!isHidden("activity") && (
              <Panel id="activity" title="Recent activity" icon="activity" collapsed={collapsed.activity} onToggle={() => togglePanel("activity")}>
                <ActivityTimeline rows={cfg.activity} />
              </Panel>
            )}
          </div>
        )}

        {tab === "operations" && (
          <div className="space-y-6 animate-fade-up">
            {cfg.stockItems ? (
              <Card className="p-5 sm:p-6">
                <SectionTitle icon="box" title={cfg.opsTitle || "Operational summary"} action={cfg.opsAction} />
                <div className="mt-4">
                  <StockHealthGrid items={cfg.stockItems} go={go} can={can} />
                </div>
              </Card>
            ) : (
              <Panel id="ops" title={cfg.opsTitle || "Operational summary"} icon="activity" collapsed={false}>
                {cfg.opsContent || <EmptyState title="No operational data" />}
              </Panel>
            )}
            {cfg.opsSecondary && (
              <Card className="p-5">{cfg.opsSecondary}</Card>
            )}
          </div>
        )}

        {tab === "insights" && (
          <div className="space-y-6 animate-fade-up">
            {cfg.series && cfg.series.length > 0 && (
              <Card className="p-5 sm:p-6">
                <SectionTitle icon="chart" title="Trend" action={<Pill color="var(--accent)">12 periods</Pill>} />
                <div className="mt-4">
                  <Sparkline data={cfg.series} id={modId + "-dash"} height={100} />
                </div>
              </Card>
            )}
            <Card className="p-5 sm:p-6">
              <SectionTitle icon="sparkle" title="Key observations" />
              <div className="mt-4">
                <InsightCards insights={cfg.insights} />
              </div>
            </Card>
            {cfg.reports && cfg.reports.length > 0 && (
              <Card className="p-5 sm:p-6">
                <SectionTitle icon="chart" title="Reports & analytics" />
                <div className="grid sm:grid-cols-2 gap-3 mt-4">
                  {cfg.reports.map((r) => (
                    <button key={r.label} type="button" onClick={r.onClick} className="flex items-center gap-4 rounded-xl glass p-4 text-left chrome-hover transition w-full">
                      <span className="grid place-items-center w-11 h-11 rounded-xl text-white shrink-0" style={{ background: "var(--accent)" }}>
                        <Icon name={r.icon || "chart"} size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm">{r.label}</div>
                        <div className="text-[11px] opacity-55">{r.desc}</div>
                      </div>
                      <Icon name="chevronRight" size={16} className="opacity-40" />
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    );
  }

  /* ----- Sticky vibrant module tabs (compact, grouped) ----- */
  function ModuleNav({ sections, section, setSection, mod }) {
    const accent = mod?.accent || "#6366f1";
    const dash = sections.find((s) => s.id === "dashboard");
    const rest = sections.filter((s) => s.id !== "dashboard");
    const groups = [];
    rest.forEach((s) => {
      const gname = s.group || "More";
      let g = groups.find((x) => x.name === gname);
      if (!g) { g = { name: gname, items: [] }; groups.push(g); }
      g.items.push(s);
    });

    const [activeGroup, setActiveGroup] = useState(() => {
      if (section === "dashboard") return groups[0]?.name || null;
      const cur = rest.find((s) => s.id === section);
      return cur ? cur.group || "More" : groups[0]?.name || null;
    });

    useEffect(() => {
      document.documentElement.style.setProperty("--accent", accent);
    }, [accent]);

    useEffect(() => {
      if (section === "dashboard") return;
      const cur = rest.find((s) => s.id === section);
      if (cur) setActiveGroup(cur.group || "More");
    }, [section]);

    const groupItems = groups.find((g) => g.name === activeGroup)?.items || [];
    const current = sections.find((s) => s.id === section);
    const tabStyle = { "--tab-accent": accent };

    function pickGroup(g) {
      setActiveGroup(g.name);
      if (g.items.length === 1) setSection(g.items[0].id);
      else if (section === "dashboard" || !g.items.some((x) => x.id === section)) setSection(g.items[0].id);
    }

    return (
      <nav className="vg-module-nav sticky top-0 z-30 mb-4 rounded-2xl glass-dark p-2 sm:p-2.5 border border-white/5" style={tabStyle}>
        <div className="flex items-center gap-2 min-w-0">
          {dash && (
            <button
              type="button"
              onClick={() => setSection("dashboard")}
              className={"vg-tab vg-tab-dash shrink-0 " + (section === "dashboard" ? "is-active" : "")}
              style={tabStyle}
            >
              <Icon name="chart" size={15} />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          )}
          <div className="h-6 w-px bg-white/10 shrink-0 hidden sm:block" />
          <div className="flex gap-1 overflow-x-auto no-scrollbar min-w-0 flex-1">
            {groups.map((g) => (
              <button
                key={g.name}
                type="button"
                onClick={() => pickGroup(g)}
                className={"vg-tab-group shrink-0 " + (activeGroup === g.name ? "is-active" : "")}
                style={activeGroup === g.name ? tabStyle : undefined}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>
        {activeGroup && groupItems.length > 0 && section !== "dashboard" && (
          <div className="flex gap-1.5 mt-2 pt-2 border-t border-white/5 overflow-x-auto no-scrollbar animate-fade-up">
            {groupItems.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                className={"vg-tab shrink-0 " + (s.id === section ? "is-active" : "")}
                style={s.id === section ? tabStyle : undefined}
              >
                <Icon name={s.icon} size={14} />
                {s.label}
              </button>
            ))}
          </div>
        )}
        {activeGroup && groupItems.length > 1 && section === "dashboard" && (
          <div className="flex gap-1.5 mt-2 pt-2 border-t border-white/5 overflow-x-auto no-scrollbar">
            {groupItems.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                className="vg-tab shrink-0 opacity-60 hover:opacity-100"
              >
                <Icon name={s.icon} size={14} />
                {s.label}
              </button>
            ))}
          </div>
        )}
        {section !== "dashboard" && current && (
          <div className="mt-1.5 px-1 flex items-center gap-1.5 text-[11px] opacity-45 truncate">
            <button type="button" onClick={() => setSection("dashboard")} className="hover:opacity-100">Home</button>
            <Icon name="chevronRight" size={12} />
            <span>{current.group}</span>
            <Icon name="chevronRight" size={12} />
            <span className="opacity-80 font-medium truncate">{current.label}</span>
          </div>
        )}
      </nav>
    );
  }

  VG.ModuleDashboard = ModuleDashboard;
  VG.ModuleNav = ModuleNav;
})(window.VG);
