/**
 * Product Image Gallery - Scroll through product images in cards
 * Works with mouse scroll, touch swipe, and auto-scroll on hover
 */

export default class ProductImageGallery {
    constructor() {
        this.init();
    }

    init() {
        // Wait for Salla to be ready
        if (typeof salla !== 'undefined' && salla.onReady) {
            salla.onReady(() => {
                this.setupImageGalleries();
                this.observeNewProducts();
            });
        } else {
            // Fallback if salla is not available
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => this.setupImageGalleries(), 1000);
                this.observeNewProducts();
            });
        }
    }

    observeNewProducts() {
        // Watch for new product cards being added
        const observer = new MutationObserver(() => {
            this.setupImageGalleries();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    setupImageGalleries() {
        // Get all product cards in both sections
        const productCards = document.querySelectorAll(`
            .s-block--latest-products .s-product-card-entry,
            .deals-section .s-product-card-entry
        `);

        productCards.forEach(card => {
            // Skip if already initialized
            if (card.dataset.galleryInitialized === 'true') {
                return;
            }

            const imageContainer = card.querySelector('.s-product-card-image');
            if (!imageContainer) return;

            const productLink = imageContainer.querySelector('a');
            const mainImage = imageContainer.querySelector('img');
            if (!mainImage || !productLink) return;

            // Get product ID
            const productId = this.getProductId(card);
            
            // Create gallery wrapper
            this.createGalleryWrapper(card, imageContainer, productLink, mainImage, productId);
            
            card.dataset.galleryInitialized = 'true';
        });
    }

    getProductId(card) {
        // Try multiple methods to get product ID
        const addToCartBtn = card.querySelector('salla-add-product-button');
        if (addToCartBtn) {
            return addToCartBtn.getAttribute('product-id');
        }

        const wishlistBtn = card.querySelector('.s-product-card-wishlist-btn');
        if (wishlistBtn) {
            return wishlistBtn.getAttribute('data-id');
        }

        const productLink = card.querySelector('a[href*="/product/"]');
        if (productLink) {
            const match = productLink.href.match(/\/product\/(\d+)/);
            if (match) return match[1];
        }

        return null;
    }

    createGalleryWrapper(card, imageContainer, productLink, mainImage, productId) {
        // Create gallery wrapper
        const galleryWrapper = document.createElement('div');
        galleryWrapper.className = 'product-image-gallery-wrapper';
        
        const gallery = document.createElement('div');
        gallery.className = 'product-image-gallery';
        
        // Add main image first
        const mainImgClone = mainImage.cloneNode(true);
        gallery.appendChild(mainImgClone);
        
        galleryWrapper.appendChild(gallery);
        
        // Replace content
        const originalHTML = productLink.innerHTML;
        productLink.innerHTML = '';
        productLink.appendChild(galleryWrapper);

        // Setup scroll functionality
        this.setupGalleryScroll(gallery, galleryWrapper, card, productId);
        
        // Try to load additional images on hover
        if (productId) {
            galleryWrapper.addEventListener('mouseenter', () => {
                this.loadAdditionalImages(gallery, productId, mainImage);
            }, { once: true });
        }
    }

    async loadAdditionalImages(gallery, productId, mainImage) {
        // Check if images already loaded
        if (gallery.dataset.imagesLoaded === 'true') return;
        
        try {
            // Try to get product data from Salla
            let images = [];
            
            // Method 1: Try Salla API
            try {
                const response = await fetch(`/api/products/${productId}`, {
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    images = data.data?.images || data.images || data.gallery || [];
                }
            } catch (e) {
                // API failed, try other methods
            }
            
            // Method 2: Try to get from product page URL
            if (images.length === 0) {
                const productLink = gallery.closest('a');
                if (productLink && productLink.href) {
                    try {
                        const response = await fetch(productLink.href);
                        if (response.ok) {
                            const html = await response.text();
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(html, 'text/html');
                            
                            // Find images in product slider
                            const sliderImages = doc.querySelectorAll('salla-slider img, [data-fslightbox] img, .swiper-slide img');
                            sliderImages.forEach(img => {
                                if (img.src && !images.some(i => (typeof i === 'string' ? i : i.url) === img.src)) {
                                    images.push(img.src);
                                }
                            });
                        }
                    } catch (e) {
                        console.log('Could not fetch product page');
                    }
                }
            }
            
            // Add additional images if found
            if (images.length > 1) {
                const mainImgSrc = mainImage.src;
                images.forEach((image, index) => {
                    const imgSrc = typeof image === 'string' ? image : (image.url || image);
                    if (imgSrc !== mainImgSrc && !Array.from(gallery.querySelectorAll('img')).some(img => img.src === imgSrc)) {
                        const img = document.createElement('img');
                        img.src = imgSrc;
                        img.alt = typeof image === 'string' ? `Product image ${index + 1}` : (image.alt || `Product image ${index + 1}`);
                        img.loading = 'lazy';
                        img.className = mainImage.className || '';
                        gallery.appendChild(img);
                    }
                });
                
                // Add dots if multiple images
                if (gallery.children.length > 1 && !galleryWrapper.querySelector('.product-gallery-dots')) {
                    const dots = document.createElement('div');
                    dots.className = 'product-gallery-dots';
                    for (let i = 0; i < gallery.children.length; i++) {
                        const dot = document.createElement('span');
                        dot.className = `gallery-dot ${i === 0 ? 'active' : ''}`;
                        dots.appendChild(dot);
                    }
                    galleryWrapper.appendChild(dots);
                }
            }
            
            gallery.dataset.imagesLoaded = 'true';
        } catch (error) {
            console.log('Error loading additional images:', error);
        }
    }

    setupGalleryScroll(gallery, wrapper, card, productId) {
        let scrollTimeout;
        let autoScrollInterval;

        // Mouse wheel scroll
        gallery.addEventListener('wheel', (e) => {
            e.preventDefault();
            gallery.scrollBy({
                left: e.deltaY > 0 ? 100 : -100,
                behavior: 'smooth'
            });
            this.updateDots(gallery, wrapper);
        });

        // Touch/swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        gallery.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        gallery.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(gallery, wrapper, touchStartX, touchEndX);
        });

        // Auto-scroll on hover (if multiple images)
        wrapper.addEventListener('mouseenter', () => {
            if (gallery.children.length <= 1) return;
            
            autoScrollInterval = setInterval(() => {
                const currentScroll = gallery.scrollLeft;
                const imageWidth = gallery.children[0]?.offsetWidth || gallery.offsetWidth;
                const maxScroll = gallery.scrollWidth - gallery.offsetWidth;

                if (currentScroll >= maxScroll - 5) {
                    gallery.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    gallery.scrollBy({ left: imageWidth, behavior: 'smooth' });
                }
                this.updateDots(gallery, wrapper);
            }, 2500);
        });

        wrapper.addEventListener('mouseleave', () => {
            if (autoScrollInterval) {
                clearInterval(autoScrollInterval);
            }
        });

        // Update dots on scroll
        gallery.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.updateDots(gallery, wrapper);
            }, 100);
        });

        // Click on dots to navigate
        wrapper.addEventListener('click', (e) => {
            if (e.target.classList.contains('gallery-dot')) {
                const index = Array.from(e.target.parentElement.children).indexOf(e.target);
                const imageWidth = gallery.children[0]?.offsetWidth || gallery.offsetWidth;
                gallery.scrollTo({
                    left: index * imageWidth,
                    behavior: 'smooth'
                });
                this.updateDots(gallery, wrapper);
            }
        });
    }

    handleSwipe(gallery, wrapper, startX, endX) {
        const imageWidth = gallery.children[0]?.offsetWidth || gallery.offsetWidth;
        const threshold = 50;

        if (startX - endX > threshold) {
            // Swipe left - next image
            gallery.scrollBy({ left: imageWidth, behavior: 'smooth' });
        } else if (endX - startX > threshold) {
            // Swipe right - previous image
            gallery.scrollBy({ left: -imageWidth, behavior: 'smooth' });
        }

        this.updateDots(gallery, wrapper);
    }

    updateDots(gallery, wrapper) {
        const dots = wrapper.querySelector('.product-gallery-dots');
        if (!dots || gallery.children.length <= 1) return;

        const imageWidth = gallery.children[0]?.offsetWidth || gallery.offsetWidth;
        const currentIndex = Math.round(gallery.scrollLeft / imageWidth);

        dots.querySelectorAll('.gallery-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }
}

// Export for use in other modules
export { ProductImageGallery };
