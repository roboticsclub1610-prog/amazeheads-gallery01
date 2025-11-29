// ADMIN PANEL JS
const API = "https://amazeheads-api.roboticsclub1610.workers.dev";

// ---------- UPLOAD ----------
async function uploadMedia() {
  const fileInput = document.getElementById("fileInput");
  if (!fileInput.files.length) return alert("Select a file first");

  const form = new FormData();
  form.append("file", fileInput.files[0]);

  const res = await fetch(`${API}/api/upload`, {
    method: "POST",
    body: form
  });

  const json = await res.json();

  if (json.success) {
    alert("Uploaded successfully");
    loadAdminList();
  } else {
    alert("Upload failed");
  }
}

// ---------- LOAD LIST ----------
async function loadAdminList() {
  const res = await fetch(`${API}/api/list`);
  const files = await res.json();

  const wrap = document.getElementById("adminList");
  wrap.innerHTML = "";

  files.forEach(f => {
    wrap.innerHTML += `
      <div class="row">
        <span>${f.filename}</span>
        <button onclick="deleteMedia('${f.filename}')">Delete</button>
      </div>
    `;
  });
}

// ---------- DELETE ----------
async function deleteMedia(filename) {
  if (!confirm("Delete " + filename + "?")) return;

  const res = await fetch(`${API}/api/delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename })
  });

  const json = await res.json();
  if (json.success) {
    alert("Deleted");
    loadAdminList();
  }
}

document.addEventListener("DOMContentLoaded", loadAdminList);
