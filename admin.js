// admin.js
const loginBtn = document.getElementById("loginBtn");
const loginMsg = document.getElementById("loginMsg");
const adminUI = document.getElementById("adminUI");
const loginRow = document.getElementById("loginRow");
const filesList = document.getElementById("filesList");
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const uploadStatus = document.getElementById("uploadStatus");
const folderInput = document.getElementById("folderInput");
const mkdirBtn = document.getElementById("mkdirBtn");
const folderSel = document.getElementById("folderSel");

let authHeader = null;

loginBtn.onclick = () => {
  const u = document.getElementById("user").value.trim();
  const p = document.getElementById("pass").value.trim();
  if (!u || !p) { loginMsg.textContent = "Enter credentials"; return; }
  authHeader = "Basic " + btoa(`${u}:${p}`);
  adminUI.style.display = "block";
  loginRow.style.display = "none";
  loadFoldersAndFiles();
};

async function loadFoldersAndFiles() {
  filesList.innerHTML = "Loading...";
  folderSel.innerHTML = `<option value="">Root</option>`;
  try {
    // list root to get files
    const res = await fetch(`${API_BASE}/api/list?prefix=`);
    if (!res.ok) throw new Error("List failed");
    const files = await res.json();
    renderFiles(files);

    // extract folders from filenames
    const folders = new Set();
    files.forEach(f => {
      const split = f.filename.split("/");
      if (split.length > 1) folders.add(split[0]);
    });
    folders.forEach(fn => {
      const opt = document.createElement("option");
      opt.value = fn; opt.textContent = fn;
      folderSel.appendChild(opt);
    });
  } catch (e) {
    filesList.innerHTML = "<p class='muted'>Unable to load files</p>";
  }
}

function renderFiles(files) {
  if (!files.length) { filesList.innerHTML = "<p class='muted'>No files</p>"; return; }
  filesList.innerHTML = "";
  files.forEach(f => {
    const row = document.createElement("div");
    row.className = "admin-row";
    const name = document.createElement("div"); name.textContent = f.filename; name.style.flex = "1";
    const view = document.createElement("a"); view.href = `${PUBLIC_R2_BASE}/${encodeURIComponent("uploads/" + f.filename)}`; view.target = "_blank"; view.innerText = "View";
    const renameBtn = document.createElement("button"); renameBtn.textContent = "Rename";
    renameBtn.onclick = async () => {
      const newName = prompt("New name (just filename):", f.filename);
      if (!newName) return;
      try {
        const r = await fetch(`${API_BASE}/api/rename`, {
          method: "POST",
          headers: {"Content-Type":"application/json","Authorization":authHeader},
          body: JSON.stringify({ oldName: f.filename, newName })
        });
        const jr = await r.json();
        if (!jr.ok) alert("Rename failed: "+(jr.error||""));
        else loadFoldersAndFiles();
      } catch (e) { alert("Rename error: "+e); }
    };
    const delBtn = document.createElement("button"); delBtn.textContent = "Delete";
    delBtn.onclick = async () => {
      if (!confirm("Delete " + f.filename + " ?")) return;
      try {
        const dres = await fetch(`${API_BASE}/api/delete`, {
          method: "POST",
          headers: {"Content-Type":"application/json","Authorization":authHeader},
          body: JSON.stringify({ name: f.filename })
        });
        const dj = await dres.json();
        if (!dj.ok) alert("Delete failed: " + (dj.error || ""));
        else loadFoldersAndFiles();
      } catch (e) { alert("Delete error: " + e); }
    };
    row.appendChild(name);
    row.appendChild(view);
    row.appendChild(renameBtn);
    row.appendChild(delBtn);
    filesList.appendChild(row);
  });
}

mkdirBtn.onclick = async () => {
  const name = folderInput.value.trim();
  if (!name) { alert("Enter folder name"); return; }
  try {
    const res = await fetch(`${API_BASE}/api/mkdir`, {
      method: "POST",
      headers: {"Content-Type":"application/json","Authorization":authHeader},
      body: JSON.stringify({ name })
    });
    const j = await res.json();
    if (!j.ok) alert("Create failed: "+(j.error||""));
    else { folderInput.value = ""; loadFoldersAndFiles(); }
  } catch (e) { alert("MKDIR error: "+e); }
};

uploadBtn.onclick = async () => {
  if (!fileInput.files.length) { uploadStatus.textContent = "Pick files first"; return; }
  const folder = folderSel.value;
  uploadStatus.textContent = "Uploading...";
  try {
    for (const f of fileInput.files) {
      const fd = new FormData();
      fd.append("file", f);
      fd.append("folder", folder);
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        headers: { "Authorization": authHeader },
        body: fd
      });
      const jr = await res.json();
      if (!jr.ok) throw new Error(jr.error || "Upload failed");
    }
    uploadStatus.textContent = "Upload complete";
    fileInput.value = "";
    loadFoldersAndFiles();
  } catch (e) {
    uploadStatus.textContent = "Upload error: " + (e.message || e);
  }
};
