let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('dynamic-content');
    const authButtons = document.getElementById('auth-buttons');
    const isAdminPage = window.location.pathname.includes('admin.html');

    // Load trạng thái đăng nhập
    const saved = localStorage.getItem('currentUser');
    if (saved) currentUser = JSON.parse(saved);

    // Chỉ render navbar nếu có auth-buttons (cho user page)
    if (authButtons) {
        renderNavbar();
    }
    
    // Xác định trang mặc định dựa trên loại page hiện tại
    const defaultPage = isAdminPage ? 'danh-sach-kh.html' : 'trang-chu.html';
    loadPage(defaultPage);

    // Click menu (navbar & static footer)
    document.querySelectorAll('.nav-item[data-page], .footer-col a[data-page]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            loadPage(link.getAttribute('data-page'));
        });
    });

    function renderNavbar() {
    const authButtons = document.getElementById('auth-buttons');
    
    if (currentUser) {
        authButtons.innerHTML = `
            <span style="color:#6d28d9; font-weight:700; margin-right:15px;">👤 ${currentUser.name}</span>
            <button onclick="logout()" class="btn-logout">Đăng xuất</button>`;
    } else {
        authButtons.innerHTML = `
            <a href="login-register.html" class="btn-login">Đăng nhập</a>
            <a href="login-register.html" class="btn-register">Đăng ký</a>`;
    }
}

    window.logout = function() {
        currentUser = null;
        localStorage.removeItem('currentUser');
        renderNavbar();
        loadPage('trang-chu.html');
    };

    window.handleLogin = function(role, name) {
        currentUser = { name: name, role: role };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        renderNavbar();
        if (role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'index.html';
        }
    };

    // ==================== LOAD PAGE (ĐÃ SỬA PATH) ====================
    async function loadPage(page) {
        contentArea.innerHTML = `<div style="padding:120px;text-align:center;color:#7c3aed;font-size:18px;">Đang tải...</div>`;

        try {
            // Kiểm tra page hiện tại để xác định folder (Admin hay User)
            const isAdminPage = window.location.pathname.includes('admin.html');
            const folder = isAdminPage ? 'Admin' : 'User';
            
            // Tạo URL đúng dựa trên document location
            const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
            const fileUrl = `${baseUrl}/Views/Fragments/${folder}/${page}`;
            
            // Thử fetch trước, nếu fail thì dùng XMLHttpRequest
            let html;
            try {
                const res = await fetch(fileUrl);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                html = await res.text();
            } catch (fetchError) {
                // Fallback: Dùng XMLHttpRequest cho file:// protocol
                console.warn("Fetch failed, trying XMLHttpRequest...");
                html = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.onload = () => {
                        if (xhr.status === 0 || (xhr.status >= 200 && xhr.status < 300)) {
                            resolve(xhr.responseText);
                        } else {
                            reject(new Error(`HTTP ${xhr.status}`));
                        }
                    };
                    xhr.onerror = () => reject(new Error("XHR failed"));
                    xhr.open('GET', fileUrl);
                    xhr.send();
                });
            }
            
            contentArea.innerHTML = html;

            // Attach event listeners cho các links data-page trong dynamic content
            contentArea.querySelectorAll('[data-page]').forEach(link => {
                link.addEventListener('click', e => {
                    e.preventDefault();
                    loadPage(link.getAttribute('data-page'));
                });
            });

            console.log(`✅ Đã load thành công: ${page}`);
        } catch (e) {
            console.error("❌ Lỗi load page:", e);
            contentArea.innerHTML = `
                <div style="padding:100px;color:#ef4444;text-align:center;">
                    <h3>❌ Không load được trang</h3>
                    <p><strong>${e.message}</strong></p>
                    <p style="font-size:12px;margin-top:10px;">File cố gắng load:<br><code>${window.location.href.substring(0, window.location.href.lastIndexOf('/'))}/Views/Fragments/${window.location.pathname.includes('admin.html') ? 'Admin' : 'User'}</code></p>
                </div>`;
        }
    }
});