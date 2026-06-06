const seedEmployees = [
  {
    id: crypto.randomUUID(),
    employeeCode: "GLS2627001",
    name: "Maya Iyer",
    dob: "1992-07-14",
    joiningDate: "2026-05-04",
    gender: "Female",
    maritalStatus: "Married",
    fatherOrSpouseName: "Rohan Iyer",
    bloodGroup: "B+",
    mobile: "9876543210",
    additionalContact: "9876501234",
    additionalRelation: "Spouse",
    email: "maya.iyer@veraglo.com",
    photo: "",
    aadhaar: "123456789012",
    pan: "ABCDE1234F",
    uan: "100200300400",
    esicIpNumber: "",
    nomineeName: "Rohan Iyer",
    nomineeRelation: "Spouse",
    presentAddress: "Andheri East, Mumbai, Maharashtra 400069",
    permanentAddress: "Andheri East, Mumbai, Maharashtra 400069",
    department: "Operations",
    designation: "Operations Executive",
    basicPay: 30000,
    hra: 12000,
    allowance: 8000,
    bonus: 2500,
    otherDeductions: 1000,
    pfApplicable: "Yes",
    esiApplicable: "Auto by wage limit",
    paymentMode: "Bank transfer",
    bankName: "HDFC Bank",
    bankAccount: "123456789012",
    ifsc: "HDFC0001234"
  },
  {
    id: crypto.randomUUID(),
    employeeCode: "GLS2627002",
    name: "Arjun Mehta",
    dob: "1989-11-03",
    joiningDate: "2026-05-08",
    gender: "Male",
    maritalStatus: "Single",
    fatherOrSpouseName: "Suresh Mehta",
    bloodGroup: "O+",
    mobile: "9765432109",
    additionalContact: "9765409876",
    additionalRelation: "Father",
    email: "arjun.mehta@veraglo.com",
    photo: "",
    aadhaar: "234567890123",
    pan: "BCDEF2345G",
    uan: "200300400500",
    esicIpNumber: "",
    nomineeName: "Suresh Mehta",
    nomineeRelation: "Father",
    presentAddress: "Koramangala, Bengaluru, Karnataka 560034",
    permanentAddress: "Navrangpura, Ahmedabad, Gujarat 380009",
    department: "Engineering",
    designation: "Software Engineer",
    basicPay: 55000,
    hra: 22000,
    allowance: 13000,
    bonus: 5000,
    otherDeductions: 1800,
    pfApplicable: "Yes",
    esiApplicable: "Auto by wage limit",
    paymentMode: "Bank transfer",
    bankName: "ICICI Bank",
    bankAccount: "234567890123",
    ifsc: "ICIC0002345"
  },
  {
    id: crypto.randomUUID(),
    employeeCode: "GLS2627003",
    name: "Nisha Rao",
    dob: "1995-02-22",
    joiningDate: "2026-05-12",
    gender: "Female",
    maritalStatus: "Single",
    fatherOrSpouseName: "Vijay Rao",
    bloodGroup: "A+",
    mobile: "9654321098",
    additionalContact: "9654309876",
    additionalRelation: "Mother",
    email: "nisha.rao@veraglo.com",
    photo: "",
    aadhaar: "345678901234",
    pan: "CDEFG3456H",
    uan: "300400500600",
    esicIpNumber: "",
    nomineeName: "Lakshmi Rao",
    nomineeRelation: "Mother",
    presentAddress: "Hitech City, Hyderabad, Telangana 500081",
    permanentAddress: "Hitech City, Hyderabad, Telangana 500081",
    department: "Sales",
    designation: "Sales Associate",
    basicPay: 20000,
    hra: 9000,
    allowance: 6000,
    bonus: 8000,
    otherDeductions: 750,
    pfApplicable: "Yes",
    esiApplicable: "Auto by wage limit",
    paymentMode: "Bank transfer",
    bankName: "State Bank of India",
    bankAccount: "345678901234",
    ifsc: "SBIN0003456"
  }
];

const allIndiaHolidays2026 = [
  { name: "Republic Day", date: "2026-01-26" },
  { name: "Id-ul-Fitr", date: "2026-03-21" },
  { name: "Mahavir Jayanti", date: "2026-03-31" },
  { name: "Good Friday", date: "2026-04-03" },
  { name: "Buddha Purnima", date: "2026-05-01" },
  { name: "Id-ul-Zuha", date: "2026-05-27" },
  { name: "Muharram", date: "2026-06-26" },
  { name: "Independence Day", date: "2026-08-15" },
  { name: "Id-e-Milad", date: "2026-08-26" },
  { name: "Mahatma Gandhi Jayanti", date: "2026-10-02" },
  { name: "Dussehra", date: "2026-10-20" },
  { name: "Diwali", date: "2026-11-08" },
  { name: "Guru Nanak Jayanti", date: "2026-11-24" },
  { name: "Christmas Day", date: "2026-12-25" }
];

const storageKey = "india-payroll-employees";
const attendanceStorageKey = "india-payroll-attendance";
const payrollRunStorageKey = "india-payroll-run-adjustments";
const advanceStorageKey = "india-payroll-advances";
const leaveRequestStorageKey = "india-payroll-leave-requests";
const historyStorageKey = "india-payroll-history";
const organizationStorageKey = "india-payroll-organizations";
const adminUserStorageKey = "india-payroll-admin-users";
const adminRoleStorageKey = "india-payroll-admin-roles";
const adminSettingsStorageKey = "india-payroll-admin-settings";
const employeeChangeStorageKey = "india-payroll-employee-change-requests";
const monthlyLeaveCredit = 1.25;
const freeShortLeaves = 2;
const shortLeaveDeductionDays = 0.5;
const pfRate = 0.12;
const epfWageLimit = 15000;
const esiEmployeeRate = 0.0075;
const esiEmployerRate = 0.0325;
const esiWageLimit = 21000;
const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const appShell = document.querySelector(".app-shell");
const form = document.querySelector("#employeeForm");
const formTitle = document.querySelector("#formTitle");
const submitButton = document.querySelector("#submitButton");
const cancelEdit = document.querySelector("#cancelEdit");
const rows = document.querySelector("#payrollRows");
const emptyState = document.querySelector("#emptyState");
const search = document.querySelector("#search");
const departmentFilter = document.querySelector("#departmentFilter");
const employeeStatusFilter = document.querySelector("#employeeStatusFilter");
const employeeSort = document.querySelector("#employeeSort");
const employeePrevPage = document.querySelector("#employeePrevPage");
const employeeNextPage = document.querySelector("#employeeNextPage");
const employeePageInfo = document.querySelector("#employeePageInfo");
const totalEmployees = document.querySelector("#totalEmployees");
const grossPayroll = document.querySelector("#grossPayroll");
const netPayroll = document.querySelector("#netPayroll");
const totalStatutory = document.querySelector("#totalStatutory");
const holidayList = document.querySelector("#holidayList");
const todayLabel = document.querySelector("#todayLabel");
const dailyMessage = document.querySelector("#dailyMessage");
const homeLoginForm = document.querySelector("#homeLoginForm");
const homeLoginRole = document.querySelector("#homeLoginRole");
const homeLoginUser = document.querySelector("#homeLoginUser");
const homeLoginPassword = document.querySelector("#homeLoginPassword");
const homeLoginMessage = document.querySelector("#homeLoginMessage");
const forgotPasswordForm = document.querySelector("#forgotPasswordForm");
const forgotPasswordContact = document.querySelector("#forgotPasswordContact");
const forgotPasswordMessage = document.querySelector("#forgotPasswordMessage");
const showForgotPassword = document.querySelector("#showForgotPassword");
const backToLogin = document.querySelector("#backToLogin");
const appLogout = document.querySelector("#appLogout");
const employeeCodePreview = document.querySelector("#employeeCodePreview");
const joiningDate = document.querySelector("#joiningDate");
const sameAddress = document.querySelector("#sameAddress");
const statutoryGuidance = document.querySelector("#statutoryGuidance");
const presentAddress = document.querySelector("#presentAddress");
const permanentAddress = document.querySelector("#permanentAddress");
const addressParts = ["AddressLine1", "AddressLine2", "City", "State", "Country", "PinCode"];
const photoInput = document.querySelector("#photo");
const sectionTabs = document.querySelectorAll(".section-tab");
const formSections = document.querySelectorAll("#newEmployeePage .form-section");
const sectionSaveButtons = document.querySelectorAll("[data-section-save]");
const attendanceMonth = document.querySelector("#attendanceMonth");
const workingDays = document.querySelector("#workingDays");
const attendanceTabButtons = document.querySelectorAll("[data-attendance-tab]");
const attendanceTabPanels = document.querySelectorAll(".attendance-tab-panel");
const attendanceDailyHead = document.querySelector("#attendanceDailyHead");
const attendanceRows = document.querySelector("#attendanceRows");
const attendanceSummaryRows = document.querySelector("#attendanceSummaryRows");
const saveAttendanceMonth = document.querySelector("#saveAttendanceMonth");
const leaveRegisterMonth = document.querySelector("#leaveRegisterMonth");
const leaveRegisterRows = document.querySelector("#leaveRegisterRows");
const runMonth = document.querySelector("#runMonth");
const runWorkingDays = document.querySelector("#runWorkingDays");
const payrollRunRows = document.querySelector("#payrollRunRows");
const savePayrollRun = document.querySelector("#savePayrollRun");
const runSummaryEmployees = document.querySelector("#runSummaryEmployees");
const runSummaryGross = document.querySelector("#runSummaryGross");
const runSummaryIncentives = document.querySelector("#runSummaryIncentives");
const runSummaryDeductions = document.querySelector("#runSummaryDeductions");
const runSummaryPayable = document.querySelector("#runSummaryPayable");
const advanceForm = document.querySelector("#advanceForm");
const advanceEmployee = document.querySelector("#advanceEmployee");
const advanceDate = document.querySelector("#advanceDate");
const advanceRows = document.querySelector("#advanceRows");
const advanceEmpty = document.querySelector("#advanceEmpty");
const profileEmployeeSelect = document.querySelector("#profileEmployeeSelect");
const profileTitle = document.querySelector("#profileTitle");
const profileAvatar = document.querySelector("#profileAvatar");
const profileName = document.querySelector("#profileName");
const profileMeta = document.querySelector("#profileMeta");
const profileDetails = document.querySelector("#profileDetails");
const profileLeaveList = document.querySelector("#profileLeaveList");
const profileAdvanceList = document.querySelector("#profileAdvanceList");
const profilePayrollList = document.querySelector("#profilePayrollList");
const portalMobile = document.querySelector("#portalMobile");
const portalOtp = document.querySelector("#portalOtp");
const sendOtp = document.querySelector("#sendOtp");
const otpForm = document.querySelector("#otpForm");
const otpMessage = document.querySelector("#otpMessage");
const portalWorkspace = document.querySelector("#portalWorkspace");
const portalEmployeeName = document.querySelector("#portalEmployeeName");
const portalProfileAvatar = document.querySelector("#portalProfileAvatar");
const portalProfileDetails = document.querySelector("#portalProfileDetails");
const portalEssCards = document.querySelector("#portalEssCards");
const portalQuickActions = document.querySelectorAll("[data-portal-action]");
const portalLogout = document.querySelector("#portalLogout");
const leaveRequestForm = document.querySelector("#leaveRequestForm");
const leaveType = document.querySelector("#leaveType");
const leaveDays = document.querySelector("#leaveDays");
const leaveFromDate = document.querySelector("#leaveFromDate");
const leaveFromDateLabel = document.querySelector("#leaveFromDateLabel");
const leaveToDate = document.querySelector("#leaveToDate");
const leaveToDateField = document.querySelector("#leaveToDateField");
const leaveDaysField = document.querySelector("#leaveDaysField");
const portalRequestRows = document.querySelector("#portalRequestRows");
const portalRequestEmpty = document.querySelector("#portalRequestEmpty");
const portalTabButtons = document.querySelectorAll("[data-portal-tab]");
const portalTabPanels = document.querySelectorAll("[data-portal-panel]");
const portalSalaryLedgerRows = document.querySelector("#portalSalaryLedgerRows");
const portalSalaryLedgerEmpty = document.querySelector("#portalSalaryLedgerEmpty");
const portalLeaveLedgerRows = document.querySelector("#portalLeaveLedgerRows");
const portalLeaveLedgerEmpty = document.querySelector("#portalLeaveLedgerEmpty");
const portalShortLeaveLedgerRows = document.querySelector("#portalShortLeaveLedgerRows");
const portalShortLeaveLedgerEmpty = document.querySelector("#portalShortLeaveLedgerEmpty");
const portalOverviewGrid = document.querySelector("#portalOverviewGrid");
const portalAttendanceGrid = document.querySelector("#portalAttendanceGrid");
const portalComplianceGrid = document.querySelector("#portalComplianceGrid");
const portalDocumentsGrid = document.querySelector("#portalDocumentsGrid");
const approvalRole = document.querySelector("#approvalRole");
const approvalRows = document.querySelector("#approvalRows");
const approvalEmpty = document.querySelector("#approvalEmpty");
const approvedLeaveRows = document.querySelector("#approvedLeaveRows");
const approvedLeaveEmpty = document.querySelector("#approvedLeaveEmpty");
const rejectedLeaveRows = document.querySelector("#rejectedLeaveRows");
const rejectedLeaveEmpty = document.querySelector("#rejectedLeaveEmpty");
const historyRows = document.querySelector("#historyRows");
const historyEmpty = document.querySelector("#historyEmpty");
const historySummary = document.querySelector("#historySummary");
const reportSearch = document.querySelector("#reportSearch");
const reportTypeFilter = document.querySelector("#reportTypeFilter");
const reportFromDate = document.querySelector("#reportFromDate");
const reportToDate = document.querySelector("#reportToDate");
const generateReport = document.querySelector("#generateReport");
const reportCards = document.querySelector("#reportCards");
const reportModal = document.querySelector("#reportModal");
const reportModalTitle = document.querySelector("#reportModalTitle");
const reportModalBody = document.querySelector("#reportModalBody");
const closeReportModal = document.querySelector("#closeReportModal");
const modalSavePdf = document.querySelector("#modalSavePdf");
const modalPrint = document.querySelector("#modalPrint");
const modalExportExcel = document.querySelector("#modalExportExcel");
const modalDownload = document.querySelector("#modalDownload");
const organizationForm = document.querySelector("#organizationForm");
const organizationList = document.querySelector("#organizationList");
const generateOrgCode = document.querySelector("#generateOrgCode");
const orgCode = document.querySelector("#orgCode");
const orgName = document.querySelector("#orgName");
const orgLogo = document.querySelector("#orgLogo");
const orgLogoPreview = document.querySelector("#orgLogoPreview");
const orgProfilePreview = document.querySelector("#orgProfilePreview");
const orgProfileFields = document.querySelector("#orgProfileFields");
const adminMessage = document.querySelector("#adminMessage");
const adminSettingsForm = document.querySelector("#adminSettingsForm");
const settingBackgroundImage = document.querySelector("#settingBackgroundImage");
const backgroundImagePreview = document.querySelector("#backgroundImagePreview");
const adminUserForm = document.querySelector("#adminUserForm");
const adminUserRole = document.querySelector("#adminUserRole");
const adminUserList = document.querySelector("#adminUserList");
const adminRoleForm = document.querySelector("#adminRoleForm");
const adminRolePermissions = document.querySelector("#adminRolePermissions");
const adminRoleList = document.querySelector("#adminRoleList");
const adminEmployeeChangeRows = document.querySelector("#adminEmployeeChangeRows");
const adminEmployeeChangeEmpty = document.querySelector("#adminEmployeeChangeEmpty");
const adminSectionTabs = document.querySelectorAll("[data-admin-section]");
const adminPanels = document.querySelectorAll("[data-admin-panel]");

const dailyMessages = [
  "Your work has value. Keep building with focus, care, and confidence.",
  "Small improvements today become stronger teams tomorrow.",
  "Bring your best energy to one task at a time. Progress follows.",
  "Teamwork turns effort into momentum. Thank you for showing up.",
  "A thoughtful day of work can move the whole organization forward.",
  "Stay curious, stay steady, and let quality speak through your work.",
  "Every role matters here. Your consistency helps everyone succeed.",
  "Lead with kindness, learn with courage, and finish the day proud.",
  "Great workplaces are built by people who keep choosing excellence.",
  "Your ideas and effort make the organization stronger every day."
];

const defaultAdminRoles = [
  {
    id: crypto.randomUUID(),
    name: "Admin",
    level: "Admin",
    permissions: ["Full system access", "Manage organization profile", "Manage employees", "Record attendance", "Approve leave", "Run payroll", "View payroll history", "Manage advances", "Manage users and roles"]
  },
  {
    id: crypto.randomUUID(),
    name: "HR",
    level: "HR",
    permissions: ["Manage employees", "Record attendance", "Run payroll", "View payroll history", "Manage advances", "View", "Add", "Edit", "Export", "Print"]
  },
  {
    id: crypto.randomUUID(),
    name: "Employee",
    level: "Employee",
    permissions: ["View personal profile", "Apply leave", "View attendance", "View salary ledger"]
  }
];

const roleAccessModules = [
  "holidaysPage",
  "payrollPage",
  "employeeProfilePage",
  "newEmployeePage",
  "attendancePage",
  "leaveRegisterPage",
  "employeePortalPage",
  "approvalsPage",
  "payrollRunPage",
  "advancePage",
  "historyPage",
  "compliancePage",
  "inventory",
  "purchase",
  "sales",
  "accounts",
  "production"
];
const roleAccessActions = ["view", "add", "edit", "delete", "approve", "export", "print"];
const defaultRoleAccess = {
  hr: {
    modules: {
      holidaysPage: true,
      payrollPage: true,
      employeeProfilePage: true,
      newEmployeePage: true,
      attendancePage: true,
      leaveRegisterPage: true,
      employeePortalPage: true,
      approvalsPage: true,
      payrollRunPage: true,
      advancePage: true,
      historyPage: true,
      compliancePage: true,
      inventory: false,
      purchase: false,
      sales: false,
      accounts: true,
      production: false
    },
    actions: {
      view: true,
      add: true,
      edit: true,
      delete: false,
      approve: false,
      export: true,
      print: true
    }
  },
  employee: {
    modules: {
      holidaysPage: true,
      payrollPage: false,
      employeeProfilePage: false,
      newEmployeePage: false,
      attendancePage: false,
      leaveRegisterPage: false,
      employeePortalPage: true,
      approvalsPage: false,
      payrollRunPage: false,
      advancePage: false,
      historyPage: false,
      compliancePage: false,
      inventory: false,
      purchase: false,
      sales: false,
      accounts: false,
      production: false
    },
    actions: {
      view: true,
      add: false,
      edit: false,
      delete: false,
      approve: false,
      export: false,
      print: false
    }
  }
};

const defaultAdminSettings = {
  fyStart: "April",
  currency: "INR",
  timezone: "Asia/Kolkata",
  weeklyOff: "Sunday",
  workingDays: 26,
  leaveCredit: 1.25,
  payslipPrefix: "PAY",
  salaryRounding: "Nearest rupee",
  visibleTabs: {
    holidaysPage: true,
    payrollPage: true,
    leaveRegisterPage: true,
    employeePortalPage: true,
    approvalsPage: true,
    historyPage: true,
    compliancePage: true
  },
  visibleActions: {
    payrollRunPage: true,
    newEmployeePage: true,
    attendancePage: true,
    advancePage: true
  },
  payrollRunColumns: {
    professionalTax: false
  },
  appearance: {
    theme: "emerald",
    font: "inter",
    backgroundImage: "",
    transparency: false
  },
  roleAccess: defaultRoleAccess
};

let employees = loadEmployees();
let attendanceRecords = loadAttendanceRecords();
let payrollRunAdjustments = loadPayrollRunAdjustments();
let advances = loadAdvances();
let leaveRequests = loadLeaveRequests();
let payrollHistory = loadPayrollHistory();
let organizations = loadOrganizations();
let adminUsers = loadAdminUsers();
let adminRoles = loadAdminRoles();
let adminSettings = loadAdminSettings();
let employeeChangeRequests = loadEmployeeChangeRequests();
let editingId = null;
let editingPhoto = "";
let pendingOtp = "";
let portalEmployeeId = "";
let pendingOrgLogo = "";
let pendingBackgroundImage = "";
let selectedProfileEmployeeId = "";
let editingOrganizationId = "";
let editingAdminUserId = "";
let activeAdminSection = "company";
let activeReport = { title: "", rows: [], html: "" };
let employeePage = 1;
const employeePageSize = 5;
let isUpdatingSalaryBreakup = false;
let activeAttendancePanel = "attendanceDailyPanel";
let activePortalPanel = "portalOverviewPanel";
let isAppLoggedIn = false;
let currentAppRole = "";

function loadEmployees() {
  const saved = localStorage.getItem(storageKey);
  const source = saved ? JSON.parse(saved) : seedEmployees;
  return source.map((employee, index) => normalizeEmployee(employee, index));
}

function normalizeEmployee(employee, index) {
  const fallback = seedEmployees[index] || seedEmployees[0];
  const normalized = {
    id: employee.id || crypto.randomUUID(),
    employeeCode: /^GLS\d{4}\d{3,}$/.test(employee.employeeCode || "")
      ? employee.employeeCode
      : generateEmployeeCode(employee.joiningDate || fallback.joiningDate, index + 1),
    name: employee.name || "",
    dob: employee.dob || fallback.dob,
    joiningDate: employee.joiningDate || fallback.joiningDate,
    gender: employee.gender || fallback.gender || "Female",
    maritalStatus: employee.maritalStatus || fallback.maritalStatus || "Single",
    fatherOrSpouseName: employee.fatherOrSpouseName || "",
    bloodGroup: employee.bloodGroup || fallback.bloodGroup || "O+",
    mobile: employee.mobile || "",
    additionalContact: employee.additionalContact || "",
    additionalRelation: employee.additionalRelation || "Spouse",
    email: employee.email || "",
    photo: employee.photo || "",
    aadhaar: employee.aadhaar || "",
    pan: employee.pan || "",
    uan: employee.uan || "",
    esicIpNumber: employee.esicIpNumber || "",
    nomineeName: employee.nomineeName || "",
    nomineeRelation: employee.nomineeRelation || "Spouse",
    presentAddress: employee.presentAddress || "",
    permanentAddress: employee.permanentAddress || employee.presentAddress || "",
    presentAddressDetails: employee.presentAddressDetails || parseAddress(employee.presentAddress || ""),
    permanentAddressDetails: employee.permanentAddressDetails || parseAddress(employee.permanentAddress || employee.presentAddress || ""),
    department: employee.department || "Operations",
    designation: employee.designation || "",
    basicPay: Number(employee.basicPay || 0),
    hra: Number(employee.hra || 0),
    conveyanceAllowance: Number(employee.conveyanceAllowance || 0),
    allowance: Number(employee.allowance || 0),
    bonus: Number(employee.bonus || 0),
    otherDeductions: Number(employee.otherDeductions || 0),
    pfApplicable: employee.pfApplicable === "No" ? "No" : "Yes",
    esiApplicable: employee.esiApplicable === "Yes" ? "Yes" : "No",
    ptApplicable: employee.ptApplicable !== false,
    tdsApplicable: employee.tdsApplicable !== false,
    lwfApplicable: employee.lwfApplicable !== false,
    gratuityApplicable: employee.gratuityApplicable !== false,
    bonusActApplicable: employee.bonusActApplicable !== false,
    paymentMode: employee.paymentMode || "Bank transfer",
    bankName: employee.bankName || "",
    bankAccount: employee.bankAccount || "",
    ifsc: employee.ifsc || "",
    status: employee.status || "Active",
    statusHistory: Array.isArray(employee.statusHistory) && employee.statusHistory.length
      ? employee.statusHistory
      : [{ month: (employee.joiningDate || fallback.joiningDate).slice(0, 7), status: employee.status || "Active" }],
    leaveOpeningBalance: Number(employee.leaveOpeningBalance ?? employee.leaveBalance ?? 0),
    leaveBalance: Number(employee.leaveBalance ?? employee.leaveOpeningBalance ?? 0),
    leaveCreditedMonths: employee.leaveCreditedMonths || []
  };
  normalized.salaryStructure = buildSalaryStructure(normalized);
  return normalized;
}

function saveEmployees() {
  localStorage.setItem(storageKey, JSON.stringify(employees));
}

function loadAttendanceRecords() {
  const saved = localStorage.getItem(attendanceStorageKey);
  return saved ? JSON.parse(saved) : {};
}

function saveAttendanceRecords() {
  localStorage.setItem(attendanceStorageKey, JSON.stringify(attendanceRecords));
}

function loadPayrollHistory() {
  const saved = localStorage.getItem(historyStorageKey);
  return saved ? JSON.parse(saved) : [];
}

function savePayrollHistory() {
  localStorage.setItem(historyStorageKey, JSON.stringify(payrollHistory));
}

function loadPayrollRunAdjustments() {
  const saved = localStorage.getItem(payrollRunStorageKey);
  return saved ? JSON.parse(saved) : {};
}

function savePayrollRunAdjustments() {
  localStorage.setItem(payrollRunStorageKey, JSON.stringify(payrollRunAdjustments));
}

function loadAdvances() {
  const saved = localStorage.getItem(advanceStorageKey);
  return saved ? JSON.parse(saved) : [];
}

function saveAdvances() {
  localStorage.setItem(advanceStorageKey, JSON.stringify(advances));
}

function loadLeaveRequests() {
  const saved = localStorage.getItem(leaveRequestStorageKey);
  return saved ? JSON.parse(saved) : [];
}

function saveLeaveRequests() {
  localStorage.setItem(leaveRequestStorageKey, JSON.stringify(leaveRequests));
}

function loadEmployeeChangeRequests() {
  const saved = localStorage.getItem(employeeChangeStorageKey);
  return saved ? JSON.parse(saved) : [];
}

function saveEmployeeChangeRequests() {
  localStorage.setItem(employeeChangeStorageKey, JSON.stringify(employeeChangeRequests));
}

function loadOrganizations() {
  const saved = localStorage.getItem(organizationStorageKey);
  return saved ? JSON.parse(saved) : [];
}

function saveOrganizations() {
  localStorage.setItem(organizationStorageKey, JSON.stringify(organizations));
}

function loadAdminUsers() {
  const saved = localStorage.getItem(adminUserStorageKey);
  return saved ? JSON.parse(saved) : [];
}

function saveAdminUsers() {
  localStorage.setItem(adminUserStorageKey, JSON.stringify(adminUsers));
}

function loadAdminRoles() {
  const saved = localStorage.getItem(adminRoleStorageKey);
  return normalizeAdminRoles(saved ? JSON.parse(saved) : defaultAdminRoles);
}

function saveAdminRoles() {
  localStorage.setItem(adminRoleStorageKey, JSON.stringify(adminRoles));
}

function normalizeAdminRoles(savedRoles = []) {
  const savedByName = new Map(savedRoles.map((role) => [String(role.name).toLowerCase(), role]));
  return defaultAdminRoles.map((role) => ({
    ...role,
    ...(savedByName.get(role.name.toLowerCase()) || {}),
    name: role.name,
    level: role.level
  }));
}

function mergeRoleAccess(savedAccess = {}) {
  return ["hr", "employee"].reduce((settings, role) => {
    settings[role] = {
      modules: { ...defaultRoleAccess[role].modules, ...(savedAccess[role]?.modules || {}) },
      actions: { ...defaultRoleAccess[role].actions, ...(savedAccess[role]?.actions || {}) }
    };
    return settings;
  }, {});
}

function loadAdminSettings() {
  const saved = localStorage.getItem(adminSettingsStorageKey);
  if (!saved) return { ...defaultAdminSettings, roleAccess: mergeRoleAccess() };
  const parsed = JSON.parse(saved);
  return {
    ...defaultAdminSettings,
    ...parsed,
    visibleTabs: { ...defaultAdminSettings.visibleTabs, ...(parsed.visibleTabs || {}) },
    visibleActions: { ...defaultAdminSettings.visibleActions, ...(parsed.visibleActions || {}) },
    payrollRunColumns: { ...defaultAdminSettings.payrollRunColumns, ...(parsed.payrollRunColumns || {}) },
    appearance: { ...defaultAdminSettings.appearance, ...(parsed.appearance || {}) },
    roleAccess: mergeRoleAccess(parsed.roleAccess)
  };
}

function saveAdminSettings() {
  localStorage.setItem(adminSettingsStorageKey, JSON.stringify(adminSettings));
}

function getGrossPay(employee) {
  return Number(employee.basicPay || 0) + Number(employee.hra || 0) + Number(employee.conveyanceAllowance || 0) + Number(employee.allowance || 0) + Number(employee.bonus || 0);
}

function getFormGrossPay() {
  return Number(form.basicPay.value || 0) + Number(form.hra.value || 0) + Number(form.conveyanceAllowance.value || 0) + Number(form.allowance.value || 0) + Number(form.bonus.value || 0);
}

function syncGrossPayFromComponents() {
  if (isUpdatingSalaryBreakup) return;
  form.grossPay.value = Math.round(getFormGrossPay());
  updateStatutoryGuidance();
}

function applySalaryBreakupFromGross() {
  if (isUpdatingSalaryBreakup) return;
  isUpdatingSalaryBreakup = true;
  const grossPay = Number(form.grossPay.value || 0);
  const basicPay = Math.round(grossPay * 0.5);
  const hra = Math.round(basicPay * 0.4);
  const conveyanceAllowance = Math.min(1600, Math.max(Math.round(grossPay * 0.032), 0));
  const bonus = 0;
  const allowance = Math.max(grossPay - basicPay - hra - conveyanceAllowance - bonus, 0);

  form.basicPay.value = basicPay;
  form.hra.value = hra;
  form.conveyanceAllowance.value = conveyanceAllowance;
  form.allowance.value = allowance;
  form.bonus.value = bonus;
  isUpdatingSalaryBreakup = false;
  updateStatutoryGuidance();
}

function updateStatutoryGuidance() {
  const basicPay = Number(form.basicPay.value || 0);
  const grossPay = getFormGrossPay();
  const pfMode = form.pfApplicable.value;
  const esiMode = form.esiApplicable.value;
  const formEmployee = {
    basicPay,
    hra: Number(form.hra.value || 0),
    conveyanceAllowance: Number(form.conveyanceAllowance.value || 0),
    allowance: Number(form.allowance.value || 0),
    bonus: Number(form.bonus.value || 0),
    otherDeductions: Number(form.otherDeductions.value || 0),
    pfApplicable: pfMode,
    esiApplicable: esiMode
  };
  const salary = buildSalaryStructure(formEmployee);
  if (form.employeePf) form.employeePf.value = Math.round(salary.employeePf);
  if (form.employerPf) form.employerPf.value = Math.round(salary.employerPf);
  if (form.employeeEsi) form.employeeEsi.value = Math.round(salary.employeeEsi);
  if (form.employerEsi) form.employerEsi.value = Math.round(salary.employerEsi);
  if (form.netSalary) form.netSalary.value = Math.round(salary.netSalary);
  const notes = [
    `Gross pay ${formatMoney(grossPay)}`,
    `Auto breakup: Basic 50%, HRA 40% of Basic, conveyance up to ${formatMoney(1600)}, special allowance balance`,
    `Employee PF ${formatMoney(salary.employeePf)} · Employer PF ${formatMoney(salary.employerPf)}`,
    `Employee ESI ${formatMoney(salary.employeeEsi)} · Employer ESI ${formatMoney(salary.employerEsi)}`,
    `Net salary ${formatMoney(salary.netSalary)}`,
    `PT ${form.ptApplicable.checked ? "selected" : "not selected"}`,
    `TDS ${form.tdsApplicable.checked ? "selected" : "not selected"}`
  ];
  statutoryGuidance.innerHTML = notes.map((note) => `<span>${note}</span>`).join("");
}

function getPf(employee) {
  if (employee.pfApplicable === "No") return 0;
  if (employee.pfApplicable === "Auto by wage limit" && employee.basicPay > epfWageLimit) return 0;
  return employee.basicPay * pfRate;
}

function getEmployerPf(employee) {
  return getPf(employee);
}

function getEsiEmployee(employee) {
  if (employee.esiApplicable === "No") return 0;
  if (employee.esiApplicable === "Yes" || getGrossPay(employee) <= esiWageLimit) return getGrossPay(employee) * esiEmployeeRate;
  return 0;
}

function getEsiEmployer(employee) {
  if (employee.esiApplicable === "No") return 0;
  if (employee.esiApplicable === "Yes" || getGrossPay(employee) <= esiWageLimit) return getGrossPay(employee) * esiEmployerRate;
  return 0;
}

function getNetPay(employee) {
  return Math.max(getGrossPay(employee) - getPf(employee) - getEsiEmployee(employee) - employee.otherDeductions, 0);
}

function buildSalaryStructure(employee) {
  const grossSalary = getGrossPay(employee);
  const employeePf = getPf(employee);
  const employerPf = getEmployerPf(employee);
  const employeeEsi = getEsiEmployee(employee);
  const employerEsi = getEsiEmployer(employee);
  const netSalary = Math.max(grossSalary - employeePf - employeeEsi - Number(employee.otherDeductions || 0), 0);
  return {
    grossSalary,
    basicSalary: Number(employee.basicPay || 0),
    hra: Number(employee.hra || 0),
    conveyanceAllowance: Number(employee.conveyanceAllowance || 0),
    specialAllowance: Number(employee.allowance || 0),
    bonus: Number(employee.bonus || 0),
    pfApplicable: employee.pfApplicable || "Yes",
    esiApplicable: employee.esiApplicable || "Yes",
    employeePf,
    employerPf,
    employeeEsi,
    employerEsi,
    otherDeductions: Number(employee.otherDeductions || 0),
    netSalary
  };
}

function getDaysInMonth(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month, 0).getDate();
}

function getMonthDates(monthKey) {
  const totalDays = getDaysInMonth(monthKey);
  return Array.from({ length: totalDays }, (_, index) => `${monthKey}-${String(index + 1).padStart(2, "0")}`);
}

function getApprovedLeaveDates(employeeId, monthKey) {
  const dates = new Set();
  leaveRequests
    .filter((request) => request.employeeId === employeeId && request.status === "approved")
    .forEach((request) => {
      if (request.type === "short") return;
      const start = getRequestFromDate(request);
      const end = getRequestToDate(request);
      getMonthDates(monthKey).forEach((date) => {
        if (date >= start && date <= end) dates.add(date);
      });
    });
  return dates;
}

function getApprovedShortLeaveCount(employeeId, monthKey) {
  return leaveRequests.filter((request) => request.employeeId === employeeId && request.status === "approved" && request.type === "short" && getRequestFromDate(request).slice(0, 7) === monthKey).length;
}

function getAttendanceRecord(employeeId, monthKey = attendanceMonth.value) {
  const savedRecord = attendanceRecords[monthKey]?.[employeeId] || {};
  const savedDays = savedRecord.days || {};
  const approvedLeaveDates = getApprovedLeaveDates(employeeId, monthKey);
  const days = {};
  getMonthDates(monthKey).forEach((date) => {
    days[date] = approvedLeaveDates.has(date) ? "leave" : savedDays[date] || "";
  });
  const presentDays = Object.values(days).filter((status) => status === "present").length;
  const absentDays = Object.values(days).filter((status) => status === "absent").length;
  const approvedLeaveDays = Object.values(days).filter((status) => status === "leave").length;
  const legacyLeaveDays = savedRecord.leavesTaken && !savedRecord.days ? Number(savedRecord.leavesTaken || 0) : 0;
  const shortLeaves = Number(savedRecord.shortLeaves || 0) + getApprovedShortLeaveCount(employeeId, monthKey);
  return {
    ...savedRecord,
    days,
    presentDays,
    absentDays,
    approvedLeaveDays,
    leavesTaken: absentDays + approvedLeaveDays + legacyLeaveDays,
    shortLeaves
  };
}

function getCurrentMonthKey() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthEndDate(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month, 0, 23, 59, 59);
}

function getEmployeeStatusForMonth(employee, monthKey) {
  const statusEntry = [...(employee.statusHistory || [])]
    .filter((entry) => entry.month <= monthKey)
    .sort((a, b) => a.month.localeCompare(b.month))
    .at(-1);
  return statusEntry?.status || employee.status || "Active";
}

function isEmployeeActiveForMonth(employee, monthKey) {
  const joiningDate = new Date(`${employee.joiningDate}T00:00:00`);
  const joinedByMonth = Number.isNaN(joiningDate.getTime()) || joiningDate <= getMonthEndDate(monthKey);
  return joinedByMonth && getEmployeeStatusForMonth(employee, monthKey) === "Active";
}

function getPreviousMonthKey(monthKey) {
  const date = new Date(`${monthKey}-01T00:00:00`);
  date.setMonth(date.getMonth() - 1);
  return date.toISOString().slice(0, 7);
}

function getSavedPayrollEntry(employeeId, monthKey) {
  return payrollHistory.find((entry) => entry.month === monthKey)?.employees.find((item) => item.id === employeeId) || null;
}

function getSavedOpeningLeave(entry) {
  if (!entry) return null;
  if (Number.isFinite(Number(entry.openingLeave))) return Number(entry.openingLeave);
  const leavesTaken = Number(entry.leavesTaken || 0);
  const unpaidLeave = Number(entry.unpaidLeave || 0);
  const leaveCredit = Number(entry.leaveCredit || 0);
  return Math.max(Number(entry.closingLeave || 0) + leavesTaken - unpaidLeave - leaveCredit, 0);
}

function getOpeningLeaveBalance(employee, monthKey) {
  const savedCurrentMonth = getSavedPayrollEntry(employee.id, monthKey);
  const savedCurrentOpening = getSavedOpeningLeave(savedCurrentMonth);
  if (savedCurrentOpening !== null) return savedCurrentOpening;

  const previousMonthKey = getPreviousMonthKey(monthKey);
  const previousMonthEntry = getSavedPayrollEntry(employee.id, previousMonthKey);
  if (previousMonthEntry) return Number(previousMonthEntry.closingLeave || 0);

  if (attendanceRecords[previousMonthKey]?.[employee.id]) {
    const previousRecord = getAttendanceRecord(employee.id, previousMonthKey);
    const previousDays = Number(previousRecord.workingDays || workingDays.value || runWorkingDays.value || 26);
    return getAttendancePayroll(employee, previousRecord, previousDays, previousMonthKey).closingLeave;
  }

  return Number(employee.leaveBalance || 0);
}

function getAttendancePayroll(employee, record = getAttendanceRecord(employee.id), days = Number(workingDays.value || 26), monthKey = attendanceMonth.value) {
  const credit = monthlyLeaveCredit;
  const openingLeave = getOpeningLeaveBalance(employee, monthKey);
  const availableLeave = openingLeave + credit;
  const leavesTaken = Number(record.leavesTaken || 0);
  const shortLeaves = Number(record.shortLeaves || 0);
  const paidLeaveUsed = Math.min(leavesTaken, availableLeave);
  const unpaidLeave = Math.max(leavesTaken - availableLeave, 0);
  const closingLeave = Math.max(availableLeave - leavesTaken, 0);
  const excessShortLeaves = Math.max(shortLeaves - freeShortLeaves, 0);
  const shortLeaveSalaryDays = excessShortLeaves * shortLeaveDeductionDays;
  const baseNetPay = getNetPay(employee);
  const perDayPay = days > 0 ? baseNetPay / days : 0;
  const attendanceDeduction = (unpaidLeave + shortLeaveSalaryDays) * perDayPay;

  return {
    baseNetPay,
    credit,
    openingLeave,
    closingLeave,
    paidLeaveUsed,
    unpaidLeave,
    shortLeaves,
    excessShortLeaves,
    shortLeaveSalaryDays,
    attendanceDeduction,
    payable: Math.max(baseNetPay - attendanceDeduction, 0)
  };
}

function getPayrollRunAdjustment(employeeId, monthKey = runMonth.value) {
  return {
    deductLeave: true,
    deductAdvance: true,
    performanceIncentive: 0,
    professionalTax: 0,
    tds: 0,
    otherStatutory: 0,
    ...(payrollRunAdjustments[monthKey]?.[employeeId] || {})
  };
}

function getAdvanceOutstanding(advance, excludeMonth = "") {
  const recovered = (advance.deductions || [])
    .filter((item) => item.month !== excludeMonth)
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  return Math.max(Number(advance.amount || 0) - recovered, 0);
}

function getMonthlyAdvanceDeduction(employeeId, monthKey = runMonth.value) {
  return advances
    .filter((advance) => advance.employeeId === employeeId && advance.date.slice(0, 7) <= monthKey)
    .reduce((sum, advance) => sum + Math.min(Number(advance.monthlyDeduction || 0), getAdvanceOutstanding(advance, monthKey)), 0);
}

function getPayrollRunCalculation(employee, monthKey = runMonth.value, days = Number(runWorkingDays.value || 26)) {
  const attendance = getAttendancePayroll(employee, getAttendanceRecord(employee.id, monthKey), days, monthKey);
  const adjustment = getPayrollRunAdjustment(employee.id, monthKey);
  const rawAttendanceDeduction = Number(attendance.attendanceDeduction || 0);
  const attendanceDeduction = adjustment.deductLeave === false ? 0 : rawAttendanceDeduction;
  const rawAdvanceDeduction = getMonthlyAdvanceDeduction(employee.id, monthKey);
  const advanceDeduction = adjustment.deductAdvance === false ? 0 : rawAdvanceDeduction;
  const performanceIncentive = Number(adjustment.performanceIncentive || 0);
  const professionalTax = adminSettings.payrollRunColumns.professionalTax && employee.ptApplicable !== false ? Number(adjustment.professionalTax || 0) : 0;
  const tds = employee.tdsApplicable !== false ? Number(adjustment.tds || 0) : 0;
  const otherStatutory = Number(adjustment.otherStatutory || 0);
  const extraDeductions = advanceDeduction + professionalTax + tds + otherStatutory;
  const payableBeforeExtra = Math.max(attendance.baseNetPay - attendanceDeduction, 0);

  return {
    attendance,
    adjustment,
    rawAttendanceDeduction,
    attendanceDeduction,
    rawAdvanceDeduction,
    advanceDeduction,
    performanceIncentive,
    professionalTax,
    tds,
    otherStatutory,
    extraDeductions,
    finalPayable: Math.max(payableBeforeExtra + performanceIncentive - extraDeductions, 0)
  };
}

function formatMoney(value) {
  return currency.format(value);
}

function getFinancialYearCode(dateValue) {
  const date = dateValue ? new Date(`${dateValue}T00:00:00`) : new Date();
  const year = date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
  return `${String(year).slice(-2)}${String(year + 1).slice(-2)}`;
}

function getNextSerial() {
  return employees.reduce((highest, employee) => {
    const match = employee.employeeCode.match(/^GLS\d{4}(\d{3,})$/) || employee.employeeCode.match(/^GLS-FY\d{2}-(\d{3,})$/);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0) + 1;
}

function generateEmployeeCode(dateValue, serial = getNextSerial()) {
  return `GLS${getFinancialYearCode(dateValue)}${String(serial).padStart(3, "0")}`;
}

function updateEmployeeCodePreview() {
  const currentEmployee = employees.find((employee) => employee.id === editingId);
  employeeCodePreview.textContent = currentEmployee?.employeeCode || generateEmployeeCode(joiningDate.value);
}

function getSelectedStatutoryLabels(employee) {
  return [
    employee.pfApplicable !== "No" ? `EPF: ${employee.pfApplicable}` : "",
    employee.esiApplicable !== "No" ? `ESI: ${employee.esiApplicable}` : "",
    employee.ptApplicable !== false ? "PT" : "",
    employee.tdsApplicable !== false ? "TDS" : "",
    employee.lwfApplicable !== false ? "LWF" : "",
    employee.gratuityApplicable !== false ? "Gratuity" : "",
    employee.bonusActApplicable !== false ? "Bonus Act" : ""
  ].filter(Boolean);
}

function getFilteredEmployees() {
  const query = search.value.trim().toLowerCase();
  const department = departmentFilter.value;
  const status = employeeStatusFilter.value;
  const sortBy = employeeSort.value;

  return employees.filter((employee) => {
    const searchable = `${employee.name} ${employee.employeeCode} ${employee.department} ${employee.mobile} ${employee.email} ${employee.status}`.toLowerCase();
    const matchesQuery = !query || searchable.includes(query);
    const matchesDepartment = department === "all" || employee.department === department;
    const matchesStatus = status === "all" || (employee.status || "Active") === status;
    return matchesQuery && matchesDepartment && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === "gross") return getGrossPay(b) - getGrossPay(a);
    if (sortBy === "code") return a.employeeCode.localeCompare(b.employeeCode);
    if (sortBy === "department") return a.department.localeCompare(b.department) || a.name.localeCompare(b.name);
    return a.name.localeCompare(b.name);
  });
}

function renderHolidays() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  todayLabel.textContent = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "full"
  }).format(today);

  const upcoming = allIndiaHolidays2026.filter((holiday) => new Date(`${holiday.date}T00:00:00`) >= today);
  holidayList.innerHTML = "";

  upcoming.forEach((holiday) => {
    const date = new Date(`${holiday.date}T00:00:00`);
    const card = document.createElement("article");
    card.className = "holiday-card";
    card.innerHTML = `
      <span></span>
      <h3></h3>
      <p></p>
    `;
    card.querySelector("span").textContent = new Intl.DateTimeFormat("en-IN", { month: "short", day: "numeric" }).format(date);
    card.querySelector("h3").textContent = holiday.name;
    card.querySelector("p").textContent = new Intl.DateTimeFormat("en-IN", { weekday: "long" }).format(date);
    holidayList.appendChild(card);
  });
}

function renderStats() {
  const totalGross = employees.reduce((sum, employee) => sum + getGrossPay(employee), 0);
  const totalNet = employees.reduce((sum, employee) => sum + getNetPay(employee), 0);
  const statutory = employees.reduce((sum, employee) => sum + getPf(employee) + getEsiEmployee(employee), 0);

  totalEmployees.textContent = employees.length;
  grossPayroll.textContent = formatMoney(totalGross);
  netPayroll.textContent = formatMoney(totalNet);
  totalStatutory.textContent = formatMoney(statutory);
}

function renderRows() {
  const filteredEmployees = getFilteredEmployees();
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / employeePageSize));
  employeePage = Math.min(employeePage, totalPages);
  const visibleEmployees = filteredEmployees.slice((employeePage - 1) * employeePageSize, employeePage * employeePageSize);
  rows.innerHTML = "";

  visibleEmployees.forEach((employee) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <div class="employee-cell">
          <div class="avatar"></div>
          <div>
            <div class="employee-name"></div>
            <div class="muted"></div>
          </div>
        </div>
      </td>
      <td></td>
      <td><span class="badge ok"></span></td>
      <td class="number"></td>
      <td class="number"></td>
      <td class="number"></td>
      <td class="number strong"></td>
      <td>
        <select class="status-select" aria-label="Employee status">
          <option>Active</option>
          <option>Disabled</option>
        </select>
      </td>
      <td class="actions">
        <div class="action-group">
          <button class="row-button view-button" type="button" title="View employee profile" aria-label="View ${escapeAttr(employee.name)}">View</button>
          <button class="row-button edit-button" type="button" title="Edit employee" aria-label="Edit ${escapeAttr(employee.name)}">Edit</button>
          <button class="row-button toggle-button" type="button" title="Activate or deactivate employee" aria-label="Activate or deactivate ${escapeAttr(employee.name)}"></button>
          <button class="row-button download-button" type="button" title="Download profile" aria-label="Download profile for ${escapeAttr(employee.name)}">Download</button>
          <button class="row-button print-button" type="button" title="Print profile" aria-label="Print profile for ${escapeAttr(employee.name)}">Print</button>
          <button class="row-button delete delete-button" type="button" title="Delete employee" aria-label="Delete ${escapeAttr(employee.name)}">Delete</button>
        </div>
      </td>
    `;

    const avatar = tr.querySelector(".avatar");
    avatar.textContent = employee.photo ? "" : getInitials(employee.name);
    if (employee.photo) {
      avatar.style.backgroundImage = `url(${employee.photo})`;
    }

    tr.querySelector(".employee-name").textContent = employee.name;
    tr.querySelector(".muted").textContent = `${employee.designation || "Employee"} · ${employee.mobile || "No mobile"}`;
    tr.children[1].textContent = employee.employeeCode;
    tr.querySelector(".badge").textContent = employee.department;
    tr.children[3].textContent = formatMoney(getGrossPay(employee));
    tr.children[4].textContent = formatMoney(getPf(employee));
    tr.children[5].textContent = formatMoney(getEsiEmployee(employee));
    tr.children[6].textContent = formatMoney(getNetPay(employee));
    tr.querySelector(".status-select").value = employee.status || "Active";
    tr.querySelector(".status-select").disabled = !hasRoleAction("edit");
    tr.querySelector(".view-button").disabled = !hasRoleAction("view");
    tr.querySelector(".edit-button").disabled = !hasRoleAction("edit");
    tr.querySelector(".toggle-button").disabled = !hasRoleAction("edit");
    tr.querySelector(".delete-button").disabled = !hasRoleAction("delete");
    tr.querySelector(".toggle-button").textContent = employee.status === "Active" ? "Deactivate" : "Activate";
    tr.querySelector(".status-select").addEventListener("change", (event) => updateEmployeeStatus(employee.id, event.target.value));
    tr.querySelector(".view-button").addEventListener("click", () => showEmployeeProfile(employee.id));
    tr.querySelector(".edit-button").addEventListener("click", () => startEdit(employee.id));
    tr.querySelector(".toggle-button").addEventListener("click", () => updateEmployeeStatus(employee.id, employee.status === "Active" ? "Disabled" : "Active"));
    tr.querySelector(".download-button").addEventListener("click", () => downloadEmployeeProfile(employee.id));
    tr.querySelector(".print-button").addEventListener("click", () => openEmployeeProfileReport(employee.id, true));
    tr.querySelector(".delete-button").addEventListener("click", () => deleteEmployee(employee.id));
    rows.appendChild(tr);
  });

  emptyState.classList.toggle("hidden", filteredEmployees.length > 0);
  employeePageInfo.textContent = `Page ${employeePage} of ${totalPages} · ${filteredEmployees.length} indexed employee${filteredEmployees.length === 1 ? "" : "s"}`;
  employeePrevPage.disabled = employeePage <= 1;
  employeeNextPage.disabled = employeePage >= totalPages;
}

function renderEmployeeProfileOptions() {
  const selected = selectedProfileEmployeeId || profileEmployeeSelect.value;
  profileEmployeeSelect.innerHTML = "";
  employees.forEach((employee) => {
    const option = document.createElement("option");
    option.value = employee.id;
    option.textContent = `${employee.name} (${employee.employeeCode})`;
    profileEmployeeSelect.appendChild(option);
  });

  if (employees.some((employee) => employee.id === selected)) {
    profileEmployeeSelect.value = selected;
    selectedProfileEmployeeId = selected;
  } else if (employees.length) {
    selectedProfileEmployeeId = employees[0].id;
    profileEmployeeSelect.value = selectedProfileEmployeeId;
  }
}

function renderEmployeeProfile() {
  const employee = employees.find((entry) => entry.id === selectedProfileEmployeeId) || employees[0];
  if (!employee) return;

  selectedProfileEmployeeId = employee.id;
  profileTitle.textContent = employee.name;
  profileName.textContent = employee.name;
  profileMeta.textContent = `${employee.employeeCode} · ${employee.department} · ${employee.status || "Active"}`;
  profileAvatar.textContent = employee.photo ? "" : getInitials(employee.name);
  profileAvatar.style.backgroundImage = employee.photo ? `url(${employee.photo})` : "";
  profileDetails.innerHTML = `
    <span>Mobile: ${employee.mobile || "Not recorded"}</span>
    <span>Email: ${employee.email || "Not recorded"}</span>
    <span>Designation: ${employee.designation || "Not recorded"}</span>
    <span>Joining: ${employee.joiningDate}</span>
    <span>Leave balance: ${Number(employee.leaveBalance || 0).toFixed(2)} days</span>
    <span>Net pay: ${formatMoney(getNetPay(employee))}</span>
    <span>Statutory: ${getSelectedStatutoryLabels(employee).join(", ") || "None selected"}</span>
  `;
  profileDetails.innerHTML += `
    <span class="profile-action-row">
      <button class="row-button" type="button" onclick="window.openEmployeeProfileReport('${employee.id}')">View Report</button>
      <button class="row-button" type="button" onclick="window.downloadEmployeeProfile('${employee.id}')">Download Profile</button>
      <button class="row-button" type="button" onclick="window.openEmployeeProfileReport('${employee.id}', true)">Print Profile</button>
    </span>
  `;

  renderProfileLeaves(employee.id);
  renderProfileAdvances(employee.id);
  renderProfilePayroll(employee.id);
}

function renderProfileLeaves(employeeId) {
  const requests = leaveRequests.filter((request) => request.employeeId === employeeId);
  profileLeaveList.innerHTML = requests.length ? "" : `<p class="muted">No leave activity recorded.</p>`;
  requests.forEach((request) => {
    const item = document.createElement("article");
    item.className = "profile-list-item";
    item.innerHTML = `<strong></strong><span></span><p></p>`;
    item.querySelector("strong").textContent = `${getRequestFromDate(request)} to ${getRequestToDate(request)} · ${request.type === "short" ? "Short leave" : "Leave"}`;
    item.querySelector("span").textContent = `${getLeaveStatusLabel(request)} · ${request.type === "short" ? "2 hours" : `${request.days} day(s)`}`;
    item.querySelector("p").textContent = `${getApprovalSummary(request)} · ${request.reason}`;
    profileLeaveList.appendChild(item);
  });
}

function renderProfileAdvances(employeeId) {
  const employeeAdvances = advances.filter((advance) => advance.employeeId === employeeId);
  profileAdvanceList.innerHTML = employeeAdvances.length ? "" : `<p class="muted">No advance activity recorded.</p>`;
  employeeAdvances.forEach((advance) => {
    const item = document.createElement("article");
    item.className = "profile-list-item";
    const history = (advance.deductions || []).map((entry) => (entry.skipped ? `${entry.month}: skipped` : `${entry.month}: ${formatMoney(entry.amount)}`)).join(", ");
    item.innerHTML = `<strong></strong><span></span><p></p>`;
    item.querySelector("strong").textContent = `${formatMoney(advance.amount)} advance · ${advance.date}`;
    item.querySelector("span").textContent = `Monthly recovery ${formatMoney(advance.monthlyDeduction)} · Outstanding ${formatMoney(getAdvanceOutstanding(advance))}`;
    item.querySelector("p").textContent = history || "No recovery history yet";
    profileAdvanceList.appendChild(item);
  });
}

function renderProfilePayroll(employeeId) {
  const entries = payrollHistory.flatMap((history) =>
    history.employees
      .filter((item) => item.id === employeeId)
      .map((item) => ({ ...item, month: history.month, savedAt: history.savedAt }))
  );
  profilePayrollList.innerHTML = entries.length ? "" : `<p class="muted">No payroll history recorded.</p>`;
  entries.forEach((entry) => {
    const item = document.createElement("article");
    item.className = "profile-list-item";
    const leaveNote = entry.leaveDeductionSkipped ? `Leave deduction skipped (${formatMoney(entry.rawAttendanceDeduction || 0)})` : `Leave deduction ${formatMoney(entry.attendanceDeduction || 0)}`;
    const advanceNote = entry.advanceDeductionSkipped ? `Advance skipped (${formatMoney(entry.rawAdvanceDeduction || 0)})` : `Advance ${formatMoney(entry.advanceDeduction || 0)}`;
    const incentiveNote = `Perf. Inc. ${formatMoney(entry.performanceIncentive || 0)}`;
    item.innerHTML = `<strong></strong><span></span><p></p>`;
    item.querySelector("strong").textContent = `${entry.month} · Payable ${formatMoney(entry.payable)}`;
    item.querySelector("span").textContent = `${leaveNote} · ${advanceNote} · ${incentiveNote}`;
    item.querySelector("p").textContent = `Leaves ${entry.leavesTaken || 0}, short leaves ${entry.shortLeaves || 0}, closing leave ${Number(entry.closingLeave || 0).toFixed(2)}`;
    profilePayrollList.appendChild(item);
  });
}

function showEmployeeProfile(employeeId) {
  if (!hasRoleAction("view")) return;
  selectedProfileEmployeeId = employeeId;
  renderEmployeeProfileOptions();
  renderEmployeeProfile();
  showPage("employeeProfilePage");
}

function getEmployeeProfileRows(employeeId) {
  const employee = employees.find((entry) => entry.id === employeeId);
  if (!employee) return [];
  return [
    { Field: "Employee code", Detail: employee.employeeCode },
    { Field: "Name", Detail: employee.name },
    { Field: "Department", Detail: employee.department },
    { Field: "Designation", Detail: employee.designation },
    { Field: "Mobile", Detail: employee.mobile },
    { Field: "Email", Detail: employee.email },
    { Field: "Address", Detail: employee.presentAddress || "Not recorded" },
    { Field: "Joining date", Detail: employee.joiningDate },
    { Field: "Status", Detail: employee.status || "Active" },
    { Field: "Basic salary", Detail: formatMoney(employee.basicPay || 0) },
    { Field: "HRA", Detail: formatMoney(employee.hra || 0) },
    { Field: "Conveyance allowance", Detail: formatMoney(employee.conveyanceAllowance || 0) },
    { Field: "Special allowance", Detail: formatMoney(employee.allowance || 0) },
    { Field: "Deductions", Detail: formatMoney(Number(employee.otherDeductions || 0) + getPf(employee) + getEsiEmployee(employee)) },
    { Field: "Employer PF", Detail: formatMoney(getEmployerPf(employee)) },
    { Field: "Employer ESI", Detail: formatMoney(getEsiEmployer(employee)) },
    { Field: "Net salary", Detail: formatMoney(getNetPay(employee)) },
    { Field: "Leave balance", Detail: `${Number(employee.leaveBalance || 0).toFixed(2)} days` }
  ];
}

function openEmployeeProfileReport(employeeId, shouldPrint = false) {
  const employee = employees.find((entry) => entry.id === employeeId);
  if (!employee) return;
  openReportModal(`Employee Profile - ${employee.name}`, getEmployeeProfileRows(employeeId));
  if (shouldPrint) printActiveReport();
}

function downloadEmployeeProfile(employeeId) {
  const employee = employees.find((entry) => entry.id === employeeId);
  if (!employee) return;
  openReportModal(`Employee Profile - ${employee.name}`, getEmployeeProfileRows(employeeId));
  downloadActiveReportHtml();
}

function renderAdvanceEmployeeOptions() {
  const selected = advanceEmployee.value;
  advanceEmployee.innerHTML = "";
  employees.forEach((employee) => {
    const option = document.createElement("option");
    option.value = employee.id;
    option.textContent = `${employee.name} (${employee.employeeCode})`;
    advanceEmployee.appendChild(option);
  });
  if ([...advanceEmployee.options].some((option) => option.value === selected)) {
    advanceEmployee.value = selected;
  }
}

function renderAdvances() {
  advanceRows.innerHTML = "";
  advanceEmpty.classList.toggle("hidden", advances.length > 0);

  advances.forEach((advance) => {
    const employee = employees.find((entry) => entry.id === advance.employeeId);
    const history = (advance.deductions || [])
      .map((item) => (item.skipped ? `${item.month}: skipped` : `${item.month}: ${formatMoney(item.amount)}`))
      .join(", ");
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td></td>
      <td class="number"></td>
      <td class="number"></td>
      <td class="number strong"></td>
      <td></td>
      <td></td>
    `;
    tr.children[0].textContent = employee ? `${employee.name} (${employee.employeeCode})` : "Former employee";
    tr.children[1].textContent = formatMoney(advance.amount);
    tr.children[2].textContent = formatMoney(advance.monthlyDeduction);
    tr.children[3].textContent = formatMoney(getAdvanceOutstanding(advance));
    tr.children[4].textContent = `${advance.date} · ${advance.paymentMethod}`;
    tr.children[5].textContent = history || "No deductions yet";
    advanceRows.appendChild(tr);
  });
}

function renderPortal() {
  const employee = employees.find((entry) => entry.id === portalEmployeeId);
  const portalHasEmployee = Boolean(employee);
  otpForm.classList.toggle("hidden", isAppLoggedIn || portalHasEmployee);
  document.querySelector(".portal-layout")?.classList.toggle("portal-dashboard-mode", isAppLoggedIn || portalHasEmployee);
  document.querySelector(".portal-requests")?.classList.toggle("hidden", !portalHasEmployee);
  portalWorkspace.classList.toggle("hidden", !employee);
  portalEmployeeName.textContent = employee ? `${employee.name} (${employee.employeeCode})` : "Employee";
  const today = new Date().toISOString().slice(0, 10);
  leaveFromDate.value = leaveFromDate.value || today;
  leaveToDate.value = leaveToDate.value || leaveFromDate.value;
  updateLeaveDays();
  renderPortalTabs();
  renderPortalProfile(employee);
  renderPortalEssDashboard(employee);
  renderPortalSalaryLedger(employee);
  renderPortalLeaveLedger(employee);
  renderPortalShortLeaveLedger(employee);
  portalRequestRows.innerHTML = "";
  const visibleRequests = employee ? leaveRequests.filter((request) => request.employeeId === employee.id) : [];
  portalRequestEmpty.classList.toggle("hidden", visibleRequests.length > 0);

  visibleRequests.forEach((request) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    `;
    tr.children[0].textContent = getRequestFromDate(request);
    tr.children[1].textContent = getRequestToDate(request);
    tr.children[2].textContent = request.type === "short" ? "Short leave" : "Leave";
    tr.children[3].textContent = request.type === "short" ? "2 hours" : request.days;
    tr.children[4].textContent = getLeaveStatusLabel(request);
    tr.children[5].textContent = getApprovalSummary(request);
    tr.children[6].textContent = request.reason;
    portalRequestRows.appendChild(tr);
  });
}

function createEssCard(title, value, detail = "", action = "") {
  const article = document.createElement("article");
  article.className = "ess-card";
  if (action) article.dataset.portalAction = action;
  article.innerHTML = `<span></span><strong></strong><small></small>`;
  article.querySelector("span").textContent = title;
  article.querySelector("strong").textContent = value;
  article.querySelector("small").textContent = detail;
  return article;
}

function renderInfoGrid(container, items = []) {
  container.innerHTML = "";
  items.forEach(([title, value, detail]) => {
    container.appendChild(createEssCard(title, value, detail));
  });
}

function getPortalEmployeeSnapshot(employee) {
  const currentMonth = getCurrentMonthKey();
  const attendance = getAttendanceRecord(employee.id, currentMonth);
  const attendancePayroll = getAttendancePayroll(employee, attendance, Number(workingDays.value || 26), currentMonth);
  const salaryEntries = getEmployeePayrollHistory(employee.id);
  const latestSalary = salaryEntries[0];
  const employeeRequests = leaveRequests.filter((request) => request.employeeId === employee.id);
  const latestRequest = employeeRequests[0];
  const nextHoliday = allIndiaHolidays2026.find((holiday) => new Date(`${holiday.date}T00:00:00`) >= new Date());
  return { currentMonth, attendance, attendancePayroll, salaryEntries, latestSalary, employeeRequests, latestRequest, nextHoliday };
}

function renderPortalEssDashboard(employee) {
  [portalEssCards, portalOverviewGrid, portalAttendanceGrid, portalComplianceGrid, portalDocumentsGrid].forEach((container) => {
    if (container) container.innerHTML = "";
  });
  if (!employee) return;

  const snapshot = getPortalEmployeeSnapshot(employee);
  [
    ["Profile", employee.designation || "Employee", `${employee.department || "Department"} · ${employee.employeeCode}`, "profileUpdate"],
    ["Attendance", `${Number(snapshot.attendance.leavesTaken || 0)} leave days`, `${Number(snapshot.attendance.shortLeaves || 0)} short leaves this month`, "attendance"],
    ["Leave balance", `${Number(snapshot.attendancePayroll.closingLeave || 0).toFixed(2)} days`, `Opening ${Number(snapshot.attendancePayroll.openingLeave || 0).toFixed(2)} · Credit ${monthlyLeaveCredit}`, "applyLeave"],
    ["Leave status", snapshot.latestRequest ? getLeaveStatusLabel(snapshot.latestRequest) : "No requests", snapshot.latestRequest ? `${snapshot.latestRequest.type === "short" ? "Short leave" : "Leave"} · ${getRequestFromDate(snapshot.latestRequest)}` : "Apply leave from the form below", "applyLeave"],
    ["Payroll history", `${snapshot.salaryEntries.length} records`, snapshot.latestSalary ? `Latest payable ${formatMoney(snapshot.latestSalary.payable || 0)}` : "Salary slips appear after payroll run", "payslip"],
    ["PF & ESI", `${formatMoney(getPf(employee))} / ${formatMoney(getEsiEmployee(employee))}`, "Employee statutory contribution", "documents"],
    ["Documents", "Form 16 / HR docs", "Downloadable records and letters", "documents"],
    ["Holiday list", snapshot.nextHoliday ? snapshot.nextHoliday.name : "No upcoming holiday", snapshot.nextHoliday ? snapshot.nextHoliday.date : "Current year list is available", ""],
    ["Shift schedule", "General shift", "09:30 AM to 06:30 PM", "attendance"],
    ["Reimbursements", "No open claim", "Submit receipts through HR", "documents"],
    ["Training notices", "Policy refresh", "HR notices and learning updates", "documents"]
  ].forEach(([title, value, detail, action]) => portalEssCards.appendChild(createEssCard(title, value, detail, action)));

  renderInfoGrid(portalOverviewGrid, [
    ["Employee", `${employee.name} (${employee.employeeCode})`, employee.designation || ""],
    ["Contact", employee.mobile || "Not recorded", employee.email || ""],
    ["Address", employee.presentAddress || "Not recorded", employee.permanentAddress ? `Permanent: ${employee.permanentAddress}` : ""],
    ["Leave balance", `${Number(snapshot.attendancePayroll.closingLeave || 0).toFixed(2)} days`, `Current month: ${snapshot.currentMonth}`],
    ["Latest leave status", snapshot.latestRequest ? getLeaveStatusLabel(snapshot.latestRequest) : "No requests", snapshot.latestRequest ? snapshot.latestRequest.reason : ""],
    ["Latest salary", snapshot.latestSalary ? formatMoney(snapshot.latestSalary.payable || 0) : "Not generated", snapshot.latestSalary ? snapshot.latestSalary.month : ""],
    ["Announcement", "Payroll desk is live", "Payslips, leave and documents are available here"],
    ["Holiday", snapshot.nextHoliday ? snapshot.nextHoliday.name : "No upcoming holiday", snapshot.nextHoliday ? snapshot.nextHoliday.date : ""],
    ["Schedule", "General shift", "09:30 AM to 06:30 PM"],
    ["Reimbursement", "No open claim", "Claim status will appear here"],
    ["Training / HR notice", "Policy refresh", "Check HR notices for new updates"]
  ]);
  renderInfoGrid(portalAttendanceGrid, [
    ["Month", snapshot.currentMonth, ""],
    ["Working days", String(snapshot.attendance.workingDays || workingDays.value || 26), ""],
    ["Leave taken", String(snapshot.attendance.leavesTaken || 0), "Approved leave is reflected automatically"],
    ["Short leave", String(snapshot.attendance.shortLeaves || 0), "First 2 are allowed without deduction"],
    ["Deduction", formatMoney(snapshot.attendancePayroll.attendanceDeduction || 0), "As per saved attendance"]
  ]);
  renderInfoGrid(portalComplianceGrid, [
    ["PF applicable", employee.pfApplicable || "Auto", formatMoney(getPf(employee))],
    ["ESI applicable", employee.esiApplicable || "Auto", formatMoney(getEsiEmployee(employee))],
    ["UAN", employee.uan || "Not recorded", ""],
    ["ESIC IP number", employee.esicIpNumber || "Not recorded", ""],
    ["PAN", employee.pan || "Not recorded", ""]
  ]);
  renderInfoGrid(portalDocumentsGrid, [
    ["Salary slips", `${snapshot.salaryEntries.length} available`, "Use View Payslip for report options"],
    ["Form 16", "Available after yearly close", "Use Download Form 16"],
    ["HR documents", "Profile, address and statutory records", "Download and print from reports"],
    ["Training notices", "Policy refresh", "Upcoming HR notices will appear here"],
    ["Reimbursement claims", "No open claim", "Claim ledger will appear here"]
  ]);
}

function getPortalPayslipRows(employee) {
  return getEmployeePayrollHistory(employee.id).map((entry) => ({
    Month: entry.month,
    "Working Days": entry.workingDays || "",
    Present: entry.presentDays || 0,
    "Leave / Absent": Number(entry.leavesTaken || 0),
    "Basic Salary": formatMoney(employee.basicPay || 0),
    HRA: formatMoney(employee.hra || 0),
    Conveyance: formatMoney(employee.conveyanceAllowance || 0),
    "Special Allowance": formatMoney(employee.allowance || 0),
    "Gross Salary": formatMoney(entry.grossPay || getGrossPay(employee)),
    "Performance Incentive": formatMoney(entry.performanceIncentive || 0),
    "Employee PF": formatMoney(getPf(employee)),
    "Employee ESI": formatMoney(getEsiEmployee(employee)),
    Deductions: formatMoney(Number(entry.attendanceDeduction || 0) + Number(entry.advanceDeduction || 0) + Number(entry.professionalTax || 0) + Number(entry.tds || 0) + Number(entry.otherStatutory || 0)),
    "Net Salary": formatMoney(entry.payable || 0),
    "Payment Status": "Generated",
    "Generated Date": new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(entry.savedAt))
  }));
}

function getPortalAttendanceRows(employee) {
  return Object.entries(attendanceRecords)
    .map(([month, records]) => ({ month, record: records[employee.id] }))
    .filter((entry) => entry.record)
    .sort((a, b) => b.month.localeCompare(a.month))
    .map(({ month, record }) => ({
      Month: month,
      "Working Days": record.workingDays || "",
      "Leave Taken": record.leavesTaken || 0,
      "Short Leave": record.shortLeaves || 0,
      "Leave Balance": Number(getAttendancePayroll(employee, record, Number(record.workingDays || workingDays.value || 26), month).closingLeave || 0).toFixed(2)
    }));
}

function getPortalDocumentRows(employee) {
  return [
    { Document: "Employee profile", Status: "Available", Action: "Use Download / Print from report" },
    { Document: "Salary slips", Status: `${getEmployeePayrollHistory(employee.id).length} generated`, Action: "View Payslip" },
    { Document: "Form 16", Status: "Available after annual payroll close", Action: "Download Form 16" },
    { Document: "PF & ESI details", Status: "Available", Action: "View Documents" },
    { Document: "Training / HR notices", Status: "Available", Action: "View Documents" }
  ];
}

function handlePortalAction(action) {
  const employee = employees.find((entry) => entry.id === portalEmployeeId);
  if (!employee) {
    showToast("Login as an employee to use this action.", true);
    return;
  }

  if (action === "applyLeave") {
    activePortalPanel = "portalRequestPanel";
    renderPortalTabs();
    leaveRequestForm.scrollIntoView({ behavior: "smooth", block: "center" });
    leaveReason.focus();
    return;
  }

  if (action === "payslip") {
    openReportModal(`Salary Slips - ${employee.name}`, getPortalPayslipRows(employee));
    return;
  }

  if (action === "form16") {
    openReportModal(`Form 16 - ${employee.name}`, [
      { Employee: employee.name, PAN: employee.pan || "Not recorded", "Financial Year": "2026-27", Status: "Available after annual payroll close" }
    ]);
    downloadActiveReportHtml();
    return;
  }

  if (action === "attendance") {
    openReportModal(`Attendance Report - ${employee.name}`, getPortalAttendanceRows(employee));
    return;
  }

  if (action === "profileUpdate") {
    openReportModal(`Profile Update Request - ${employee.name}`, getEmployeeProfileRows(employee.id), "<p class=\"muted\">Profile changes can be requested here and routed to HR/Admin for approval.</p>");
    return;
  }

  if (action === "documents") {
    openReportModal(`Documents - ${employee.name}`, getPortalDocumentRows(employee));
  }
}

function renderPortalTabs() {
  portalTabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.portalTab === activePortalPanel);
  });
  portalTabPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.portalPanel === activePortalPanel);
  });
}

function renderPortalProfile(employee) {
  if (!employee) {
    portalProfileDetails.innerHTML = "";
    portalProfileAvatar.textContent = "";
    portalProfileAvatar.style.backgroundImage = "";
    return;
  }

  portalProfileAvatar.textContent = employee.photo ? "" : getInitials(employee.name);
  portalProfileAvatar.style.backgroundImage = employee.photo ? `url(${employee.photo})` : "";
  portalProfileDetails.innerHTML = "";
  [
    `Mobile: ${employee.mobile || "Not recorded"}`,
    `Email: ${employee.email || "Not recorded"}`,
    `Contact: ${employee.additionalContact || "Not recorded"} (${employee.additionalRelation || "Family"})`,
    `Address: ${employee.presentAddress || "Not recorded"}`
  ].forEach((detail) => {
    const item = document.createElement("span");
    item.textContent = detail;
    portalProfileDetails.appendChild(item);
  });
}

function getEmployeePayrollHistory(employeeId) {
  return payrollHistory
    .flatMap((history) =>
      history.employees
        .filter((entry) => entry.id === employeeId)
        .map((entry) => ({ ...entry, month: history.month, savedAt: history.savedAt }))
    )
    .sort((a, b) => b.month.localeCompare(a.month));
}

function renderPortalSalaryLedger(employee) {
  const entries = employee ? getEmployeePayrollHistory(employee.id) : [];
  portalSalaryLedgerRows.innerHTML = "";
  portalSalaryLedgerEmpty.classList.toggle("hidden", entries.length > 0);

  entries.forEach((entry) => {
    const date = new Date(`${entry.month}-01T00:00:00`);
    const deductions = Number(entry.attendanceDeduction || 0) + Number(entry.advanceDeduction || 0) + Number(entry.professionalTax || 0) + Number(entry.tds || 0) + Number(entry.otherStatutory || 0);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td></td>
      <td></td>
      <td class="number"></td>
      <td class="number"></td>
      <td class="number"></td>
      <td class="number strong"></td>
    `;
    tr.children[0].textContent = new Intl.DateTimeFormat("en-IN", { year: "numeric" }).format(date);
    tr.children[1].textContent = new Intl.DateTimeFormat("en-IN", { month: "long" }).format(date);
    tr.children[2].textContent = formatMoney(entry.grossPay || 0);
    tr.children[3].textContent = formatMoney(entry.performanceIncentive || 0);
    tr.children[4].textContent = formatMoney(deductions);
    tr.children[5].textContent = formatMoney(entry.payable || 0);
    portalSalaryLedgerRows.appendChild(tr);
  });
}

function renderPortalLeaveLedger(employee) {
  const payrollEntries = employee ? getEmployeePayrollHistory(employee.id) : [];
  const requestEntries = employee ? leaveRequests.filter((request) => request.employeeId === employee.id && request.type !== "short") : [];
  portalLeaveLedgerRows.innerHTML = "";
  portalLeaveLedgerEmpty.classList.toggle("hidden", payrollEntries.length + requestEntries.length > 0);

  payrollEntries.forEach((entry) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td></td>
      <td class="number"></td>
      <td class="number"></td>
      <td class="number"></td>
      <td></td>
      <td></td>
    `;
    tr.children[0].textContent = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date(`${entry.month}-01T00:00:00`));
    tr.children[1].textContent = Number(entry.openingLeave || 0).toFixed(2);
    tr.children[2].textContent = Number(entry.leaveCredit || 0).toFixed(2);
    tr.children[3].textContent = Number(entry.leavesTaken || 0).toFixed(2);
    tr.children[4].textContent = `Closing ${Number(entry.closingLeave || 0).toFixed(2)}`;
    tr.children[5].textContent = `Paid ${Number(entry.paidLeaveUsed || 0).toFixed(2)}, unpaid ${Number(entry.unpaidLeave || 0).toFixed(2)}`;
    portalLeaveLedgerRows.appendChild(tr);
  });

  requestEntries.forEach((request) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td></td>
      <td class="number">-</td>
      <td class="number">-</td>
      <td class="number"></td>
      <td></td>
      <td></td>
    `;
    tr.children[0].textContent = `${getRequestFromDate(request)} to ${getRequestToDate(request)}`;
    tr.children[3].textContent = Number(request.days || 0).toFixed(2);
    tr.children[4].textContent = getLeaveStatusLabel(request);
    tr.children[5].textContent = request.reason;
    portalLeaveLedgerRows.appendChild(tr);
  });
}

function renderPortalShortLeaveLedger(employee) {
  const payrollEntries = employee ? getEmployeePayrollHistory(employee.id).filter((entry) => Number(entry.shortLeaves || 0) > 0) : [];
  const requestEntries = employee ? leaveRequests.filter((request) => request.employeeId === employee.id && request.type === "short") : [];
  portalShortLeaveLedgerRows.innerHTML = "";
  portalShortLeaveLedgerEmpty.classList.toggle("hidden", payrollEntries.length + requestEntries.length > 0);

  payrollEntries.forEach((entry) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td></td>
      <td></td>
      <td class="number"></td>
      <td></td>
      <td></td>
    `;
    tr.children[0].textContent = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date(`${entry.month}-01T00:00:00`));
    tr.children[1].textContent = "Monthly payroll";
    tr.children[2].textContent = Number(entry.shortLeaves || 0);
    tr.children[3].textContent = Number(entry.excessShortLeaves || 0) > 0 ? `${entry.excessShortLeaves} excess` : "Within free limit";
    tr.children[4].textContent = `Salary days deducted ${Number(entry.excessShortLeaves || 0) * shortLeaveDeductionDays}`;
    portalShortLeaveLedgerRows.appendChild(tr);
  });

  requestEntries.forEach((request) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td></td>
      <td>Short leave request</td>
      <td class="number">1</td>
      <td></td>
      <td></td>
    `;
    tr.children[0].textContent = getRequestFromDate(request);
    tr.children[3].textContent = getLeaveStatusLabel(request);
    tr.children[4].textContent = request.reason;
    portalShortLeaveLedgerRows.appendChild(tr);
  });
}

function renderApprovals() {
  const role = approvalRole.value;
  approvalRows.innerHTML = "";
  const visibleRequests = leaveRequests.filter((request) => canRoleActOnRequest(role, request));
  approvalEmpty.classList.toggle("hidden", visibleRequests.length > 0);

  visibleRequests.forEach((request) => {
    const employee = employees.find((entry) => entry.id === request.employeeId);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td class="actions">
        <div class="action-group">
          <button class="row-button approve-button" type="button">Approve</button>
          <button class="row-button delete reject-button" type="button">Reject</button>
        </div>
      </td>
    `;

    tr.children[0].textContent = employee ? `${employee.name} (${employee.employeeCode})` : "Former employee";
    tr.children[1].textContent = getRequestFromDate(request);
    tr.children[2].textContent = getRequestToDate(request);
    tr.children[3].textContent = request.type === "short" ? "Short leave" : "Leave";
    tr.children[4].textContent = request.type === "short" ? "2 hours" : request.days;
    tr.children[5].textContent = getLeaveStatusLabel(request);
    tr.children[6].textContent = request.reason;
    tr.querySelector(".approve-button").disabled = !hasRoleAction("approve");
    tr.querySelector(".reject-button").disabled = !hasRoleAction("approve");
    tr.querySelector(".approve-button").addEventListener("click", () => approveLeaveRequest(request.id, role));
    tr.querySelector(".reject-button").addEventListener("click", () => rejectLeaveRequest(request.id, role));
    approvalRows.appendChild(tr);
  });

  renderLeaveApprovalRegister(approvedLeaveRows, approvedLeaveEmpty, leaveRequests.filter((request) => request.status === "approved"));
  renderLeaveApprovalRegister(rejectedLeaveRows, rejectedLeaveEmpty, leaveRequests.filter((request) => request.status === "rejected"));
}

function renderLeaveApprovalRegister(targetRows, emptyElement, requests) {
  targetRows.innerHTML = "";
  emptyElement.classList.toggle("hidden", requests.length > 0);

  requests.forEach((request) => {
    const employee = employees.find((entry) => entry.id === request.employeeId);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td><span class="badge"></span></td>
      <td></td>
    `;
    tr.children[0].textContent = employee ? `${employee.name} (${employee.employeeCode})` : "Former employee";
    tr.children[1].textContent = request.type === "short" ? "Short leave" : "Leave";
    tr.children[2].textContent = `${getRequestFromDate(request)} to ${getRequestToDate(request)}`;
    tr.children[3].textContent = request.reason;
    tr.querySelector(".badge").textContent = getLeaveStatusLabel(request);
    tr.querySelector(".badge").classList.toggle("ok", request.status === "approved");
    tr.children[5].textContent = getApprovalSummary(request);
    targetRows.appendChild(tr);
  });
}

function getLeaveStatusLabel(request) {
  const labels = {
    pendingLevel1: "Pending first approval",
    pendingDirector: "Pending Director",
    approved: "Approved",
    rejected: "Rejected"
  };
  return labels[request.status] || request.status;
}

function getRequestFromDate(request) {
  return request.fromDate || request.date;
}

function getRequestToDate(request) {
  return request.toDate || request.date;
}

function calculateLeaveDays(fromDate, toDate) {
  if (!fromDate || !toDate) return 0;
  const start = new Date(`${fromDate}T00:00:00`);
  const end = new Date(`${toDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;
  return Math.floor((end - start) / 86400000) + 1;
}

function updateLeaveDays() {
  const isShortLeave = leaveType.value === "short";
  leaveFromDateLabel.textContent = isShortLeave ? "Short leave date" : "From date";
  leaveToDateField.classList.toggle("hidden", isShortLeave);
  leaveDaysField.classList.toggle("hidden", isShortLeave);
  if (isShortLeave) {
    leaveToDate.value = leaveFromDate.value || leaveToDate.value;
    leaveToDate.required = false;
    leaveDays.value = 0;
    return;
  }

  leaveToDate.required = true;
  if (leaveFromDate.value && (!leaveToDate.value || leaveToDate.value < leaveFromDate.value)) {
    leaveToDate.value = leaveFromDate.value;
  }
  leaveDays.value = calculateLeaveDays(leaveFromDate.value, leaveToDate.value) || 1;
}

function getApprovalSummary(request) {
  const first = request.firstApprovalBy ? `Step 1: ${request.firstApprovalBy}` : "Step 1: pending";
  const director = request.directorApprovalBy ? `Director: ${request.directorApprovalBy}` : "Director: pending";
  return `${first} · ${director}`;
}

function canRoleActOnRequest(role, request) {
  if (request.status === "pendingLevel1") return ["Supervisor", "Engineer", "Manager"].includes(role);
  if (request.status === "pendingDirector") return role === "Director";
  return false;
}

function renderAttendance() {
  const currentMonth = getCurrentMonthKey();
  attendanceMonth.max = currentMonth;
  if (!attendanceMonth.value || attendanceMonth.value > currentMonth) {
    attendanceMonth.value = currentMonth;
  }
  const monthKey = attendanceMonth.value;
  renderAttendanceTabs();
  renderAttendanceDailyHeader(monthKey);
  attendanceRows.innerHTML = "";
  attendanceSummaryRows.innerHTML = "";
  const activeEmployees = employees.filter((employee) => isEmployeeActiveForMonth(employee, monthKey));

  if (!activeEmployees.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="${getDaysInMonth(monthKey) + 1}" class="muted">No active employees for this month.</td>`;
    attendanceRows.appendChild(tr);
    attendanceSummaryRows.innerHTML = `<tr><td colspan="7" class="muted">No active employees for this month.</td></tr>`;
    return;
  }

  activeEmployees.forEach((employee) => {
    const record = getAttendanceRecord(employee.id, monthKey);
    const approvedLeaveDates = getApprovedLeaveDates(employee.id, monthKey);
    const dailyTr = document.createElement("tr");
    dailyTr.innerHTML = `
      <td>
        <div class="employee-name"></div>
        <div class="muted"></div>
      </td>`;

    dailyTr.querySelector(".employee-name").textContent = employee.name;
    dailyTr.querySelector(".muted").textContent = employee.employeeCode;
    getMonthDates(monthKey).forEach((date) => {
      const td = document.createElement("td");
      const select = document.createElement("select");
      select.className = "day-attendance-select";
      select.innerHTML = `
        <option value="">-</option>
        <option value="present">P</option>
        <option value="absent">A</option>
        <option value="leave">L</option>
      `;
      select.value = record.days[date] || "";
      if (approvedLeaveDates.has(date)) {
        select.disabled = true;
        select.title = "Approved leave is reflected automatically";
      }
      select.addEventListener("change", () => updateDailyAttendance(employee.id, date, select.value));
      td.appendChild(select);
      dailyTr.appendChild(td);
    });
    attendanceRows.appendChild(dailyTr);

    const summaryTr = document.createElement("tr");
    summaryTr.innerHTML = `
      <td><div class="employee-name"></div><div class="muted"></div></td>
      <td class="number"></td>
      <td class="number"></td>
      <td class="number"></td>
      <td class="number"></td>
      <td class="number"></td>
      <td></td>
    `;
    summaryTr.querySelector(".employee-name").textContent = employee.name;
    summaryTr.querySelector(".muted").textContent = employee.employeeCode;
    summaryTr.children[1].textContent = workingDays.value || 26;
    summaryTr.children[2].textContent = record.presentDays;
    summaryTr.children[3].textContent = record.absentDays;
    summaryTr.children[4].textContent = record.approvedLeaveDays;
    summaryTr.children[5].textContent = record.shortLeaves;
    summaryTr.children[6].textContent = record.approvedLeaveDays ? "Approved leave auto-marked" : "Ready";
    attendanceSummaryRows.appendChild(summaryTr);
  });
}

function renderAttendanceTabs() {
  attendanceTabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.attendanceTab === activeAttendancePanel);
  });
  attendanceTabPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === activeAttendancePanel);
  });
}

function renderAttendanceDailyHeader(monthKey) {
  attendanceDailyHead.innerHTML = "";
  const tr = document.createElement("tr");
  tr.innerHTML = `<th>Employee</th>`;
  getMonthDates(monthKey).forEach((date) => {
    const th = document.createElement("th");
    th.className = "attendance-day-heading";
    th.textContent = date.slice(-2);
    tr.appendChild(th);
  });
  attendanceDailyHead.appendChild(tr);
}

function renderLeaveRegister() {
  const currentMonth = getCurrentMonthKey();
  leaveRegisterMonth.max = currentMonth;
  if (!leaveRegisterMonth.value || leaveRegisterMonth.value > currentMonth) {
    leaveRegisterMonth.value = currentMonth;
  }
  const monthKey = leaveRegisterMonth.value;
  const days = Number(workingDays.value || 26);
  leaveRegisterRows.innerHTML = "";

  employees.forEach((employee) => {
    const record = getAttendanceRecord(employee.id, monthKey);
    const payroll = getAttendancePayroll(employee, record, days, monthKey);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <div class="employee-name"></div>
        <div class="muted"></div>
      </td>
      <td class="number"></td>
      <td class="number"></td>
      <td class="number"></td>
      <td class="number"></td>
      <td class="number"></td>
      <td class="number"></td>
      <td class="number strong"></td>
    `;

    tr.querySelector(".employee-name").textContent = employee.name;
    tr.querySelector(".muted").textContent = employee.employeeCode;
    tr.children[1].textContent = payroll.openingLeave.toFixed(2);
    tr.children[2].textContent = payroll.credit.toFixed(2);
    tr.children[3].textContent = Number(record.leavesTaken || 0).toFixed(2);
    tr.children[4].textContent = payroll.paidLeaveUsed.toFixed(2);
    tr.children[5].textContent = payroll.unpaidLeave.toFixed(2);
    tr.children[6].textContent = Number(record.shortLeaves || 0);
    tr.children[7].textContent = payroll.closingLeave.toFixed(2);
    leaveRegisterRows.appendChild(tr);
  });
}

function renderPayrollRun() {
  const monthKey = runMonth.value;
  const days = Number(runWorkingDays.value || 26);
  const showProfessionalTax = adminSettings.payrollRunColumns.professionalTax === true;
  payrollRunRows.innerHTML = "";
  applyPayrollRunColumnSettings();
  const totals = {
    employees: employees.length,
    gross: 0,
    incentives: 0,
    deductions: 0,
    payable: 0
  };

  employees.forEach((employee) => {
    const run = getPayrollRunCalculation(employee, monthKey, days);
    totals.gross += getGrossPay(employee);
    totals.incentives += run.performanceIncentive;
    totals.deductions += run.attendanceDeduction + run.advanceDeduction + run.professionalTax + run.tds + run.otherStatutory;
    totals.payable += run.finalPayable;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <div class="employee-name"></div>
        <div class="muted"></div>
      </td>
      <td class="number"></td>
      <td></td>
      <td></td>
      <td class="number pt-column"><input class="mini-input pt-input" type="number" min="0" step="1"></td>
      <td class="number"><input class="mini-input tds-input" type="number" min="0" step="1"></td>
      <td class="number"><input class="mini-input other-statutory-input" type="number" min="0" step="1"></td>
      <td class="number"><input class="mini-input incentive-input" type="number" min="0" step="1"></td>
      <td class="number strong"></td>
    `;

    tr.querySelector(".employee-name").textContent = employee.name;
    tr.querySelector(".muted").textContent = `${employee.employeeCode} · PF ${formatMoney(getPf(employee))} · ESI ${formatMoney(getEsiEmployee(employee))}`;
    tr.children[1].textContent = formatMoney(run.attendance.baseNetPay);
    tr.children[2].innerHTML = `
      <label class="deduction-toggle">
        <span>${formatMoney(run.rawAttendanceDeduction)}</span>
        <input class="deduct-leave-input" type="checkbox">
      </label>
    `;
    tr.children[3].innerHTML = `
      <label class="deduction-toggle">
        <span>${formatMoney(run.rawAdvanceDeduction)}</span>
        <input class="deduct-advance-input" type="checkbox">
      </label>
    `;
    tr.children[8].textContent = formatMoney(run.finalPayable);
    tr.querySelector(".pt-column").classList.toggle("hidden-column", !showProfessionalTax);

    const leaveToggle = tr.querySelector(".deduct-leave-input");
    const advanceToggle = tr.querySelector(".deduct-advance-input");
    const ptInput = tr.querySelector(".pt-input");
    const tdsInput = tr.querySelector(".tds-input");
    const otherInput = tr.querySelector(".other-statutory-input");
    const incentiveInput = tr.querySelector(".incentive-input");
    const canDeductProfessionalTax = showProfessionalTax && employee.ptApplicable !== false;
    const canDeductTds = employee.tdsApplicable !== false;
    leaveToggle.checked = run.adjustment.deductLeave !== false;
    advanceToggle.checked = run.adjustment.deductAdvance !== false;
    ptInput.value = canDeductProfessionalTax ? run.adjustment.professionalTax || 0 : 0;
    ptInput.disabled = !canDeductProfessionalTax;
    ptInput.title = canDeductProfessionalTax ? "" : "Professional Tax is not applicable for this employee or hidden by Admin";
    tdsInput.value = canDeductTds ? run.adjustment.tds || 0 : 0;
    tdsInput.disabled = !canDeductTds;
    tdsInput.title = canDeductTds ? "" : "TDS is not applicable for this employee";
    otherInput.value = run.adjustment.otherStatutory || 0;
    incentiveInput.value = run.adjustment.performanceIncentive || 0;

    leaveToggle.addEventListener("change", () => updatePayrollRunAdjustment(employee.id, "deductLeave", leaveToggle.checked));
    advanceToggle.addEventListener("change", () => updatePayrollRunAdjustment(employee.id, "deductAdvance", advanceToggle.checked));
    ptInput.addEventListener("input", () => updatePayrollRunAdjustment(employee.id, "professionalTax", ptInput.value));
    tdsInput.addEventListener("input", () => updatePayrollRunAdjustment(employee.id, "tds", tdsInput.value));
    otherInput.addEventListener("input", () => updatePayrollRunAdjustment(employee.id, "otherStatutory", otherInput.value));
    incentiveInput.addEventListener("input", () => updatePayrollRunAdjustment(employee.id, "performanceIncentive", incentiveInput.value));
    payrollRunRows.appendChild(tr);
  });

  renderPayrollRunSummary(totals);
}

function renderPayrollRunSummary(totals) {
  runSummaryEmployees.textContent = totals.employees;
  runSummaryGross.textContent = formatMoney(totals.gross);
  runSummaryIncentives.textContent = formatMoney(totals.incentives);
  runSummaryDeductions.textContent = formatMoney(totals.deductions);
  runSummaryPayable.textContent = formatMoney(totals.payable);
}

function applyPayrollRunColumnSettings() {
  const showProfessionalTax = adminSettings.payrollRunColumns.professionalTax === true;
  document.querySelectorAll("#payrollRunPage .pt-column").forEach((element) => {
    element.classList.toggle("hidden-column", !showProfessionalTax);
  });
}

function updatePayrollRunAdjustment(employeeId, field, value) {
  const monthKey = runMonth.value;
  payrollRunAdjustments[monthKey] = payrollRunAdjustments[monthKey] || {};
  const nextValue = field === "deductLeave" || field === "deductAdvance" ? Boolean(value) : Number(value || 0);
  payrollRunAdjustments[monthKey][employeeId] = {
    ...getPayrollRunAdjustment(employeeId, monthKey),
    [field]: nextValue
  };
  savePayrollRunAdjustments();
  renderPayrollRun();
}

function updateEmployeeStatus(employeeId, status) {
  if (!hasRoleAction("edit")) return;
  const month = getCurrentMonthKey();
  const currentEmployee = employees.find((employee) => employee.id === employeeId);
  if (!currentEmployee) return;
  const statusHistory = (currentEmployee.statusHistory || []).filter((entry) => entry.month !== month);
  const proposedEmployee = { ...currentEmployee, status, statusHistory: [...statusHistory, { month, status }] };

  if (currentAppRole === "hr") {
    const queued = queueEmployeeChangeRequest(currentEmployee, proposedEmployee, "Employee status change");
    adminMessage.textContent = queued
      ? `Status change for ${currentEmployee.name} is waiting for Admin authorization.`
      : "No status change was found.";
    renderRows();
    renderAdmin();
    return;
  }

  employees = employees.map((employee) => {
    if (employee.id !== employeeId) return employee;
    return proposedEmployee;
  });
  saveEmployees();
  renderRows();
  renderAttendance();
  showToast(`Employee ${currentEmployee.name} ${status === "Active" ? "activated" : "deactivated"}.`);
}

function updateDailyAttendance(employeeId, date, status) {
  const monthKey = date.slice(0, 7);
  const record = getAttendanceRecord(employeeId, monthKey);
  attendanceRecords[monthKey] = attendanceRecords[monthKey] || {};
  const days = { ...(record.days || {}) };
  if (status) {
    days[date] = status;
  } else {
    delete days[date];
  }
  attendanceRecords[monthKey][employeeId] = {
    ...(attendanceRecords[monthKey][employeeId] || {}),
    days,
    workingDays: Number(workingDays.value || 26)
  };
  saveAttendanceRecords();
  renderAttendance();
}

function updateAttendanceRecord(employeeId, field, value) {
  const monthKey = attendanceMonth.value;
  attendanceRecords[monthKey] = attendanceRecords[monthKey] || {};
  attendanceRecords[monthKey][employeeId] = {
    ...getAttendanceRecord(employeeId, monthKey),
    [field]: Number(value || 0)
  };
  saveAttendanceRecords();
  renderAttendance();
}

function saveMonthlyPayroll() {
  saveAttendanceRecords();
  renderAttendance();
}

function savePayrollRunSnapshot() {
  if (!window.confirm(`Finalize and save payroll for ${runMonth.value}?`)) return;
  const monthKey = runMonth.value;
  const days = Number(runWorkingDays.value || 26);
  attendanceRecords[monthKey] = attendanceRecords[monthKey] || {};
  clearAdvanceDeductionsForMonth(monthKey);

  const snapshots = employees.map((employee) => {
    const record = getAttendanceRecord(employee.id, monthKey);
    const run = getPayrollRunCalculation(employee, monthKey, days);
    const payroll = run.attendance;
    const creditApplied = payroll.credit;

    employee.leaveBalance = payroll.closingLeave;

    attendanceRecords[monthKey][employee.id] = {
      ...(attendanceRecords[monthKey][employee.id] || {}),
      days: record.days || {},
      leavesTaken: Number(record.leavesTaken || 0),
      shortLeaves: Number(record.shortLeaves || 0),
      presentDays: Number(record.presentDays || 0),
      absentDays: Number(record.absentDays || 0),
      approvedLeaveDays: Number(record.approvedLeaveDays || 0),
      workingDays: days
    };

    return {
      id: employee.id,
      employeeCode: employee.employeeCode,
      name: employee.name,
      salaryStructure: buildSalaryStructure(employee),
      grossPay: getGrossPay(employee),
      baseNetPay: payroll.baseNetPay,
      workingDays: days,
      presentDays: Number(record.presentDays || 0),
      absentDays: Number(record.absentDays || 0),
      approvedLeaveDays: Number(record.approvedLeaveDays || 0),
      openingLeave: payroll.openingLeave,
      leaveCredit: creditApplied,
      leavesTaken: Number(record.leavesTaken || 0),
      paidLeaveUsed: payroll.paidLeaveUsed,
      unpaidLeave: payroll.unpaidLeave,
      shortLeaves: payroll.shortLeaves,
      excessShortLeaves: payroll.excessShortLeaves,
      rawAttendanceDeduction: run.rawAttendanceDeduction,
      attendanceDeduction: run.attendanceDeduction,
      leaveDeductionSkipped: run.adjustment.deductLeave === false,
      rawAdvanceDeduction: run.rawAdvanceDeduction,
      advanceDeduction: run.advanceDeduction,
      advanceDeductionSkipped: run.adjustment.deductAdvance === false,
      performanceIncentive: run.performanceIncentive,
      professionalTax: run.professionalTax,
      tds: run.tds,
      otherStatutory: run.otherStatutory,
      payable: run.finalPayable,
      closingLeave: payroll.closingLeave
    };
  });

  const totals = snapshots.reduce(
    (sum, item) => ({
      gross: sum.gross + item.grossPay,
      incentives: sum.incentives + Number(item.performanceIncentive || 0),
      deductions: sum.deductions + item.attendanceDeduction + item.advanceDeduction + item.professionalTax + item.tds + item.otherStatutory,
      payable: sum.payable + item.payable
    }),
    { gross: 0, incentives: 0, deductions: 0, payable: 0 }
  );

  payrollHistory = payrollHistory.filter((entry) => entry.month !== monthKey);
  payrollHistory.unshift({
    month: monthKey,
    workingDays: days,
    savedAt: new Date().toISOString(),
    employees: snapshots,
    totals
  });
  syncEmployeeLeaveBalancesFromHistory();

  saveEmployees();
  saveAttendanceRecords();
  savePayrollRunAdjustments();
  recordAdvanceDeductions(monthKey);
  saveAdvances();
  savePayrollHistory();
  render();
  showPage("historyPage");
}

function syncEmployeeLeaveBalancesFromHistory() {
  employees = employees.map((employee) => {
    const latestEntry = payrollHistory
      .filter((history) => history.employees.some((item) => item.id === employee.id))
      .sort((a, b) => b.month.localeCompare(a.month))[0];
    const latestEmployeeEntry = latestEntry?.employees.find((item) => item.id === employee.id);
    return latestEmployeeEntry ? { ...employee, leaveBalance: Number(latestEmployeeEntry.closingLeave || 0) } : employee;
  });
}

function clearAdvanceDeductionsForMonth(monthKey) {
  advances = advances.map((advance) => ({
    ...advance,
    deductions: (advance.deductions || []).filter((item) => item.month !== monthKey)
  }));
}

function recordAdvanceDeductions(monthKey) {
  advances = advances.map((advance) => {
    const outstanding = getAdvanceOutstanding(advance);
    if (outstanding <= 0 || advance.date.slice(0, 7) > monthKey) return advance;
    const adjustment = getPayrollRunAdjustment(advance.employeeId, monthKey);
    if (adjustment.deductAdvance === false) {
      return {
        ...advance,
        deductions: [
          ...(advance.deductions || []),
          {
            month: monthKey,
            amount: 0,
            skipped: true,
            note: "Skipped in payroll run",
            deductedAt: new Date().toISOString()
          }
        ]
      };
    }
    const amount = Math.min(Number(advance.monthlyDeduction || 0), outstanding);
    if (amount <= 0) return advance;
    return {
      ...advance,
      deductions: [
        ...(advance.deductions || []),
        {
          month: monthKey,
          amount,
          deductedAt: new Date().toISOString()
        }
      ]
    };
  });
}

function renderHistory() {
  historyRows.innerHTML = "";
  historySummary.textContent = `${payrollHistory.length} saved month${payrollHistory.length === 1 ? "" : "s"}`;
  historyEmpty.classList.toggle("hidden", payrollHistory.length > 0);

  payrollHistory.forEach((entry) => {
    const tr = document.createElement("tr");
    tr.className = "clickable-row";
    tr.innerHTML = `
      <td></td>
      <td class="number"></td>
      <td class="number"></td>
      <td class="number"></td>
      <td class="number"></td>
      <td class="number strong"></td>
      <td></td>
      <td class="actions"><button class="row-button view-history" type="button">View</button></td>
    `;

    tr.children[0].textContent = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date(`${entry.month}-01T00:00:00`));
    tr.children[1].textContent = entry.employees.length;
    tr.children[2].textContent = formatMoney(entry.totals.gross);
    tr.children[3].textContent = formatMoney(entry.totals.incentives || 0);
    tr.children[4].textContent = formatMoney(entry.totals.deductions);
    tr.children[5].textContent = formatMoney(entry.totals.payable);
    tr.children[6].textContent = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(entry.savedAt));
    tr.addEventListener("click", () => openPayrollHistoryReport(entry.month));
    tr.querySelector(".view-history").addEventListener("click", (event) => {
      event.stopPropagation();
      openPayrollHistoryReport(entry.month);
    });
    historyRows.appendChild(tr);
  });
  renderReportCards();
}

function showToast(message, isError = false) {
  const target = document.querySelector(".page.active .soft-note") || adminMessage || homeLoginMessage;
  if (target) {
    target.textContent = message;
    target.style.color = isError ? "var(--danger)" : "var(--accent)";
  }
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildReportTable(rows = []) {
  if (!rows.length) return `<p class="muted">No records found for this report.</p>`;
  const headers = Object.keys(rows[0]);
  return `
    <table class="modal-report-table">
      <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
      <tbody>
        ${rows.map((row) => `<tr>${headers.map((header) => `<td>${escapeHtml(row[header])}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  `;
}

function getActiveOrganizationProfile() {
  return organizations[0] || {
    name: "Veraglo Payroll",
    legalName: "Veraglo Payroll",
    logo: "assets/veraglo-logo.png",
    addressLine1: "Registered office",
    addressLine2: "",
    city: "",
    state: "",
    country: "India",
    pinCode: "",
    gstin: "",
    pan: "",
    registration: "",
    payrollContact: currentAppRole ? currentAppRole.toUpperCase() : "System"
  };
}

function buildReportShell(title, rows, summaryHtml = "", options = {}) {
  const organization = getActiveOrganizationProfile();
  const generatedAt = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date());
  const address = [organization.addressLine1, organization.addressLine2, organization.city, organization.state, organization.country, organization.pinCode].filter(Boolean).join(", ");
  const period = options.period || getReportPeriodText();
  const logo = organization.logo ? `<img src="${escapeHtml(organization.logo)}" alt="${escapeHtml(organization.name)} logo">` : `<span>${escapeHtml((organization.name || "V").slice(0, 1))}</span>`;
  return `
    <section class="report-document">
      <header class="report-letterhead">
        <div class="report-logo">${logo}</div>
        <div>
          <h3>${escapeHtml(organization.name || "Veraglo Payroll")}</h3>
          <p>${escapeHtml(address || "Address not recorded")}</p>
          <p>${escapeHtml([organization.gstin && `GST ${organization.gstin}`, organization.pan && `PAN ${organization.pan}`, organization.registration && `Reg. ${organization.registration}`].filter(Boolean).join(" · ") || "GST/PAN/registration details not recorded")}</p>
        </div>
      </header>
      <div class="report-meta">
        <span>Report title: ${escapeHtml(title)}</span>
        <span>Period: ${escapeHtml(period)}</span>
        <span>Generated by: ${escapeHtml(currentAppRole ? currentAppRole.toUpperCase() : "System")}</span>
        <span>Generated: ${escapeHtml(generatedAt)}</span>
        <span>Page 1 of 1</span>
      </div>
      ${summaryHtml}
      ${buildReportTable(rows)}
      <footer class="report-footer">
        <span>Prepared by payroll department</span>
        <span>Authorized signatory</span>
      </footer>
    </section>
  `;
}

function getReportPeriodText() {
  const from = reportFromDate.value || "";
  const to = reportToDate.value || "";
  if (from && to) return `${from} to ${to}`;
  if (from) return `From ${from}`;
  if (to) return `Up to ${to}`;
  return "All available records";
}

function openReportModal(title, rows, summaryHtml = "", options = {}) {
  activeReport = { title, rows, html: buildReportShell(title, rows, summaryHtml, options) };
  reportModalTitle.textContent = title;
  reportModalBody.innerHTML = activeReport.html;
  reportModal.classList.remove("hidden");
  showToast(`${title} opened.`);
}

function closeActiveReport() {
  reportModal.classList.add("hidden");
}

function downloadText(filename, content, type = "text/plain") {
  const blob = new Blob([content], { type });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function exportActiveReportCsv() {
  const rows = activeReport.rows || [];
  if (!rows.length) {
    showToast("No rows available to export.", true);
    return;
  }
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => `"${String(row[header] ?? "").replaceAll('"', '""')}"`).join(","))
  ].join("\n");
  downloadText(`${activeReport.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.csv`, csv, "text/csv");
  showToast("Report exported to Excel-compatible CSV.");
}

function downloadActiveReportHtml() {
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(activeReport.title)}</title></head><body><h1>${escapeHtml(activeReport.title)}</h1>${activeReport.html}</body></html>`;
  downloadText(`${activeReport.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.html`, html, "text/html");
  showToast("Report downloaded.");
}

function printActiveReport() {
  window.print();
  showToast("Print dialog opened. Choose Save as PDF to create PDF.");
}

function getReportDateRange() {
  return {
    from: reportFromDate.value ? new Date(`${reportFromDate.value}T00:00:00`) : null,
    to: reportToDate.value ? new Date(`${reportToDate.value}T23:59:59`) : null
  };
}

function inReportDateRange(value) {
  if (!value) return true;
  const date = new Date(value.includes("T") ? value : `${value}T00:00:00`);
  const { from, to } = getReportDateRange();
  return (!from || date >= from) && (!to || date <= to);
}

function filterReportRows(rows) {
  const query = reportSearch.value.trim().toLowerCase();
  if (!query) return rows;
  return rows.filter((row) => Object.values(row).some((value) => String(value).toLowerCase().includes(query)));
}

function getEmployeeMasterRows() {
  return employees.map((employee) => ({
    Code: employee.employeeCode,
    Name: employee.name,
    Department: employee.department,
    Designation: employee.designation,
    Mobile: employee.mobile,
    Email: employee.email,
    Status: employee.status || "Active",
    "Gross Pay": formatMoney(getGrossPay(employee)),
    "Basic Salary": formatMoney(employee.basicPay || 0),
    HRA: formatMoney(employee.hra || 0),
    Conveyance: formatMoney(employee.conveyanceAllowance || 0),
    "Special Allowance": formatMoney(employee.allowance || 0),
    "Employee PF": formatMoney(getPf(employee)),
    "Employer PF": formatMoney(getEmployerPf(employee)),
    "Employee ESI": formatMoney(getEsiEmployee(employee)),
    "Employer ESI": formatMoney(getEsiEmployer(employee)),
    "Net Pay": formatMoney(getNetPay(employee))
  }));
}

function getPayrollReportRows(monthKey = "") {
  return payrollHistory
    .filter((history) => !monthKey || history.month === monthKey)
    .filter((history) => inReportDateRange(`${history.month}-01`))
    .flatMap((history) => history.employees.map((entry) => {
      const employee = employees.find((item) => item.id === entry.id) || {};
      const salary = entry.salaryStructure || buildSalaryStructure(employee);
      return {
        Employee: `${entry.name} (${entry.employeeCode})`,
        Month: history.month,
        "Working Days": entry.workingDays || history.workingDays || "",
        Present: entry.presentDays || 0,
        "Leave / Absent": Number(entry.leavesTaken || 0),
        "Basic Salary": formatMoney(salary.basicSalary || employee.basicPay || 0),
        HRA: formatMoney(salary.hra || employee.hra || 0),
        Conveyance: formatMoney(salary.conveyanceAllowance || 0),
        "Special Allowance": formatMoney(salary.specialAllowance || employee.allowance || 0),
        "Gross Salary": formatMoney(entry.grossPay || salary.grossSalary || 0),
        "Employee PF": formatMoney(salary.employeePf || getPf(employee)),
        "Employee ESI": formatMoney(salary.employeeEsi || getEsiEmployee(employee)),
        Deductions: formatMoney(Number(entry.attendanceDeduction || 0) + Number(entry.advanceDeduction || 0) + Number(entry.professionalTax || 0) + Number(entry.tds || 0) + Number(entry.otherStatutory || 0)),
        "Net Salary": formatMoney(entry.payable || 0),
        "Payment Status": "Generated",
        "Generated Date": new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(history.savedAt))
      };
    }));
}

function getSalarySlipRows(monthKey = "") {
  return getPayrollReportRows(monthKey).map((row) => ({
    ...row,
    "Salary Slip": "View / Save as PDF / Print / Download"
  }));
}

function getAttendanceReportRows() {
  return Object.entries(attendanceRecords).flatMap(([month, records]) =>
    Object.entries(records).map(([employeeId, record]) => {
      const employee = employees.find((entry) => entry.id === employeeId) || {};
      const normalized = getAttendanceRecord(employeeId, month);
      return {
        Employee: employee.name || "Former employee",
        Month: month,
        "Working Days": record.workingDays || "",
        Present: normalized.presentDays || 0,
        Absent: normalized.absentDays || 0,
        "Approved Leave": normalized.approvedLeaveDays || 0,
        "Short Leave": normalized.shortLeaves || 0
      };
    })
  ).filter((row) => inReportDateRange(`${row.Month}-01`));
}

function getLeaveReportRows(status = "") {
  return leaveRequests
    .filter((request) => !status || request.status === status)
    .filter((request) => inReportDateRange(getRequestFromDate(request)))
    .map((request) => {
      const employee = employees.find((entry) => entry.id === request.employeeId) || {};
      return {
        Employee: employee.name || "Former employee",
        Type: request.type === "short" ? "Short leave" : "Leave",
        Dates: `${getRequestFromDate(request)} to ${getRequestToDate(request)}`,
        Days: request.type === "short" ? "2 hours" : request.days,
        Reason: request.reason,
        Status: getLeaveStatusLabel(request),
        Approvals: getApprovalSummary(request)
      };
    });
}

function getPfEsiRows(kind = "both") {
  return employees.map((employee) => ({
    Code: employee.employeeCode,
    Employee: employee.name,
    Department: employee.department,
    "Basic + DA": formatMoney(employee.basicPay),
    Gross: formatMoney(getGrossPay(employee)),
    "Employee PF": kind === "esi" ? "" : formatMoney(getPf(employee)),
    "Employer PF": kind === "esi" ? "" : formatMoney(getEmployerPf(employee)),
    ESI: kind === "pf" ? "" : formatMoney(getEsiEmployee(employee)),
    "Employer ESI": kind === "pf" ? "" : formatMoney(getEsiEmployer(employee))
  }));
}

function getDepartmentReportRows() {
  const departments = [...new Set(employees.map((employee) => employee.department))];
  return departments.map((department) => {
    const departmentEmployees = employees.filter((employee) => employee.department === department);
    return {
      Department: department,
      Employees: departmentEmployees.length,
      Gross: formatMoney(departmentEmployees.reduce((sum, employee) => sum + getGrossPay(employee), 0)),
      Net: formatMoney(departmentEmployees.reduce((sum, employee) => sum + getNetPay(employee), 0)),
      PF: formatMoney(departmentEmployees.reduce((sum, employee) => sum + getPf(employee), 0)),
      ESI: formatMoney(departmentEmployees.reduce((sum, employee) => sum + getEsiEmployee(employee), 0))
    };
  });
}

function openPayrollHistoryReport(monthKey) {
  const history = payrollHistory.find((entry) => entry.month === monthKey);
  if (!history) return;
  const rows = getPayrollReportRows(monthKey);
  const summary = `
    <div class="report-summary-grid">
      <span>Salary month: ${history.month}</span>
      <span>Employees: ${history.employees.length}</span>
      <span>Gross: ${formatMoney(history.totals.gross)}</span>
      <span>Deductions: ${formatMoney(history.totals.deductions)}</span>
      <span>Net salary: ${formatMoney(history.totals.payable)}</span>
      <span>Generated date: ${new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(history.savedAt))}</span>
    </div>
  `;
  openReportModal(`Payroll Report - ${history.month}`, rows, summary);
}

function getReportRows(type) {
  const map = {
    employee: getEmployeeMasterRows,
    payroll: getPayrollReportRows,
    salarySlip: getSalarySlipRows,
    attendance: getAttendanceReportRows,
    leave: () => getLeaveReportRows(),
    approval: () => getLeaveReportRows(),
    pf: () => getPfEsiRows("pf"),
    esi: () => getPfEsiRows("esi"),
    department: getDepartmentReportRows,
    custom: () => [...getEmployeeMasterRows(), ...getDepartmentReportRows()],
    all: getPayrollReportRows
  };
  return filterReportRows((map[type] || map.all)());
}

function renderReportCards() {
  const cards = [
    ["employee", "Employee Master Report"],
    ["payroll", "Monthly Payroll Report"],
    ["salarySlip", "Salary Slip Report"],
    ["attendance", "Attendance Report"],
    ["leave", "Leave Report"],
    ["approval", "Approved / Rejected Leave Report"],
    ["pf", "PF Report"],
    ["esi", "ESI Report"],
    ["department", "Department-wise Report"],
    ["custom", "Custom Report"]
  ];
  const selected = reportTypeFilter.value;
  reportCards.innerHTML = "";
  cards
    .filter(([type]) => selected === "all" || selected === type)
    .forEach(([type, title]) => {
      const article = document.createElement("article");
      article.className = "report-card";
      article.innerHTML = `<strong>${title}</strong><span></span><div class="action-group"><button class="row-button view-report" type="button">Preview</button><button class="row-button download-report" type="button">Download</button><button class="row-button print-report" type="button">Print</button></div>`;
      const rows = getReportRows(type);
      article.querySelector("span").textContent = `${rows.length} indexed record${rows.length === 1 ? "" : "s"}`;
      article.querySelector(".view-report").addEventListener("click", () => openReportModal(title, rows));
      article.querySelector(".download-report").addEventListener("click", () => {
        openReportModal(title, rows);
        exportActiveReportCsv();
      });
      article.querySelector(".print-report").addEventListener("click", () => {
        openReportModal(title, rows);
        printActiveReport();
      });
      reportCards.appendChild(article);
    });
}

function render() {
  renderHome();
  renderHolidays();
  renderStats();
  renderRows();
  renderEmployeeProfileOptions();
  renderEmployeeProfile();
  renderAdvanceEmployeeOptions();
  renderAdvances();
  renderPortal();
  renderApprovals();
  renderAttendance();
  renderLeaveRegister();
  renderPayrollRun();
  renderHistory();
  renderAdmin();
  updateEmployeeCodePreview();
  applyVisibilitySettings();
}

function renderHome() {
  const today = new Date();
  const dayKey = Math.floor(today.setHours(0, 0, 0, 0) / 86400000);
  dailyMessage.textContent = dailyMessages[dayKey % dailyMessages.length];
}

function setAppLoginState(isLoggedIn) {
  isAppLoggedIn = isLoggedIn;
  appShell.classList.toggle("logged-in", isLoggedIn);
  appShell.classList.toggle("logged-out", !isLoggedIn);
  if (!isLoggedIn) {
    currentAppRole = "";
    portalEmployeeId = "";
    showLoginPanel();
    homeLoginPassword.value = "";
    showPage("homePage");
  }
}

function findEmployeeForLogin(loginId) {
  const normalizedLogin = loginId.trim().toLowerCase();
  const mobileLogin = loginId.replace(/\D/g, "").slice(-10);
  return employees.find((employee) => {
    const employeeMobile = String(employee.mobile || "").replace(/\D/g, "").slice(-10);
    const employeeEmail = String(employee.email || "").toLowerCase();
    const employeeCode = String(employee.employeeCode || "").toLowerCase();
    return normalizedLogin === employeeEmail || normalizedLogin === employeeCode || (mobileLogin && mobileLogin === employeeMobile);
  });
}

function handleHomeLogin(event) {
  event.preventDefault();
  const user = homeLoginUser.value.trim();
  const password = homeLoginPassword.value.trim();
  if (!user || !password) {
    homeLoginMessage.textContent = "Enter your login ID and password.";
    return;
  }

  const role = homeLoginRole.value;
  const employee = role === "employee" ? findEmployeeForLogin(user) : null;
  if (role === "employee" && (!employee || getEmployeeStatusForMonth(employee, getCurrentMonthKey()) !== "Active")) {
    homeLoginMessage.textContent = "No active employee record found for this login.";
    return;
  }

  currentAppRole = role;
  homeLoginMessage.textContent = "Welcome. Opening your dashboard.";
  homeLoginPassword.value = "";
  setAppLoginState(true);
  if (role === "employee") {
    portalEmployeeId = employee.id;
    portalMobile.value = employee.mobile || user.replace(/\D/g, "").slice(0, 10);
    activePortalPanel = "portalOverviewPanel";
  }
  render();
  applyVisibilitySettings();
  showPage(role === "employee" ? "employeePortalPage" : "homePage");
}

function handleAppLogout() {
  setAppLoginState(false);
  applyVisibilitySettings();
  homeLoginMessage.textContent = "You have been logged out.";
}

function showForgotPasswordPanel() {
  homeLoginForm.classList.add("hidden");
  forgotPasswordForm.classList.remove("hidden");
  forgotPasswordContact.value = homeLoginUser.value.trim();
  forgotPasswordMessage.textContent = "";
  forgotPasswordContact.focus();
}

function showLoginPanel() {
  forgotPasswordForm.classList.add("hidden");
  homeLoginForm.classList.remove("hidden");
  homeLoginMessage.textContent = "";
  homeLoginUser.focus();
}

function handleForgotPassword(event) {
  event.preventDefault();
  const contact = forgotPasswordContact.value.trim();
  if (!contact) {
    forgotPasswordMessage.textContent = "Enter registered mobile number or email.";
    return;
  }
  forgotPasswordMessage.textContent = `Password reset instructions are ready for ${contact}.`;
}

function renderAdmin() {
  renderOrganizationList();
  renderOrganizationProfilePreview();
  renderAdminRoleOptions();
  renderAdminUserList();
  renderAdminRoleList();
  renderAdminEmployeeChangeRequests();
  fillAdminSettings();
  showAdminSection(activeAdminSection);
}

function showAdminSection(section) {
  activeAdminSection = section;
  adminSectionTabs.forEach((button) => button.classList.toggle("active", button.dataset.adminSection === section));
  adminPanels.forEach((panel) => panel.classList.toggle("hidden", panel.dataset.adminPanel !== section));
}

function renderOrganizationList() {
  organizationList.innerHTML = "";
  if (!organizations.length) {
    organizationList.innerHTML = `<p class="muted">No organization profiles saved yet.</p>`;
    return;
  }

  organizations.forEach((organization) => {
    const item = document.createElement("article");
    item.className = "admin-list-item";
    item.innerHTML = `
      <div class="admin-org-mini-logo"></div>
      <div>
        <strong></strong>
        <p></p>
      </div>
      <span class="badge"></span>
    `;
    const logo = item.querySelector(".admin-org-mini-logo");
    if (organization.logo) logo.style.backgroundImage = `url("${organization.logo}")`;
    logo.textContent = organization.logo ? "" : "Org";
    item.querySelector("strong").textContent = organization.name;
    item.querySelector("p").textContent = `${organization.city}, ${organization.state} · ${organization.email}`;
    item.querySelector(".badge").textContent = organization.code;
    organizationList.appendChild(item);
  });
}

function renderOrganizationProfilePreview() {
  const organization = organizations[0];
  const hasProfile = Boolean(organization);
  orgProfilePreview.classList.toggle("hidden", !hasProfile || Boolean(editingOrganizationId));
  orgProfileFields.classList.toggle("hidden", hasProfile && !editingOrganizationId);
  generateOrgCode.classList.toggle("hidden", hasProfile && !editingOrganizationId);

  if (!organization || editingOrganizationId) return;

  orgProfilePreview.innerHTML = `
    <div class="org-profile-head">
      <div class="admin-org-mini-logo"></div>
      <div>
        <strong></strong>
        <p></p>
      </div>
      <button class="secondary-button" id="editOrganizationProfile" type="button">Edit</button>
    </div>
    <div class="org-profile-grid">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;
  const logo = orgProfilePreview.querySelector(".admin-org-mini-logo");
  logo.textContent = organization.logo ? "" : "Org";
  if (organization.logo) logo.style.backgroundImage = `url("${organization.logo}")`;
  orgProfilePreview.querySelector("strong").textContent = organization.name;
  orgProfilePreview.querySelector("p").textContent = `${organization.legalName} · ${organization.code}`;
  const details = orgProfilePreview.querySelectorAll(".org-profile-grid span");
  details[0].textContent = `Type: ${organization.type || "Not recorded"}`;
  details[1].textContent = `Industry: ${organization.industry || "Not recorded"}`;
  details[2].textContent = `Email: ${organization.email || "Not recorded"}`;
  details[3].textContent = `Phone: ${organization.phone || "Not recorded"}`;
  details[4].textContent = `Address: ${[organization.addressLine1, organization.city, organization.state, organization.pinCode].filter(Boolean).join(", ") || "Not recorded"}`;
  details[5].textContent = `PF/ESI: ${organization.pfCode || "PF not recorded"} · ${organization.esiCode || "ESI not recorded"}`;
  orgProfilePreview.querySelector("#editOrganizationProfile").addEventListener("click", () => startOrganizationEdit(organization.id));
}

function renderAdminRoleOptions() {
  adminUserRole.innerHTML = "";
  adminRoles.forEach((role) => {
    const option = document.createElement("option");
    option.value = role.name;
    option.textContent = role.name;
    adminUserRole.appendChild(option);
  });
}

function renderAdminUserList() {
  adminUserList.innerHTML = "";
  if (!adminUsers.length) {
    adminUserList.innerHTML = `<p class="muted">No admin users saved yet.</p>`;
    return;
  }

  adminUsers.forEach((user) => {
    const item = document.createElement("article");
    item.className = "admin-list-item";
    item.innerHTML = `
      <div>
        <strong></strong>
        <p></p>
      </div>
      <span class="badge"></span>
      <div class="action-group">
        <button class="row-button edit-user" type="button">Edit</button>
        <button class="row-button toggle-user" type="button"></button>
        <button class="row-button delete delete-user" type="button">Del</button>
      </div>
    `;
    item.querySelector("strong").textContent = user.name;
    item.querySelector("p").textContent = `${user.mobile} · ${user.email} · ${user.department || "No department"}`;
    item.querySelector(".badge").textContent = `${user.role} · ${user.status}`;
    item.querySelector(".toggle-user").textContent = user.status === "Active" ? "Disable" : "Activate";
    item.querySelector(".edit-user").addEventListener("click", () => startAdminUserEdit(user.id));
    item.querySelector(".toggle-user").addEventListener("click", () => toggleAdminUserStatus(user.id));
    item.querySelector(".delete-user").addEventListener("click", () => deleteAdminUser(user.id));
    adminUserList.appendChild(item);
  });
}

function renderAdminRoleList() {
  adminRoleList.innerHTML = "";
  adminRoles.forEach((role) => {
    const item = document.createElement("article");
    item.className = "admin-list-item";
    item.innerHTML = `
      <div>
        <strong></strong>
        <p></p>
      </div>
      <span class="badge"></span>
    `;
    item.querySelector("strong").textContent = role.name;
    item.querySelector("p").textContent = role.permissions.join(", ");
    item.querySelector(".badge").textContent = role.level;
    adminRoleList.appendChild(item);
  });
}

function startAdminUserEdit(id) {
  const user = adminUsers.find((entry) => entry.id === id);
  if (!user) return;
  editingAdminUserId = id;
  adminUserForm.adminUserName.value = user.name || "";
  adminUserForm.adminUserMobile.value = user.mobile || "";
  adminUserForm.adminUserEmail.value = user.email || "";
  adminUserForm.adminUserRole.value = user.role || "Employee";
  adminUserForm.adminUserDepartment.value = user.department || "";
  adminUserForm.adminUserStatus.value = user.status || "Active";
  adminUserForm.querySelector(".primary-button").textContent = "Update user";
}

function toggleAdminUserStatus(id) {
  adminUsers = adminUsers.map((user) => (
    user.id === id ? { ...user, status: user.status === "Active" ? "Inactive" : "Active" } : user
  ));
  saveAdminUsers();
  renderAdminUserList();
}

function deleteAdminUser(id) {
  adminUsers = adminUsers.filter((user) => user.id !== id);
  if (editingAdminUserId === id) {
    editingAdminUserId = "";
    adminUserForm.reset();
  }
  saveAdminUsers();
  renderAdmin();
}

function renderAdminEmployeeChangeRequests() {
  adminEmployeeChangeRows.innerHTML = "";
  adminEmployeeChangeEmpty.classList.toggle("hidden", employeeChangeRequests.length > 0);

  employeeChangeRequests.forEach((request) => {
    const employee = employees.find((entry) => entry.id === request.employeeId);
    const isPending = request.status === "Pending Admin";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td><span class="badge"></span></td>
      <td class="actions">
        <div class="action-group">
          <button class="row-button approve-change" type="button">Approve</button>
          <button class="row-button reject-change delete" type="button">Reject</button>
        </div>
      </td>
    `;
    tr.children[0].textContent = employee ? `${employee.name} (${employee.employeeCode})` : `${request.employeeName} (${request.employeeCode})`;
    tr.children[1].textContent = `${request.requestedBy} · ${request.requestedRole}`;
    tr.children[2].textContent = new Date(request.requestedAt).toLocaleDateString("en-IN");
    tr.children[3].textContent = request.changedFields.join(", ");
    tr.querySelector(".badge").textContent = request.status;
    tr.querySelector(".badge").classList.toggle("ok", request.status === "Approved");
    tr.querySelector(".approve-change").disabled = !isPending || !isAdminSession();
    tr.querySelector(".reject-change").disabled = !isPending || !isAdminSession();
    tr.querySelector(".approve-change").addEventListener("click", () => approveEmployeeChange(request.id));
    tr.querySelector(".reject-change").addEventListener("click", () => rejectEmployeeChange(request.id));
    adminEmployeeChangeRows.appendChild(tr);
  });
}

function approveEmployeeChange(requestId) {
  if (!isAdminSession()) {
    adminMessage.textContent = "Only Admin can authorize employee record changes.";
    return;
  }

  const request = employeeChangeRequests.find((entry) => entry.id === requestId);
  if (!request || request.status !== "Pending Admin") return;

  employees = employees.map((employee) => {
    if (employee.id !== request.employeeId) return employee;
    return {
      ...employee,
      ...request.proposedEmployee,
      changeAuthorizedBy: getLoginDisplayName(),
      changeAuthorizedAt: new Date().toISOString()
    };
  });
  employeeChangeRequests = employeeChangeRequests.map((entry) => (
    entry.id === requestId
      ? { ...entry, status: "Approved", decidedBy: getLoginDisplayName(), decidedAt: new Date().toISOString() }
      : entry
  ));
  saveEmployees();
  saveEmployeeChangeRequests();
  adminMessage.textContent = `Approved employee changes for ${request.employeeName}.`;
  render();
}

function rejectEmployeeChange(requestId) {
  if (!isAdminSession()) {
    adminMessage.textContent = "Only Admin can reject employee record changes.";
    return;
  }

  const request = employeeChangeRequests.find((entry) => entry.id === requestId);
  if (!request || request.status !== "Pending Admin") return;

  employeeChangeRequests = employeeChangeRequests.map((entry) => (
    entry.id === requestId
      ? { ...entry, status: "Rejected", decidedBy: getLoginDisplayName(), decidedAt: new Date().toISOString() }
      : entry
  ));
  saveEmployeeChangeRequests();
  adminMessage.textContent = `Rejected employee changes for ${request.employeeName}.`;
  renderAdmin();
}

function fillAdminSettings() {
  const appearance = adminSettings.appearance || defaultAdminSettings.appearance;
  adminSettingsForm.settingFyStart.value = adminSettings.fyStart;
  adminSettingsForm.settingCurrency.value = adminSettings.currency;
  adminSettingsForm.settingTimezone.value = adminSettings.timezone;
  adminSettingsForm.settingWeeklyOff.value = adminSettings.weeklyOff;
  adminSettingsForm.settingWorkingDays.value = adminSettings.workingDays;
  adminSettingsForm.settingLeaveCredit.value = adminSettings.leaveCredit;
  adminSettingsForm.settingPayslipPrefix.value = adminSettings.payslipPrefix;
  adminSettingsForm.settingSalaryRounding.value = adminSettings.salaryRounding;
  adminSettingsForm.settingTheme.value = appearance.theme;
  adminSettingsForm.settingFont.value = appearance.font;
  adminSettingsForm.settingTransparency.checked = appearance.transparency === true;
  adminSettingsForm.settingClearBackground.checked = false;
  renderBackgroundPreview(appearance.backgroundImage);
  adminSettingsForm.querySelectorAll('input[name="visibleTabs"]').forEach((input) => {
    input.checked = adminSettings.visibleTabs[input.value] !== false;
  });
  adminSettingsForm.querySelectorAll('input[name="visibleActions"]').forEach((input) => {
    input.checked = adminSettings.visibleActions[input.value] !== false;
  });
  adminSettingsForm.querySelectorAll('input[name="roleAccessModules"]').forEach((input) => {
    input.checked = adminSettings.roleAccess[input.dataset.role]?.modules[input.value] === true;
  });
  adminSettingsForm.querySelectorAll('input[name="roleAccessActions"]').forEach((input) => {
    input.checked = adminSettings.roleAccess[input.dataset.role]?.actions[input.value] === true;
  });
  adminSettingsForm.querySelectorAll('input[name="payrollRunColumns"]').forEach((input) => {
    input.checked = adminSettings.payrollRunColumns[input.value] === true;
  });
}

function renderBackgroundPreview(image = "") {
  backgroundImagePreview.style.backgroundImage = image ? `url("${image}")` : "";
  backgroundImagePreview.textContent = image ? "" : "No background image";
}

function applyAppCustomization() {
  const appearance = adminSettings.appearance || defaultAdminSettings.appearance;
  document.body.dataset.theme = appearance.theme || "emerald";
  document.body.dataset.font = appearance.font || "inter";
  document.body.classList.toggle("transparent-mode", appearance.transparency === true);
  document.body.classList.toggle("has-custom-bg", Boolean(appearance.backgroundImage));
  document.documentElement.style.setProperty("--app-bg-image", appearance.backgroundImage ? `url("${appearance.backgroundImage}")` : "none");
}

function hasRoleModule(pageId) {
  if (!isAppLoggedIn) return pageId === "homePage";
  if (currentAppRole === "admin") return true;
  if (pageId === "homePage") return true;
  if (pageId === "adminPage") return false;
  return adminSettings.roleAccess[currentAppRole]?.modules[pageId] === true;
}

function hasRoleAction(action) {
  if (!isAppLoggedIn) return false;
  if (currentAppRole === "admin") return true;
  return adminSettings.roleAccess[currentAppRole]?.actions[action] === true;
}

function isPageGloballyVisible(pageId) {
  if (currentAppRole === "admin" || pageId === "homePage") return true;
  const tabAllowed = !(pageId in adminSettings.visibleTabs) || adminSettings.visibleTabs[pageId] !== false;
  const actionAllowed = !(pageId in adminSettings.visibleActions) || adminSettings.visibleActions[pageId] !== false;
  return tabAllowed && actionAllowed;
}

function canAccessPage(pageId) {
  return hasRoleModule(pageId) && isPageGloballyVisible(pageId);
}

function applyVisibilitySettings() {
  document.querySelectorAll(".header-actions .tab-button").forEach((button) => {
    const pageId = button.dataset.page;
    if (!pageId) return;
    button.classList.toggle("hidden", !canAccessPage(pageId));
  });

  document.querySelectorAll(".stats .stat-action").forEach((button) => {
    button.classList.toggle("hidden", !canAccessPage(button.dataset.page));
  });

  applyPayrollRunColumnSettings();
  applyAppCustomization();

  const activePage = document.querySelector(".page.active");
  const activeId = activePage?.id;
  if (activeId && !canAccessPage(activeId)) {
    showPage("homePage");
  }
}

function addressField(prefix, part) {
  return form.querySelector(`#${prefix}${part}`);
}

function getAddressDetails(prefix) {
  return {
    line1: addressField(prefix, "AddressLine1").value.trim(),
    line2: addressField(prefix, "AddressLine2").value.trim(),
    city: addressField(prefix, "City").value.trim(),
    state: addressField(prefix, "State").value.trim(),
    country: addressField(prefix, "Country").value.trim(),
    pinCode: addressField(prefix, "PinCode").value.trim()
  };
}

function formatAddress(details) {
  return [details.line1, details.line2, details.city, details.state, details.country, details.pinCode]
    .filter(Boolean)
    .join(", ");
}

function syncAddressHiddenFields() {
  presentAddress.value = formatAddress(getAddressDetails("present"));
  permanentAddress.value = formatAddress(getAddressDetails("permanent"));
}

function parseAddress(value = "") {
  const parts = value.split(",").map((part) => part.trim()).filter(Boolean);
  const last = parts.at(-1) || "";
  const pinMatch = last.match(/\b(\d{6})\b/);
  const pinCode = pinMatch ? pinMatch[1] : "";
  const stateFromLast = pinCode ? last.replace(pinCode, "").trim() : last;
  const hasCountry = parts.at(-2) === "India";
  const cityIndex = hasCountry ? parts.length - 4 : parts.length - 3;
  const stateIndex = hasCountry ? parts.length - 3 : parts.length - 2;
  const line2End = Math.max(1, cityIndex);
  return {
    line1: parts[0] || "",
    line2: parts.length > 4 ? parts.slice(1, line2End).join(", ") : "",
    city: cityIndex > 0 ? parts[cityIndex] : parts[1] || "",
    state: pinMatch && !hasCountry ? stateFromLast : (stateIndex > 0 ? parts[stateIndex] : stateFromLast),
    country: hasCountry ? "India" : "India",
    pinCode
  };
}

function fillAddressFields(prefix, details) {
  addressField(prefix, "AddressLine1").value = details.line1 || "";
  addressField(prefix, "AddressLine2").value = details.line2 || "";
  addressField(prefix, "City").value = details.city || "";
  addressField(prefix, "State").value = details.state || "";
  addressField(prefix, "Country").value = details.country || "India";
  addressField(prefix, "PinCode").value = details.pinCode || "";
  syncAddressHiddenFields();
}

function setPermanentAddressLocked(isLocked) {
  addressParts.forEach((part) => {
    addressField("permanent", part).readOnly = isLocked;
  });
}

async function readForm() {
  syncAddressHiddenFields();
  const data = new FormData(form);
  const presentAddressDetails = getAddressDetails("present");
  const permanentAddressDetails = getAddressDetails("permanent");
  const openingLeave = Number(data.get("leaveOpeningBalance") || 0);
  const employee = {
    employeeCode: employees.find((employee) => employee.id === editingId)?.employeeCode || generateEmployeeCode(data.get("joiningDate")),
    name: data.get("name").trim(),
    dob: data.get("dob"),
    joiningDate: data.get("joiningDate"),
    gender: data.get("gender"),
    maritalStatus: data.get("maritalStatus"),
    fatherOrSpouseName: data.get("fatherOrSpouseName").trim(),
    bloodGroup: data.get("bloodGroup"),
    mobile: data.get("mobile").trim(),
    additionalContact: data.get("additionalContact").trim(),
    additionalRelation: data.get("additionalRelation"),
    email: data.get("email").trim(),
    photo: await readPhoto(),
    aadhaar: data.get("aadhaar").trim(),
    pan: data.get("pan").trim().toUpperCase(),
    uan: data.get("uan").trim(),
    esicIpNumber: data.get("esicIpNumber").trim(),
    nomineeName: data.get("nomineeName").trim(),
    nomineeRelation: data.get("nomineeRelation"),
    presentAddress: formatAddress(presentAddressDetails),
    permanentAddress: formatAddress(permanentAddressDetails),
    presentAddressDetails,
    permanentAddressDetails,
    department: data.get("department"),
    designation: data.get("designation").trim(),
    basicPay: Number(data.get("basicPay")),
    hra: Number(data.get("hra")),
    conveyanceAllowance: Number(data.get("conveyanceAllowance")),
    allowance: Number(data.get("allowance")),
    bonus: Number(data.get("bonus")),
    otherDeductions: Number(data.get("otherDeductions")),
    leaveOpeningBalance: openingLeave,
    leaveBalance: openingLeave,
    pfApplicable: data.get("pfApplicable"),
    esiApplicable: data.get("esiApplicable"),
    ptApplicable: data.get("ptApplicable") === "on",
    tdsApplicable: data.get("tdsApplicable") === "on",
    lwfApplicable: data.get("lwfApplicable") === "on",
    gratuityApplicable: data.get("gratuityApplicable") === "on",
    bonusActApplicable: data.get("bonusActApplicable") === "on",
    paymentMode: data.get("paymentMode"),
    bankName: data.get("bankName").trim(),
    bankAccount: data.get("bankAccount").trim(),
    ifsc: data.get("ifsc").trim().toUpperCase()
  };
  employee.salaryStructure = buildSalaryStructure(employee);
  return employee;
}

function readPhoto() {
  const file = photoInput.files[0];
  if (!file) return Promise.resolve(editingPhoto);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });
}

function readImageFile(file) {
  if (!file) return Promise.resolve("");
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });
}

function generateOrganizationCode() {
  const namePart = (orgName.value || "ORG")
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, "X");
  const year = new Date().getFullYear().toString().slice(-2);
  let serial = organizations.length + 1;
  let code = "";

  do {
    code = `${namePart}${year}${String(serial).padStart(3, "0")}`;
    serial += 1;
  } while (organizations.some((organization) => organization.code === code));

  orgCode.value = code;
  adminMessage.textContent = `Generated unique organization code ${code}.`;
}

async function previewOrganizationLogo() {
  const logo = await readImageFile(orgLogo.files[0]);
  pendingOrgLogo = logo;
  if (logo) {
    orgLogoPreview.style.backgroundImage = `url("${logo}")`;
    orgLogoPreview.textContent = "";
  }
}

function clearOrganizationForm() {
  organizationForm.reset();
  editingOrganizationId = "";
  pendingOrgLogo = "";
  orgLogoPreview.style.backgroundImage = "";
  orgLogoPreview.textContent = "Logo";
}

function startOrganizationEdit(id) {
  const organization = organizations.find((entry) => entry.id === id);
  if (!organization) return;

  editingOrganizationId = id;
  orgCode.value = organization.code || "";
  orgName.value = organization.name || "";
  organizationForm.orgLegalName.value = organization.legalName || "";
  organizationForm.orgType.value = organization.type || "Private Limited";
  organizationForm.orgIndustry.value = organization.industry || "";
  organizationForm.orgRegistration.value = organization.registration || "";
  organizationForm.orgGstin.value = organization.gstin || "";
  organizationForm.orgPan.value = organization.pan || "";
  organizationForm.orgTan.value = organization.tan || "";
  organizationForm.orgPfCode.value = organization.pfCode || "";
  organizationForm.orgEsiCode.value = organization.esiCode || "";
  organizationForm.orgPtCode.value = organization.ptCode || "";
  organizationForm.orgWebsite.value = organization.website || "";
  organizationForm.orgAddressLine1.value = organization.addressLine1 || "";
  organizationForm.orgAddressLine2.value = organization.addressLine2 || "";
  organizationForm.orgCity.value = organization.city || "";
  organizationForm.orgState.value = organization.state || "";
  organizationForm.orgCountry.value = organization.country || "India";
  organizationForm.orgPinCode.value = organization.pinCode || "";
  organizationForm.orgPhone.value = organization.phone || "";
  organizationForm.orgEmail.value = organization.email || "";
  organizationForm.orgHrEmail.value = organization.hrEmail || "";
  organizationForm.orgPayrollContact.value = organization.payrollContact || "";
  orgLogoPreview.style.backgroundImage = organization.logo ? `url("${organization.logo}")` : "";
  orgLogoPreview.textContent = organization.logo ? "" : "Logo";
  renderOrganizationProfilePreview();
  orgName.focus();
}

async function saveOrganizationProfile(event) {
  event.preventDefault();
  if (!orgCode.value) generateOrganizationCode();
  const data = new FormData(organizationForm);
  const code = data.get("orgCode").trim().toUpperCase();

  if (organizations.some((organization) => organization.code === code && organization.id !== editingOrganizationId)) {
    adminMessage.textContent = `Organization code ${code} already exists. Generate a new code before saving.`;
    orgCode.focus();
    return;
  }

  const logo = pendingOrgLogo || (await readImageFile(orgLogo.files[0]));
  const existing = organizations.find((organization) => organization.id === editingOrganizationId);
  const nextOrganization = {
    id: editingOrganizationId || crypto.randomUUID(),
    code,
    logo: logo || existing?.logo || "",
    name: data.get("orgName").trim(),
    legalName: data.get("orgLegalName").trim(),
    type: data.get("orgType"),
    industry: data.get("orgIndustry").trim(),
    registration: data.get("orgRegistration").trim(),
    gstin: data.get("orgGstin").trim().toUpperCase(),
    pan: data.get("orgPan").trim().toUpperCase(),
    tan: data.get("orgTan").trim().toUpperCase(),
    pfCode: data.get("orgPfCode").trim(),
    esiCode: data.get("orgEsiCode").trim(),
    ptCode: data.get("orgPtCode").trim(),
    website: data.get("orgWebsite").trim(),
    addressLine1: data.get("orgAddressLine1").trim(),
    addressLine2: data.get("orgAddressLine2").trim(),
    city: data.get("orgCity").trim(),
    state: data.get("orgState").trim(),
    country: data.get("orgCountry").trim(),
    pinCode: data.get("orgPinCode").trim(),
    phone: data.get("orgPhone").trim(),
    email: data.get("orgEmail").trim(),
    hrEmail: data.get("orgHrEmail").trim(),
    payrollContact: data.get("orgPayrollContact").trim(),
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  organizations = editingOrganizationId
    ? organizations.map((organization) => (organization.id === editingOrganizationId ? nextOrganization : organization))
    : [nextOrganization, ...organizations];
  saveOrganizations();
  clearOrganizationForm();
  adminMessage.textContent = `Organization profile saved with unique code ${code}.`;
  renderAdmin();
}

async function previewBackgroundImage() {
  const image = await readImageFile(settingBackgroundImage.files[0]);
  pendingBackgroundImage = image;
  renderBackgroundPreview(image || adminSettings.appearance?.backgroundImage || "");
}

function readRoleAccessSettings() {
  const roleAccess = mergeRoleAccess();
  ["hr", "employee"].forEach((role) => {
    roleAccess[role] = {
      modules: roleAccessModules.reduce((settings, moduleId) => {
        settings[moduleId] = false;
        return settings;
      }, {}),
      actions: roleAccessActions.reduce((settings, actionId) => {
        settings[actionId] = false;
        return settings;
      }, {})
    };
  });

  adminSettingsForm.querySelectorAll('input[name="roleAccessModules"]').forEach((input) => {
    roleAccess[input.dataset.role].modules[input.value] = input.checked;
  });
  adminSettingsForm.querySelectorAll('input[name="roleAccessActions"]').forEach((input) => {
    roleAccess[input.dataset.role].actions[input.value] = input.checked;
  });
  return roleAccess;
}

async function saveAdminSettingsForm(event) {
  event.preventDefault();
  const data = new FormData(adminSettingsForm);
  const visibleTabs = Object.keys(defaultAdminSettings.visibleTabs).reduce((settings, pageId) => {
    settings[pageId] = data.getAll("visibleTabs").includes(pageId);
    return settings;
  }, {});
  const visibleActions = Object.keys(defaultAdminSettings.visibleActions).reduce((settings, pageId) => {
    settings[pageId] = data.getAll("visibleActions").includes(pageId);
    return settings;
  }, {});
  const payrollRunColumns = Object.keys(defaultAdminSettings.payrollRunColumns).reduce((settings, columnId) => {
    settings[columnId] = data.getAll("payrollRunColumns").includes(columnId);
    return settings;
  }, {});
  const uploadedBackground = pendingBackgroundImage || (await readImageFile(settingBackgroundImage.files[0]));
  const backgroundImage = data.get("settingClearBackground") === "on" ? "" : uploadedBackground || adminSettings.appearance?.backgroundImage || "";
  const appearance = {
    theme: data.get("settingTheme"),
    font: data.get("settingFont"),
    backgroundImage,
    transparency: data.get("settingTransparency") === "on"
  };
  adminSettings = {
    fyStart: data.get("settingFyStart"),
    currency: data.get("settingCurrency"),
    timezone: data.get("settingTimezone"),
    weeklyOff: data.get("settingWeeklyOff"),
    workingDays: Number(data.get("settingWorkingDays")),
    leaveCredit: Number(data.get("settingLeaveCredit")),
    payslipPrefix: data.get("settingPayslipPrefix").trim().toUpperCase(),
    salaryRounding: data.get("settingSalaryRounding"),
    visibleTabs,
    visibleActions,
    payrollRunColumns,
    appearance,
    roleAccess: readRoleAccessSettings()
  };
  pendingBackgroundImage = "";
  settingBackgroundImage.value = "";
  saveAdminSettings();
  adminMessage.textContent = "Payroll defaults and visibility permissions saved.";
  renderAdmin();
  renderPayrollRun();
  applyVisibilitySettings();
}

function saveAdminUser(event) {
  event.preventDefault();
  const data = new FormData(adminUserForm);
  const nextUser = {
    id: editingAdminUserId || crypto.randomUUID(),
    name: data.get("adminUserName").trim(),
    mobile: data.get("adminUserMobile").trim(),
    email: data.get("adminUserEmail").trim(),
    role: data.get("adminUserRole"),
    department: data.get("adminUserDepartment").trim(),
    status: data.get("adminUserStatus"),
    createdAt: adminUsers.find((user) => user.id === editingAdminUserId)?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  adminUsers = editingAdminUserId
    ? adminUsers.map((user) => (user.id === editingAdminUserId ? nextUser : user))
    : [nextUser, ...adminUsers];
  saveAdminUsers();
  editingAdminUserId = "";
  adminUserForm.reset();
  adminUserForm.querySelector(".primary-button").textContent = "Save user";
  adminMessage.textContent = "User profile saved.";
  renderAdmin();
}

function saveAdminRole(event) {
  event.preventDefault();
  const data = new FormData(adminRoleForm);
  const roleName = data.get("adminRoleName").trim();
  adminRoles = normalizeAdminRoles(adminRoles).map((role) => (
    role.name === roleName
      ? {
          ...role,
          level: data.get("adminRoleLevel"),
          permissions: [...adminRolePermissions.selectedOptions].map((option) => option.value)
        }
      : role
  ));
  saveAdminRoles();
  adminRoleForm.reset();
  adminMessage.textContent = `${roleName} role definition saved.`;
  renderAdmin();
}

function resetForm() {
  editingId = null;
  editingPhoto = "";
  form.reset();
  form.joiningDate.value = new Date().toISOString().slice(0, 10);
  form.grossPay.value = 50000;
  form.autoSalaryBreakup.checked = true;
  applySalaryBreakupFromGross();
  form.otherDeductions.value = 0;
  form.leaveOpeningBalance.value = 0;
  form.pfApplicable.value = "Yes";
  form.esiApplicable.value = "No";
  setEmployeeStatutoryFields({
    ptApplicable: true,
    tdsApplicable: true,
    lwfApplicable: true,
    gratuityApplicable: true,
    bonusActApplicable: true
  });
  fillAddressFields("present", { country: "India" });
  fillAddressFields("permanent", { country: "India" });
  sameAddress.checked = false;
  setPermanentAddressLocked(false);
  formTitle.textContent = "Add employee";
  submitButton.textContent = "Add employee";
  cancelEdit.classList.add("hidden");
  updateEmployeeCodePreview();
  showEmployeeSection("employeeDetailsSection");
}

function setEmployeeStatutoryFields(employee) {
  form.ptApplicable.checked = employee.ptApplicable !== false;
  form.tdsApplicable.checked = employee.tdsApplicable !== false;
  form.lwfApplicable.checked = employee.lwfApplicable !== false;
  form.gratuityApplicable.checked = employee.gratuityApplicable !== false;
  form.bonusActApplicable.checked = employee.bonusActApplicable !== false;
  updateStatutoryGuidance();
}

function resetAttendanceDefaults() {
  const month = getCurrentMonthKey();
  attendanceMonth.value = month;
  attendanceMonth.max = month;
  leaveRegisterMonth.value = month;
  leaveRegisterMonth.max = month;
  runMonth.value = month;
  advanceDate.value = new Date().toISOString().slice(0, 10);
  if (!workingDays.value) workingDays.value = 26;
  if (!runWorkingDays.value) runWorkingDays.value = 26;
}

function saveAdvance(event) {
  event.preventDefault();
  const data = new FormData(advanceForm);
  advances.unshift({
    id: crypto.randomUUID(),
    employeeId: data.get("advanceEmployee"),
    amount: Number(data.get("advanceAmount")),
    date: data.get("advanceDate"),
    paymentMethod: data.get("advancePaymentMethod"),
    monthlyDeduction: Number(data.get("advanceMonthlyDeduction")),
    deductions: []
  });
  saveAdvances();
  advanceForm.reset();
  advanceDate.value = new Date().toISOString().slice(0, 10);
  render();
}

function generateOtp() {
  const employee = employees.find((entry) => entry.mobile === portalMobile.value.trim());
  if (!employee) {
    otpMessage.textContent = "No employee found with this registered mobile number.";
    pendingOtp = "";
    return;
  }

  pendingOtp = String(Math.floor(100000 + Math.random() * 900000));
  otpMessage.textContent = `Demo OTP for ${employee.name}: ${pendingOtp}`;
}

function verifyOtp(event) {
  event.preventDefault();
  const employee = employees.find((entry) => entry.mobile === portalMobile.value.trim());
  if (!employee || !pendingOtp || portalOtp.value.trim() !== pendingOtp) {
    otpMessage.textContent = "Invalid mobile number or OTP.";
    return;
  }

  portalEmployeeId = employee.id;
  activePortalPanel = "portalOverviewPanel";
  pendingOtp = "";
  portalOtp.value = "";
  otpMessage.textContent = "Login successful.";
  renderPortal();
}

function logoutPortal() {
  if (currentAppRole === "employee") {
    handleAppLogout();
    return;
  }
  portalEmployeeId = "";
  otpMessage.textContent = "";
  renderPortal();
}

function submitLeaveRequest(event) {
  event.preventDefault();
  if (!portalEmployeeId) return;
  updateLeaveDays();
  const data = new FormData(leaveRequestForm);
  const type = data.get("leaveType");
  const fromDate = data.get("leaveFromDate");
  const toDate = type === "short" ? fromDate : data.get("leaveToDate");
  const days = type === "short" ? 0 : calculateLeaveDays(fromDate, toDate);
  if (!fromDate || !toDate || (!days && type !== "short")) return;
  leaveRequests.unshift({
    id: crypto.randomUUID(),
    employeeId: portalEmployeeId,
    type,
    date: fromDate,
    fromDate,
    toDate,
    days,
    reason: data.get("leaveReason").trim(),
    status: "pendingLevel1",
    firstApprovalBy: "",
    directorApprovalBy: "",
    rejectedBy: "",
    createdAt: new Date().toISOString()
  });
  saveLeaveRequests();
  leaveRequestForm.reset();
  leaveFromDate.value = new Date().toISOString().slice(0, 10);
  leaveToDate.value = leaveFromDate.value;
  updateLeaveDays();
  render();
}

function approveLeaveRequest(requestId, role) {
  if (!hasRoleAction("approve")) return;
  leaveRequests = leaveRequests.map((request) => {
    if (request.id !== requestId) return request;
    if (request.status === "pendingLevel1" && ["Supervisor", "Engineer", "Manager"].includes(role)) {
      return {
        ...request,
        status: "pendingDirector",
        firstApprovalBy: role,
        firstApprovedAt: new Date().toISOString()
      };
    }
    if (request.status === "pendingDirector" && role === "Director") {
      applyApprovedLeaveToAttendance(request);
      return {
        ...request,
        status: "approved",
        directorApprovalBy: role,
        directorApprovedAt: new Date().toISOString()
      };
    }
    return request;
  });
  saveAttendanceRecords();
  saveLeaveRequests();
  render();
}

function rejectLeaveRequest(requestId, role) {
  if (!window.confirm("Reject this leave request?")) return;
  if (!hasRoleAction("approve")) return;
  leaveRequests = leaveRequests.map((request) => {
    if (request.id !== requestId) return request;
    return {
      ...request,
      status: "rejected",
      rejectedBy: role,
      rejectedAt: new Date().toISOString()
    };
  });
  saveLeaveRequests();
  render();
}

function applyApprovedLeaveToAttendance(request) {
  const monthKey = getRequestFromDate(request).slice(0, 7);
  attendanceRecords[monthKey] = attendanceRecords[monthKey] || {};
  const savedRecord = attendanceRecords[monthKey][request.employeeId] || {};
  const days = { ...(savedRecord.days || {}) };
  if (request.type === "leave") {
    const start = getRequestFromDate(request);
    const end = getRequestToDate(request);
    getMonthDates(monthKey).forEach((date) => {
      if (date >= start && date <= end) days[date] = "leave";
    });
  }
  attendanceRecords[monthKey][request.employeeId] = {
    ...savedRecord,
    days,
    workingDays: Number(workingDays.value || 26)
  };
}

function startEdit(id) {
  if (!hasRoleAction("edit")) return;
  const employee = employees.find((entry) => entry.id === id);
  if (!employee) return;

  editingId = id;
  editingPhoto = employee.photo || "";
  form.name.value = employee.name;
  form.dob.value = employee.dob;
  form.joiningDate.value = employee.joiningDate;
  form.gender.value = employee.gender;
  form.maritalStatus.value = employee.maritalStatus;
  form.fatherOrSpouseName.value = employee.fatherOrSpouseName;
  form.bloodGroup.value = employee.bloodGroup;
  form.mobile.value = employee.mobile;
  form.additionalContact.value = employee.additionalContact;
  form.additionalRelation.value = employee.additionalRelation;
  form.email.value = employee.email;
  form.aadhaar.value = employee.aadhaar;
  form.pan.value = employee.pan;
  form.uan.value = employee.uan;
  form.esicIpNumber.value = employee.esicIpNumber;
  form.nomineeName.value = employee.nomineeName;
  form.nomineeRelation.value = employee.nomineeRelation;
  fillAddressFields("present", employee.presentAddressDetails || parseAddress(employee.presentAddress));
  fillAddressFields("permanent", employee.permanentAddressDetails || parseAddress(employee.permanentAddress));
  form.department.value = employee.department;
  form.designation.value = employee.designation;
  form.grossPay.value = getGrossPay(employee);
  form.autoSalaryBreakup.checked = true;
  form.basicPay.value = employee.basicPay;
  form.hra.value = employee.hra;
  form.conveyanceAllowance.value = employee.conveyanceAllowance || 0;
  form.allowance.value = employee.allowance;
  form.bonus.value = employee.bonus;
  form.otherDeductions.value = employee.otherDeductions;
  form.leaveOpeningBalance.value = Number(employee.leaveBalance ?? employee.leaveOpeningBalance ?? 0);
  form.pfApplicable.value = employee.pfApplicable;
  form.esiApplicable.value = employee.esiApplicable;
  setEmployeeStatutoryFields(employee);
  form.paymentMode.value = employee.paymentMode;
  form.bankName.value = employee.bankName;
  form.bankAccount.value = employee.bankAccount;
  form.ifsc.value = employee.ifsc;
  photoInput.value = "";
  sameAddress.checked = employee.presentAddress === employee.permanentAddress;
  setPermanentAddressLocked(sameAddress.checked);
  formTitle.textContent = "Edit employee";
  submitButton.textContent = "Save changes";
  cancelEdit.classList.remove("hidden");
  updateEmployeeCodePreview();
  showEmployeeSection("employeeDetailsSection");
  showPage("newEmployeePage");
  form.name.focus();
}

function deleteEmployee(id) {
  const employee = employees.find((entry) => entry.id === id);
  if (employee && !window.confirm(`Delete employee profile for ${employee.name}? This action cannot be undone.`)) return;
  if (!hasRoleAction("delete")) return;
  employees = employees.filter((employee) => employee.id !== id);
  saveEmployees();
  if (editingId === id) resetForm();
  render();
  showToast("Employee deleted successfully.");
}

function copyPresentAddress() {
  if (sameAddress.checked) {
    fillAddressFields("permanent", getAddressDetails("present"));
    setPermanentAddressLocked(true);
  } else {
    setPermanentAddressLocked(false);
  }
  syncAddressHiddenFields();
}

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function escapeAttr(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

function isAdminSession() {
  return currentAppRole === "admin";
}

function shouldQueueEmployeeEditApproval() {
  return editingId && currentAppRole === "hr";
}

function getLoginDisplayName() {
  return homeLoginUser.value.trim() || (currentAppRole === "hr" ? "HR user" : "Admin user");
}

const employeeChangeLabels = {
  name: "Name",
  dob: "DOB",
  joiningDate: "Joining date",
  mobile: "Mobile",
  email: "Email",
  department: "Department",
  designation: "Designation",
  basicPay: "Basic + DA",
  hra: "HRA",
  conveyanceAllowance: "Conveyance allowance",
  allowance: "Special allowance",
  bonus: "Bonus",
  otherDeductions: "Other deductions",
  leaveOpeningBalance: "Opening leave balance",
  leaveBalance: "Leave balance",
  paymentMode: "Payment mode",
  bankName: "Bank name",
  bankAccount: "Bank account",
  ifsc: "IFSC",
  status: "Status"
};

function getEmployeeChangeSummary(currentEmployee, proposedEmployee) {
  const keys = Object.keys(employeeChangeLabels);
  const changed = keys.filter((key) => JSON.stringify(currentEmployee[key] ?? "") !== JSON.stringify(proposedEmployee[key] ?? ""));
  return changed.map((key) => employeeChangeLabels[key]);
}

function queueEmployeeChangeRequest(currentEmployee, proposedEmployee, source = "Employee edit") {
  const changedFields = getEmployeeChangeSummary(currentEmployee, proposedEmployee);
  if (!changedFields.length) return false;

  employeeChangeRequests.unshift({
    id: crypto.randomUUID(),
    employeeId: currentEmployee.id,
    employeeCode: currentEmployee.employeeCode,
    employeeName: currentEmployee.name,
    requestedBy: getLoginDisplayName(),
    requestedRole: currentAppRole.toUpperCase(),
    requestedAt: new Date().toISOString(),
    source,
    status: "Pending Admin",
    changedFields,
    proposedEmployee,
    decidedBy: "",
    decidedAt: ""
  });
  saveEmployeeChangeRequests();
  return true;
}

function showPage(pageId) {
  if (!isAppLoggedIn && pageId !== "homePage") {
    pageId = "homePage";
  }
  if (isAppLoggedIn && !canAccessPage(pageId)) {
    pageId = "homePage";
  }
  const showSummary = pageId === "homePage";
  document.querySelector(".app-shell").classList.toggle("summary-hidden", !showSummary);
  document.querySelector(".stats").classList.toggle("hidden", !showSummary);
  document.querySelectorAll(".page").forEach((page) => page.classList.toggle("active", page.id === pageId));
  document.querySelectorAll(".tab-button").forEach((button) => button.classList.toggle("active", button.dataset.page === pageId));
}

function showEmployeeSection(sectionId) {
  formSections.forEach((section) => section.classList.toggle("active", section.id === sectionId));
  sectionTabs.forEach((button) => button.classList.toggle("active", button.dataset.section === sectionId));
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (editingId && !hasRoleAction("edit")) {
    formTitle.textContent = "Edit access is restricted";
    return;
  }
  if (!editingId && !hasRoleAction("add")) {
    formTitle.textContent = "Add employee access is restricted";
    return;
  }
  if (!validateForm()) return;
  const nextEmployee = await readForm();

  if (editingId) {
    const currentEmployee = employees.find((employee) => employee.id === editingId);
    if (currentEmployee && shouldQueueEmployeeEditApproval()) {
      const queued = queueEmployeeChangeRequest(currentEmployee, { ...currentEmployee, ...nextEmployee }, "Employee edit");
      adminMessage.textContent = queued
        ? `Employee changes for ${currentEmployee.name} are waiting for Admin authorization.`
        : "No employee changes were found.";
      resetForm();
      renderAdmin();
      renderRows();
      showPage("adminPage");
      return;
    }
    employees = employees.map((employee) => (employee.id === editingId ? { ...employee, ...nextEmployee } : employee));
  } else {
    employees = [{ id: crypto.randomUUID(), ...nextEmployee }, ...employees];
  }

  saveEmployees();
  resetForm();
  render();
  showPage("payrollPage");
});

function validateForm() {
  const controls = [...form.querySelectorAll("[required]")];
  const invalid = controls.find((control) => {
    if (control.disabled) return false;
    const value = control.value.trim();
    if (!value) return true;
    if (control.pattern) return !new RegExp(`^(?:${control.pattern})$`).test(value);
    if (control.type === "email") return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    return false;
  });

  if (!invalid) return true;

  const section = invalid.closest(".form-section");
  if (section) showEmployeeSection(section.id);
  invalid.focus();
  invalid.reportValidity();
  return false;
}

function saveSection(sectionId, nextSectionId) {
  const section = document.querySelector(`#${sectionId}`);
  const controls = [...section.querySelectorAll("[required]")];
  const invalid = controls.find((control) => {
    if (control.disabled) return false;
    const value = control.value.trim();
    if (!value) return true;
    if (control.pattern) return !new RegExp(`^(?:${control.pattern})$`).test(value);
    if (control.type === "email") return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    return false;
  });

  if (invalid) {
    invalid.focus();
    invalid.reportValidity();
    return;
  }

  syncAddressHiddenFields();
  if (nextSectionId) showEmployeeSection(nextSectionId);
}

cancelEdit.addEventListener("click", resetForm);
search.addEventListener("input", () => {
  employeePage = 1;
  renderRows();
});
departmentFilter.addEventListener("change", () => {
  employeePage = 1;
  renderRows();
});
employeeStatusFilter.addEventListener("change", () => {
  employeePage = 1;
  renderRows();
});
employeeSort.addEventListener("change", renderRows);
employeePrevPage.addEventListener("click", () => {
  employeePage = Math.max(1, employeePage - 1);
  renderRows();
});
employeeNextPage.addEventListener("click", () => {
  employeePage += 1;
  renderRows();
});
joiningDate.addEventListener("change", updateEmployeeCodePreview);
form.grossPay.addEventListener("input", () => {
  if (form.autoSalaryBreakup.checked) {
    applySalaryBreakupFromGross();
  } else {
    updateStatutoryGuidance();
  }
});
form.autoSalaryBreakup.addEventListener("change", () => {
  if (form.autoSalaryBreakup.checked) applySalaryBreakupFromGross();
});
homeLoginForm.addEventListener("submit", handleHomeLogin);
forgotPasswordForm.addEventListener("submit", handleForgotPassword);
showForgotPassword.addEventListener("click", showForgotPasswordPanel);
backToLogin.addEventListener("click", showLoginPanel);
appLogout.addEventListener("click", handleAppLogout);
["basicPay", "hra", "conveyanceAllowance", "allowance", "bonus"].forEach((fieldName) => {
  form[fieldName].addEventListener("input", syncGrossPayFromComponents);
  form[fieldName].addEventListener("change", syncGrossPayFromComponents);
});
form.otherDeductions.addEventListener("input", updateStatutoryGuidance);
form.otherDeductions.addEventListener("change", updateStatutoryGuidance);
["pfApplicable", "esiApplicable", "ptApplicable", "tdsApplicable", "lwfApplicable", "gratuityApplicable", "bonusActApplicable"].forEach((fieldName) => {
  form[fieldName].addEventListener("input", updateStatutoryGuidance);
  form[fieldName].addEventListener("change", updateStatutoryGuidance);
});
attendanceMonth.addEventListener("change", renderAttendance);
workingDays.addEventListener("input", renderAttendance);
saveAttendanceMonth.addEventListener("click", saveMonthlyPayroll);
attendanceTabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeAttendancePanel = button.dataset.attendanceTab;
    renderAttendanceTabs();
  });
});
leaveRegisterMonth.addEventListener("change", renderLeaveRegister);
runMonth.addEventListener("change", renderPayrollRun);
runWorkingDays.addEventListener("input", renderPayrollRun);
savePayrollRun.addEventListener("click", savePayrollRunSnapshot);
profileEmployeeSelect.addEventListener("change", () => {
  selectedProfileEmployeeId = profileEmployeeSelect.value;
  renderEmployeeProfile();
});
advanceForm.addEventListener("submit", saveAdvance);
organizationForm.addEventListener("submit", saveOrganizationProfile);
generateOrgCode.addEventListener("click", generateOrganizationCode);
orgName.addEventListener("input", () => {
  if (!organizations.some((organization) => organization.code === orgCode.value)) orgCode.value = "";
});
orgLogo.addEventListener("change", previewOrganizationLogo);
settingBackgroundImage.addEventListener("change", previewBackgroundImage);
adminSettingsForm.addEventListener("submit", saveAdminSettingsForm);
adminUserForm.addEventListener("submit", saveAdminUser);
adminRoleForm.addEventListener("submit", saveAdminRole);
adminSectionTabs.forEach((button) => {
  button.addEventListener("click", () => showAdminSection(button.dataset.adminSection));
});
closeReportModal.addEventListener("click", closeActiveReport);
modalPrint.addEventListener("click", printActiveReport);
modalSavePdf.addEventListener("click", printActiveReport);
modalExportExcel.addEventListener("click", exportActiveReportCsv);
modalDownload.addEventListener("click", downloadActiveReportHtml);
generateReport.addEventListener("click", renderReportCards);
reportSearch.addEventListener("input", renderReportCards);
reportTypeFilter.addEventListener("change", renderReportCards);
reportFromDate.addEventListener("change", renderReportCards);
reportToDate.addEventListener("change", renderReportCards);
sendOtp.addEventListener("click", generateOtp);
otpForm.addEventListener("submit", verifyOtp);
portalLogout.addEventListener("click", logoutPortal);
leaveRequestForm.addEventListener("submit", submitLeaveRequest);
leaveType.addEventListener("change", () => {
  const isShortLeave = leaveType.value === "short";
  leaveToDate.disabled = isShortLeave;
  leaveToDate.required = !isShortLeave;
  updateLeaveDays();
});
leaveFromDate.addEventListener("change", updateLeaveDays);
leaveToDate.addEventListener("change", updateLeaveDays);
portalTabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activePortalPanel = button.dataset.portalTab;
    renderPortalTabs();
  });
});
portalQuickActions.forEach((button) => {
  button.addEventListener("click", () => handlePortalAction(button.dataset.portalAction));
});
portalEssCards.addEventListener("click", (event) => {
  const card = event.target.closest("[data-portal-action]");
  if (card) handlePortalAction(card.dataset.portalAction);
});
approvalRole.addEventListener("change", renderApprovals);
sameAddress.addEventListener("change", copyPresentAddress);
addressParts.forEach((part) => {
  addressField("present", part).addEventListener("input", () => {
    if (sameAddress.checked) copyPresentAddress();
    syncAddressHiddenFields();
  });
  addressField("permanent", part).addEventListener("input", syncAddressHiddenFields);
});
sectionSaveButtons.forEach((button) => {
  button.addEventListener("click", () => saveSection(button.dataset.sectionSave, button.dataset.nextSection));
});
document.querySelectorAll(".tab-button[data-page], .stat-action").forEach((button) => {
  button.addEventListener("click", () => showPage(button.dataset.page));
});
sectionTabs.forEach((button) => {
  button.addEventListener("click", () => showEmployeeSection(button.dataset.section));
});

resetAttendanceDefaults();
resetForm();
saveEmployees();
render();
window.openEmployeeProfileReport = openEmployeeProfileReport;
window.downloadEmployeeProfile = downloadEmployeeProfile;
