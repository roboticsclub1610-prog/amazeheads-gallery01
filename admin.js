const API_ORIGIN = 'https://YOUR_WORKER_URL';
const pass = localStorage.getItem('amaze_admin_pass');
if(!pass){
  alert('Not logged in - redirecting to homepage');
  window.location.href = '/';
}

const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const folderPathInput = document.getElementById('folderPath');
const refreshBtn = document.getElementById('refreshBtn');
const createFolderBtn = document.getElementById('createFolderBtn');
const createFolderName = document.getElementById('createFolderName');
const logoutBtn = document.getElementById('logoutBtn');

async function list(prefix=''){
  fileList.innerHTML = 'Loading…';
  try {
    const r = await fetch(API_ORIGIN + '/api/list?prefix=' + encodeURIComponent(prefix), {
      headers: { 'x-admin-password': pass }
    });
    const j = await r.json();
    renderList(j.objects || []);
  } catch(e){
    fileList.innerHTML = 'Failed to list';
  }
}

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
  });
}

async function deleteObj(key){
  if(!confirm('Delete ' + key + ' ?')) return;
  await fetch(API_ORIGIN + '/api/delete', {
    method: 'POST',
    headers: {'content-type':'application/json', 'x-admin-password': pass},
    body: JSON.stringify({ key })
  });
  list(folderPathInput.value);
}

async function renameObj(key, newKey){
  await fetch(API_ORIGIN + '/api/rename', {
    method: 'POST',
    headers: {'content-type':'application/json', 'x-admin-password': pass},
    body: JSON.stringify({ key, newKey })
  });
  list(folderPathInput.value);
}

async function uploadFiles(files, prefix){
  const fd = new FormData();
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
