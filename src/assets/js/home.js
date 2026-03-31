import "lite-youtube-embed";
import BasePage from "./base-page";
import Lightbox from "fslightbox";
import ProductImageGallery from "./product-image-gallery";
window.fslightbox = Lightbox;

class Home extends BasePage {
    onReady() {
        this.initFeaturedTabs();
        this.initDealsSection();
        this.initTopBannerCountdown();
        this.initVehicleSearch();
        
        // Initialize product image gallery
        new ProductImageGallery();
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
            const brand = document.getElementById('vehicle-brand')?.value || '';
            const model = document.getElementById('vehicle-model')?.value || '';
            const year = document.getElementById('vehicle-year')?.value || '';
            const engine = document.getElementById('vehicle-engine')?.value || '';
            const trim = document.getElementById('vehicle-trim')?.value || '';

            // Create array of values
            const values = [brand, model, year, engine, trim];

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

Home.initiateWhenReady(['index']);