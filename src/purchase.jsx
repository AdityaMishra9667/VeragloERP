/* Veraglo ERP — Purchase Management module (functional, interconnected). */
(function (VG) {
  const { useState } = React;
  const ui = VG.ui, fx = VG.fx, store = VG.store, inr = VG.fmt.inr, today = VG.fmt.todayISO;
  const { Icon, Button, Pill, Card } = ui;
  const { Field, Text, Area, Num, DateF, Select, MasterSelect, Modal, InternalScreen, RecordTable, PageHead, StatusTag, printDocument, DocActions } = fx;

  const itemName = (id) => (VG.itemDisplay && VG.itemDisplay.tableLabel(id)) || (VG.itemMfr && VG.itemMfr.label(id)) || "—";
  const itemNameSkuPdf = (id) => (VG.itemDisplay && VG.itemDisplay.itemNameSkuCell(id)) || itemName(id);
  const suppName = (id) => (store.get("suppliers", id) || {}).name || "—";

  const PR_STATUS = { Pending: "#f59e0b", Approved: "#34d399", Ordered: "#6366f1", Rejected: "#ef4444" };
  const PO_STATUS = { Open: "#22d3ee", Approved: "#34d399", Received: "#6366f1", Closed: "#94a3b8", Cancelled: "#ef4444" };

  /* ---------- PO document ---------- */
  function poDoc(po) {
    const supp = store.get("suppliers", po.supplierId) || {};
    const rows = (po.lines || []).map((l, i) => {
      const amt = (Number(l.qty) || 0) * (Number(l.rate) || 0);
      const it = store.get("items", l.itemId) || {};
      const desc = (VG.itemDisplay && VG.itemDisplay.itemDescription(it)) || "";
      return `<tr><td>${i + 1}</td><td>${itemNameSkuPdf(l.itemId)}</td><td>${(VG.itemDisplay && VG.itemDisplay.nl2br(desc)) || ""}</td><td>${it.hsn || ""}</td><td class="vg-right">${l.qty} ${l.uom || ""}</td><td class="vg-right">${inr(l.rate)}</td><td class="vg-right">${inr(amt)}</td></tr>`;
    }).join("");
    const inner = `
      <div class="vg-cols">
        <div class="vg-card"><b>Supplier</b>${supp.name || "—"}<br>${supp.address || ""}<br>GSTIN: ${supp.gstin || "—"}</div>
        <div class="vg-card"><b>Purchase Order</b>No: ${po.no}<br>Date: ${po.date}<br>Status: ${po.status}${po.prNo ? "<br>Ref PR: " + po.prNo : ""}</div>
        <div class="vg-card"><b>Deliver To</b>${store.company().name}<br>${store.company().address}</div>
      </div>
      <table class="vg-tbl"><thead><tr><th>#</th><th>Item Name / SKU</th><th>Item Description</th><th>HSN/SAC</th><th class="vg-right">Qty</th><th class="vg-right">Rate</th><th class="vg-right">Amount</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="vg-totals"><div class="grand"><span>Total</span><span>${inr(po.total || 0)}</span></div></div>
      <div class="vg-terms"><b>Terms:</b> Goods subject to incoming quality inspection. Please quote PO number on all documents.</div>
      <div class="vg-sign"><div>Prepared by: <b>${po.preparedBy || "—"}</b></div><div>Checked by: <b>—</b></div><div>Approved by: <b>${po.approvedBy || "—"}</b></div><div>For ${store.company().name}</div></div>`;
    return { title: "Purchase Order", subtitle: po.no + " · " + suppName(po.supplierId), inner };
  }

  /* ---------- PR form ---------- */
  function PRForm({ open, onClose, record, roleKey, can }) {
    const isEdit = !!(record && record.id);
    const [f, setF] = useState(() => record || { date: today(), priority: "Normal", status: "Pending", uom: "Nos" });
    const [dirty, setDirty] = useState(false);
    const set = (k, v) => { setDirty(true); setF((p) => ({ ...p, [k]: v })); };
    function pickItem(id) { const it = store.get("items", id) || {}; setDirty(true); setF((p) => ({ ...p, itemId: id, uom: it.unit, qty: p.qty || it.reorder })); }
    function save() {
      if (!f.itemId) return VG.toast("Select an item from master", "error");
      if (!(Number(f.qty) > 0)) return VG.toast("Quantity must be greater than 0", "error");
      if (isEdit) { store.update("purchaseRequests", f.id, f, roleKey); VG.toast("Request " + f.no + " updated"); }
      else { const no = store.nextNo("PR", f.date); store.create("purchaseRequests", { ...f, no, raisedBy: roleKey }, roleKey); VG.toast("Purchase request " + no + " created"); }
      onClose();
    }
    return (
      <Modal open={open} onClose={onClose} size="lg" dirty={dirty} title={isEdit ? "Edit Request " + f.no : "New Purchase Request"} subtitle="Items come from the item master only"
        footer={<><Button variant="soft" onClick={onClose}>Close</Button><Button icon="check" onClick={save}>{isEdit ? "Save changes" : "Raise request"}</Button></>}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Field label="Date" required><DateF value={f.date} onChange={(v) => set("date", v)} /></Field>
          <Field label="Item (master)" required className="lg:col-span-2"><MasterSelect variant="line" collection="items" value={f.itemId} onChange={pickItem} actorRole={roleKey} can={can("add")} /></Field>
          <Field label="Quantity" required><Num value={f.qty} onChange={(v) => set("qty", v)} /></Field>
          <Field label="Unit"><Text value={f.uom} onChange={(v) => set("uom", v)} /></Field>
          <Field label="Priority"><Select value={f.priority} onChange={(v) => set("priority", v)} options={["Low", "Normal", "High", "Urgent"].map((x) => ({ value: x, label: x }))} /></Field>
          <Field label="Needed by"><DateF value={f.neededBy} onChange={(v) => set("neededBy", v)} /></Field>
          <Field label="Preferred supplier (master)" className="lg:col-span-2"><MasterSelect collection="suppliers" value={f.supplierId} onChange={(v) => set("supplierId", v)} actorRole={roleKey} can={can("add")} /></Field>
          <Field label="Justification / reason" className="sm:col-span-2 lg:col-span-3"><Area value={f.reason} onChange={(v) => set("reason", v)} rows={2} /></Field>
        </div>
      </Modal>
    );
  }

  /* ================= Sections ================= */
  function Dashboard(props) {
    return VG.ModuleDashboard ? <VG.ModuleDashboard modId="purchase" {...props} /> : null;
  }

  function RequestsPage({ roleKey, can }) {
    VG.useDB();
    const [edit, setEdit] = useState(null);
    const rows = store.list("purchaseRequests").slice().reverse();
    const cols = [
      { key: "no", label: "PR #", render: (r) => <span className="font-mono text-xs">{r.no}</span> },
      { key: "date", label: "Date" },
      { key: "itemId", label: "Item", render: (r) => itemName(r.itemId), csv: (r) => itemName(r.itemId) },
      { key: "qty", label: "Qty", render: (r) => r.qty + " " + (r.uom || "") },
      { key: "priority", label: "Priority", render: (r) => <Pill color={r.priority === "Urgent" || r.priority === "High" ? "#f59e0b" : "#94a3b8"}>{r.priority}</Pill> },
      { key: "status", label: "Status", render: (r) => <StatusTag value={r.status} map={PR_STATUS} /> },
      { key: "act", label: "Action", render: (r) => {
        if (r.status === "Pending" && can("approve")) return <div className="flex gap-1.5"><Button variant="soft" className="!py-1" onClick={() => { store.update("purchaseRequests", r.id, { status: "Approved", approvedBy: roleKey }, roleKey); VG.toast("Request " + r.no + " approved"); }}>Approve</Button><Button variant="ghost" className="!py-1" onClick={() => { store.update("purchaseRequests", r.id, { status: "Rejected" }, roleKey); VG.toast("Request " + r.no + " rejected"); }}>Reject</Button></div>;
        if (r.status === "Approved" && can("add")) return <Button variant="soft" className="!py-1" onClick={() => { const po = store.poFromRequest(r.id, {}, roleKey); VG.toast("Purchase Order " + po.no + " created"); }}>Create PO</Button>;
        if (r.status === "Ordered") return <span className="text-xs opacity-60">{r.poNo}</span>;
        return <span className="opacity-40 text-xs">—</span>;
      } },
    ];
    return (
      <div>
        <PageHead title="Purchase Requests" desc="Raise, approve and convert requisitions into purchase orders" />
        <RecordTable title="Requests" columns={cols} rows={rows} can={can} printTitle="Purchase Requests" searchKeys={["no"]}
          filters={[{ key: "status", label: "All status", options: ["Pending", "Approved", "Ordered", "Rejected"] }]}
          onNew={() => setEdit({})} newLabel="New Request" onEdit={(r) => setEdit(r)} empty="No purchase requests yet" />
        {edit && <PRForm open onClose={() => setEdit(null)} record={edit.id ? edit : null} roleKey={roleKey} can={can} />}
      </div>
    );
  }

  function OrdersPage({ roleKey, can }) {
    VG.useDB();
    const [view, setView] = useState(null);
    const rows = store.list("purchaseOrders").slice().reverse();
    const cols = [
      { key: "no", label: "PO #", render: (r) => <span className="font-mono text-xs">{r.no}</span> },
      { key: "date", label: "Date" },
      { key: "supplierId", label: "Supplier", render: (r) => suppName(r.supplierId), csv: (r) => suppName(r.supplierId) },
      { key: "total", label: "Value", render: (r) => inr(r.total), csv: (r) => r.total },
      { key: "status", label: "Status", render: (r) => <StatusTag value={r.status} map={PO_STATUS} /> },
    ];
    const po = view ? (store.get("purchaseOrders", view.id) || view) : null;
    if (po) {
      return (
        <InternalScreen onBack={() => setView(null)} backLabel="Back to purchase orders" title={"Purchase Order " + po.no} subtitle={suppName(po.supplierId)}
          footer={<><DocActions build={() => poDoc(po)} />{can("edit") && po.status === "Open" && <Button variant="soft" icon="check" onClick={() => { store.update("purchaseOrders", po.id, { status: "Approved", approvedBy: roleKey }, roleKey); setView(store.get("purchaseOrders", po.id)); VG.toast("PO " + po.no + " approved"); }}>Approve</Button>}<Button icon="download" onClick={() => VG.goTo("inventory", "receipt")}>Record receipt</Button></>}>
          <div className="flex items-center gap-2 mb-4"><StatusTag value={po.status} map={PO_STATUS} /><span className="text-sm opacity-60 ml-auto">{po.date}{po.prNo ? " · from " + po.prNo : ""}</span></div>
          <div className="overflow-x-auto rounded-xl glass">
            <table className="w-full text-xs"><thead className="text-[10px] uppercase opacity-55 vg-sticky-thead"><tr className="text-left border-b border-white/10"><th className="px-3 py-2">Item</th><th className="px-3 py-2 text-right">Qty</th><th className="px-3 py-2 text-right">Rate</th><th className="px-3 py-2 text-right">Amount</th></tr></thead>
              <tbody>{(po.lines || []).map((l, i) => <tr key={i} className="border-b border-white/5"><td className="px-3 py-2">{itemName(l.itemId)}</td><td className="px-3 py-2 text-right">{l.qty} {l.uom}</td><td className="px-3 py-2 text-right">{inr(l.rate)}</td><td className="px-3 py-2 text-right font-medium">{inr((Number(l.qty) || 0) * (Number(l.rate) || 0))}</td></tr>)}</tbody>
            </table>
          </div>
          <div className="flex justify-end mt-3 text-sm"><div className="w-56"><div className="flex justify-between font-semibold text-base border-t border-white/10 pt-1"><span>Total</span><span>{inr(po.total || 0)}</span></div></div></div>
        </InternalScreen>
      );
    }
    return (
      <div>
        <PageHead title="Purchase Orders" desc="Issued orders awaiting goods receipt from Stores" />
        <RecordTable tableId="purchase-orders" title="Purchase orders" columns={cols} rows={rows} can={can} printTitle="Purchase Orders" searchKeys={["no"]}
          filters={[{ key: "status", label: "All status", options: ["Open", "Approved", "Received", "Closed", "Cancelled"] }]}
          onView={(r) => setView(r)} empty="No purchase orders — approve a request to create one" />
      </div>
    );
  }

  function PendingReceiptPage({ roleKey, can }) {
    VG.useDB();
    const rows = store.list("materialReceipts").filter((r) => r.status === "Pending QC" || r.status === "Pending" || !r.posted).slice().reverse();
    const cols = [
      { key: "no", label: "MRN", render: (r) => <span className="font-mono text-xs">{r.no}</span> },
      { key: "date", label: "Date" },
      { key: "itemId", label: "Item", render: (r) => itemName(r.itemId), csv: (r) => itemName(r.itemId) },
      { key: "qty", label: "Qty", render: (r) => (r.qtyReceived || r.qty) + " " + (r.unit || "") },
      { key: "status", label: "Status", render: (r) => <Pill color="#f59e0b">{r.status || "Pending"}</Pill> },
    ];
    return (
      <div>
        <PageHead title="Material Pending Receipt" desc="Goods received awaiting QC clearance and stock posting" />
        <RecordTable title="Pending receipts" columns={cols} rows={rows} can={can} printTitle="Pending Material Receipt" searchKeys={["no"]} empty="No pending receipts — all material cleared" />
      </div>
    );
  }

  function ReportsPage({ roleKey, can }) {
    VG.useDB();
    const prs = store.list("purchaseRequests"), pos = store.list("purchaseOrders");
    const reports = [
      { n: "Purchase Pending Report", d: "Requests awaiting approval/order", rows: prs.filter((x) => x.status === "Pending" || x.status === "Approved"), kind: "pr" },
      { n: "Open PO Report", d: "Orders awaiting receipt", rows: pos.filter((x) => x.status !== "Closed" && x.status !== "Cancelled"), kind: "po" },
      { n: "All Purchase Orders", d: "Complete order register", rows: pos, kind: "po" },
    ];
    function print(r) {
      const body = (r.rows || []).map((x) => r.kind === "pr"
        ? `<tr><td>${x.no}</td><td>${x.date}</td><td>${itemName(x.itemId)}</td><td>${x.qty} ${x.uom || ""}</td><td>${x.status}</td></tr>`
        : `<tr><td>${x.no}</td><td>${x.date}</td><td>${suppName(x.supplierId)}</td><td>${inr(x.total)}</td><td>${x.status}</td></tr>`).join("");
      const head = r.kind === "pr" ? "<th>#</th><th>Date</th><th>Item</th><th>Qty</th><th>Status</th>" : "<th>#</th><th>Date</th><th>Supplier</th><th>Value</th><th>Status</th>";
      printDocument({ title: r.n, subtitle: store.company().name, inner: `<table class="vg-tbl"><thead><tr>${head}</tr></thead><tbody>${body || '<tr><td colspan=5>No data</td></tr>'}</tbody></table>` }, "preview");
    }
    return (
      <div>
        <PageHead title="Purchase Reports" desc="Company header & footer · preview, print or save as PDF" />
        <div className="grid sm:grid-cols-2 gap-4">{reports.map((r) => (
          <Card key={r.n} className="p-4 flex items-center gap-4">
            <span className="grid place-items-center w-11 h-11 rounded-xl text-white shrink-0" style={{ background: "var(--accent)" }}><Icon name="chart" size={18} /></span>
            <div className="flex-1 min-w-0"><div className="font-medium text-sm">{r.n}</div><div className="text-[11px] opacity-55">{r.d} · {(r.rows || []).length} rows</div></div>
            <Button variant="soft" icon="eye" onClick={() => print(r)}>Open</Button>
          </Card>
        ))}</div>
      </div>
    );
  }

  const SECTIONS = [
    { id: "dashboard", label: "Dashboard", icon: "chart", group: "Overview" },
    { id: "requests", label: "Purchase Request", icon: "inbox", group: "Purchase" },
    { id: "orders", label: "Purchase Order", icon: "cart", group: "Purchase" },
    { id: "receipt", label: "Material Pending Receipt", icon: "download", group: "Purchase" },
    { id: "reports", label: "Supplier Reports", icon: "chart", group: "Reports" },
  ];
  if (VG.registerModuleSections) VG.registerModuleSections("purchase", SECTIONS);
  const PAGES = { dashboard: Dashboard, requests: RequestsPage, orders: OrdersPage, receipt: PendingReceiptPage, reports: ReportsPage };

  VG.modules = VG.modules || {};
  VG.modules.purchase = function PurchaseModule({ mod, roleKey }) {
    const can = (a) => VG.can(roleKey, a);
    const [section, setSection] = useState(() => VG.consumeSection("purchase", "dashboard"));
    const Page = PAGES[section] || Dashboard;
    const actions = [
      { label: "New request", icon: "plus", primary: true, onClick: () => setSection("requests") },
      { label: "Purchase orders", icon: "cart", onClick: () => setSection("orders") },
      { label: "Reports", icon: "chart", onClick: () => setSection("reports") },
    ];
    return (
      <VG.ModuleScaffold mod={mod} sections={SECTIONS} section={section} setSection={setSection} actions={actions} roleKey={roleKey}>
        <Page roleKey={roleKey} can={can} go={setSection} mod={mod} />
      </VG.ModuleScaffold>
    );
  };
})(window.VG);
