// app.js - public gallery
(async function () {
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "Loading...";
  try {
    const res = await fetch(`${API_BASE}/api/list?prefix=${encodeURIComponent(DEFAULT_FOLDER)}`);
    if (!res.ok) throw new Error("List failed");
    const files = await res.json();
    if (!files.length) {
      gallery.innerHTML = "<p class='muted'>No files yet.</p>";
      return;
    }
    gallery.innerHTML = "";
    files.forEach(f => {
      const url = `${PUBLIC_R2_BASE}/${encodeURIComponent("uploads/" + f.filename)}`;
      const ext = f.filename.split(".").pop().toLowerCase();
      const card = document.createElement("div");
      card.className = "card";
      if (["mp4","webm","ogg"].includes(ext)) {
        card.innerHTML = `<video controls src="${url}" preload="none"></video><div class="fname">${f.filename}</div>`;
      } else {
        card.innerHTML = `<img loading="lazy" src="${url}" alt="${f.filename}"><div class="fname">${f.filename}</div>`;
      }
      gallery.appendChild(card);
    });
  } catch (e) {
    console.error(e);
    gallery.innerHTML = "<p class='muted'>Unable to load gallery.</p>";
  }
})();
