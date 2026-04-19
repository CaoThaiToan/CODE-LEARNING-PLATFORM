// ── API Config ────────────────────────────────────────────
const API_BASE = 'http://localhost:3000/api';

// ── State ─────────────────────────────────────────────────
let currentUser = null;

// ── Helpers ───────────────────────────────────────────────
const getToken  = ()         => localStorage.getItem('token');
const saveAuth  = (token, u) => { localStorage.setItem('token', token); localStorage.setItem('currentUser', JSON.stringify(u)); };
const clearAuth = ()         => { localStorage.removeItem('token'); localStorage.removeItem('currentUser'); };

const apiFetch = async (endpoint, options = {}) => {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    return res.json();
};

// ── DOM Ready ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const contentArea  = document.getElementById('dynamic-content');
    const authButtons  = document.getElementById('auth-buttons');
    const isAdminPage  = window.location.pathname.includes('admin.html');

    // Restore session from localStorage
    const saved = localStorage.getItem('currentUser');
    if (saved) currentUser = JSON.parse(saved);

    if (authButtons) renderNavbar();

    const defaultPage = isAdminPage ? 'danh-sach-kh.html' : 'trang-chu.html';
    loadPage(defaultPage);

    // Static nav/footer links
    document.querySelectorAll('.nav-item[data-page], .footer-col a[data-page]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            loadPage(link.getAttribute('data-page'));
        });
    });

    // ── Render Navbar ─────────────────────────────────────
    function renderNavbar() {
        if (!authButtons) return;
        if (currentUser) {
            const adminBadge = (currentUser.role_id === 1 || currentUser.role === 'Admin')
                ? `<a href="admin.html" class="btn-admin" title="Trang Admin">⚙️ Admin</a>`
                : '';
            const displayName = currentUser.full_name || currentUser.username || 'User';
            authButtons.innerHTML = `
                <span style="color:#6d28d9;font-weight:700;margin-right:10px;">👤 ${displayName}</span>
                ${adminBadge}
                <button onclick="logout()" style="background:var(--primary, #6d28d9);color:#fff;border:none;padding:8px 16px;border-radius:8px;font-weight:600;cursor:pointer;transition:0.2s;" onmouseover="this.style.background='var(--primary-hover, #5b21b6)'" onmouseout="this.style.background='var(--primary, #6d28d9)'">Đăng xuất</button>`;
        } else {
            authButtons.innerHTML = `
                <a href="login-register.html" class="btn-login">Đăng nhập</a>
                <a href="login-register.html" class="btn-register">Đăng ký</a>`;
        }
    }

    // ── Logout ────────────────────────────────────────────
    window.logout = async () => {
        await apiFetch('/auth/logout', { method: 'POST' });
        currentUser = null;
        clearAuth();
        renderNavbar();
        loadPage('trang-chu.html');
    };

    // ── Handle Login (gọi từ login-register.html) ─────────
    window.handleLogin = async (email, password) => {
        const data = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (!data.success) {
            return { success: false, message: data.message };
        }

        currentUser = data.user;
        saveAuth(data.token, data.user);
        renderNavbar();

        if (data.user.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'index.html';
        }
        return { success: true };
    };

    // ── Handle Register (gọi từ login-register.html) ──────
    window.handleRegister = async (name, email, password) => {
        const data = await apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });

        if (!data.success) {
            return { success: false, message: data.message };
        }

        currentUser = data.user;
        saveAuth(data.token, data.user);
        renderNavbar();
        window.location.href = 'index.html';
        return { success: true };
    };

    // ── Handle Add Course (Admin) ─────────────────────────
    window.handleAddCourse = async (courseData) => {
        const data = await apiFetch('/courses', {
            method: 'POST',
            body: JSON.stringify(courseData)
        });
        return data;
    };

    // ── Load Courses ──────────────────────────────────────
    window.loadCourses = async (type) => {
        const query = type ? `?type=${type}` : '';
        const data  = await apiFetch(`/courses${query}`);
        return data.success ? data.data : [];
    };

    // ── Delete Course (Admin) ─────────────────────────────
    window.deleteCourse = async (id) => {
        const data = await apiFetch(`/courses/${id}`, { method: 'DELETE' });
        return data;
    };

    // ── Load Page (Fragment system) ───────────────────────
    async function loadPage(page) {
        if (!contentArea) return;
        contentArea.innerHTML = `<div style="padding:120px;text-align:center;color:#7c3aed;font-size:18px;">Đang tải...</div>`;

        try {
            const isAdmin  = window.location.pathname.includes('admin.html');
            const folder   = isAdmin ? 'Admin' : 'User';
            const baseUrl  = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
            const fileUrl  = `${baseUrl}/Views/Fragments/${folder}/${page}`;

            // 1. Cập nhật trạng thái active cho menu bên trái (Sidebar)
            if (isAdmin) {
                document.querySelectorAll('.sidebar-nav .nav-item').forEach(nav => {
                    nav.classList.remove('active');
                    if (nav.getAttribute('data-page') === page) {
                        nav.classList.add('active');
                    }
                });
            }

            let html;
            try {
                const res = await fetch(fileUrl);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                html = await res.text();
            } catch {
                html = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.onload = () => (xhr.status === 0 || (xhr.status >= 200 && xhr.status < 300))
                        ? resolve(xhr.responseText) : reject(new Error(`HTTP ${xhr.status}`));
                    xhr.onerror = () => reject(new Error('XHR failed'));
                    xhr.open('GET', fileUrl);
                    xhr.send();
                });
            }

            contentArea.innerHTML = html;

            // Re-attach data-page links inside dynamic content
            contentArea.querySelectorAll('[data-page]').forEach(link => {
                link.addEventListener('click', e => {
                    e.preventDefault();
                    loadPage(link.getAttribute('data-page'));
                });
            });

            console.log(`✅ Loaded: ${page}`);
        } catch (e) {
            console.error('❌ Load page error:', e);
            contentArea.innerHTML = `
                <div style="padding:100px;color:#ef4444;text-align:center;">
                    <h3>❌ Không load được trang</h3>
                    <p><strong>${e.message}</strong></p>
                </div>`;
        }
    }

    // Expose loadPage globally so fragments can call it
    window.loadPage = loadPage;
});