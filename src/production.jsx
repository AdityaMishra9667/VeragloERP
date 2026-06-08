/* Veraglo ERP — Production Planning (functional, SO → WO → QC). */
(function (VG) {
  const { useState } = React;
  const ui = VG.ui, fx = VG.fx, store = VG.store, inr = VG.fmt.inr, today = VG.fmt.todayISO;
  const { Icon, Button, Pill, Card } = ui;
  const { Field, Text, Area, Num, DateF, Select, MasterSelect, Modal, InternalScreen, RecordTable, PageHead, StatusTag, printDocument, DocActions } = fx;

  const custName = (id) => (store.get("customers", id) || {}).name || "—";
  const canSeeCustomer = (roleKey) => store.canViewCustomerForRole ? store.canViewCustomerForRole(roleKey) : (roleKey === "admin");
  const WO_STATUS = {
    "Received from Sales": "#60a5fa", "BOM Pending": "#f59e0b", "BOM Under Review": "#a78bfa", "BOM Approved": "#22d3ee",
    "Material Requirement Generated": "#8b5cf6", "Material Availability Checked": "#0ea5e9", "Material Partially Issued": "#f97316",
    "Material Fully Issued": "#22c55e", "Production Planned": "#6366f1", "Production In Progress": "#f59e0b", "Production Completed": "#34d399",
    "Material Returned": "#14b8a6", "Sent to Finished Goods Store": "#10b981", Closed: "#64748b", Planned: "#a78bfa", Released: "#22d3ee", Running: "#f59e0b", Completed: "#34d399"
  };

  function woDoc(wo) {
    const so = wo.salesOrderId ? store.get("salesOrders", wo.salesOrderId) : null;
    const inner = `
      <div class="vg-cols">
        <div class="vg-card"><b>Work Order</b>No: ${wo.no}<br>Date: ${wo.date}<br>Line: ${wo.line || "—"}<br>Status: ${wo.status}</div>
        <div class="vg-card"><b>Sales Order</b>${wo.salesOrderNoMasked || wo.salesOrderNo || so && so.no || "—"}<br>Customer: ${wo.customerId ? custName(wo.customerId) : "Restricted"}</div>
        <div class="vg-card"><b>Output</b>Planned: ${wo.qtyPlanned || 0}<br>Produced: ${wo.qtyProduced || 0}<br>Target: ${wo.targetDate || "—"}</div>
      </div>
      <div class="vg-terms"><b>Product:</b> ${wo.product || ""} ${wo.sku ? "(" + wo.sku + ")" : ""}<br>${wo.remarks ? "<b>Remarks:</b> " + wo.remarks : ""}</div>
      <div class="vg-sign"><div>Prepared by: <b>${wo.preparedBy || "—"}</b></div><div>Checked by: <b>—</b></div><div>Approved by: <b>—</b></div></div>`;
    return { title: "Work Order", subtitle: wo.no, inner };
  }

  function CompleteModal({ wo, onClose, roleKey }) {
    const [qty, setQty] = useState(wo.qtyPlanned || 0);
    const [rejectQty, setRejectQty] = useState(0);
    const [remarks, setRemarks] = useState("");
    const [batchNo, setBatchNo] = useState(wo.batchNo || "");
    const [operatorName, setOperatorName] = useState("");
    const [supervisorName, setSupervisorName] = useState("");
    const [documents, setDocuments] = useState("");
    function submit() {
      store.completeWorkOrder(wo.id, { qtyProduced: qty, rejectQty, remarks, batchNo, operatorName, supervisorName, productionDocuments: documents }, roleKey);
      VG.toast("WO " + wo.no + " completed · sent to Quality & Dispatch queue", "success");
      onClose(true);
    }
    return (
      <Modal open onClose={() => onClose(false)} size="md" title={"Complete " + wo.no} subtitle="Posts production output and creates QC inspection"
        footer={<><Button variant="soft" onClick={() => onClose(false)}>Cancel</Button><Button icon="check" onClick={submit}>Complete WO</Button></>}>
        <div className="grid gap-3">
          <Field label="Quantity produced" required><Num value={qty} onChange={setQty} /></Field>
          <Field label="Rejected during production"><Num value={rejectQty} onChange={setRejectQty} /></Field>
          <Field label="Batch / lot number"><Text value={batchNo} onChange={setBatchNo} /></Field>
          <Field label="Operator name"><Text value={operatorName} onChange={setOperatorName} /></Field>
          <Field label="Supervisor name"><Text value={supervisorName} onChange={setSupervisorName} /></Field>
          <Field label="Production docs"><Text value={documents} onChange={setDocuments} placeholder="prod-report.pdf" /></Field>
          <Field label="Remarks"><Area value={remarks} onChange={setRemarks} rows={2} /></Field>
          <p className="text-xs opacity-60">Sales order moves through Production Completed → Sent to QC. Final dispatch starts only after QC acceptance.</p>
        </div>
      </Modal>
    );
  }

  function Dashboard(props) {
    return VG.ModuleDashboard ? <VG.ModuleDashboard modId="production" {...props} /> : null;
  }

  function WorkOrdersPage({ roleKey, can }) {
    VG.useDB();
    const [view, setView] = useState(null);
    const [complete, setComplete] = useState(null);
    const rows = store.list("workOrders").slice().reverse().map((w) => store.workOrderViewForRole ? store.workOrderViewForRole(w, roleKey) : w);
    const showCust = canSeeCustomer(roleKey);
    const cols = [
      { key: "no", label: "WO #", render: (r) => <span className="font-mono text-xs">{r.no}</span> },
      { key: "date", label: "Date" },
      { key: "salesOrderNo", label: "Sales order", render: (r) => r.salesOrderNoMasked || r.salesOrderNo || "—" },
      ...(showCust ? [{ key: "customerId", label: "Customer", render: (r) => custName(r.customerId), csv: (r) => custName(r.customerId) }] : []),
      { key: "product", label: "Product" },
      { key: "bomNo", label: "BOM", render: (r) => r.bomNo || "—" },
      { key: "priority", label: "Priority", render: (r) => <Pill color={r.priority === "Critical" ? "#ef4444" : r.priority === "High Priority" ? "#f59e0b" : r.priority === "Urgent" ? "#a855f7" : "#6366f1"}>{r.priority || "Normal"}</Pill> },
      { key: "qtyPlanned", label: "Planned", render: (r) => r.qtyPlanned + " / " + (r.qtyProduced || 0) },
      { key: "status", label: "Status", render: (r) => <StatusTag value={r.status} map={WO_STATUS} /> },
      { key: "rev", label: "Revision", render: (r) => r.revisionPendingAck ? <Pill color="#f59e0b">Rev {r.revisionNo || 0} pending</Pill> : (r.revisionNo ? <Pill color="#22d3ee">Rev {r.revisionNo}</Pill> : "—") },
      { key: "act", label: "Action", render: (r) => (
        <div className="flex gap-1 flex-wrap">
          {r.revisionPendingAck && can("edit") && <Button variant="soft" className="!py-1" onClick={() => { store.acknowledgeWorkOrderRevision(r.id, roleKey); VG.toast("Revision acknowledged"); }}>Acknowledge revision</Button>}
          {(r.status === "Received from Sales" || r.status === "BOM Pending" || r.status === "Planned") && can("edit") && <Button variant="soft" className="!py-1" onClick={() => { store.acceptWorkOrder(r.id, roleKey); VG.toast("WO accepted for planning"); }}>Accept</Button>}
          {!r.bomId && can("edit") && <Button variant="soft" className="!py-1" onClick={() => { VG.goTo("production", "bom"); VG.toast("Select or create BOM, then attach in WO details"); }}>BOM</Button>}
          {!r.materialRequirementId && can("edit") && <Button variant="soft" className="!py-1" onClick={() => {
            const mr = store.planMaterialRequirement(r.id, { priority: r.priority, requiredByDate: r.requiredDate }, roleKey);
            if (mr) VG.toast("Material requirement " + mr.no + " generated");
          }}>Plan material</Button>}
          {(r.status === "Material Fully Issued" || r.status === "Production Planned" || r.status === "Released" || r.status === "Running") && can("edit") && <Button variant="soft" className="!py-1" onClick={() => { store.update("workOrders", r.id, { status: "Production In Progress", productionStatus: "In Progress" }, roleKey); if (r.salesOrderId) store._setSOStage(r.salesOrderId, "Production In Progress", roleKey, "WO running"); VG.toast("WO running"); }}>Start</Button>}
          {(r.status === "Production In Progress" || r.status === "Released" || r.status === "Running") && can("edit") && <Button variant="soft" className="!py-1" onClick={() => setComplete(r)}>Complete</Button>}
          {r.status === "Completed" && <Button variant="soft" className="!py-1" onClick={() => VG.goTo("dispatch", "shipments")}>Dispatch</Button>}
        </div>
      ) },
    ];
    if (view) {
      const wo = store.get("workOrders", view.id) || view;
      const bom = wo.bomId ? store.get("boms", wo.bomId) : (store.getDefaultBom && store.getDefaultBom(wo.finishedItemId || (store.findItemBySku && store.findItemBySku(wo.sku) || {}).id));
      const reqs = bom && store.explodeBom ? store.explodeBom(bom.id, wo.qtyPlanned || 1) : [];
      return (
        <>
          <InternalScreen onBack={() => setView(null)} backLabel="Back to work orders" title={"Work Order " + wo.no} subtitle={custName(wo.customerId)}
            footer={<>
              <DocActions build={() => woDoc(wo)} />
              {can("edit") && bom && (
                <Button variant="soft" icon="check" onClick={() => { store.useExistingBomForWorkOrder(wo.id, bom.id, roleKey); VG.toast("BOM attached to WO"); setView(store.get("workOrders", wo.id)); }}>Use this BOM</Button>
              )}
              {!bom && can("edit") && (
                <Button variant="soft" icon="plus" onClick={() => {
                  const created = store.createWorkOrderSpecificBom(wo.id, { name: "WO " + wo.no + " BOM", qtyOutput: 1, lines: [] }, roleKey);
                  if (created) VG.toast("WO-specific BOM created: " + created.no);
                  setView(store.get("workOrders", wo.id));
                }}>Create WO BOM</Button>
              )}
              {wo.bomId && can("approve") && (
                <Button variant="soft" icon="shield" onClick={() => { store.approveBomForWorkOrder(wo.id, roleKey); VG.toast("BOM approved for WO"); setView(store.get("workOrders", wo.id)); }}>Approve BOM</Button>
              )}
              {wo.bomId && can("edit") && (
                <Button variant="soft" icon="edit" onClick={() => { const reason = window.prompt("Revision reason (mandatory):", ""); if (!reason) return; store.reviseWorkOrderBom(wo.id, { reason }, roleKey); VG.toast("BOM revision raised"); setView(store.get("workOrders", wo.id)); }}>Revise BOM</Button>
              )}
              {bom && (wo.status === "Production Planned" || wo.status === "Production In Progress" || wo.status === "Released" || wo.status === "Running") && can("edit") && (
                <Button variant="soft" icon="logout" onClick={() => {
                  const res = store.issueBomForWorkOrder(wo.id, roleKey, { allowPartial: true });
                  if (!res.ok) VG.toast(res.reason || "Issue failed", "error");
                  else VG.toast("Issued " + res.issued.length + " component(s)" + (res.skipped.length ? " · " + res.skipped.length + " short" : ""), res.skipped.length ? "warn" : "success");
                }}>Issue BOM materials</Button>
              )}
              {wo.status !== "Completed" && can("edit") && <Button icon="check" onClick={() => { setComplete(wo); }}>Mark complete</Button>}
            </>}>
            <StatusTag value={wo.status} map={WO_STATUS} />
            <div className="grid sm:grid-cols-4 gap-3 mt-4 text-sm">
              <Card className="p-3"><div className="text-[11px] uppercase opacity-55">SO</div>{wo.salesOrderNo}</Card>
              <Card className="p-3"><div className="text-[11px] uppercase opacity-55">Product</div>{wo.product}</Card>
              <Card className="p-3"><div className="text-[11px] uppercase opacity-55">Qty</div>{wo.qtyProduced || 0} / {wo.qtyPlanned}</Card>
              <Card className="p-3"><div className="text-[11px] uppercase opacity-55">BOM</div>{bom ? <span className="font-mono text-xs">{bom.no}</span> : <span className="text-rose-400/80">None</span>}</Card>
            </div>
            {reqs.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-semibold uppercase opacity-55 mb-2">Component requirements</div>
                <div className="overflow-x-auto rounded-xl glass">
                  <table className="w-full text-xs">
                    <thead><tr className="opacity-55 text-[10px] uppercase border-b border-white/10"><th className="text-left px-3 py-2">Item</th><th className="text-right px-3 py-2">Qty</th><th className="text-right px-3 py-2">Stock</th></tr></thead>
                    <tbody>{reqs.map((r, i) => {
                      const it = store.get("items", r.itemId);
                      const avail = store.onHand(r.itemId);
                      return <tr key={i} className="border-b border-white/5"><td className="px-3 py-1.5">{it ? (VG.itemMfr ? VG.itemMfr.label(it) : it.sku + " — " + it.name) : r.itemId}</td><td className="px-3 py-1.5 text-right">{r.qty} {r.unit}</td><td className={"px-3 py-1.5 text-right " + (avail < r.qty ? "text-amber-400" : "")}>{avail}</td></tr>;
                    })}</tbody>
                  </table>
                </div>
              </div>
            )}
          </InternalScreen>
          {complete && <CompleteModal wo={complete} onClose={(ok) => { setComplete(null); if (ok) setView(null); }} roleKey={roleKey} />}
        </>
      );
    }
    return (
      <div>
        <PageHead title="Work Orders" desc="Release → material planning → production completion → QC handoff" />
        <RecordTable tableId="production-work-orders" title="Work orders" columns={cols} rows={rows} can={can} printTitle="Work Orders" searchKeys={["no", "salesOrderNo", "product"]}
          filters={[{ key: "status", label: "All status", options: Object.keys(WO_STATUS) }]}
          onView={(r) => setView(r)} empty="No work orders — release from a confirmed sales order on the dashboard" />
      </div>
    );
  }

  function ShopFloorPage({ roleKey, can }) {
    VG.useDB();
    const lines = ["Line 1 — Drivers", "Line 2 — Assembly", "Line 3 — Packing"];
    const wos = store.list("workOrders").filter((w) => w.status === "Released" || w.status === "Running");
    return (
      <div className="space-y-4">
        <PageHead title="Shop Floor" desc="Live work order status by production line" />
        <div className="grid lg:grid-cols-3 gap-4">
          {lines.map((line) => {
            const onLine = wos.filter((w) => (w.line || "Line 1") === line.split(" — ")[0]);
            const pct = onLine.length ? Math.min(100, Math.round(onLine.reduce((s, w) => s + ((w.qtyProduced || 0) / (w.qtyPlanned || 1)) * 100, 0) / onLine.length)) : 0;
            return (
              <Card key={line} className="p-4">
                <div className="flex justify-between text-sm font-medium mb-2"><span>{line}</span><Pill color={pct > 80 ? "#34d399" : "#f59e0b"}>{onLine.length ? "Running" : "Idle"}</Pill></div>
                <div className="h-2 rounded-full bg-white/10 mb-3"><div className="h-full rounded-full" style={{ width: pct + "%", background: "var(--accent)" }} /></div>
                {onLine.length === 0 ? <div className="text-xs opacity-50">No active WO</div> : onLine.map((w) => (
                  <div key={w.id} className="text-xs glass rounded-lg p-2 mb-1.5">{w.no} · {w.product} · {w.qtyProduced || 0}/{w.qtyPlanned}</div>
                ))}
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  function ReportsPage() {
    VG.useDB();
    const wos = store.list("workOrders");
    const run = (title, rows) => printDocument({ title, subtitle: store.company().name, inner: `<table class="vg-tbl"><thead><tr><th>WO</th><th>SO</th><th>Customer</th><th>Status</th><th>Qty</th></tr></thead><tbody>${rows.map((w) => `<tr><td>${w.no}</td><td>${w.salesOrderNo || ""}</td><td>${custName(w.customerId)}</td><td>${w.status}</td><td>${w.qtyProduced || 0}/${w.qtyPlanned}</td></tr>`).join("") || "<tr><td colspan=5>No data</td></tr>"}</tbody></table>` }, "preview");
    return (
      <div>
        <PageHead title="Production Reports" />
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="p-4 flex items-center gap-4"><Icon name="chart" size={22} /><div className="flex-1"><div className="font-medium text-sm">Work Order Register</div><div className="text-xs opacity-55">{wos.length} records</div></div><Button variant="soft" onClick={() => run("WO Register", wos)}>Open</Button></Card>
          <Card className="p-4 flex items-center gap-4"><Icon name="factory" size={22} /><div className="flex-1"><div className="font-medium text-sm">Active WOs</div><div className="text-xs opacity-55">{wos.filter((w) => w.status === "Released").length} active</div></div><Button variant="soft" onClick={() => run("Active WOs", wos.filter((w) => w.status === "Released"))}>Open</Button></Card>
        </div>
      </div>
    );
  }

  function MaterialControlPage({ roleKey, can }) {
    VG.useDB();
    const [woId, setWoId] = useState("");
    const [refresh, setRefresh] = useState(0);
    const [consumedEdit, setConsumedEdit] = useState({});
    const [scrapEdit, setScrapEdit] = useState({});
    const [returnQtyEdit, setReturnQtyEdit] = useState({});
    const wos = store.list("workOrders").filter((w) => !!w.materialRequirementId);
    const wo = woId ? store.get("workOrders", woId) : null;
    const mr = wo && wo.materialRequirementId ? store.get("materialRequirements", wo.materialRequirementId) : null;
    const returns = store.list("returns").filter((r) => r.workOrderId === woId && r.kind === "Production Return");
    const scraps = store.list("scrap").filter((s) => s.workOrderId === woId);

    function sumByItem(rows, key) {
      const out = {};
      rows.forEach((r) => { out[r.itemId] = (out[r.itemId] || 0) + (Number(r[key]) || 0); });
      return out;
    }
    const returnedMap = sumByItem(returns, "qty");
    const scrapMap = sumByItem(scraps, "qty");

    function saveConsumption() {
      if (!mr || !can("edit")) return;
      const consume = {};
      const scrap = {};
      (mr.lines || []).forEach((ln) => {
        const baseConsumed = Number(ln.consumedQty ?? ln.issuedQty ?? 0);
        const baseScrap = Number(ln.scrapQty ?? scrapMap[ln.itemId] ?? 0);
        consume[ln.itemId] = Number(consumedEdit[ln.itemId] ?? baseConsumed);
        scrap[ln.itemId] = Number(scrapEdit[ln.itemId] ?? baseScrap);
      });
      store.recordWorkOrderMaterialConsumption(wo.id, { consume, scrap }, roleKey);
      VG.toast("Material consumption updated");
      setConsumedEdit({});
      setScrapEdit({});
      setRefresh((x) => x + 1);
    }
    function createReturnLine(itemId) {
      if (!wo || !mr || !can("edit")) return;
      const qty = Number(returnQtyEdit[itemId] || 0);
      if (qty <= 0) return VG.toast("Enter return quantity", "error");
      store.returnMaterialFromProduction(wo.id, { lines: [{ itemId, qtyReturned: qty, condition: "Good", remarks: "Return from WO Material Control" }], acceptedBy: roleKey }, roleKey);
      VG.toast("Production return created");
      setReturnQtyEdit((p) => ({ ...p, [itemId]: 0 }));
      setRefresh((x) => x + 1);
    }

    return (
      <div key={refresh} className="space-y-4">
        <PageHead title="WO Material Control" desc="Planned vs issued vs consumed vs returned vs scrap with alternate approval and shortage classification" />
        <Card className="p-3">
          <Field label="Work order">
            <Select value={woId} onChange={setWoId} options={[{ value: "", label: "Select work order" }].concat(wos.map((w) => ({ value: w.id, label: w.no + " · " + (w.product || "") })))} />
          </Field>
        </Card>
        {!mr && <Card className="p-6 text-center opacity-60">Select a work order with generated material requirement.</Card>}
        {mr && (
          <>
            <Card className="p-3">
              <div className="text-sm font-medium mb-2">Shortage Classification Panel</div>
              <div className="text-xs opacity-65">Classify each shortage as Critical / Non-critical / Substitute Available with vendor status tracking.</div>
            </Card>
            <div className="overflow-x-auto rounded-xl glass">
              <table className="w-full text-xs">
                <thead><tr className="opacity-60 text-[10px] uppercase border-b border-white/10">
                  <th className="text-left px-2 py-2">Item</th>
                  <th className="text-right px-2 py-2">Planned</th>
                  <th className="text-right px-2 py-2">Issued</th>
                  <th className="text-right px-2 py-2">Consumed</th>
                  <th className="text-right px-2 py-2">Returned</th>
                  <th className="text-right px-2 py-2">Scrap</th>
                  <th className="text-right px-2 py-2">Variance</th>
                  <th className="text-left px-2 py-2">Alternate</th>
                  <th className="text-left px-2 py-2">Shortage</th>
                  <th className="text-left px-2 py-2">Production Return</th>
                </tr></thead>
                <tbody>
                  {(mr.lines || []).map((ln, i) => {
                    const item = store.get("items", ln.itemId) || {};
                    const planned = Number(ln.requiredQty) || 0;
                    const issued = Number(ln.issuedQty) || 0;
                    const consumed = Number(consumedEdit[ln.itemId] ?? (ln.consumedQty ?? issued)) || 0;
                    const returned = Number(ln.returnedQty || returnedMap[ln.itemId] || 0);
                    const scrap = Number(scrapEdit[ln.itemId] ?? (ln.scrapQty || scrapMap[ln.itemId] || 0));
                    const variance = Math.round((planned - consumed - scrap + returned) * 1000) / 1000;
                    return (
                      <tr key={i} className="border-b border-white/5 align-top">
                        <td className="px-2 py-2">
                          <div className="font-mono">{item.sku || ln.sku || ln.itemId}</div>
                          <div className="opacity-65">{item.name || ln.description}</div>
                        </td>
                        <td className="px-2 py-2 text-right">{planned}</td>
                        <td className="px-2 py-2 text-right">{issued}</td>
                        <td className="px-2 py-2 text-right">
                          {can("edit")
                            ? <Num value={consumed} onChange={(v) => setConsumedEdit((p) => ({ ...p, [ln.itemId]: Number(v || 0) }))} />
                            : consumed}
                        </td>
                        <td className="px-2 py-2 text-right">{returned}</td>
                        <td className="px-2 py-2 text-right">
                          {can("edit")
                            ? <Num value={scrap} onChange={(v) => setScrapEdit((p) => ({ ...p, [ln.itemId]: Number(v || 0) }))} />
                            : scrap}
                        </td>
                        <td className={"px-2 py-2 text-right " + (Math.abs(variance) > 0.001 ? "text-amber-400" : "")}>{variance}</td>
                        <td className="px-2 py-2">
                          {ln.alternateItemId ? (
                            <div className="space-y-1">
                              <div className="opacity-70">Alt: {(store.get("items", ln.alternateItemId) || {}).sku || ln.alternateItemId}</div>
                              {ln.alternateApproved
                                ? <Pill color="#22c55e">Approved</Pill>
                                : (can("approve") ? <Button variant="soft" className="!py-1" onClick={() => { store.approveAlternateForMrLine(mr.id, ln.itemId, { alternateItemId: ln.alternateItemId }, roleKey); setRefresh((x) => x + 1); }}>Approve alt</Button> : <Pill color="#f59e0b">Pending</Pill>)}
                            </div>
                          ) : <span className="opacity-50">—</span>}
                        </td>
                        <td className="px-2 py-2">
                          <div className="space-y-1">
                            <Select value={ln.shortageClass || ""} onChange={(v) => { store.classifyShortageForMrLine(mr.id, ln.itemId, { shortageClass: v }, roleKey); setRefresh((x) => x + 1); }}
                              options={[{ value: "", label: "Classify" }, { value: "Critical", label: "Critical shortage" }, { value: "Non-critical", label: "Non-critical shortage" }, { value: "Substitute available", label: "Substitute available" }]} />
                            <Select value={ln.vendorStatus || ""} onChange={(v) => { store.classifyShortageForMrLine(mr.id, ln.itemId, { vendorStatus: v }, roleKey); setRefresh((x) => x + 1); }}
                              options={[{ value: "", label: "Vendor status" }, { value: "Purchase pending", label: "Purchase pending" }, { value: "Vendor delivery pending", label: "Vendor delivery pending" }]} />
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          {can("edit") ? (
                            <div className="flex items-center gap-1">
                              <Num value={returnQtyEdit[ln.itemId] || 0} onChange={(v) => setReturnQtyEdit((p) => ({ ...p, [ln.itemId]: Number(v || 0) }))} />
                              <Button variant="soft" className="!py-1" onClick={() => createReturnLine(ln.itemId)}>Create</Button>
                            </div>
                          ) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {can("edit") && <div className="flex justify-end"><Button icon="check" onClick={saveConsumption}>Save variance baseline</Button></div>}
          </>
        )}
      </div>
    );
  }

  function BomPage(props) {
    return VG.BomListPage ? <VG.BomListPage {...props} mode="production" /> : null;
  }
  function MrpPage(props) {
    return VG.BomRequirementsPage ? <VG.BomRequirementsPage {...props} /> : null;
  }

  const SECTIONS = [
    { id: "dashboard", label: "Dashboard", icon: "chart", group: "Overview" },
    { id: "orders", label: "Work Orders", icon: "factory", group: "Shop Floor" },
    { id: "shop", label: "Shop Floor", icon: "grid", group: "Shop Floor" },
    { id: "bom", label: "BOM Register", icon: "flow", group: "Planning" },
    { id: "mrp", label: "Material Requirements", icon: "box", group: "Planning" },
    { id: "material-control", label: "WO Material Control", icon: "settings", group: "Planning" },
    { id: "reports", label: "Reports", icon: "chart", group: "Reports" },
  ];
  if (VG.registerModuleSections) VG.registerModuleSections("production", SECTIONS);
  const PAGES = { dashboard: Dashboard, orders: WorkOrdersPage, bom: BomPage, mrp: MrpPage, "material-control": MaterialControlPage, shop: ShopFloorPage, reports: ReportsPage };

  VG.modules = VG.modules || {};
  VG.modules.production = function ProductionModule({ mod, roleKey }) {
    const can = (a) => VG.can(roleKey, a);
    const [section, setSection] = useState(() => VG.consumeSection("production", "dashboard"));
    const Page = PAGES[section] || Dashboard;
    const actions = [
      { label: "Release work order", icon: "factory", primary: true, onClick: () => setSection("orders") },
      { label: "Issue materials", icon: "logout", onClick: () => setSection("mrp") },
      { label: "Material control", icon: "settings", onClick: () => setSection("material-control") },
      { label: "BOM register", icon: "flow", onClick: () => setSection("bom") },
      { label: "Shop floor", icon: "grid", onClick: () => setSection("shop") },
    ];
    return (
      <VG.ModuleScaffold mod={mod} sections={SECTIONS} section={section} setSection={setSection} actions={actions} roleKey={roleKey}>
        <Page roleKey={roleKey} can={can} go={setSection} mod={mod} />
      </VG.ModuleScaffold>
    );
  };
})(window.VG);
