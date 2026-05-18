// Agent Board - Dashboard App (rewritten)
(function () {
  const API = "/api";
  const COLUMNS = ["backlog", "todo", "doing", "review", "ready-for-approval", "done", "failed"];
  const COL_LABELS = { backlog: "Backlog", todo: "To Do", doing: "Doing", review: "Review", "ready-for-approval": "Ready for Approval", done: "Done", failed: "Failed" };

  let state = {
    projects: [],
    tasks: [],
    agents: [],
    currentProject: null,
    currentView: "board",
    filterAgent: null,
  };

  // --- Theme (dark default) ---
  const themeToggle = document.getElementById("themeToggle");

  function initTheme() {
    // Always default to dark
    document.documentElement.setAttribute("data-theme", "dark");
    themeToggle.textContent = "\u2600";

    // Check if user previously switched to light
    const saved = localStorage.getItem("ab-theme");
    if (saved === "light") {
      document.documentElement.setAttribute("data-theme", "light");
      themeToggle.textContent = "\u263E";
    }
  }

  themeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    document.documentElement.setAttribute("data-theme", isDark ? "light" : "dark");
    themeToggle.textContent = isDark ? "\u263E" : "\u2600";
    localStorage.setItem("ab-theme", isDark ? "light" : "dark");
  });
  initTheme();

  // --- API helpers ---
  async function api(path, opts) {
    const res = await fetch(API + path, {
      headers: { "Content-Type": "application/json" },
      ...opts,
    });
    return res.json();
  }

  // --- Onboarding ---
  const onboardingPanel = document.getElementById("onboardingPanel");

  function showOnboarding() {
    if (state.tasks.length === 0) {
      onboardingPanel.classList.remove("hidden");
    } else {
      onboardingPanel.classList.add("hidden");
    }
  }

  function hideOnboarding() {
    onboardingPanel.classList.add("hidden");
  }

  // --- Data loading ---
  async function loadProjects() {
    state.projects = await api("/projects");
    // Auto-create "Main" project if none exist
    if (!state.projects.length) {
      const main = await api("/projects", {
        method: "POST",
        body: JSON.stringify({
          name: "Main",
          owner: "agent-board",
          description: "Default project for agent tasks",
        }),
      });
      state.projects = [main];
    }
    renderProjectSelect();
    if (!state.currentProject) {
      state.currentProject = state.projects[0].id;
    }
  }

  async function loadTasks() {
    if (!state.currentProject) { state.tasks = []; return; }
    state.tasks = await api("/tasks?projectId=" + state.currentProject);
  }

  async function loadAgents() {
    state.agents = await api("/agents");
  }

  async function refresh() {
    await Promise.all([loadProjects(), loadAgents()]);
    await loadTasks();
    render();
  }

  // --- Project selector ---
  const projectSelect = document.getElementById("projectSelect");
  function renderProjectSelect() {
    projectSelect.innerHTML = state.projects
      .map((p) => `<option value="${p.id}" ${p.id === state.currentProject ? "selected" : ""}>${p.name}</option>`)
      .join("");
  }

  projectSelect.addEventListener("change", async () => {
    state.currentProject = projectSelect.value;
    await loadTasks();
    render();
  });

  // --- Agent filter (from /api/agents) ---
  const agentFilter = document.getElementById("agentFilter");
  function renderAgentFilter() {
    const agents = state.agents || [];
    agentFilter.innerHTML = '<option value="">All Agents</option>' +
      agents
        .filter(a => a.id)
        .map(a => `<option value="${a.id}" ${a.id === state.filterAgent ? "selected" : ""}>${a.name || a.id}</option>`)
        .join("");
  }

  agentFilter.addEventListener("change", () => {
    state.filterAgent = agentFilter.value || null;
    render();
  });

  // --- View tabs ---
  document.getElementById("viewTabs").addEventListener("click", (e) => {
    if (!e.target.classList.contains("tab")) return;
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    e.target.classList.add("active");
    state.currentView = e.target.dataset.view;
    render();
  });

  // --- Help panel ---
  const helpOverlay = document.getElementById("helpOverlay");
  document.getElementById("helpBtn").addEventListener("click", () => {
    helpOverlay.classList.add("open");
  });
  document.getElementById("helpClose").addEventListener("click", () => {
    helpOverlay.classList.remove("open");
  });
  helpOverlay.addEventListener("click", (e) => {
    if (e.target === helpOverlay) helpOverlay.classList.remove("open");
  });

  // --- Onboarding create button ---
  document.getElementById("onboardingCreateBtn").addEventListener("click", () => {
    showTaskModal("backlog");
  });

  // --- Render ---
  function render() {
    const boardView = document.getElementById("boardView");
    const agentsView = document.getElementById("agentsView");
    const statsView = document.getElementById("statsView");

    boardView.classList.add("hidden");
    agentsView.classList.add("hidden");
    statsView.classList.add("hidden");
    hideOnboarding();

    if (state.currentView === "board") {
      boardView.classList.remove("hidden");
      renderAgentFilter();
      showOnboarding();
      renderBoard();
    } else if (state.currentView === "agents") {
      agentsView.classList.remove("hidden");
      renderAgents();
    } else if (state.currentView === "stats") {
      statsView.classList.remove("hidden");
      renderStats();
    } else if (state.currentView === "ready-for-approval") {
      const readyForApprovalView = document.getElementById("readyForApprovalView");
      readyForApprovalView.classList.remove("hidden");
      renderReadyForApproval();
    }
  }

  function formatDuration(ms) {
    if (!ms) return "—";
    const mins = Math.floor(ms / 60000);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs}h ${mins % 60}m`;
    return `${mins}m`;
  }

  async function renderStats() {
    const view = document.getElementById("statsView");

    const stats = await api("/stats");

    // Empty state
    if (!stats.totalTasks) {
      view.innerHTML = `
        <div class="stats-empty">
          <div class="stats-empty-icon">📊</div>
          <h3>No tasks yet</h3>
          <p>Your stats will appear here once tasks are created and completed. Head over to the Board to create your first task.</p>
        </div>
      `;
      return;
    }

    const statusBars = Object.entries(stats.byStatus || {}).map(([s, c]) =>
      `<div class="stat-bar"><span class="stat-label">${s}</span><div class="stat-fill" style="width:${Math.max(5, (c / Math.max(stats.totalTasks, 1)) * 100)}%;background:var(--col-${s},#666)"></div><span class="stat-val">${c}</span></div>`
    ).join("");

    const agentRows = (stats.agentStats || []).map(a =>
      `<tr>
        <td><strong>${esc(a.agentId)}</strong></td>
        <td>${a.totalTasks}</td>
        <td>${a.completed}</td>
        <td>${a.failed}</td>
        <td>${a.inProgress}</td>
        <td>${formatDuration(a.avgDurationMs)}</td>
        <td>${(a.completionRate * 100).toFixed(0)}%</td>
      </tr>`
    ).join("");

    const oldest = stats.oldestDoingTask;
    const alertHtml = oldest && oldest.ageMs > 7200000
      ? `<div class="stat-alert">⚠ Stuck task: "${esc(oldest.title)}" (${esc(oldest.assignee)}) — in progress for ${formatDuration(oldest.ageMs)}</div>`
      : "";

    view.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">${stats.totalTasks}</div>
          <div class="stat-title">Total Tasks</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${(stats.completionRate * 100).toFixed(0)}%</div>
          <div class="stat-title">Completion Rate</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${formatDuration(stats.avgDurationMs)}</div>
          <div class="stat-title">Avg Duration</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${stats.byStatus?.failed || 0}</div>
          <div class="stat-title">Failed</div>
        </div>
      </div>
      ${alertHtml}
      <h3 style="margin:24px 0 12px">Status Breakdown</h3>
      <div class="stat-bars">${statusBars}</div>
      <h3 style="margin:24px 0 12px">Agent Performance</h3>
      <table class="stats-table">
        <thead><tr><th>Agent</th><th>Total</th><th>Done</th><th>Failed</th><th>Active</th><th>Avg Time</th><th>Rate</th></tr></thead>
        <tbody>${agentRows || '<tr><td colspan="7">No agent data yet</td></tr>'}</tbody>
      </table>
    `;
  }

  function renderBoard() {
    const board = document.getElementById("boardView");
    board.innerHTML = COLUMNS.map((col) => {
      let tasks = state.tasks.filter((t) => t.column === col);
      // Apply agent filter if set
      if (state.filterAgent) {
        tasks = tasks.filter((t) => t.assignee === state.filterAgent);
      }
      return `
        <div class="column" data-col="${col}">
          <div class="column-header">
            <span><span class="dot" style="background:var(--col-${col})"></span>${COL_LABELS[col]}</span>
            <span class="count">${tasks.length}</span>
          </div>
          <div class="column-body" data-col="${col}">
            ${tasks.map(renderCard).join("")}
            <button class="add-task-btn" data-col="${col}">+ Add task</button>
          </div>
        </div>`;
    }).join("");

    // Drag & drop
    board.querySelectorAll(".card").forEach(initDrag);
    board.querySelectorAll(".column-body").forEach(initDrop);

    // Click to open detail
    board.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("click", (e) => {
        if (e.defaultPrevented) return;
        openDetail(card.dataset.id);
      });
    });

    // Add task buttons
    board.querySelectorAll(".add-task-btn").forEach((btn) => {
      btn.addEventListener("click", () => showTaskModal(btn.dataset.col));
    });
  }

  function getUnresolvedDeps(task) {
    if (!task.dependencies || !task.dependencies.length) return [];
    return task.dependencies
      .map((depId) => state.tasks.find((t) => t.id === depId))
      .filter((dep) => dep && dep.column !== "done");
  }

  function renderCard(task) {
    const priorityClass = `badge-priority-${task.priority}`;
    const tags = task.tags.map((t) => `<span class="badge badge-tag">${esc(t)}</span>`).join("");
    const comments = task.comments.length ? `<span class="card-comments">${task.comments.length} comment${task.comments.length > 1 ? "s" : ""}</span>` : "";

    // Check unresolved dependencies
    const blockers = getUnresolvedDeps(task);
    const lockHtml = blockers.length
      ? `<span class="badge badge-locked" title="Blocked by: ${blockers.map((b) => esc(b.title)).join(", ")}">&#x1F512; ${blockers.length} dep${blockers.length > 1 ? "s" : ""}</span>`
      : "";

    // Check if deadline is overdue
    let overdueClass = "";
    let deadlineHtml = "";
    if (task.deadline) {
      const deadlineDate = new Date(task.deadline);
      const now = new Date();
      const isOverdue = deadlineDate < now && task.column !== "done";
      overdueClass = isOverdue ? "card-overdue" : "";
      const deadlineStr = deadlineDate.toLocaleDateString();
      deadlineHtml = `<span class="badge badge-deadline ${isOverdue ? "badge-overdue" : ""}">${isOverdue ? "⚠ " : ""}📅 ${deadlineStr}</span>`;
    }

    return `
      <div class="card ${overdueClass} ${blockers.length ? "card-blocked" : ""}" draggable="true" data-id="${task.id}">
        <div class="card-title">${lockHtml ? lockHtml + " " : ""}${esc(task.title)}</div>
        ${task.description ? `<div class="card-desc">${esc(task.description)}</div>` : ""}
        <div class="card-meta">
          ${task.assignee ? `<span class="badge badge-assignee">${esc(task.assignee)}</span>` : ""}
          <span class="badge ${priorityClass}">${task.priority}</span>
          ${tags}
          ${deadlineHtml}
          ${comments}
        </div>
      </div>`;
  }

  function renderAgents() {
    const view = document.getElementById("agentsView");
    if (!state.agents.length) {
      view.innerHTML = '<div style="padding:24px;color:var(--text-muted)">No agents registered. Use the API to register agents.</div>';
      return;
    }
    view.innerHTML = state.agents.map((a) => {
      const taskCount = state.tasks.filter((t) => t.assignee === a.id).length;
      const isOnline = a.status === "online";
      const displayRole = a.role || "worker";
      return `
        <div class="agent-card">
          <div class="agent-card-header">
            <div class="agent-status-dot ${isOnline ? "online" : "offline"}"></div>
            <span class="agent-card-name">${esc(a.name || a.id)}</span>
          </div>
          <div class="agent-card-role">${esc(displayRole)}</div>
          <div class="agent-card-stats">
            <span class="agent-card-stat"><strong>${taskCount}</strong> task${taskCount !== 1 ? "s" : ""}</span>
            <span class="agent-card-stat"><strong>${isOnline ? "Online" : "Offline"}</strong></span>
          </div>
          <div class="agent-card-caps">
            ${(a.capabilities || []).map((c) => `<span class="badge">${esc(c)}</span>`).join("")}
            ${(!a.capabilities || !a.capabilities.length) ? '<span class="badge" style="opacity:0.4">no capabilities</span>' : ""}
          </div>
        </div>`;
    }).join("");
  }

  // --- Drag & Drop ---
  let draggedId = null;

  function initDrag(card) {
    card.addEventListener("dragstart", (e) => {
      draggedId = card.dataset.id;
      card.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });
    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      draggedId = null;
    });
  }

  function initDrop(colBody) {
    colBody.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      colBody.classList.add("drag-over");
    });
    colBody.addEventListener("dragleave", () => {
      colBody.classList.remove("drag-over");
    });
    colBody.addEventListener("drop", async (e) => {
      e.preventDefault();
      colBody.classList.remove("drag-over");
      if (!draggedId) return;
      const newCol = colBody.dataset.col;
      await api("/tasks/" + draggedId + "/move", {
        method: "POST",
        body: JSON.stringify({ column: newCol }),
      });
      await loadTasks();
      render();
    });
  }

  // --- Task Detail Panel ---
  const detailPanel = document.getElementById("detailPanel");
  const detailContent = document.getElementById("detailContent");
  let threadInterval = null;
  let currentDetailTaskId = null;

  document.getElementById("closeDetail").addEventListener("click", () => {
    detailPanel.classList.remove("open");
    if (threadInterval) { clearInterval(threadInterval); threadInterval = null; }
    currentDetailTaskId = null;
  });

  function renderThread(comments) {
    const threadEl = document.getElementById("threadMessages");
    if (!threadEl) return;
    if (!comments.length) {
      threadEl.innerHTML = '<div class="thread-empty">No comments yet. Start the conversation!</div>';
      return;
    }
    threadEl.innerHTML = comments.map((c) =>
      `<div class="thread-msg">
        <div class="thread-msg-header">
          <span class="thread-msg-author">${esc(c.author)}</span>
          <span class="thread-msg-time">${new Date(c.at).toLocaleString()}</span>
        </div>
        <div class="thread-msg-text">${esc(c.text)}</div>
      </div>`
    ).join("");
    threadEl.scrollTop = threadEl.scrollHeight;
  }

  async function refreshThread(taskId) {
    try {
      const comments = await api("/tasks/" + taskId + "/comments");
      if (currentDetailTaskId === taskId) renderThread(comments);
    } catch (e) { /* ignore polling errors */ }
  }

  function openDetail(taskId) {
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task) return;
    currentDetailTaskId = taskId;

    detailContent.innerHTML = `
      <h2>${esc(task.title)}</h2>
      <div class="detail-field"><label>Status</label><div class="value"><span class="badge" style="background:var(--col-${task.column});color:#000">${task.column}</span></div></div>
      <div class="detail-field"><label>Assignee</label><div class="value">${esc(task.assignee || "Unassigned")}</div></div>
      <div class="detail-field"><label>Priority</label><div class="value"><span class="badge badge-priority-${task.priority}">${task.priority}</span></div></div>
      <div class="detail-field"><label>Description</label><div class="value">${esc(task.description || "No description")}</div></div>
      <div class="detail-field"><label>Tags</label><div class="value">${task.tags.map((t) => `<span class="badge badge-tag">${esc(t)}</span>`).join(" ") || "None"}</div></div>
      <div class="detail-field"><label>Created by</label><div class="value">${esc(task.createdBy)}</div></div>
      <div class="detail-field"><label>Created</label><div class="value">${new Date(task.createdAt).toLocaleString()}</div></div>
      <div class="thread-panel">
        <label>Thread (${task.comments.length})</label>
        <div class="thread-messages" id="threadMessages"></div>
        <div class="thread-input">
          <input type="text" id="commentAuthor" placeholder="Author" class="thread-author-input">
          <div class="thread-send-row">
            <input type="text" id="commentText" placeholder="Type a message..." class="thread-text-input">
            <button class="btn btn-primary" id="addCommentBtn">Send</button>
          </div>
        </div>
      </div>
    `;

    renderThread(task.comments);

    // Send comment handler
    async function sendComment() {
      const author = document.getElementById("commentAuthor").value.trim();
      const text = document.getElementById("commentText").value.trim();
      if (!author || !text) return;
      document.getElementById("commentText").value = "";
      await api("/tasks/" + taskId + "/comments", {
        method: "POST",
        body: JSON.stringify({ author, text }),
      });
      await refreshThread(taskId);
      await loadTasks();
    }

    document.getElementById("addCommentBtn").addEventListener("click", sendComment);
    document.getElementById("commentText").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendComment(); }
    });

    // Auto-refresh thread every 10 seconds
    if (threadInterval) clearInterval(threadInterval);
    threadInterval = setInterval(() => refreshThread(taskId), 10000);

    detailPanel.classList.add("open");
  }

  async function renderReadyForApproval() {
    const view = document.getElementById("readyForApprovalView");
    view.innerHTML = `<h2>Plans Ready for Approval</h2><div id="readyForApprovalList" class="task-list"></div>`;
    const listEl = document.getElementById("readyForApprovalList");

    try {
      const plans = await fetch("http://100.122.158.123:8088/api/plans/ready-for-approval").then(res => res.json());

      if (!plans || plans.length === 0) {
        listEl.innerHTML = `<div class="empty-state">No plans currently ready for approval.</div>`;
        return;
      }

      listEl.innerHTML = plans.map(plan => `
        <div class="card">
          <div class="card-title">${esc(plan.title)}</div>
          <div class="card-desc">${esc(plan.review_reason || "No review reason provided.")}</div>
          <button class="btn btn-sm" onclick="openHermesKanbanTask('${plan.task_id}')">View Task</button>
        </div>
      `).join('');
    } catch (error) {
      listEl.innerHTML = `<div class="error-state">Error loading plans: ${esc(error.message)}</div>`;
      console.error("Error loading ready for approval plans:", error);
    }
  }

  function openHermesKanbanTask(taskId) {
    // This function will open the Hermes Kanban task in a new tab/window.
    // The Hermes Kanban API server is running at http://100.122.158.123:8088
    // The task view URL is not directly provided in the prompt, so we'll assume a sensible default.
    window.open(`http://100.122.158.123:8088/tasks/${taskId}`, '_blank');
  }

  // --- Modals ---
  function showModal(html) {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `<div class="modal">${html}</div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });
    return overlay;
  }

  function showTaskModal(column) {
    if (!state.currentProject) return;

    // Get agents for assignee suggestions
    const agentOptions = state.agents.length
      ? state.agents.map(a => `<option value="${a.id}">${a.name || a.id}</option>`).join("")
      : "";

    const overlay = showModal(`
      <h2>New Task</h2>
      <label>Title</label>
      <input type="text" id="modalTaskTitle" autofocus>
      <label>Description</label>
      <textarea id="modalTaskDesc"></textarea>
      <label>Assignee</label>
      <input type="text" id="modalTaskAssignee" list="agentList" placeholder="Type or select an agent">
      <datalist id="agentList">${agentOptions}</datalist>
      <label>Priority</label>
      <select id="modalTaskPriority">
        <option value="medium" selected>Medium</option>
        <option value="low">Low</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>
      <label>Tags (comma-separated)</label>
      <input type="text" id="modalTaskTags" placeholder="seo, audit">
      <div class="modal-actions">
        <button class="btn" id="modalCancel">Cancel</button>
        <button class="btn btn-primary" id="modalConfirm">Create</button>
      </div>
    `);
    overlay.querySelector("#modalCancel").addEventListener("click", () => overlay.remove());
    overlay.querySelector("#modalConfirm").addEventListener("click", async () => {
      const title = overlay.querySelector("#modalTaskTitle").value.trim();
      if (!title) return;
      const tags = overlay.querySelector("#modalTaskTags").value.trim();
      await api("/tasks", {
        method: "POST",
        body: JSON.stringify({
          projectId: state.currentProject,
          title,
          description: overlay.querySelector("#modalTaskDesc").value.trim(),
          assignee: overlay.querySelector("#modalTaskAssignee").value.trim(),
          priority: overlay.querySelector("#modalTaskPriority").value,
          tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
          column: column || "backlog",
        }),
      });
      overlay.remove();
      await loadTasks();
      render();
    });
  }

  document.getElementById("newTaskBtn").addEventListener("click", () => showTaskModal("backlog"));

  // --- Escape ---
  function esc(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // --- Init ---
  refresh();

  // Auto-refresh every 5s
  setInterval(async () => {
    await loadTasks();
    if (state.currentView === "board") {
      renderBoard();
      showOnboarding();
    }
  }, 5000);
})();
