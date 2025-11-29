// PUBLIC GALLERY JS
const API = "https://amazeheads-api.roboticsclub1610.workers.dev";

async function loadGallery() {
  try {
    const res = await fetch(`${API}/api/list`);
    const files = await res.json();

    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";

    files.forEach(f => {
      const url = `${API.replace("/api", "")}/${f.filename}`;

      gallery.innerHTML += `
        <div class="card">
          <img src="${url}" loading="lazy">
          <div class="info">${f.filename}</div>
        </div>`;
    });

  } catch (err) {
    console.error(err);
    document.getElementById("gallery").innerHTML =
      "<p>Unable to load images</p>";
  }
}

document.addEventListener("DOMContentLoaded", loadGallery);
