const menuToggle = document.querySelector('.site-header__toggle');
const navigation = document.querySelector('.site-header__navigation');
const navigationLinks = document.querySelectorAll('.site-header__link');
const siteHeader = document.querySelector('.site-header');

const scrollToSection = (targetId) => {
    const target = document.querySelector(targetId);

    if (!target) {
        return;
    }

    const headerOffset = siteHeader ? siteHeader.offsetHeight : 0;
    const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({
        top: Math.max(0, targetPosition),
        behavior: reducedMotion ? 'auto' : 'smooth'
    });
};

const internalLinks = document.querySelectorAll('a[href^="#"]');

internalLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
        const targetId = link.getAttribute('href');

        if (!targetId || targetId === '#') {
            return;
        }

        const target = document.querySelector(targetId);

        if (!target) {
            return;
        }

        event.preventDefault();
        scrollToSection(targetId);
        window.history.replaceState(null, '', targetId);
    });
});

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

const clientsCarousel = document.querySelector('.clients__carousel');

if (clientsCarousel) {
    const viewport = clientsCarousel.querySelector('.clients__viewport');
    const track = clientsCarousel.querySelector('.clients__track');
    const previousButton = clientsCarousel.querySelector('.clients__control--prev');
    const nextButton = clientsCarousel.querySelector('.clients__control--next');
    const originalCards = Array.from(track.querySelectorAll('.client-card'));
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const autoplayDelay = 4500;
    let visibleCount = 1;
    let currentIndex = 0;
    let autoplayId = null;
    let isAnimating = false;
    let rebuildTimeoutId = null;

    const getVisibleCount = () => {
        if (window.innerWidth >= 1024) {
            return 4;
        }

        if (window.innerWidth >= 768) {
            return 3;
        }

        return 1;
    };

    const setTransition = (enabled) => {
        track.style.transition = enabled && !reducedMotionQuery.matches
            ? 'transform 500ms ease'
            : 'none';
    };

    const updatePosition = () => {
        const activeCard = track.children[currentIndex];

        if (!activeCard) {
            return;
        }

        track.style.transform = `translate3d(-${activeCard.offsetLeft}px, 0, 0)`;
    };

    const createClones = () => {
        const firstCards = originalCards.slice(0, visibleCount);
        const lastCards = originalCards.slice(-visibleCount);

        lastCards.reverse().forEach((card) => {
            const clone = card.cloneNode(true);
            clone.dataset.carouselClone = 'true';
            clone.setAttribute('aria-hidden', 'true');
            track.prepend(clone);
        });

        firstCards.forEach((card) => {
            const clone = card.cloneNode(true);
            clone.dataset.carouselClone = 'true';
            clone.setAttribute('aria-hidden', 'true');
            track.append(clone);
        });
    };

    const buildCarousel = () => {
        visibleCount = getVisibleCount();
        track.querySelectorAll('[data-carousel-clone="true"]').forEach((clone) => {
            clone.remove();
        });

        createClones();
        currentIndex = visibleCount;
        isAnimating = false;
        setTransition(false);
        updatePosition();

        requestAnimationFrame(() => {
            if (!reducedMotionQuery.matches) {
                setTransition(true);
            }
        });
    };

    const goTo = (index) => {
        if (isAnimating || originalCards.length <= visibleCount) {
            return;
        }

        currentIndex = index;
        isAnimating = true;
        setTransition(true);
        updatePosition();
    };

    const resetAutoplay = () => {
        if (autoplayId) {
            window.clearInterval(autoplayId);
        }

        if (reducedMotionQuery.matches || originalCards.length <= visibleCount) {
            autoplayId = null;
            return;
        }

        autoplayId = window.setInterval(() => {
            goTo(currentIndex + 1);
        }, autoplayDelay);
    };

    const stopAutoplay = () => {
        if (autoplayId) {
            window.clearInterval(autoplayId);
            autoplayId = null;
        }
    };

    const handleTransitionEnd = (event) => {
        if (event.propertyName !== 'transform') {
            return;
        }

        isAnimating = false;

        const firstCloneIndex = visibleCount + originalCards.length;
        const lastCloneIndex = visibleCount - 1;

        if (currentIndex >= firstCloneIndex) {
            currentIndex = visibleCount;
            setTransition(false);
            updatePosition();

            requestAnimationFrame(() => {
                setTransition(true);
            });
        } else if (currentIndex <= lastCloneIndex) {
            currentIndex = visibleCount + originalCards.length - 1;
            setTransition(false);
            updatePosition();

            requestAnimationFrame(() => {
                setTransition(true);
            });
        }
    };

    previousButton?.addEventListener('click', () => {
        goTo(currentIndex - 1);
        resetAutoplay();
    });

    nextButton?.addEventListener('click', () => {
        goTo(currentIndex + 1);
        resetAutoplay();
    });

    track.addEventListener('transitionend', handleTransitionEnd);

    clientsCarousel.addEventListener('mouseenter', stopAutoplay);
    clientsCarousel.addEventListener('mouseleave', resetAutoplay);

    clientsCarousel.addEventListener('focusin', stopAutoplay);
    clientsCarousel.addEventListener('focusout', (event) => {
        if (!clientsCarousel.contains(event.relatedTarget)) {
            resetAutoplay();
        }
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoplay();
        } else {
            resetAutoplay();
        }
    });

    const handleMotionPreferenceChange = () => {
        stopAutoplay();
        setTransition(true);
        resetAutoplay();
    };

    if (reducedMotionQuery.addEventListener) {
        reducedMotionQuery.addEventListener('change', handleMotionPreferenceChange);
    } else {
        reducedMotionQuery.addListener(handleMotionPreferenceChange);
    }

    window.addEventListener('resize', () => {
        const nextVisibleCount = getVisibleCount();

        if (nextVisibleCount === visibleCount) {
            return;
        }

        window.clearTimeout(rebuildTimeoutId);
        rebuildTimeoutId = window.setTimeout(() => {
            stopAutoplay();
            buildCarousel();
            resetAutoplay();
        }, 150);
    });

    buildCarousel();
    resetAutoplay();
}

const companyNumbers = document.querySelector('.company-numbers');
const companyStatNumbers = document.querySelectorAll('.company-stat__number[data-counter], .company-stat__number[data-target]');

if (companyNumbers && companyStatNumbers.length) {
    const animationDuration = 1500;
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let hasAnimated = false;

    const getTargetValue = (numberElement) => Number(
        numberElement.dataset.target ?? numberElement.dataset.counter
    );

    const setFinalValues = () => {
        companyStatNumbers.forEach((numberElement) => {
            const target = getTargetValue(numberElement);
            numberElement.textContent = `+${target}`;
        });
    };

    const animateNumbers = () => {
        if (hasAnimated) {
            return;
        }

        hasAnimated = true;

        if (reducedMotionQuery.matches) {
            setFinalValues();
            return;
        }

        const startTime = performance.now();

        const updateNumbers = (currentTime) => {
            const progress = Math.min(
                (currentTime - startTime) / animationDuration,
                1
            );

            const easedProgress = 1 - Math.pow(1 - progress, 3);

            companyStatNumbers.forEach((numberElement) => {
                const target = getTargetValue(numberElement);
                const currentValue = Math.round(target * easedProgress);

                numberElement.textContent = `+${currentValue}`;
            });

            if (progress < 1) {
                window.requestAnimationFrame(updateNumbers);
                return;
            }

            setFinalValues();
        };

        window.requestAnimationFrame(updateNumbers);
    };

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            (entries, currentObserver) => {
                if (!entries.some((entry) => entry.isIntersecting)) {
                    return;
                }

                animateNumbers();
                currentObserver.disconnect();
            },
            { threshold: 0.35 }
        );

        observer.observe(companyNumbers);
    } else {
        animateNumbers();
    }
}
