import "lite-youtube-embed";
import BasePage from "./base-page";
import Lightbox from "fslightbox";
import ProductImageGallery from "./product-image-gallery";
import { selectDisplayText } from "./partials/vehicle-dropdowns";
window.fslightbox = Lightbox;

class Home extends BasePage {
    onReady() {
        this.initFeaturedTabs();
        this.initDealsSection();
        this.initTopBannerCountdown();
        this.initVehicleSearch();
        this.initMobexHeroSlider();
        this.initMobexRsParallax();
        this.initMobexFeaturedBrandsCarousel();

        // Initialize product image gallery
        new ProductImageGallery();
    }

    /**
     * Mobex reference hero: 4 slides, prev/next, dots, autoplay 7s, swipe (matches reference script.js).
     */
    initMobexHeroSlider() {
        const root = document.querySelector('.mobex-hero-slider');
        if (!root || root.dataset.mobexHeroBound === '1') {
            return;
        }

        const wrap = root.parentElement;
        const slides = root.querySelectorAll('.mobex-hero-slide');
        const dots = wrap ? wrap.querySelectorAll('.mobex-hero-dots .dot') : [];
        const prevBtn = wrap?.querySelector('.mobex-hero-prev') ?? null;
        const nextBtn = wrap?.querySelector('.mobex-hero-next') ?? null;
        if (!wrap || !slides.length || !dots.length) {
            return;
        }

        root.dataset.mobexHeroBound = '1';

        let idx = 0;
        let autoTimer;

        const restartMobexRsAnimations = (slide) => {
            if (!slide || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                return;
            }
            const animEls = slide.querySelectorAll('.mobex-rs-slot > img.mobex-rs-anim, .hero-text > *');
            animEls.forEach((el) => {
                el.style.animation = 'none';
            });
            void slide.offsetWidth;
            animEls.forEach((el) => {
                el.style.animation = '';
            });
        };

        const show = (i) => {
            const n = slides.length;
            if (!n) {
                return;
            }
            idx = ((i % n) + n) % n;
            slides.forEach((s, j) => {
                s.classList.toggle('active', j === idx);
            });
            dots.forEach((d, j) => {
                const on = j === idx;
                d.classList.toggle('active', on);
                d.setAttribute('aria-selected', on ? 'true' : 'false');
            });
            restartMobexRsAnimations(slides[idx]);
        };

        const next = () => show(idx + 1);

        const resetAuto = () => {
            clearInterval(autoTimer);
            autoTimer = setInterval(next, 7000);
        };

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                show(idx - 1);
                resetAuto();
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                show(idx + 1);
                resetAuto();
            });
        }

        dots.forEach((dot, j) => {
            dot.addEventListener('click', () => {
                show(j);
                resetAuto();
            });
        });

        let touchX = null;
        root.addEventListener(
            'touchstart',
            (e) => {
                touchX = e.touches[0].clientX;
            },
            { passive: true }
        );
        root.addEventListener(
            'touchend',
            (e) => {
                if (touchX == null) {
                    return;
                }
                const dx = e.changedTouches[0].clientX - touchX;
                touchX = null;
                if (Math.abs(dx) < 45) {
                    return;
                }
                if (dx > 0) {
                    show(idx - 1);
                } else {
                    show(idx + 1);
                }
                resetAuto();
            },
            { passive: true }
        );

        show(0);
        resetAuto();
    }

    /**
     * Featured brand logos: horizontal strip + prev/next (Mobex et_clients parity).
     */
    initMobexFeaturedBrandsCarousel() {
        const root = document.querySelector('[data-mobex-fb-carousel]');
        const viewport = root?.querySelector('[data-mobex-fb-viewport]');
        const prev = root?.querySelector('[data-mobex-fb-prev]');
        const next = root?.querySelector('[data-mobex-fb-next]');
        if (!root || !viewport || !prev || !next || root.dataset.mobexFbBound === '1') {
            return;
        }
        root.dataset.mobexFbBound = '1';

        const step = () => Math.max(220, Math.floor(viewport.clientWidth * 0.72));

        const scrollByDir = (dir) => {
            const delta = step() * dir;
            viewport.scrollBy({ left: delta, behavior: 'smooth' });
        };

        prev.addEventListener('click', () => {
            const rtl = document.documentElement.getAttribute('dir') === 'rtl';
            scrollByDir(rtl ? 1 : -1);
        });
        next.addEventListener('click', () => {
            const rtl = document.documentElement.getAttribute('dir') === 'rtl';
            scrollByDir(rtl ? -1 : 1);
        });
    }

    initMobexRsParallax() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        document.querySelectorAll('.mobex-rs-stage').forEach((stage) => {
            stage.addEventListener('mousemove', (e) => {
                const r = stage.getBoundingClientRect();
                if (r.width < 1 || r.height < 1) {
                    return;
                }
                const mx = (e.clientX - r.left) / r.width - 0.5;
                const my = (e.clientY - r.top) / r.height - 0.5;
                stage.style.setProperty('--mobex-rx', `${mx * 14}px`);
                stage.style.setProperty('--mobex-ry', `${my * 10}px`);
            });
            stage.addEventListener('mouseleave', () => {
                stage.style.setProperty('--mobex-rx', '0px');
                stage.style.setProperty('--mobex-ry', '0px');
            });
        });
    }

    /**
     * used in views/components/home/featured-products-style*.twig
     */
    initFeaturedTabs() {
        app.all('.tab-trigger', el => {
            el.addEventListener('click', ({ currentTarget: btn }) => {
                let id = btn.dataset.componentId;
                // btn.setAttribute('fill', 'solid');
                app.toggleClassIf(`#${id} .tabs-wrapper>div`, 'is-active opacity-0 translate-y-3', 'inactive', tab => tab.id == btn.dataset.target)
                    .toggleClassIf(`#${id} .tab-trigger`, 'is-active', 'inactive', tabBtn => tabBtn == btn);

                // fadeIn active tabe
                setTimeout(() => app.toggleClassIf(`#${id} .tabs-wrapper>div`, 'opacity-100 translate-y-0', 'opacity-0 translate-y-3', tab => tab.id == btn.dataset.target), 100);
            })
        });
        document.querySelectorAll('.s-block-tabs').forEach(block => block.classList.add('tabs-initialized'));
    }

    /**
     * Initialize Deals of the Week section
     * - Countdown timer
     * - Product slider (show 4 at a time, navigate through groups)
     */
    initDealsSection() {
        try {
            // Countdown Timer - Deals Section
            this.initDealsCountdown();
            
            // Product Slider - Show 4 products at a time
            this.initDealsProductSlider();
        } catch (error) {
            console.error('Error initializing deals section:', error);
        }
    }

    /**
     * Initialize countdown timer for deals section
     */
    initDealsCountdown() {
        const dealsTimerBoxes = document.querySelectorAll('.deals-countdown .timer-box');
        if (dealsTimerBoxes.length === 0) return;

        let dealsHours = parseInt(dealsTimerBoxes[0]?.textContent || '09', 10);
        let dealsMinutes = parseInt(dealsTimerBoxes[1]?.textContent || '20', 10);
        let dealsSeconds = parseInt(dealsTimerBoxes[2]?.textContent || '54', 10);
        let dealsMilliseconds = parseInt(dealsTimerBoxes[3]?.textContent || '27', 10);

        const updateTimer = () => {
            dealsMilliseconds--;
            if (dealsMilliseconds < 0) {
                dealsMilliseconds = 99;
                dealsSeconds--;
                if (dealsSeconds < 0) {
                    dealsSeconds = 59;
                    dealsMinutes--;
                    if (dealsMinutes < 0) {
                        dealsMinutes = 59;
                        dealsHours--;
                        if (dealsHours < 0) {
                            dealsHours = 23;
                        }
                    }
                }
            }

            if (dealsTimerBoxes[0]) dealsTimerBoxes[0].textContent = String(dealsHours).padStart(2, '0');
            if (dealsTimerBoxes[1]) dealsTimerBoxes[1].textContent = String(dealsMinutes).padStart(2, '0');
            if (dealsTimerBoxes[2]) dealsTimerBoxes[2].textContent = String(dealsSeconds).padStart(2, '0');
            if (dealsTimerBoxes[3]) dealsTimerBoxes[3].textContent = String(dealsMilliseconds).padStart(2, '0');
        };

        // Update every 10ms for milliseconds
        setInterval(updateTimer, 10);
    }

    /**
     * Initialize countdown timer for top banner - Days, Hours, Minutes, Seconds
     */
    initTopBannerCountdown() {
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        
        if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

        let days = parseInt(daysEl.textContent || '09', 10);
        let hours = parseInt(hoursEl.textContent || '19', 10);
        let minutes = parseInt(minutesEl.textContent || '15', 10);
        let seconds = parseInt(secondsEl.textContent || '29', 10);

        const updateTimer = () => {
            seconds--;
            if (seconds < 0) {
                seconds = 59;
                minutes--;
                if (minutes < 0) {
                    minutes = 59;
                    hours--;
                    if (hours < 0) {
                        hours = 23;
                        days--;
                        if (days < 0) {
                            days = 0;
                        }
                    }
                }
            }

            daysEl.textContent = String(days).padStart(2, '0');
            hoursEl.textContent = String(hours).padStart(2, '0');
            minutesEl.textContent = String(minutes).padStart(2, '0');
            secondsEl.textContent = String(seconds).padStart(2, '0');
        };

        // Update every second
        setInterval(updateTimer, 1000);
    }

    /**
     * Initialize product slider for deals section
     * Shows 4 products at a time, navigates through groups
     */
    initDealsProductSlider() {
        const dealsSection = document.querySelector('.deals-section');
        if (!dealsSection) return;

        const dealsPrevBtn = dealsSection.querySelector('.deals-prev');
        const dealsNextBtn = dealsSection.querySelector('.deals-next');
        const productsList = dealsSection.querySelector('salla-products-list');

        if (!dealsPrevBtn || !dealsNextBtn || !productsList) return;

        let currentIndex = 0;
        let productCards = [];
        let totalGroups = 0;
        let productsPerPage = 4;

        // Function to get products per page based on screen size
        const getProductsPerPage = () => {
            const width = window.innerWidth;
            if (width <= 480) return 1;
            if (width <= 768) return 2;
            if (width <= 1200) return 3;
            return 4;
        };

        // Function to get all product cards
        const getProductCards = () => {
            return Array.from(dealsSection.querySelectorAll('.s-product-card-entry'));
        };

        // Function to show/hide products based on current index
        const updateProductVisibility = () => {
            if (productCards.length === 0) return;

            // Force 4 products per page on desktop (width > 1200px)
            productsPerPage = window.innerWidth > 1200 ? 4 : getProductsPerPage();
            totalGroups = Math.ceil(productCards.length / productsPerPage);

            // Ensure currentIndex is valid
            if (currentIndex >= totalGroups) {
                currentIndex = 0;
            }

            productCards.forEach((card, index) => {
                const startIndex = currentIndex * productsPerPage;
                const endIndex = startIndex + productsPerPage;
                
                // Show products in current range, hide others
                if (index >= startIndex && index < endIndex) {
                    card.style.display = 'flex';
                    card.style.visibility = 'visible';
                    card.style.opacity = '1';
                    card.classList.add('deals-product-visible');
                    card.classList.remove('deals-product-hidden');
                } else {
                    card.style.display = 'none';
                    card.style.visibility = 'hidden';
                    card.style.opacity = '0';
                    card.classList.add('deals-product-hidden');
                    card.classList.remove('deals-product-visible');
                }
            });

            // Update button states
            dealsPrevBtn.disabled = currentIndex === 0;
            dealsNextBtn.disabled = currentIndex >= totalGroups - 1;

            // Add visual feedback for disabled state
            if (dealsPrevBtn.disabled) {
                dealsPrevBtn.style.opacity = '0.5';
                dealsPrevBtn.style.cursor = 'not-allowed';
            } else {
                dealsPrevBtn.style.opacity = '1';
                dealsPrevBtn.style.cursor = 'pointer';
            }

            if (dealsNextBtn.disabled) {
                dealsNextBtn.style.opacity = '0.5';
                dealsNextBtn.style.cursor = 'not-allowed';
            } else {
                dealsNextBtn.style.opacity = '1';
                dealsNextBtn.style.cursor = 'pointer';
            }
        };

        // Function to initialize slider
        const initSlider = () => {
            productCards = getProductCards();
            
            if (productCards.length === 0) {
                // Products not loaded yet, try again
                setTimeout(initSlider, 500);
                return;
            }

            console.log('Deals slider: Found', productCards.length, 'products');

            // Force 4 products per page on desktop (width > 1200px)
            productsPerPage = window.innerWidth > 1200 ? 4 : getProductsPerPage();
            totalGroups = Math.ceil(productCards.length / productsPerPage);
            
            console.log('Deals slider: Showing', productsPerPage, 'products per page,', totalGroups, 'total groups');
            
            // Reset to first page
            currentIndex = 0;

            // Initially hide all products (they're all in DOM, just hidden)
            productCards.forEach((card, index) => {
                card.style.display = 'none';
                card.style.visibility = 'hidden';
                card.classList.add('deals-product-hidden');
            });

            // Show first group of 4 products
            updateProductVisibility();

            // Handle window resize to recalculate
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    // Reset to first page on resize to avoid showing empty pages
                    if (currentIndex >= totalGroups) {
                        currentIndex = 0;
                    }
                    updateProductVisibility();
                }, 250);
            });

            // Navigation handlers
            dealsPrevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentIndex > 0) {
                    currentIndex--;
                    updateProductVisibility();
                }
            });

            dealsNextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentIndex < totalGroups - 1) {
                    currentIndex++;
                    updateProductVisibility();
                }
            });
        };

        // Wait for Salla products to load
        // Try multiple approaches to detect when products are loaded
        const checkProductsLoaded = () => {
            productCards = getProductCards();
            
            console.log('Checking products loaded:', productCards.length, 'found');
            
            if (productCards.length > 0) {
                console.log('Products found, initializing slider...');
                initSlider();
            } else {
                // Check if products-list is hydrated/ready
                const productsListEl = productsList.querySelector('.s-products-list');
                if (productsList.classList.contains('hydrated') || productsListEl) {
                    console.log('Products list element found, waiting for cards...');
                    // Give it more time for cards to render
                    setTimeout(() => {
                        productCards = getProductCards();
                        if (productCards.length > 0) {
                            console.log('Products loaded after delay:', productCards.length);
                            initSlider();
                        } else {
                            setTimeout(checkProductsLoaded, 500);
                        }
                    }, 800);
                } else {
                    // Try again after a delay
                    setTimeout(checkProductsLoaded, 500);
                }
            }
        };

        // Start checking after a short delay to let Salla initialize
        setTimeout(checkProductsLoaded, 1000);

        // Also listen for Salla ready event if available
        if (typeof salla !== 'undefined' && salla.onReady) {
            salla.onReady(() => {
                console.log('Salla ready, checking products...');
                setTimeout(checkProductsLoaded, 500);
            });
        }

        // Also listen for DOM mutations to catch when products are added
        if (typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver(() => {
                productCards = getProductCards();
                if (productCards.length > 0 && totalGroups === 0) {
                    console.log('Products detected via mutation observer:', productCards.length);
                    initSlider();
                }
            });
            
            observer.observe(productsList, {
                childList: true,
                subtree: true
            });
        }
    }

    /**
     * Initialize vehicle search functionality
     * Collects values from brand, model, year, engine, trim fields
     * Combines them into a search query and redirects to Salla search
     */
    initVehicleSearch() {
        const searchBtn = document.getElementById('vehicle-search-btn');
        if (!searchBtn) return;

        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Get all form field values
            const brand = selectDisplayText(document.getElementById('vehicle-brand'));
            const model = selectDisplayText(document.getElementById('vehicle-model'));
            const year = selectDisplayText(document.getElementById('vehicle-year'));

            const values = [brand, model, year];

            // Remove empty values
            const nonEmptyValues = values.filter(value => value && value.trim() !== '');

            // If no values selected, don't redirect
            if (nonEmptyValues.length === 0) {
                console.log('No vehicle search criteria selected');
                return;
            }

            // Join values with spaces
            const searchQuery = nonEmptyValues.join(' ');

            // Encode the query
            const encodedQuery = encodeURIComponent(searchQuery);

            // Redirect to Salla search
            const searchUrl = `/search?q=${encodedQuery}`;
            console.log('Redirecting to search:', searchUrl);
            window.location.href = searchUrl;
        });
    }
}

// home.js is only enqueued on the home template; Salla may report page.slug as something other than "index".
Home.initiateWhenReady();