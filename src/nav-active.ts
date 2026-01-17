// Set active navigation item based on current page
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach((item) => {
        const href = item.getAttribute('href');
        if (href) {
            // Check if current path contains the href (for service pages)
            if (currentPath.includes('mouthpiece') && href.includes('ai')) {
                item.classList.add('active');
            } else if (currentPath.includes('trial') && href.includes('ai')) {
                item.classList.add('active');
            } else if (currentPath.includes('restaurant') && href.includes('ai')) {
                item.classList.add('active');
            } else if (href.includes(currentPath)) {
                item.classList.add('active');
            }
        }
    });
});
