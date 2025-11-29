<<<<<<< HEAD
// Admin scripts (simple). API endpoints must match your Worker.
const API_BASE = "https://amazeheads-api.roboticsclub1610.workers.dev"; // <--- change if your worker uses different path
const loginForm = document.getElementById('loginForm');
const dashboard = document.getElementById('dashboard');
const loginMsg = document.getElementById('loginMsg');

function show(msg){ loginMsg.textContent = msg; }

loginForm?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  show('Logging in...');
  try{
    // try login endpoint if exists
    const r = await fetch(`${API_BASE}/api/login`, {
      method:'POST', headers:{'content-type':'application/json'},
      body: JSON.stringify({ email, password })
    });
    const json = await r.json();
    if(!r.ok) throw new Error(json?.error || 'Login failed');
    // store token
    localStorage.setItem('amaze_token', json.token);
    show('Login successful');
    openDashboard();
  }catch(err){
    // If login endpoint doesn't exist, allow local fallback
    console.warn('login fallback', err);
    show('Login fallback: allowed (no server auth).');
    openDashboard();
  }
});

async function openDashboard(){
  loginForm.parentElement.classList.add('hidden');
  dashboard.classList.remove('hidden');
  await loadAlbums();
=======
const API_ORIGIN = 'https://amazeheads-api.roboticsclub1610.workers.dev/';
const pass = localStorage.getItem('amaze_admin_pass');
if(!pass){
  alert('Not logged in - redirecting to homepage');
  window.location.href = '/';
>>>>>>> a3e02af44a5b71eada5ddc2e6615c1a5169294fe
}

async function loadAlbums(){
  // try to read albums; fallback: show file list
  try{
    const r = await fetch(`${API_BASE}/api/list`);
    const files = await r.json();
    populateAlbums(files);
  }catch(e){
    console.error(e);
    show('Unable to load albums/files');
  }
}

<<<<<<< HEAD
function populateAlbums(files){
  const select = document.getElementById('albumSelect');
  select.innerHTML = '<option value="">Default</option>';
  // if Worker returns album grouping we would list them; otherwise just use default
  // show files in mediaList:
  const mediaList = document.getElementById('mediaList');
  mediaList.innerHTML = '';
  files.forEach(f=>{
    const key = f.filename || f.key || f.name;
    const url = f.url || f.publicUrl || `${API_BASE.replace('/api','')}/${key}`;
    const item = document.createElement('div'); item.className='media-item';
    item.innerHTML = `<img src="${url}" alt=""><div style="display:flex;gap:8px;margin-top:6px">
      <button data-k="${key}" class="del">Delete</button>
      <a href="${url}" target="_blank">Open</a>
    </div>`;
    mediaList.appendChild(item);
  });

  // attach delete
  document.querySelectorAll('.del').forEach(b=>{
    b.addEventListener('click', async (e)=>{
      const filename = e.target.dataset.k;
      if(!confirm('Delete '+filename+' ?')) return;
      try{
        const r = await fetch(`${API_BASE}/api/delete`, {
          method:'POST', headers:{'content-type':'application/json'},
          body: JSON.stringify({ filename })
        });
        const j = await r.json();
        if(!r.ok) throw new Error(j?.error||'delete failed');
        alert('deleted');
        loadAlbums();
      }catch(err){ alert('Delete failed'); console.error(err); }
    });
=======
function renderList(objects){
  fileList.innerHTML = '';
  if(objects.length === 0){ fileList.innerHTML = '<div>No files</div>'; return; }
  objects.forEach(obj=>{
    const row = document.createElement('div');
    row.style.display = 'flex'; row.style.alignItems='center'; row.style.gap = '12px';
    row.style.padding = '8px'; row.style.borderBottom = '1px solid #eee';
    const left = document.createElement('div'); left.style.flex='1';
    left.innerHTML = `<div style="font-weight:600">${obj.key}</div><div style="font-size:12px;color:#666">${obj.size || 0} bytes</div>`;
    const btnRename = document.createElement('button'); btnRename.textContent='Rename';
    const btnDelete = document.createElement('button'); btnDelete.textContent='Delete';
    btnRename.onclick = ()=> {
      const newn = prompt('New name for: ' + obj.key, obj.key);
      if(newn) renameObj(obj.key, newn);
    };
    btnDelete.onclick = ()=> deleteObj(obj.key);
    row.appendChild(left); row.appendChild(btnRename); row.appendChild(btnDelete);
    fileList.appendChild(row);
>>>>>>> a3e02af44a5b71eada5ddc2e6615c1a5169294fe
  });
}

// create album button (calls /api/create-album if exists)
document.getElementById('createAlbumBtn')?.addEventListener('click', async ()=>{
  const name = document.getElementById('albumName').value.trim();
  if(!name) return alert('Enter album name');
  try{
    const r = await fetch(`${API_BASE}/api/create-album`, {
      method: 'POST', headers:{'content-type':'application/json'},
      body: JSON.stringify({ name })
    });
    const j = await r.json();
    if(!r.ok) throw new Error(j?.error || 'create failed');
    alert('album created');
    loadAlbums();
  }catch(err){
    // fallback: no album support - Just inform
    alert('Album endpoint not available; using default folder.');
    loadAlbums();
  }
});

// upload
document.getElementById('uploadBtn')?.addEventListener('click', async ()=>{
  const fileInput = document.getElementById('fileInput');
  const albumId = document.getElementById('albumSelect').value;
  if(!fileInput.files.length) return alert('Choose a file');
  const fd = new FormData();
<<<<<<< HEAD
  fd.append('file', fileInput.files[0]);
  if(albumId) fd.append('albumId', albumId);
  try{
    const r = await fetch(`${API_BASE}/api/upload`, { method:'POST', body: fd });
    const j = await r.json();
    if(!r.ok) throw new Error(j?.error||'upload failed');
    alert('Uploaded');
    loadAlbums();
  }catch(err){ alert('Upload failed'); console.error(err); }
});
=======
  for(const f of files) fd.append('files', f);
  fd.append('prefix', prefix || '');
  const r = await fetch(API_ORIGIN + '/api/upload', {
    method:'POST',
    headers: { 'x-admin-password': pass },
    body: fd
  });
  const j = await r.json().catch(()=>({}));
  await list(prefix);
  alert(j.message || 'Uploaded');
}

createFolderBtn.addEventListener('click', async()=>{
  const name = createFolderName.value.trim();
  if(!name) return alert('enter name');
  const prefix = (folderPathInput.value || '').trim();
  await fetch(API_ORIGIN + '/api/create-folder', {
    method:'POST',
    headers:{ 'content-type':'application/json','x-admin-password': pass},
    body: JSON.stringify({ prefix, folderName: name })
  });
  createFolderName.value='';
  list(folderPathInput.value);
});

fileInput.addEventListener('change', ()=> uploadFiles(fileInput.files, folderPathInput.value));
dropArea.addEventListener('dragover', e=>{ e.preventDefault(); dropArea.style.background='#f7faff'; });
dropArea.addEventListener('dragleave', ()=>{ dropArea.style.background='transparent'; });
dropArea.addEventListener('drop', e=>{
  e.preventDefault();
  dropArea.style.background='transparent';
  const files = [...e.dataTransfer.files];
  uploadFiles(files, folderPathInput.value);
});

refreshBtn.addEventListener('click', ()=> list(folderPathInput.value));
logoutBtn.addEventListener('click', ()=> { localStorage.removeItem('amaze_admin_pass'); window.location.href = '/'; });

list('');
>>>>>>> a3e02af44a5b71eada5ddc2e6615c1a5169294fe
