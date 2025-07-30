// menu.js
document.addEventListener('DOMContentLoaded', function() {
    // Мобильное меню
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
        
        // Закрытие меню при клике на ссылку
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    } else {
        console.error('Не найдены элементы меню');
    }
});