async function apiJson(method, url, payload) {
  const user = sessionStorage.getItem('emr_user');
  const role = user ? JSON.parse(user).role : '';
  const opts = { method, headers: { 'Content-Type': 'application/json', 'x-user-role': role } };
  if (payload) opts.body = JSON.stringify(payload);
  const res = await fetch(url, opts);
  const text = await res.text();
  try { return { ok: res.ok, body: JSON.parse(text) }; } catch (e) { return { ok: res.ok, body: text }; }
}

function showAdminAlert(msg, type='warning') {
  document.getElementById('adminAlert').innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
}

async function loadUsers(params) {
  params = params || {};
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.role) qs.set('role', params.role);
  if (params.from) qs.set('from', params.from);
  if (params.to) qs.set('to', params.to);
  const url = '/api/users' + (qs.toString() ? ('?' + qs.toString()) : '');
  const r = await apiJson('GET', url);
  if (!r.ok) { showAdminAlert((r.body && r.body.error) || '목록을 불러오지 못했습니다', 'danger'); return; }
  const tbody = document.querySelector('#usersTable tbody');
  tbody.innerHTML = '';
  r.body.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${u.id}</td>
      <td>${u.loginId}</td>
      <td><input data-id="${u.id}" class="form-control form-control-sm u_name" value="${u.name || ''}"></td>
      <td><input data-id="${u.id}" class="form-control form-control-sm u_phone" value="${u.phone || ''}"></td>
      <td><input type="date" data-id="${u.id}" class="form-control form-control-sm u_birthDate" value="${u.birthDate ? u.birthDate.split('T')[0] : ''}"></td>
      <td><input data-id="${u.id}" class="form-control form-control-sm u_address" value="${u.address || ''}"></td>
      <td>
        <select data-id="${u.id}" class="form-select form-select-sm u_role">
          <option value="DOCTOR">의사</option>
          <option value="NURSE">간호사</option>
          <option value="PT">물리치료사</option>
          <option value="RADIOLOGIST">방사선사</option>
          <option value="OT">작업치료사</option>
          <option value="ADMIN">관리자</option>
        </select>
      </td>
      <td>${new Date(u.createdAt).toLocaleString()}</td>
      <td>
        <button class="btn btn-sm btn-success saveBtn" data-id="${u.id}">저장</button>
        <button class="btn btn-sm btn-warning resetBtn" data-id="${u.id}">초기화</button>
        <button class="btn btn-sm btn-danger delBtn" data-id="${u.id}">삭제</button>
      </td>
    `;
    tbody.appendChild(tr);
    const roleSel = tr.querySelector('.u_role'); if (roleSel) roleSel.value = u.role;
  });

  // attach handlers
  document.querySelectorAll('.saveBtn').forEach(b => b.addEventListener('click', async (ev) => {
    const id = ev.currentTarget.dataset.id;
    const name = document.querySelector(`.u_name[data-id="${id}"]`).value;
    const role = document.querySelector(`.u_role[data-id="${id}"]`).value;
    const phone = document.querySelector(`.u_phone[data-id="${id}"]`).value;
    const birthDate = document.querySelector(`.u_birthDate[data-id="${id}"]`).value || null;
    const address = document.querySelector(`.u_address[data-id="${id}"]`).value;
    const r = await apiJson('PUT', `/api/users/${id}`, { name, role, phone, birthDate, address });
    if (r.ok) showAdminAlert('저장되었습니다', 'success'); else showAdminAlert((r.body && r.body.error) || '저장 실패', 'danger');
    loadUsers();
  }));

  document.querySelectorAll('.delBtn').forEach(b => b.addEventListener('click', async (ev) => {
    const id = ev.currentTarget.dataset.id;
    if (!confirm('정말 삭제하십니까?')) return;
    const r = await apiJson('DELETE', `/api/users/${id}`);
    if (r.ok) showAdminAlert('삭제되었습니다', 'success'); else showAdminAlert((r.body && r.body.error) || '삭제 실패', 'danger');
    loadUsers();
  }));

  // reset password handlers
  document.querySelectorAll('.resetBtn').forEach(b => b.addEventListener('click', async (ev) => {
    const id = ev.currentTarget.dataset.id;
    if (!confirm('사용자 비밀번호를 임시 비밀번호로 초기화하시겠습니까?')) return;
    const r = await apiJson('POST', `/api/users/${id}/reset-password`);
    if (r.ok && r.body && r.body.tempPassword) {
      showAdminAlert('초기화 완료. 임시비밀번호: ' + r.body.tempPassword, 'info');
      try { await navigator.clipboard.writeText(r.body.tempPassword); } catch (e) {}
    } else {
      showAdminAlert((r.body && r.body.error) || '초기화 실패', 'danger');
    }
    loadUsers();
  }));
}

document.addEventListener('DOMContentLoaded', () => {
  // ensure only admin can access this page on client-side
  const user = sessionStorage.getItem('emr_user');
  if (!user || JSON.parse(user).role !== 'ADMIN') {
    document.body.innerHTML = '<div class="container py-5"><div class="alert alert-danger">관리자 권한이 필요합니다.</div></div>';
    return;
  }

  document.getElementById('addUserBtn').addEventListener('click', async () => {
    const loginId = document.getElementById('u_loginId').value.trim();
    const name = document.getElementById('u_name').value.trim();
    const phone = document.getElementById('u_phone').value.trim();
    const birthDate = document.getElementById('u_birthDate').value || null;
    const address = document.getElementById('u_address').value.trim();
    const role = document.getElementById('u_role').value;
    const password = document.getElementById('u_password').value;
    if (!loginId || !name || !password) { showAdminAlert('아이디/이름/비밀번호를 입력하세요', 'warning'); return; }
    // client-side validation
    if (phone) {
      const digits = phone.replace(/\D/g, '');
      if (digits.length < 9 || digits.length > 11) { showAdminAlert('전화번호 형식이 올바르지 않습니다', 'warning'); return; }
    }
    if (birthDate) {
      const d = new Date(birthDate);
      if (isNaN(d.getTime()) || d.getTime() > Date.now()) { showAdminAlert('생년월일 형식이 올바르지 않거나 미래 날짜입니다', 'warning'); return; }
    }
    const r = await apiJson('POST', '/api/users', { loginId, name, role, password, phone, birthDate, address });
    if (r.ok) { showAdminAlert('계정이 추가되었습니다', 'success'); document.getElementById('u_loginId').value=''; document.getElementById('u_name').value=''; document.getElementById('u_password').value=''; }
    else showAdminAlert((r.body && r.body.error) || '추가 실패', 'danger');
    loadUsers();
  });

  loadUsers();
  // wire filters
  const filterBtn = document.getElementById('filterBtn');
  if (filterBtn) filterBtn.addEventListener('click', () => {
    const q = document.getElementById('userSearch').value.trim();
    const role = document.getElementById('filterRole').value;
    const from = document.getElementById('filterFrom').value || null;
    const to = document.getElementById('filterTo').value || null;
    loadUsers({ q, role: role || null, from, to });
  });
  // Enter to search
  const userSearch = document.getElementById('userSearch');
  if (userSearch) userSearch.addEventListener('keydown', (e) => { if (e.key === 'Enter') document.getElementById('filterBtn').click(); });
});
