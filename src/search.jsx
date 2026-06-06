/* Veraglo ERP — universal search (⌘K) across masters, transactions, users. */
(function (VG) {
  const { useState, useEffect, useMemo, useRef } = React;
  const store = VG.store;
  const { Icon, Pill } = VG.ui;

  const SEARCH_INDEX = [
    { coll: "customers", module: "sales", section: "customers", label: "Customers", icon: "users", keys: ["name", "code", "gstin", "contact"] },
    { coll: "suppliers", module: "inventory", section: "suppliers", label: "Suppliers", icon: "cart", keys: ["name", "code", "gstin"] },
    { coll: "items", module: "inventory", section: "items", label: "Items", icon: "box", keys: ["sku", "name", "manufacturerName", "manufacturerPartNumber", "brandName"] },
    { coll: "manufacturers", module: "inventory", section: "manufacturers", label: "Manufacturers", icon: "database", keys: ["code", "name", "brand", "country"] },
    { coll: "boms", module: "inventory", section: "bom", label: "BOMs", icon: "flow", keys: ["no", "name", "revision", "status"] },
    { coll: "quotations", module: "sales", section: "quotations", label: "Quotations", icon: "file", keys: ["no", "status"] },
    { coll: "salesOrders", module: "sales", section: "orders", label: "Sales Orders", icon: "cart", keys: ["no", "status", "stage"] },
    { coll: "purchaseRequests", module: "purchase", section: "requests", label: "Purchase Requests", icon: "inbox", keys: ["no", "status"] },
    { coll: "purchaseOrders", module: "purchase", section: "orders", label: "Purchase Orders", icon: "cart", keys: ["no", "status"] },
    { coll: "workOrders", module: "production", section: "orders", label: "Work Orders", icon: "factory", keys: ["no", "salesOrderNo", "product"] },
    { coll: "shipments", module: "dispatch", section: "shipments", label: "Shipments", icon: "truck", keys: ["no", "salesOrderNo"] },
    { coll: "invoices", module: "sales", section: "invoices", label: "Tax Invoices", icon: "rupee", keys: ["no", "salesOrderNo", "status", "irn", "ewayBillNo"] },
    { coll: "invoices", module: "accounts", section: "receivables", label: "Invoices (Receivables)", icon: "rupee", keys: ["no", "salesOrderNo", "status"] },
    { coll: "employees", module: "hr", section: "employees", label: "Employees", icon: "users", keys: ["name", "code", "department"] },
    { coll: "leads", module: "sales", section: "leads", label: "Leads", icon: "activity", keys: ["no", "title", "stage"] },
    { coll: "enquiries", module: "sales", section: "enquiries", label: "Enquiries", icon: "inbox", keys: ["no", "subject"] },
    { coll: "erpUsers", module: "admin", section: "users", label: "Users", icon: "users", keys: ["userId", "name", "email"] },
    { coll: "locations", module: "admin", section: "locations", label: "Locations", icon: "grid", keys: ["name", "code", "city"] },
  ];

  function custName(id) { return (store.get("customers", id) || {}).name || ""; }
  function itemLabel(id) { return (VG.itemMfr && VG.itemMfr.label(id)) || ""; }

  function enrichRow(coll, r) {
    const title = r.no || r.code || r.sku || r.name || r.userId || r.title || r.subject || r.id;
    let sub = r.status || r.stage || r.department || "";
    if (r.customerId) sub = (sub ? sub + " · " : "") + custName(r.customerId);
    if (r.itemId) sub = (sub ? sub + " · " : "") + itemLabel(r.itemId);
    if (r.email) sub = r.email;
    return { title, sub };
  }

  VG.buildSearchIndex = function (roleKey) {
    const allowed = new Set(VG.modulesForRole(roleKey).map((m) => m.id));
    const out = [];
    SEARCH_INDEX.forEach((def) => {
      if (!allowed.has(def.module) && def.module !== "admin") return;
      if (def.module === "admin" && roleKey !== "admin" && !VG.can(roleKey, "view", "admin")) return;
      (store.list(def.coll) || []).forEach((r) => {
        const { title, sub } = enrichRow(def.coll, r);
        const hay = def.keys.map((k) => r[k]).concat([title, sub]).join(" ").toLowerCase();
        out.push({
          id: def.coll + ":" + r.id,
          coll: def.coll,
          recordId: r.id,
          module: def.module,
          section: def.section,
          type: def.label,
          icon: def.icon,
          title: String(title),
          subtitle: String(sub || ""),
          haystack: hay,
        });
      });
    });
    (VG.MODULES || []).forEach((m) => {
      if (!allowed.has(m.id)) return;
      if (!out.some((x) => x.id === "nav:" + m.id)) {
        out.push({
          id: "nav:" + m.id,
          module: m.id,
          section: null,
          type: "Module",
          icon: m.icon,
          title: m.name,
          subtitle: m.tagline,
          haystack: (m.name + " " + m.tagline + " " + m.category).toLowerCase(),
          isNav: true,
        });
      }
    });
    return out;
  };

  function UniversalSearch({ open, onClose, roleKey }) {
    const [q, setQ] = useState("");
    const [hi, setHi] = useState(0);
    const inputRef = useRef(null);

    const index = useMemo(() => (open ? VG.buildSearchIndex(roleKey) : []), [open, roleKey]);
    const ql = q.trim().toLowerCase();
    const results = useMemo(() => {
      if (!ql) return index.filter((x) => x.isNav).slice(0, 8);
      return index.filter((x) => x.haystack.includes(ql)).slice(0, 24);
    }, [index, ql]);

    useEffect(() => {
      if (open) {
        setQ("");
        setHi(0);
        setTimeout(() => inputRef.current && inputRef.current.focus(), 50);
      }
    }, [open]);

    useEffect(() => {
      const onKey = (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
          e.preventDefault();
          if (open) onClose();
          else VG._openSearch && VG._openSearch();
        }
        if (!open) return;
        if (e.key === "Escape") onClose();
        if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, results.length - 1)); }
        if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
        if (e.key === "Enter" && results[hi]) pick(results[hi]);
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [open, results, hi]);

    function pick(r) {
      onClose();
      if (r.isNav) {
        if (VG._openModule) VG._openModule(r.module);
      } else {
        VG.goTo(r.module, r.section);
      }
    }

    if (!open) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative w-full max-w-xl glass-dark rounded-2xl shadow-glass overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
            <Icon name="search" size={18} className="opacity-50" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => { setQ(e.target.value); setHi(0); }}
              placeholder="Search customers, orders, items, modules…"
              className="flex-1 bg-transparent outline-none text-sm"
            />
            <kbd className="text-[10px] opacity-40 glass px-1.5 py-0.5 rounded">ESC</kbd>
          </div>
          <ul className="max-h-[50vh] overflow-y-auto py-2">
            {results.length === 0 && <li className="px-4 py-8 text-center text-sm opacity-50">No matches for “{q}”</li>}
            {results.map((r, i) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => pick(r)}
                  onMouseEnter={() => setHi(i)}
                  className={"w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition " + (i === hi ? "bg-white/10" : "hover:bg-white/5")}
                >
                  <span className="grid place-items-center w-9 h-9 rounded-lg glass shrink-0">
                    <Icon name={r.icon} size={16} style={{ color: "var(--accent)" }} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <div className="font-medium truncate">{r.title}</div>
                    <div className="text-xs opacity-55 truncate">{r.subtitle || r.type}</div>
                  </span>
                  <Pill color="#6366f1">{r.type}</Pill>
                </button>
              </li>
            ))}
          </ul>
          <div className="px-4 py-2 border-t border-white/10 text-[10px] opacity-45 flex gap-3">
            <span>↑↓ navigate</span><span>↵ open</span><span>⌘K toggle</span>
          </div>
        </div>
      </div>
    );
  }

  VG.UniversalSearch = UniversalSearch;
})(window.VG);
