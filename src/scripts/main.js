const menuToggle = document.querySelector('.site-header__toggle');
const navigation = document.querySelector('.site-header__navigation');
const navigationLinks = document.querySelectorAll('.site-header__link');

if (menuToggle && navigation) {
    const closeMenu = () => {
        navigation.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Abrir menu');
    };

    const toggleMenu = () => {
        const isOpen = navigation.classList.toggle('is-open');

        menuToggle.setAttribute('aria-expanded', String(isOpen));
        menuToggle.setAttribute(
            'aria-label',
            isOpen ? 'Fechar menu' : 'Abrir menu'
        );
    };

    menuToggle.addEventListener('click', toggleMenu);

    navigationLinks.forEach((link) => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMenu();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) {
            closeMenu();
        }
    });
}
