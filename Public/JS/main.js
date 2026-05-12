// ── API Config ────────────────────────────────────────────
const API_BASE = 'http://localhost:3000/api';

// ── State ─────────────────────────────────────────────────
let currentUser = null;

// ── Global Confirm Dialog ─────────────────────────────────
window.showConfirmDialog = ({ title = 'Xác nhận', message = 'Bạn có chắc chắn không?', icon = 'fa-circle-exclamation', confirmText = 'Xác nhận', cancelText = 'Hủy', onConfirm }) => {
    let modal = document.getElementById('global-confirm-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'global-confirm-modal';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.6);backdrop-filter:blur(4px);z-index:9999;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.2s;';
        modal.innerHTML = `
            <div style="background:#fff;border-radius:24px;padding:32px;width:90%;max-width:400px;text-align:center;box-shadow:0 20px 40px rgba(0,0,0,0.1);transform:translateY(20px);transition:transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275);">
                <div id="gcm-icon-wrapper" style="width:64px;height:64px;border-radius:50%;background:#f3e8ff;color:#7c3aed;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 20px;">
                    <i id="gcm-icon" class="fa-solid fa-circle-exclamation"></i>
                </div>
                <h3 id="gcm-title" style="font-size:20px;font-weight:800;color:#1e293b;margin-bottom:10px;">Xác nhận</h3>
                <p id="gcm-message" style="font-size:15px;color:#64748b;margin-bottom:28px;line-height:1.5;">Bạn có chắc chắn không?</p>
                <div style="display:flex;gap:12px;">
                    <button id="gcm-cancel" style="flex:1;padding:12px;border-radius:12px;border:none;background:#f1f5f9;color:#64748b;font-weight:700;font-size:15px;cursor:pointer;transition:0.2s;">Hủy</button>
                    <button id="gcm-confirm" style="flex:1;padding:12px;border-radius:12px;border:none;background:linear-gradient(135deg, #8b5cf6, #6d28d9);color:#fff;font-weight:700;font-size:15px;cursor:pointer;transition:0.2s;">Xác nhận</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Hover effects
        const btnCancel = document.getElementById('gcm-cancel');
        const btnConfirm = document.getElementById('gcm-confirm');
        btnCancel.onmouseover = () => btnCancel.style.background = '#e2e8f0';
        btnCancel.onmouseout = () => btnCancel.style.background = '#f1f5f9';
        btnConfirm.onmouseover = () => btnConfirm.style.opacity = '0.9';
        btnConfirm.onmouseout = () => btnConfirm.style.opacity = '1';
    }

    document.getElementById('gcm-title').textContent = title;
    document.getElementById('gcm-message').textContent = message;
    document.getElementById('gcm-cancel').textContent = cancelText;
    document.getElementById('gcm-confirm').textContent = confirmText;
    document.getElementById('gcm-icon').className = `fa-solid ${icon}`;

    const innerDiv = modal.querySelector('div');

    // Show
    modal.style.display = 'flex';
    // Trigger reflow
    void modal.offsetWidth;
    modal.style.opacity = '1';
    innerDiv.style.transform = 'translateY(0)';

    // Close function
    const close = () => {
        modal.style.opacity = '0';
        innerDiv.style.transform = 'translateY(20px)';
        setTimeout(() => modal.style.display = 'none', 200);
    };

    document.getElementById('gcm-cancel').onclick = close;
    document.getElementById('gcm-confirm').onclick = () => {
        close();
        if (onConfirm) onConfirm();
    };
};

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
    const isAdminPage  = window.location.pathname.startsWith('/admin');

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
                ? `<a href="/admin" class="btn-admin" title="Trang Admin">⚙️ Admin</a>`
                : '';
            const displayName = currentUser.full_name || currentUser.username || 'User';
            authButtons.innerHTML = `
                <span style="color:#6d28d9;font-weight:700;margin-right:10px;">👤 ${displayName}</span>
                ${adminBadge}
                <button onclick="logout()" style="background:var(--primary, #6d28d9);color:#fff;border:none;padding:8px 16px;border-radius:8px;font-weight:600;cursor:pointer;transition:0.2s;" onmouseover="this.style.background='var(--primary-hover, #5b21b6)'" onmouseout="this.style.background='var(--primary, #6d28d9)'">Đăng xuất</button>`;
        } else {
            authButtons.innerHTML = `
                <a href="/login" class="btn-login">Đăng nhập</a>
                <a href="/login" class="btn-register">Đăng ký</a>`;
        }
    }

    // ── Logout ────────────────────────────────────────────
    window.logout = () => {
        window.showConfirmDialog({
            title: 'Đăng xuất',
            message: 'Bạn có chắc chắn muốn rời khỏi hệ thống?',
            icon: 'fa-arrow-right-from-bracket',
            confirmText: 'Đăng xuất',
            onConfirm: () => {
                // Always clear local auth regardless of API response
                try { apiFetch('/auth/logout', { method: 'POST' }); } catch (_) {}
                currentUser = null;
                clearAuth();
                window.location.replace('/login');
            }
        });
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
            window.location.href = '/admin';
        } else {
            window.location.href = '/';
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
        window.location.href = '/';
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
    window.loadCourses = async (status) => {
        const query = status ? `?status=${status}` : '';
        const data  = await apiFetch(`/courses${query}`);
        return data.success ? data.data : [];
    };

    // ── Delete Course (Admin) ─────────────────────────────
    window.deleteCourse = async (id) => {
        const data = await apiFetch(`/courses/${id}`, { method: 'DELETE' });
        return data;
    };

    // ── Get single Course by ID ────────────────────────────
    window.getCourseById = async (id) => {
        const data = await apiFetch(`/courses/${id}`);
        return data.success ? data.data : null;
    };

    // ── Update Course (Admin) ──────────────────────────────
    window.updateCourse = async (id, payload) => {
        const data = await apiFetch(`/courses/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
        return data;
    };

    // ── Shared state: ID của khoá học đang chỉnh sửa ──────
    window.editingCourseId = null;

    // ── Shared state: bài học đang xem / chỉnh sửa ────────
    window.editingLessonId  = null;
    window.selectedCourseId = null; // Course đang xem bài học

    // ── Get Lessons by Course ─────────────────────────────
    window.getLessonsByCourse = async (courseId) => {
        const data = await apiFetch(`/lessons?course_id=${courseId}`);
        return data.success ? data.data : [];
    };

    // ── Get single Lesson by ID ───────────────────────────
    window.getLessonById = async (id) => {
        const data = await apiFetch(`/lessons/${id}`);
        return data.success ? data.data : null;
    };

    // ── Create Lesson (Admin) ─────────────────────────────
    window.createLesson = async (payload) => {
        const data = await apiFetch('/lessons', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        return data;
    };

    // ── Update Lesson (Admin) ─────────────────────────────
    window.updateLesson = async (id, payload) => {
        const data = await apiFetch(`/lessons/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
        return data;
    };

    // ── Delete Lesson (Admin) ─────────────────────────────
    window.deleteLesson = async (id) => {
        const data = await apiFetch(`/lessons/${id}`, { method: 'DELETE' });
        return data;
    };

    // ── Create Order (User) ───────────────────────────────
    window.createOrder = async (payload) => {
        const data = await apiFetch('/orders', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        return data;
    };

    // ── Load All Orders (Admin) ───────────────────────────
    window.loadOrders = async () => {
        const data = await apiFetch('/orders');
        return data.success ? data.data : [];
    };

    // ── Get Order Stats (Admin) ───────────────────────────
    window.getOrderStats = async () => {
        const data = await apiFetch('/orders/stats');
        return data.success ? data.data : null;
    };

    // ── Confirm Order (Admin) ─────────────────────────────
    window.confirmOrder = async (orderId) => {
        const data = await apiFetch(`/orders/${orderId}/confirm`, { method: 'PUT' });
        return data;
    };

    // ── Load Page (Fragment system) ───────────────────────
    async function loadPage(page) {
        if (!contentArea) return;
        contentArea.innerHTML = `<div style="padding:120px;text-align:center;color:#7c3aed;font-size:18px;">Đang tải...</div>`;

        try {
            const isAdmin  = window.location.pathname.startsWith('/admin');
            const folder   = isAdmin ? 'Admin' : 'User';
            const fileUrl  = `/views/Fragments/${folder}/${page}`;

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

            // ⚠️ innerHTML không tự chạy <script>. Phải clone & re-inject để thực thi.
            contentArea.querySelectorAll('script').forEach(oldScript => {
                const newScript = document.createElement('script');
                Array.from(oldScript.attributes).forEach(attr =>
                    newScript.setAttribute(attr.name, attr.value)
                );
                newScript.text = oldScript.innerHTML;
                oldScript.parentNode.replaceChild(newScript, oldScript);
            });

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