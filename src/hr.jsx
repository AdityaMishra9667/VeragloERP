/* Veraglo ERP — HR & Payroll (functional, Leave → Attendance → Payroll → Salary slip). */
(function (VG) {
  const { useState } = React;
  const ui = VG.ui, fx = VG.fx, store = VG.store, inr = VG.fmt.inr, today = VG.fmt.todayISO;
  const { Icon, Button, Pill, Card } = ui;
  const { Field, Text, Num, DateF, Select, Modal, InternalScreen, RecordTable, PageHead, ListPage, StatusTag, printDocument, DocActions } = fx;

  const empName = (id) => (store.get("employees", id) || {}).name || "—";
  const LV_STATUS = { Pending: "#f59e0b", Approved: "#34d399", Rejected: "#ef4444" };
  const monthNow = () => today().slice(0, 7);

  function slipDoc(slip) {
    if (VG.accountsSlipDoc) return VG.accountsSlipDoc(slip);
    return { title: "Salary Slip", subtitle: slip.employeeName, inner: "<p>" + slip.month + "</p>" };
  }

  function empDoc(emp) {
    return { title: "Employee Profile", subtitle: emp.code, inner: `<div class="vg-cols"><div class="vg-card"><b>${emp.name}</b>${emp.department}<br>${emp.designation}</div><div class="vg-card">CTC: ${inr(emp.ctc)}<br>DOJ: ${emp.doj}</div></div>` };
  }

  function EmployeeForm({ open, onClose, record, roleKey, can }) {
    const isEdit = !!(record && record.id);
    const [f, setF] = useState(() => record || { status: "Active", doj: today() });
    const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
    function save() {
      if (!f.name) return VG.toast("Name required", "error");
      if (isEdit) { store.update("employees", f.id, f, roleKey); VG.toast("Employee updated"); }
      else {
        const code = "EMP-" + String((store.list("employees").length + 1)).padStart(4, "0");
        store.create("employees", { ...f, code }, roleKey);
        VG.toast("Employee " + code + " added");
      }
      onClose();
    }
    return (
      <Modal open={open} onClose={onClose} size="lg" title={isEdit ? "Edit " + f.name : "New employee"}
        footer={<><Button variant="soft" onClick={onClose}>Cancel</Button><Button icon="check" onClick={save}>Save</Button></>}>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Full name" required><Text value={f.name} onChange={(v) => set("name", v)} /></Field>
          <Field label="Department"><Select value={f.department} onChange={(v) => set("department", v)} options={["Production", "Quality", "Sales", "Accounts", "HR", "Dispatch"].map((x) => ({ value: x, label: x }))} /></Field>
          <Field label="Designation"><Text value={f.designation} onChange={(v) => set("designation", v)} /></Field>
          <Field label="DOJ"><DateF value={f.doj} onChange={(v) => set("doj", v)} /></Field>
          <Field label="Annual CTC (₹)"><Num value={f.ctc} onChange={(v) => set("ctc", v)} /></Field>
          <Field label="PAN"><Text value={f.pan} onChange={(v) => set("pan", v)} /></Field>
          <Field label="Status"><Select value={f.status} onChange={(v) => set("status", v)} options={["Active", "Inactive"].map((x) => ({ value: x, label: x }))} /></Field>
        </div>
      </Modal>
    );
  }

  function Dashboard(props) {
    return VG.ModuleDashboard ? <VG.ModuleDashboard modId="hr" {...props} /> : null;
  }

  function EmployeesPage({ roleKey, can }) {
    VG.useDB();
    const [edit, setEdit] = useState(null);
    const [view, setView] = useState(null);
    const rows = store.list("employees");
    if (edit) {
      return <EmployeeForm open record={edit.id ? edit : null} roleKey={roleKey} can={can} onClose={() => setEdit(null)} />;
    }
    if (view) {
      return (
        <InternalScreen onBack={() => setView(null)} backLabel="Back to employees" title={view.name} subtitle={view.code}
          footer={<DocActions build={() => empDoc(view)} />}
          breadcrumbs={[{ label: "Employees", onClick: () => setView(null) }, { label: view.name }]}>
          <div className="text-sm grid sm:grid-cols-2 gap-3 max-w-2xl">
            <Card className="p-3">{view.department} · {view.designation}</Card>
            <Card className="p-3">CTC {inr(view.ctc)} · DOJ {view.doj}</Card>
          </div>
        </InternalScreen>
      );
    }
    return (
      <ListPage title="Employees" onNew={() => setEdit({})} newLabel="Add Employee" can={can}>
        <RecordTable embedded suppressNew title="Employee List" columns={[
          { key: "code", label: "Code" },
          { key: "name", label: "Name" },
          { key: "department", label: "Dept" },
          { key: "designation", label: "Role" },
          { key: "ctc", label: "CTC", render: (r) => inr(r.ctc) },
          { key: "status", label: "Status", render: (r) => <StatusTag value={r.status} map={{ Active: "#34d399", Inactive: "#94a3b8" }} /> },
        ]} rows={rows} can={can} printTitle="Employees" searchKeys={["name", "code", "department"]}
          onNew={() => setEdit({})} onView={(r) => setView(r)} onEdit={can("edit") ? (r) => setEdit(r) : null} />
      </ListPage>
    );
  }

  function LeavePage({ roleKey, can }) {
    VG.useDB();
    const rows = store.list("leaveRequests").slice().reverse();
    return (
      <ListPage title="Leave approvals" desc="Approved leave updates monthly attendance for payroll deductions" can={can}>
        <RecordTable embedded suppressNew title="Leave Request List" columns={[
          { key: "no", label: "#", render: (r) => <span className="font-mono text-xs">{r.no}</span> },
          { key: "employeeId", label: "Employee", render: (r) => empName(r.employeeId) },
          { key: "from", label: "From" },
          { key: "to", label: "To" },
          { key: "days", label: "Days" },
          { key: "type", label: "Type" },
          { key: "status", label: "Status", render: (r) => <StatusTag value={r.status} map={LV_STATUS} /> },
          { key: "act", label: "Action", render: (r) => r.status === "Pending" && can("edit") ? (
            <div className="flex gap-1">
              <Button variant="soft" className="!py-1" onClick={() => { store.approveLeave(r.id, roleKey); VG.toast("Leave approved · attendance updated"); }}>Approve</Button>
              <Button variant="ghost" className="!py-1" onClick={() => { store.rejectLeave(r.id, roleKey); VG.toast("Leave rejected"); }}>Reject</Button>
            </div>
          ) : null },
        ]} rows={rows} can={can} printTitle="Leave" filters={[{ key: "status", label: "All", options: ["Pending", "Approved", "Rejected"] }]} />
      </ListPage>
    );
  }

  function AttendancePage({ roleKey, can }) {
    VG.useDB();
    const [month, setMonth] = useState(monthNow());
    const rows = store.list("attendanceRecords").filter((a) => a.month === month).map((a) => ({
      ...a, emp: store.get("employees", a.employeeId) || {},
    }));
    return (
      <ListPage title="Monthly attendance" desc="Lock month before payroll · leave days affect deductions" can={can}>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Field label="Month"><Text value={month} onChange={setMonth} /></Field>
          {can("edit") && <Button variant="soft" onClick={() => { store.lockAttendanceMonth(month, roleKey); VG.toast("Attendance locked for " + month); }}>Lock month</Button>}
          <Button variant="soft" onClick={() => VG.goTo("attendance", "dashboard")}>Open Attendance module</Button>
        </div>
        <RecordTable embedded suppressNew title={"Attendance List · " + month} columns={[
          { key: "emp", label: "Employee", render: (r) => (r.emp.name || empName(r.employeeId)), csv: (r) => empName(r.employeeId) },
          { key: "present", label: "Present" },
          { key: "leave", label: "Leave" },
          { key: "absent", label: "Absent" },
          { key: "otHours", label: "OT hrs" },
          { key: "locked", label: "Locked", render: (r) => r.locked ? <Pill color="#94a3b8">Yes</Pill> : <Pill color="#34d399">Open</Pill> },
        ]} rows={rows} can={can} printTitle="Attendance" empty="No records for this month" />
      </ListPage>
    );
  }

  function PayrollPage({ roleKey, can }) {
    VG.useDB();
    const month = monthNow();
    const runs = store.list("payrollRuns").slice().reverse();
    const slips = store.list("salarySlips").filter((s) => s.month === month);
    const [viewSlip, setViewSlip] = useState(null);
    function runPayroll() {
      const run = store.runPayroll(month, roleKey);
      VG.toast("Payroll " + run.no + " processed · " + (run.employeeCount || 0) + " slips", "success");
    }
    if (viewSlip) {
      return (
        <InternalScreen onBack={() => setViewSlip(null)} backLabel="Back to payroll" title="Salary slip" subtitle={viewSlip.employeeName + " · " + viewSlip.month}
          footer={<DocActions build={() => slipDoc(viewSlip)} />}
          breadcrumbs={[{ label: "Payroll", onClick: () => setViewSlip(null) }, { label: viewSlip.employeeName }]}>
          <div className="grid sm:grid-cols-3 gap-3 text-sm w-full">
            <Card className="p-3">Gross {inr(viewSlip.gross)}</Card>
            <Card className="p-3">Leave ded. {inr(viewSlip.leaveDeduction)}</Card>
            <Card className="p-3 font-semibold">Net {inr(viewSlip.net)}</Card>
          </div>
        </InternalScreen>
      );
    }
    return (
      <ListPage title="Payroll" desc="Process monthly payroll after attendance is locked" can={can}>
        {can("add") && (
          <Card className="p-4 flex flex-wrap items-center gap-3 mb-4">
            <span className="text-sm">Run payroll for <b>{month}</b></span>
            <Button icon="rupee" onClick={runPayroll}>Run payroll</Button>
            <Button variant="soft" onClick={() => store.lockAttendanceMonth(month, roleKey)}>Lock attendance first</Button>
          </Card>
        )}
        <RecordTable embedded suppressNew title="Payroll Run List" columns={[
          { key: "no", label: "Run #" },
          { key: "month", label: "Month" },
          { key: "status", label: "Status" },
          { key: "totalNet", label: "Net payout", render: (r) => inr(r.totalNet) },
          { key: "employeeCount", label: "Employees" },
        ]} rows={runs} can={can} printTitle="Payroll runs" />
        <RecordTable embedded suppressNew title={"Salary Slip List · " + month} columns={[
          { key: "employeeCode", label: "Code" },
          { key: "employeeName", label: "Name" },
          { key: "gross", label: "Gross", render: (r) => inr(r.gross) },
          { key: "deductions", label: "Deductions", render: (r) => inr(r.deductions) },
          { key: "net", label: "Net", render: (r) => inr(r.net) },
        ]} rows={slips} can={can} printTitle="Salary slips" onView={(r) => setViewSlip(r)} />
      </ListPage>
    );
  }

  const SECTIONS = [
    { id: "dashboard", label: "Dashboard", icon: "chart", group: "Overview" },
    { id: "employees", label: "Employees", icon: "users", group: "People" },
    { id: "leave", label: "Leave", icon: "clock", group: "People" },
    { id: "attendance", label: "Attendance", icon: "activity", group: "People" },
    { id: "payroll", label: "Payroll", icon: "rupee", group: "Payroll" },
    { id: "reports", label: "Reports", icon: "chart", group: "Reports" },
  ];
  if (VG.registerModuleSections) VG.registerModuleSections("hr", SECTIONS);
  const PAGES = {
    dashboard: Dashboard, employees: EmployeesPage, leave: LeavePage,
    attendance: AttendancePage, payroll: PayrollPage,
    reports: function ReportsPage() {
      VG.useDB();
      return <div><PageHead title="HR Reports" /><Card className="p-4 text-sm opacity-60">Headcount, leave balance and payroll registers — export from each section.</Card></div>;
    },
  };

  VG.modules = VG.modules || {};
  VG.modules.hr = function HRModule({ mod, roleKey }) {
    const can = (a) => VG.can(roleKey, a);
    const [section, setSection] = useState(() => VG.consumeSection("hr", "dashboard"));
    const Page = PAGES[section] || Dashboard;
    return (
      <VG.ModuleScaffold mod={mod} sections={SECTIONS} section={section} setSection={setSection} roleKey={roleKey}
        actions={[
          { label: "Approve leave", icon: "clock", primary: true, onClick: () => setSection("leave") },
          { label: "Run payroll", icon: "rupee", onClick: () => setSection("payroll") },
        ]}>
        <Page roleKey={roleKey} can={can} go={setSection} mod={mod} />
      </VG.ModuleScaffold>
    );
  };
})(window.VG);
