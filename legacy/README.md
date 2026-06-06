# Veraglo Payroll

A browser-based payroll app for Veraglo, tailored for India-focused payroll records, INR display, statutory PF/ESI calculations, and upcoming all-India holidays.

## Run

Open `index.html` in a browser, or use the local server URL if one is already running. The app stores payroll changes in `localStorage`.

## Features

- First page shows upcoming all-India 2026 holidays
- Home page starts as an image-based login page with role selection and forgot-password reset; after login it opens a modern image dashboard with text-only translucent navigation buttons
- Top menu is simplified to Home, Admin, Employee Login, and Logout, with module access handled from Home and Admin
- PF & ESI is available as a Home page card instead of a top-menu item
- Admin is organized into clear internal sections for Company Profile, User Profile & Roles, Settings, and Approvals
- Company Profile collapses to a clean preview after saving, with an Edit button to reopen the original fields
- Approval section separates Pending for Approvals, Approved Leave, and Rejected Leave registers
- A common visual theme is applied across internal pages, forms, tables, reports, menus, and buttons so modules match the Home page design language
- Module color accents are available where useful, while the overall branding stays consistent and professional
- User access levels are limited to Admin, HR, and Employee
- Admin has full access to all modules, reports, settings, company details, users, roles, and system configuration
- Admin can customize HR and Employee permissions module-wise and action-wise for View, Add, Edit, Delete, Approve, Export, and Print
- Page-style tabs for Holidays, Employees, Leave Register, Employee Portal, Approvals, History, and Rules
- Admin panel for organization profile, unique organization code generation, logo upload, statutory registrations, contact/address fields, payroll defaults, users, and role definitions
- Admin visibility permissions can show or hide organization tabs and Home page action buttons
- Admin role-based access control covers HR, Employee, and future business modules such as Inventory, Purchase, Sales, Accounts, Reports, and Production
- Admin payroll column settings can activate or deactivate the Professional Tax column in Run Payroll
- Admin appearance customization supports color themes, font styles, background image, and transparency mode
- Admin leave request register lists submitted, pending, approved, and rejected leave requests across all employees
- Record Attendence button opens the attendance module for monthly leave and short-leave tracking
- Record Attendence blocks future months and shows only employees active in the selected month
- Leave Register page showing opening balance, monthly credit, leave taken, paid leave, unpaid leave, short leaves, and closing balance
- Leave Register carries each saved month closing leave balance forward as the next month opening leave balance
- Leave Register month selection is limited to the current calendar month or earlier
- Payroll Run module calculates monthly salary from attendance, PF/ESI, advance or loan recovery, performance incentives, professional tax, TDS, and other statutory deductions
- Performance incentive can be entered manually per employee during Run Payroll and is saved in payroll history
- Payroll Run can skip leave deduction or advance recovery per employee for a selected month, with advance skip/deduction recorded in advance history
- Payroll Run includes a monthly review strip for employees, gross pay, incentives, deductions, and payable before saving
- Employee profile page shows employee details, leave activity, advance activity, and payroll/attendance history by employee name
- Advance Payment module records employee advances, date, payment method, monthly recovery amount, outstanding balance, and deduction history
- Employee Portal module lets employees log in with registered mobile number and demo OTP, then apply for leave or 2-hour short leave
- Employee Portal leave history is filtered to the logged-in employee only
- Employee Portal leave form uses From/Upto dates and calculates total leave days automatically
- Employee Portal shows the logged-in employee photo, contact details, and address, with leave history, salary ledger, leave ledger, and short leave ledger grouped as bottom tabs
- Short leave requests use only one date field for the requested short-leave date
- Approvals module supports two-step leave approval: Supervisor, Engineer, or Manager first, then Director final approval
- Approved leave requests update the Attendance module automatically
- Payroll History saves each month after attendance payroll is finalized
- Leave balance credits 1.25 days per saved month and deducts leave taken
- Salary deduction applies when leave balance is exhausted
- First 2 short leaves are free; each extra short leave deducts 0.5 day salary
- Dedicated Add Employee page with pastel tabs for personal, identity/address, and salary sections
- Each Add Employee section includes a save/continue button, with the final salary section saving the employee record
- Salary Details includes a Gross Pay field with automatic salary breakup into Basic + DA, HRA, and Other Allowance
- Salary Details includes a manual Opening Leave Balance field while adding an employee
- HR edits to saved employee records are held as employee change requests until Admin approves them in the Admin panel
- Present and permanent addresses use structured fields for address line 1, address line 2, city, state, country, and PIN code, with searchable suggestion lists for city/state/country
- Expanded department master for administration, accounts, audit, compliance, HR, IT, operations, production, quality, sales, support, security, stores, and other common departments
- Automatic employee code generation like `GLS2627001`, using `GLS`, joining financial year, and the next serial number
- Aadhaar, PAN, UAN, ESIC IP number, nominee, contact, family contact, email, address, bank, IFSC, and photo fields
- Employer can select or deselect employee statutory applicability for EPF, ESI, Professional Tax, TDS, Labour Welfare Fund, Gratuity, and Bonus Act tracking, with salary-based guidance shown while adding an employee
- Same-address selector to copy present address into permanent address
- INR payroll summaries at the top
- Veraglo logo is used in the app header
- Run Payroll is a prominent text-only navigation button on the Home page
- Add, edit, and delete employee payroll records
- Employees page includes an Active/Disabled status selector for each employee
- Employees page includes functional View, Edit, Delete, Activate/Deactivate, Download Profile, and Print Profile actions
- Employee master records support search, department/status filters, sorting, and pagination
- Payroll history rows are clickable and open a payroll report popup with salary details, payment status, and generated date
- Report popups include Save as PDF, Print, Export to Excel-compatible CSV, and Download options
- Report generation covers employee master, monthly payroll, salary slip, attendance, leave, approved/rejected leave, PF, ESI, department-wise, and custom reports
- Delete, payroll finalization, and leave rejection actions use confirmation prompts
- Calculates gross pay from Basic + DA, HRA, allowance, and bonus
- Calculates employee PF at 12% of Basic + DA
- Calculates employee ESI at 0.75% when gross wages are up to ₹21,000
- Tracks employer ESI at 3.25% for reference
- Keeps TDS and professional tax as manual/other deductions because they vary by employee and state
