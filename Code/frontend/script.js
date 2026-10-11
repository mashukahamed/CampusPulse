
"use strict";

/* ========================================
   CampusPulse - Application JavaScript
   ======================================== */

/* 1. Demo student data
   Replace this sample with data from your backend later. */


let students = [];

function mapStudentData(record) {
  const engagement = Math.round(
    (
      record.assignment_completion_pct +
      Math.min(record.login_count_30d * 5, 100) +
      Math.min(record.events_attended * 10, 100) +
      Math.min(record.certifications_count * 20, 100)
    ) / 4
  );

  const placement = Math.round(
    (
      record.aptitude_score +
      record.coding_score +
      record.mock_interview_score +
      record.technical_skill_score +
      record.communication_score
    ) / 5
  );

  const academicFlag =
    record.cgpa < 7 ||
    record.backlogs > 0 ||
    record.attendance_pct < 75;

  const placementFlag = placement < 60;

  let status = "On track";

  if (academicFlag) {
    status = "Academic support";
  } else if (placementFlag) {
    status = "Placement support";
  } else if (record.attendance_pct < 85 || engagement < 60) {
    status = "Monitor";
  }

  const success = Math.round(
    (record.cgpa / 10 * 100 * 0.4) +
    (record.attendance_pct * 0.2) +
    (engagement * 0.2) +
    (placement * 0.2)
  );

  return {
    id: record.student_id,
    name: record.student_id,
    department: record.department,
    year: record.year,
    cgpa: record.cgpa,
    attendance: record.attendance_pct,
    engagement,
    placement,
    success,
    status,
    academicFlag,
    placementFlag
  };
}

function updateMyProgress(studentId) {
  const student = students.find(s => s.id === studentId);
  if (elements.mySelectedStudent) {
  elements.mySelectedStudent.textContent =
    student ? student.id : "None selected";
}

  if (!student) {
    elements.myAcademic.textContent = "—";
    elements.myAttendance.textContent = "—";
    elements.myEngagement.textContent = "—";
    elements.myPlacement.textContent = "—";
    elements.myNextSteps.innerHTML =
      "<p>Select a student record to view progress and suggested actions.</p>";
    return;
  }

  elements.myAcademic.textContent =
    `${Math.round((student.cgpa / 10) * 100)}/100`;

  elements.myAttendance.textContent =
    `${student.attendance}%`;

  elements.myEngagement.textContent =
    `${student.engagement}/100`;

  elements.myPlacement.textContent =
    `${student.placement}/100`;

  const steps = [];

  if (student.attendance < 75) {
    steps.push(
      "<p><strong>Attendance</strong><br>Review missed classes and discuss a realistic attendance plan with your mentor.</p>"
    );
  }

  if (student.cgpa < 7 || student.academicFlag) {
    steps.push(
      "<p><strong>Academic improvement</strong><br>Identify one difficult subject and plan a focused revision session.</p>"
    );
  }

  if (student.placement < 60) {
    steps.push(
      "<p><strong>Placement practice</strong><br>Practise coding, aptitude, and communication skills regularly.</p>"
    );
  }

  if (student.engagement < 50) {
    steps.push(
      "<p><strong>Learning activity</strong><br>Review assignment completion and set a small weekly learning goal.</p>"
    );
  }

  if (steps.length === 0) {
    steps.push(
      "<p><strong>Keep progressing</strong><br>Maintain your current habits and choose one skill to improve this week.</p>"
    );
  }

  elements.myNextSteps.innerHTML = steps.join("");
}

/* 2. DOM helpers */

const getElement = (id) => document.getElementById(id);

const elements = {
  sidebar: getElement("sidebar"),
  breadcrumb: getElement("breadcrumb"),
  roleTitle: getElement("roleTitle"),
  roleDescription: getElement("roleDescription"),
  roleSwitch: getElement("roleSwitch"),
  studentSearch: getElement("studentSearch"),
  departmentFilter: getElement("departmentFilter"),
  statusFilter: getElement("statusFilter"),
  studentRows: getElement("studentRows"),
  overviewStudents: getElement("overviewStudents"),
  studentProfile: getElement("studentProfile"),
  departmentChart: getElement("departmentChart"),
  departmentLabels: getElement("departmentLabels"),
  chartMetric: getElement("chartMetric"),
  chatMessages: getElement("chatMessages"),
  assistantForm: getElement("assistantForm"),
  assistantInput: getElement("assistantInput"),
  toast: getElement("toast"),
  totalStudents: document.querySelector(
  "#page-overview .metrics-grid .metric-card:nth-child(1) .metric-value"
  

),

academicSupportCount: document.querySelector(
  "#page-overview .metrics-grid .metric-card:nth-child(2) .metric-value"
),

placementSupportCount: document.querySelector(
  "#page-overview .metrics-grid .metric-card:nth-child(3) .metric-value"
),

averageAttendance: document.querySelector(
  "#page-overview .metrics-grid .metric-card:nth-child(4) .metric-value"
  
),
supportTotal: getElement("supportTotal"),
onTrackCount: getElement("onTrackCount"),
monitorCount: getElement("monitorCount"),
academicCount: getElement("academicCount"),
placementCount: getElement("placementCount"),
attendanceSignalCount: getElement("attendanceSignalCount"),
assessmentDeclineCount: getElement("assessmentDeclineCount"),
placementGapCount: getElement("placementGapCount"),
riskAttendanceCount: getElement("riskAttendanceCount"),
riskAcademicCount: getElement("riskAcademicCount"),
riskPlacementCount: getElement("riskPlacementCount"),
riskEngagementCount: getElement("riskEngagementCount"),

myProgressStudent: getElement("myProgressStudent"),
myAcademic: getElement("myAcademic"),
myAttendance: getElement("myAttendance"),
myEngagement: getElement("myEngagement"),
myPlacement: getElement("myPlacement"),
myNextSteps: getElement("myNextSteps"),
};

const pageNames = {
  overview: "Overview",
  students: "Student Analytics",
  insights: "Risk Insights",
  recommendations: "Recommendations",
  assistant: "AI Assistant",
  myprogress: "My Progress",
  about: "About CampusPulse"
};

const departmentNames = [
  "Data Sci.",
  "Computer Sci.",
  "Electronics",
  "IT"
];

/* 3. Navigation */

let currentRole = "faculty";
let toastTimeout;

function showPage(pageName) {
  const studentPages = ["myprogress", "about"];

  if (
    currentRole === "student" &&
    !studentPages.includes(pageName)
  ) {
    return;
  }

  const targetPage = getElement(`page-${pageName}`);

  if (!targetPage) {
    return;
  }

  document.querySelectorAll(".page").forEach((page) => {
    page.classList.toggle("active", page === targetPage);
  });

  document.querySelectorAll(".nav-link[data-page]").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.page === pageName
    );
  });

  elements.breadcrumb.textContent = pageNames[pageName] || "Overview";

  if (pageName === "students") {
    renderStudents();
  }

  if (pageName === "overview") {
    renderChart();
  }

  elements.sidebar.classList.remove("open");
}

document.querySelectorAll(".nav-link[data-page]").forEach((button) => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
  });
});

document.querySelectorAll("[data-go]").forEach((button) => {
  button.addEventListener("click", () => {
    showPage(button.dataset.go);
  });
});

getElement("mobileMenu").addEventListener("click", () => {
  elements.sidebar.classList.toggle("open");
});

/* 4. Faculty and student view switch
   This is only a frontend demonstration, not real access control. */

function setRole(role) {
  currentRole = role;

  const isStudent = role === "student";
  const allowedPages = isStudent
    ? ["myprogress", "about"]
    : Object.keys(pageNames).filter((page) => page !== "myprogress");

  elements.roleTitle.textContent = isStudent
    ? "Student workspace"
    : "Faculty workspace";

  elements.roleDescription.textContent = isStudent
    ? "Review your own progress and choose practical next steps."
    : "Review class-level patterns and identify opportunities for student support.";

  elements.roleSwitch.textContent = isStudent
    ? "Switch to faculty view →"
    : "Switch to student view →";

  document.querySelectorAll(".nav-link[data-page]").forEach((button) => {
    button.hidden = !allowedPages.includes(button.dataset.page);
  });

  showPage(isStudent ? "myprogress" : "overview");
}

elements.roleSwitch.addEventListener("click", () => {
  setRole(currentRole === "faculty" ? "student" : "faculty");
});

/* 5. Student helpers */

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

function getStatusClass(status) {
  if (status === "On track") {
    return "good";
  }

  if (status === "Monitor") {
    return "watch";
  }

  return "risk";
}

function createStudentCell(student) {
  const cell = document.createElement("div");
  cell.className = "student-cell";

  const avatar = document.createElement("span");
  avatar.className = "student-avatar";
  avatar.textContent = getInitials(student.name);

  const details = document.createElement("div");
  const name = document.createElement("div");
  const id = document.createElement("div");

  name.className = "student-name";
  name.textContent = student.name;

  id.className = "student-id";
  id.textContent = student.id;

  details.append(name, id);
  cell.append(avatar, details);

  return cell;
}

function createStatusBadge(status) {
  const badge = document.createElement("span");

  badge.className = `status ${getStatusClass(status)}`;
  badge.textContent = status;

  return badge;
}

function createTableCell(content, className = "") {
  const cell = document.createElement("td");

  if (content instanceof Node) {
    cell.appendChild(content);
  } else {
    cell.textContent = String(content);
  }

  if (className) {
    cell.className = className;
  }

  return cell;
}

/* 6. Overview student table */

function renderOverviewStudents() {
  elements.overviewStudents.replaceChildren();

  const flaggedStudents = students
    .filter((student) => {
      return student.academicFlag || student.placementFlag;
    })
    .slice(0, 4);

  flaggedStudents.forEach((student) => {
    const row = document.createElement("tr");

    row.append(
      createTableCell(createStudentCell(student)),
      createTableCell(student.department),
      createTableCell(student.success, "score"),
      createTableCell(createStatusBadge(student.status))
    );

    elements.overviewStudents.appendChild(row);
  });
}

/* 7. Student search, filters and table */

function getFilteredStudents() {
  const searchText = elements.studentSearch.value
    .trim()
    .toLowerCase();

  const selectedDepartment = elements.departmentFilter.value;
  const selectedStatus = elements.statusFilter.value;

  return students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchText) ||
      student.id.toLowerCase().includes(searchText);

    const matchesDepartment =
      selectedDepartment === "all" ||
      student.department === selectedDepartment;

    const matchesStatus =
      selectedStatus === "all" ||
      student.status === selectedStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });
}

function renderStudents() {
  const filteredStudents = getFilteredStudents();

  elements.studentRows.replaceChildren();

  filteredStudents.forEach((student) => {
    const row = document.createElement("tr");

    row.dataset.student = student.id;
    row.tabIndex = 0;

    row.append(
      createTableCell(createStudentCell(student)),
      createTableCell(student.department),
      createTableCell(student.cgpa.toFixed(1)),
      createTableCell(`${student.attendance}%`),
      createTableCell(student.engagement),
      createTableCell(student.placement),
      createTableCell(student.success),
      createTableCell(createStatusBadge(student.status))
    );

    row.addEventListener("click", () => {
      showStudentProfile(student.id);
    });

    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showStudentProfile(student.id);
      }
    });

    elements.studentRows.appendChild(row);
  });

  const count = filteredStudents.length;

  const average = count
    ? (
        filteredStudents.reduce(
          (total, student) => total + student.success,
          0
        ) / count
      ).toFixed(1)
    : "—";

  getElement("matchCount").textContent = count;
  getElement("averageSuccess").textContent = average;

  getElement("academicFlags").textContent = filteredStudents.filter(
    (student) => student.academicFlag
  ).length;

  getElement("placementFlags").textContent = filteredStudents.filter(
    (student) => student.placementFlag
  ).length;

  getElement("tableFoot").textContent =
    `Showing ${count} of ${students.length} fictional sample records. ` +
    "Select a row to view details.";

  if (
    elements.studentProfile.dataset.studentId &&
    !filteredStudents.some(
      (student) =>
        student.id === elements.studentProfile.dataset.studentId
    )
  ) {
    elements.studentProfile.hidden = true;
  }
}

elements.studentSearch.addEventListener("input", renderStudents);
elements.departmentFilter.addEventListener("change", renderStudents);
elements.statusFilter.addEventListener("change", renderStudents);

getElement("resetFilters").addEventListener("click", () => {
  elements.studentSearch.value = "";
  elements.departmentFilter.value = "all";
  elements.statusFilter.value = "all";

  elements.studentProfile.hidden = true;
  renderStudents();
});

/* 8. Individual student profile */

function showStudentProfile(studentId) {
  const student = students.find((item) => item.id === studentId);

  if (!student) {
    return;
  }

  const profile = elements.studentProfile;
  profile.replaceChildren();
  profile.hidden = false;
  profile.dataset.studentId = student.id;

  const heading = document.createElement("div");
  heading.className = "card-header";

  const headingText = document.createElement("div");
  const title = document.createElement("h2");
  const subtitle = document.createElement("p");

  title.textContent = student.name;
  subtitle.textContent =
    `Roll number: ${student.id} · ${student.department} · Year ${student.year}`;

  headingText.append(title, subtitle);
  heading.append(headingText, createStatusBadge(student.status));

  const metricGrid = document.createElement("div");
  metricGrid.className = "profile-grid";

  const profileMetrics = [
    ["CGPA", `${student.cgpa.toFixed(1)}/10`],
    ["Attendance", `${student.attendance}%`],
    ["Engagement", `${student.engagement}/100`],
    ["Placement readiness", `${student.placement}/100`]
  ];

  profileMetrics.forEach(([label, value]) => {
    const metric = document.createElement("div");
    const metricLabel = document.createElement("span");
    const metricValue = document.createElement("strong");

    metric.className = "profile-stat";
    metricLabel.textContent = label;
    metricValue.textContent = value;

    metric.append(metricLabel, metricValue);
    metricGrid.appendChild(metric);
  });

  const columns = document.createElement("div");
  columns.className = "profile-columns";

  const performance = document.createElement("div");
  performance.className = "profile-section";

  const performanceTitle = document.createElement("h3");
  performanceTitle.textContent = "Performance indicators";
  performance.appendChild(performanceTitle);

  const indicators = [
    ["Academic indicator", Math.round(student.cgpa * 10)],
    ["Attendance", student.attendance],
    ["Engagement", student.engagement],
    ["Placement readiness", student.placement]
  ];

  indicators.forEach(([label, value]) => {
    const bar = document.createElement("div");
    bar.className = "profile-bar";

    const barLabel = document.createElement("div");
    barLabel.className = "profile-bar-label";

    const labelText = document.createElement("span");
    const labelValue = document.createElement("strong");

    labelText.textContent = label;
    labelValue.textContent = `${value}%`;

    const track = document.createElement("div");
    track.className = "progress-track";

    const fill = document.createElement("div");
    fill.className = "progress-fill";
    fill.style.width = `${Math.max(0, Math.min(100, value))}%`;

    barLabel.append(labelText, labelValue);
    track.appendChild(fill);
    bar.append(barLabel, track);
    performance.appendChild(bar);
  });

  const flagSection = document.createElement("div");
  flagSection.className = "profile-section";

  const flagTitle = document.createElement("h3");
  flagTitle.textContent = "Risk flags and explanations";
  flagSection.appendChild(flagTitle);

 
const flags = [];

if (student.attendance < 75) {
  flags.push({
    title: "Attendance needs review",
    explanation:
      `Attendance is ${student.attendance}%, below the illustrative ` +
      "75% review threshold. Verify records and ask about barriers.",
    action:
      "Verify the attendance record and arrange a check-in with the student.",
    urgent: true
  });
}

  

  if (student.academicFlag) {
    flags.push({
      title: "Academic support signal",
      explanation:
        "The demo rule flags this profile for review. Check internal " +
        "marks, backlogs and assessment context.",
      urgent: true
    });
  }

  if (student.placementFlag) {
    flags.push({
      title: "Placement practice gap",
      explanation:
        `The illustrative placement indicator is ${student.placement}/100. ` +
        "Consider aptitude, coding and mock-interview practice.",
      urgent: false
    });
  }

  if (student.engagement < 60) {
    flags.push({
      title: "Engagement may need a check-in",
      explanation:
        "Check learning platform access and assignment context before " +
        "interpreting this indicator.",
      urgent: false
    });
  }

  if (flags.length === 0) {
    flags.push({
      title: "No demo rule triggered",
      explanation:
        "This fictional record does not trigger the current example rules. " +
        "Continue normal check-ins; this does not guarantee that support is unnecessary.",
      urgent: false
    });
  }

  flags.forEach((flag) => {
    const item = document.createElement("div");
    item.className = flag.urgent ? "flag urgent" : "flag";

    const titleElement = document.createElement("strong");
    const explanation = document.createElement("p");

   
titleElement.textContent = flag.title;
explanation.textContent = flag.explanation;

item.append(titleElement, explanation);

if (flag.action) {
  const action = document.createElement("p");
  action.className = "flag-action";
  action.textContent = `Recommended action: ${flag.action}`;
  item.appendChild(action);
}

flagSection.appendChild(item);
  });

  columns.append(performance, flagSection);

  const footer = document.createElement("p");
  footer.className = "muted-note";
  footer.textContent =
    "Synthetic demo profile. Flags are illustrative rules, not validated " +
    "predictions. Confirm the source data and student context before acting.";

    
  const followUpSection = document.createElement("div");
  followUpSection.className = "profile-section";

  const followUpTitle = document.createElement("h3");
  followUpTitle.textContent = "Student Follow-up";

  const followUpDescription = document.createElement("p");
  followUpDescription.textContent =
    "Track whether the recommended student follow-up has been completed.";

  const followUpStatus = document.createElement("p");
  const followUpButton = document.createElement("button");

  const storageKey = `campusPulseFollowUps`;
  let followUps = {};

  try {
    followUps = JSON.parse(localStorage.getItem(storageKey) || "{}");
  } catch {
    followUps = {};
  }

  function updateFollowUpUI() {
    const isCompleted = followUps[student.id] === true;

    followUpStatus.textContent = isCompleted
      ? "Follow-up status: Completed"
      : "Follow-up status: Pending";

    followUpButton.textContent = isCompleted
      ? "Reopen Follow-up"
      : "Mark Follow-up Complete";
  }

  followUpButton.type = "button";

  followUpButton.addEventListener("click", () => {
    followUps[student.id] = followUps[student.id] !== true;

    try {
      localStorage.setItem(storageKey, JSON.stringify(followUps));
      updateFollowUpUI();
    } catch {
      followUpStatus.textContent =
        "Unable to save status in this browser.";
    }
  });

  updateFollowUpUI();

  followUpSection.append(
    followUpTitle,
    followUpDescription,
    followUpStatus,
    followUpButton
  );

 profile.append(
  heading,
  metricGrid,
  columns,
  followUpSection,
  footer
);

  profile.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

/* 9. Department performance chart */


const chartMetrics = {
  success: student => student.success,
  academic: student => student.cgpa * 10,
  attendance: student => student.attendance,
  placement: student => student.placement
};




function renderChart() {
  const metric = elements.chartMetric.value;
  const getMetricValue = chartMetrics[metric];

  if (!getMetricValue || !students.length) {
    return;
  }

  const departments = [
    ...new Set(students.map(student => student.department))
  ];

  elements.departmentChart.replaceChildren();
  elements.departmentLabels.replaceChildren();

  departments.forEach(department => {
    const departmentStudents = students.filter(
      student => student.department === department
    );

    const current = Math.round(
      departmentStudents.reduce(
        (sum, student) => sum + getMetricValue(student),
        0
      ) / departmentStudents.length
    );

    const previous = Math.max(0, current - 5);

    const group = document.createElement("div");
    group.className = "bar-group";

    const previousBar = document.createElement("div");
    previousBar.className = "bar previous";
    previousBar.style.height = `${previous}%`;
    previousBar.title =
      `Illustrative previous value: ${previous}% (not historical data)`;

    const currentBar = document.createElement("div");
    currentBar.className = "bar current";
    currentBar.style.height = `${current}%`;
    currentBar.title = `Current average: ${current}%`;

    group.append(previousBar, currentBar);
    elements.departmentChart.appendChild(group);

    const label = document.createElement("span");
    label.textContent = department;
    elements.departmentLabels.appendChild(label);
  });
}
elements.chartMetric.addEventListener("change", renderChart);

/* 10. Demo recommendation actions */

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.hidden = false;

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    elements.toast.hidden = true;
  }, 2800);
}



const recommendationKey = "campusPulseRecommendations";

function renderSavedRecommendations() {
  const container = document.getElementById("savedRecommendations");
  if (!container) return;

  let items = [];

  try {
    items = JSON.parse(localStorage.getItem(recommendationKey) || "[]");
  } catch {
    items = [];
  }

  if (items.length === 0) {
    container.innerHTML =
      "<p>No saved recommendations yet. Choose an action above to get started.</p>";
    return;
  }

  container.innerHTML = items.map((item, index) => `
    <div class="step-list">
      <p>
        <strong>${item.title}</strong><br>
        Status: <strong>${item.status}</strong><br>
        <button class="button button-primary" data-complete-index="${index}">
          ${item.status === "Completed" ? "Reopen" : "Mark Completed"}
        </button>
      </p>
    </div>
  `).join("");

  container.querySelectorAll("[data-complete-index]").forEach(button => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.completeIndex);
      items[index].status =
        items[index].status === "Completed" ? "Pending" : "Completed";
      items[index].updatedAt = new Date().toLocaleString();

      localStorage.setItem(recommendationKey, JSON.stringify(items));
      renderSavedRecommendations();
      showToast("Recommendation status updated.");
    });
  });
}

document.querySelectorAll("#page-recommendations [data-toast]").forEach(button => {
  button.addEventListener("click", () => {
    const card = button.closest(".recommendation");
    const title = card.querySelector("h2").textContent;
    let items = [];

    try {
      items = JSON.parse(localStorage.getItem(recommendationKey) || "[]");
    } catch {
      items = [];
    }

    const existing = items.find(item => item.title === title);

    if (existing) {
      existing.status = "Pending";
      existing.updatedAt = new Date().toLocaleString();
    } else {
      items.push({
        title,
        status: "Pending",
        createdAt: new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString()
      });
    }

    try {
      localStorage.setItem(recommendationKey, JSON.stringify(items));
      renderSavedRecommendations();
      showToast(`${title} saved as a pending recommendation.`);
    } catch {
      showToast("Could not save the recommendation in this browser.");
    }
  });
});

renderSavedRecommendations();

function renderSavedRecommendations() {
  const container = document.getElementById("savedRecommendations");
  if (!container) return;

  let items = [];

  try {
    items = JSON.parse(
      localStorage.getItem("campusPulseRecommendations") || "[]"
    );
  } catch {
    items = [];
  }

  if (items.length === 0) {
    container.innerHTML =
      "<p>No saved recommendations yet. Choose an action above to get started.</p>";
    return;
  }

  container.innerHTML = items.map((item, index) => `
    <div class="step-list">
      <p>
        <strong>${item.title}</strong><br>
        Status: <strong>${item.status}</strong><br>
        <button class="button button-primary" data-complete-index="${index}">
          ${item.status === "Completed" ? "Reopen" : "Mark Completed"}
        </button>
      </p>
    </div>
  `).join("");

  container.querySelectorAll("[data-complete-index]").forEach(button => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.completeIndex);
      items[index].status =
        items[index].status === "Completed" ? "Pending" : "Completed";
      items[index].updatedAt = new Date().toLocaleString();

      localStorage.setItem(
        "campusPulseRecommendations",
        JSON.stringify(items)
      );

      renderSavedRecommendations();
      showToast("Recommendation status updated.");
    });
  });
}

/* 11. Demo AI assistant
   These are predefined responses, not real AI-generated answers. */


function getDemoAnswer(question) {
  const text = question.toLowerCase();
  const total = students.length;

  if (total === 0) {
    return "No student data is available yet. Please check the backend connection.";
  }

  if (
    text.includes("how many") &&
    (text.includes("student") || text.includes("academic"))
  ) {
    if (text.includes("placement")) {
      const count = students.filter(s => s.placementFlag).length;
      return `${count} out of ${total} students are flagged for placement support by the current demo rule.`;
    }

    if (text.includes("attendance")) {
      const count = students.filter(s => s.attendance < 75).length;
      return `${count} out of ${total} students have attendance below 75%.`;
    }

    const count = students.filter(s => s.academicFlag).length;
    return `${count} out of ${total} students are flagged for academic support by the current demo rule.`;
  }

  if (text.includes("attendance")) {
    const lowAttendance = students.filter(s => s.attendance < 75);

    if (text.includes("who") || text.includes("list") || text.includes("below")) {
      if (lowAttendance.length === 0) {
        return "No students currently have attendance below 75% in the loaded dataset.";
      }

      return "Students with attendance below 75%:\n" +
        lowAttendance
          .map(s => `${s.name}: ${s.attendance}%`)
          .join("\n");
    }

    const average = (
      students.reduce((sum, s) => sum + s.attendance, 0) / total
    ).toFixed(1);

    return `Average attendance is ${average}%. ${lowAttendance.length} students are below 75%. Verify records and arrange supportive follow-ups where needed.`;
  }

  if (text.includes("placement") || text.includes("coding") || text.includes("aptitude")) {
    const flagged = students.filter(s => s.placementFlag);

    if (text.includes("who") || text.includes("list")) {
      if (flagged.length === 0) {
        return "No students are currently flagged for placement support by the demo rule.";
      }

      return "Students flagged for placement support:\n" +
        flagged.map(s => `${s.name}: ${s.placement}/100`).join("\n");
    }

    return `${flagged.length} out of ${total} students are flagged for placement support. Review their skill indicators and offer targeted practice. This is not a hiring prediction.`;
  }

  if (text.includes("academic") || text.includes("internal") || text.includes("mark")) {
    const flagged = students.filter(s => s.academicFlag);

    if (text.includes("who") || text.includes("list")) {
      if (flagged.length === 0) {
        return "No students are currently flagged for academic support by the demo rule.";
      }

      return "Students flagged for academic support:\n" +
        flagged.map(s => `${s.name}: CGPA ${s.cgpa}, attendance ${s.attendance}%`).join("\n");
    }

    return `${flagged.length} out of ${total} students are flagged for academic support. Check current marks, backlogs and student context before deciding on support.`;
  }

  if (text.includes("engagement")) {
    const flagged = students.filter(s => s.engagement < 50);
    return `${flagged.length} out of ${total} students have an engagement indicator below 50/100. Check assignment and platform records before interpreting the result.`;
  }

  if (text.includes("total") || text.includes("all students") || text.includes("student count")) {
    return `CampusPulse currently has ${total} student records loaded from the backend.`;
  }

  return "Try asking: How many students need academic support? Which students have attendance below 75%? How many need placement support? Which students have low engagement?";
}

function addChatMessage(message, type = "assistant") {
  const bubble = document.createElement("div");

  bubble.className =
    type === "user"
      ? "chat-message user"
      : "chat-message";

  bubble.textContent = message;

  elements.chatMessages.appendChild(bubble);
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
  return bubble;
}


async function sendAssistantPrompt(question) {
  const message = question.trim();

  if (!message) {
    return;
  }

  addChatMessage(message, "user");
  elements.assistantInput.value = "";
  elements.assistantInput.focus();

  const loadingMessage = addChatMessage(
    "CampusPulse AI is thinking...",
    "assistant"
  );

  try {
    const response = await fetch(
     "https://campuspulse-backend-phe9.onrender.com/api/ai-chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: message
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "The AI request failed."
      );
    }

    loadingMessage.textContent = result.answer;
  } catch (error) {
    console.error("CampusPulse AI error:", error);

    loadingMessage.textContent =
      "Sorry, I couldn't connect to CampusPulse AI. Please check that the backend is running and try again.";
  }
}

/* 12. Initialise the application */

function updateDashboardStats() {
  const total = students.length;
  const attendanceSignalCount = students.filter(
  student => student.attendance < 75
).length;

  // Calculate support flags
  const academicFlags = students.filter(
    student => student.academicFlag
  ).length;

  const placementFlags = students.filter(
    student => student.placementFlag
  ).length;

  // Calculate average attendance
  const averageAttendance = total > 0
    ? students.reduce(
        (sum, student) => sum + student.attendance,
        0
      ) / total
    : 0;
    const assessmentDeclineCount = students.filter(
  student =>
    Number(student.internal_avg) <
    Number(student.previous_internal_avg)
).length;

const placementGapCount = students.filter(
  student => student.placement < 60
).length;
const riskAttendanceCount = students.filter(
  student => student.attendance < 75
).length;

const riskAcademicCount = students.filter(
  student =>
    student.academicFlag
).length;
elements.riskAttendanceCount.textContent = riskAttendanceCount;
elements.riskAcademicCount.textContent = riskAcademicCount;
const riskPlacementCount = students.filter(
  student => student.placement < 60
).length;

const riskEngagementCount = students.filter(
  student => student.engagement < 50
).length;

  // Count students by status
  const onTrackCount = students.filter(
    student => student.status === "On track"
  ).length;

  const monitorCount = students.filter(
    student => student.status === "Monitor"
  ).length;

  const academicCount = students.filter(
    student => student.status === "Academic support"
  ).length;

  const placementCount = students.filter(
    student => student.status === "Placement support"
  ).length;

  // Update the four main dashboard cards
  elements.totalStudents.textContent =
    total.toLocaleString("en-IN");

  elements.academicSupportCount.textContent =
    academicFlags.toLocaleString("en-IN");

  elements.placementSupportCount.textContent =
    placementFlags.toLocaleString("en-IN");

  elements.averageAttendance.textContent =
    `${averageAttendance.toFixed(1)}%`;

  // Update donut chart center and legend
  elements.supportTotal.textContent = total;
  elements.onTrackCount.textContent = onTrackCount;
  elements.monitorCount.textContent = monitorCount;
  elements.academicCount.textContent = academicCount;
  elements.placementCount.textContent = placementCount;

  // Update donut chart colors based on real counts
  const donut = document.querySelector(".donut-chart");

  if (donut && total > 0) {
    const onTrackPercent =
      (onTrackCount / total) * 100;

    const monitorEnd =
      onTrackPercent + (monitorCount / total) * 100;

    const academicEnd =
      monitorEnd + (academicCount / total) * 100;

    donut.style.setProperty(
      "--on-track-percent",
      `${onTrackPercent}%`
    );

    donut.style.setProperty(
      "--monitor-end",
      `${monitorEnd}%`
    );

    donut.style.setProperty(
      "--academic-end",
      `${academicEnd}%`
    );
  }

  // Debug information
  console.log("CampusPulse dashboard updated:", {
    total,
    academicFlags,
    placementFlags,
    averageAttendance: averageAttendance.toFixed(1),
    onTrackCount,
    monitorCount,
    academicCount,
    placementCount
  });
  elements.attendanceSignalCount.textContent =
  attendanceSignalCount;
  elements.assessmentDeclineCount.textContent =
  assessmentDeclineCount;
  
elements.placementGapCount.textContent =
  placementGapCount;
  elements.riskPlacementCount.textContent = riskPlacementCount;
elements.riskEngagementCount.textContent = riskEngagementCount;
}

async function initialiseApp() {
  elements.toast.hidden = true;
  elements.studentProfile.hidden = true;

  try {
    const response = await fetch(
      "https://campuspulse-backend-phe9.onrender.com/api/students"
    );

    if (!response.ok) {
      throw new Error("Could not load student data");
    }

    const data = await response.json();

    const records = Array.isArray(data)
      ? data
      : data.students;

    if (!Array.isArray(records)) {
      throw new Error(
        "API response does not contain a student array"
      );
    }

    students = records.map(mapStudentData);

    // Populate the Student View demo selector
  if (elements.myProgressStudent) {
  elements.myProgressStudent.innerHTML =
    '<option value="">Select a student</option>' +
    students.map(student =>
      `<option value="${student.id}">${student.id} — ${student.department}</option>`
    ).join("");

  elements.myProgressStudent.addEventListener("change", () => {
    updateMyProgress(elements.myProgressStudent.value);
  });
}
    updateDashboardStats();

    renderOverviewStudents();
    renderStudents();
    renderChart();

    console.log(
      `Loaded ${students.length} students from the backend`
    );
  
} catch (error) {
  console.error(
    "CampusPulse data loading failed:",
    error
  );

  alert(
    "Unable to load student data. Please make sure the CampusPulse backend is running, then refresh the page."
  );
}
}


initialiseApp();

fetch("https://campuspulse-backend-phe9.onrender.com/api/students")
  .then(response => {
    if (!response.ok) {
      throw new Error("Failed to fetch student data");
    }
    return response.json();
  })
  .then(data => {
    console.log("Student data received from backend:", data);
  })
  .catch(error => {
    console.error("Error connecting to backend:", error);
  });

elements.assistantForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendAssistantPrompt(elements.assistantInput.value);
});
