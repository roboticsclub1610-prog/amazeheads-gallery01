// Frontend site JS - public gallery
const API_BASE = "https://amazeheads-api.roboticsclub1610.workers.dev"; // <--- change if needed

async function fetchList(){
  try{
    const res = await fetch(`${API_BASE}/api/list`);
    if(!res.ok) throw new Error("List failed");
    const files = await res.json();
    // if worker returns simple list of objects with key/url adjust accordingly
    renderGallery(files);
  }catch(e){
    console.error(e);
    document.getElementById('gallery')?.insertAdjacentHTML('beforeend','<p class="muted">Unable to load gallery.</p>');
  }
}

function renderGallery(files){
  const container = document.getElementById('gallery');
  if(!container) return;
  container.innerHTML = '';
  // Worker might return objects with 'filename' or 'key' and we need to build URL with R2_BASE_URL
  files.forEach(f=>{
    // try common properties
    const filename = f.filename || f.key || f.name || f.path;
    // if API returned full url field:
    const url = f.url || f.publicUrl || (filename ? `${API_BASE.replace('/api','')}/${filename}` : null);
    const imgUrl = url;
    const card = document.createElement('div'); card.className='card';
    card.innerHTML = `<img src="${imgUrl}" alt="${filename||''}" loading="lazy"><div style="padding:8px"><small>${filename||''}</small></div>`;
    container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', ()=> {
  fetchList();
});
