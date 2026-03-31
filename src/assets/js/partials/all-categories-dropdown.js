// All Categories Dropdown Menu
class AllCategoriesDropdown {
    constructor() {
        this.categories = [];
        this.isOpen = false;
        this.init();
    }

    init() {
        const button = document.getElementById('all-categories-btn');
        const menu = document.getElementById('all-categories-menu');
        
        if (!button || !menu) {
            console.log('AllCategoriesDropdown: Button or menu not found, retrying...');
            setTimeout(() => this.init(), 500);
            return;
        }

        console.log('AllCategoriesDropdown: Initializing...');

        // Wait for Salla to be ready
        if (typeof salla !== 'undefined' && salla.onReady) {
            salla.onReady().then(() => {
                console.log('AllCategoriesDropdown: Salla ready, loading categories...');
                this.setupEventListeners();
                this.loadCategories();
            }).catch(() => {
                console.log('AllCategoriesDropdown: Salla onReady failed, trying anyway...');
                this.setupEventListeners();
                this.loadCategories();
            });
        } else {
            console.log('AllCategoriesDropdown: Salla not ready, waiting...');
            setTimeout(() => this.init(), 500);
        }
    }

    setupEventListeners() {
        const button = document.getElementById('all-categories-btn');
        const menu = document.getElementById('all-categories-menu');
        
        if (!button || !menu) return;

        // On mobile, open mobile menu instead
        if (window.innerWidth < 1024) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                // Trigger mobile menu
                const mobileMenuTrigger = document.querySelector('.mburger--collapse');
                if (mobileMenuTrigger) {
                    mobileMenuTrigger.click();
                } else {
                    // Fallback: navigate to mobile menu
                    window.location.href = '#mobile-menu';
                }
            });
            return;
        }

        // Desktop: Toggle on click
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggle();
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!button.contains(e.target) && !menu.contains(e.target)) {
                this.close();
            }
        });

        // Hover behavior for desktop
        button.addEventListener('mouseenter', () => {
            if (!this.isOpen) {
                this.open();
            }
        });

        const dropdown = button.closest('.all-categories-dropdown');
        if (dropdown) {
            dropdown.addEventListener('mouseleave', () => {
                this.close();
            });
        }
    }

    async loadCategories() {
        const menu = document.getElementById('all-categories-menu');
        if (!menu) {
            console.log('AllCategoriesDropdown: Menu element not found');
            return;
        }

        console.log('AllCategoriesDropdown: Loading categories...');

        try {
            // Get categories from menu API
            let categories = [];
            
            // Wait a bit for menu component to load
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Try to get from menu component first
            const menuElement = document.querySelector('custom-main-menu');
            console.log('AllCategoriesDropdown: Menu element found:', !!menuElement);
            
            if (menuElement && menuElement.menus && menuElement.menus.length > 0) {
                categories = menuElement.menus;
                console.log('AllCategoriesDropdown: Got', categories.length, 'categories from custom-main-menu');
            } else if (typeof salla !== 'undefined' && salla.api && salla.api.component) {
                console.log('AllCategoriesDropdown: Trying salla.api.component.getMenus()...');
                try {
                    const response = await salla.api.component.getMenus();
                    console.log('AllCategoriesDropdown: getMenus response:', response);
                    if (response && response.data && response.data.length > 0) {
                        categories = response.data;
                        console.log('AllCategoriesDropdown: Got', categories.length, 'categories from API');
                    }
                } catch (e) {
                    console.log('AllCategoriesDropdown: getMenus error:', e);
                }
            }

            // If still no categories, wait more and try again
            if (categories.length === 0) {
                console.log('AllCategoriesDropdown: No categories yet, waiting 1 second...');
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const menuElement2 = document.querySelector('custom-main-menu');
                if (menuElement2 && menuElement2.menus && menuElement2.menus.length > 0) {
                    categories = menuElement2.menus;
                    console.log('AllCategoriesDropdown: Got', categories.length, 'categories on retry');
                }
            }

            if (categories.length === 0) {
                console.log('AllCategoriesDropdown: No categories found, showing error');
                const errorText = (typeof salla !== 'undefined' && salla.lang) ? salla.lang.get('blocks.home.no_categories') : 'لا توجد فئات متاحة';
                menu.innerHTML = '<div class="categories-error">' + errorText + '</div>';
                return;
            }

            // Fetch full category data with images
            console.log('AllCategoriesDropdown: Enriching', categories.length, 'categories with images...');
            const enrichedCategories = await this.enrichCategoriesWithImages(categories);
            this.categories = enrichedCategories;
            console.log('AllCategoriesDropdown: Enriched categories:', this.categories.length);
            this.render();
        } catch (error) {
            console.error('AllCategoriesDropdown: Error loading categories:', error);
            menu.innerHTML = '<div class="categories-error">حدث خطأ في تحميل الفئات</div>';
        }
    }

    async enrichCategoriesWithImages(menuCategories) {
        if (!menuCategories || menuCategories.length === 0) return [];

        try {
            // Fetch categories from API to get images
            let apiCategories = [];
            
            if (typeof salla !== 'undefined' && salla.api && salla.api.get) {
                try {
                    const response = await salla.api.get('/categories', {limit: 100});
                    apiCategories = (response && response.data) ? response.data : (Array.isArray(response) ? response : []);
                } catch (e) {
                    console.log('salla.api.get failed, trying fetch...');
                }
            }

            // If API get failed, try fetch
            if (apiCategories.length === 0) {
                const apiUrl = 'https://api.salla.dev/store/v1';
                try {
                    const response = await fetch(apiUrl + '/categories?limit=100');
                    if (response.ok) {
                        const data = await response.json();
                        apiCategories = (data && data.data) ? data.data : (Array.isArray(data) ? data : []);
                    }
                } catch (e) {
                    console.log('Fetch also failed:', e);
                }
            }

            // Match menu categories with API categories
            return menuCategories.map(menuCat => {
                // Extract category ID from URL
                let categoryId = null;
                if (menuCat.url) {
                    const match = menuCat.url.match(/\/c(\d+)/);
                    if (match && match[1]) {
                        categoryId = match[1];
                    }
                }

                // Find matching API category
                const apiCat = apiCategories.find(api => {
                    return (categoryId && api.id && String(api.id) === String(categoryId)) ||
                           (api.url && menuCat.url && (api.url === menuCat.url || menuCat.url.includes(api.url))) ||
                           (api.name && menuCat.name && api.name === menuCat.name);
                });

                // Get image
                let image = menuCat.image || null;
                if (!image && apiCat) {
                    if (apiCat.image) {
                        image = (typeof apiCat.image === 'string') ? apiCat.image : (apiCat.image.url || apiCat.image.original || apiCat.image.medium);
                    } else if (apiCat.image_url) {
                        image = apiCat.image_url;
                    } else if (apiCat.thumbnail) {
                        image = (typeof apiCat.thumbnail === 'string') ? apiCat.thumbnail : apiCat.thumbnail.url;
                    }
                }

                return {
                    ...menuCat,
                    image: image,
                    children: menuCat.children || []
                };
            });
        } catch (error) {
            console.error('Error enriching categories:', error);
            return menuCategories;
        }
    }

    render() {
        const menu = document.getElementById('all-categories-menu');
        if (!menu) {
            console.log('AllCategoriesDropdown: Menu not found in render');
            return;
        }
        
        if (this.categories.length === 0) {
            console.log('AllCategoriesDropdown: No categories to render');
            const errorText = (typeof salla !== 'undefined' && salla.lang) ? salla.lang.get('blocks.home.no_categories') : 'لا توجد فئات متاحة';
            menu.innerHTML = '<div class="categories-error">' + errorText + '</div>';
            return;
        }

        console.log('AllCategoriesDropdown: Rendering', this.categories.length, 'categories');

        let html = '<div class="categories-menu-container">';
        html += '<div class="categories-menu-left">';
        
        // Left column: Main categories with icons
        this.categories.forEach((category, index) => {
            const isActive = index === 0;
            const title = category.title || category.name || 'Category';
            const url = category.url || '#';
            html += `
                <a href="${url}" class="category-item ${isActive ? 'active' : ''}" data-category-index="${index}">
                    ${category.image ? `<img src="${category.image}" alt="${title}" class="category-icon" />` : `<i class="sicon-menu category-icon-placeholder"></i>`}
                    <span class="category-name">${title}</span>
                    ${category.children && category.children.length > 0 ? '<i class="sicon-sar category-arrow"></i>' : ''}
                </a>
            `;
        });

        html += '</div>'; // Close left column

        // Right columns: Subcategories
        html += '<div class="categories-menu-right">';
        
        this.categories.forEach((category, index) => {
            const isActive = index === 0;
            const noSubcategoriesText = (typeof salla !== 'undefined' && salla.lang) ? salla.lang.get('blocks.home.no_subcategories') : 'لا توجد تصنيفات فرعية';
            html += `
                <div class="subcategories-panel ${isActive ? 'active' : ''}" data-panel-index="${index}">
                    ${category.children && category.children.length > 0 ? this.renderSubcategories(category.children) : '<div class="no-subcategories">' + noSubcategoriesText + '</div>'}
                </div>
            `;
        });

        html += '</div>'; // Close right columns
        html += '</div>'; // Close container

        menu.innerHTML = html;
        this.setupCategoryHover();
        console.log('AllCategoriesDropdown: Categories rendered successfully');
    }

    renderSubcategories(children) {
        const noSubcategoriesText = (typeof salla !== 'undefined' && salla.lang) ? salla.lang.get('blocks.home.no_subcategories') : 'لا توجد تصنيفات فرعية';
        if (!children || children.length === 0) return '<div class="no-subcategories">' + noSubcategoriesText + '</div>';

        let html = '';
        const columns = 3; // Number of columns
        const itemsPerColumn = Math.ceil(children.length / columns);

        for (let col = 0; col < columns; col++) {
            const start = col * itemsPerColumn;
            const end = Math.min(start + itemsPerColumn, children.length);
            const columnItems = children.slice(start, end);

            if (columnItems.length > 0) {
                html += '<div class="subcategory-column">';
                columnItems.forEach(item => {
                    html += `
                        <a href="${item.url || '#'}" class="subcategory-item">
                            ${item.image ? `<img src="${item.image}" alt="${item.title}" class="subcategory-image" />` : ''}
                            <span class="subcategory-name">${item.title}</span>
                        </a>
                    `;
                });
                html += '</div>';
            }
        }

        return html;
    }

    setupCategoryHover() {
        const categoryItems = document.querySelectorAll('.category-item');
        const panels = document.querySelectorAll('.subcategories-panel');

        categoryItems.forEach(item => {
            item.addEventListener('mouseenter', (e) => {
                e.preventDefault();
                // Remove active from all
                categoryItems.forEach(i => i.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));

                // Add active to hovered
                item.classList.add('active');
                const index = item.getAttribute('data-category-index');
                const panel = document.querySelector(`.subcategories-panel[data-panel-index="${index}"]`);
                if (panel) {
                    panel.classList.add('active');
                }
            });
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        const menu = document.getElementById('all-categories-menu');
        const button = document.getElementById('all-categories-btn');
        
        if (!menu || !button) return;

        menu.classList.add('open');
        button.classList.add('active');
        this.isOpen = true;
    }

    close() {
        const menu = document.getElementById('all-categories-menu');
        const button = document.getElementById('all-categories-btn');
        
        if (!menu || !button) return;

        menu.classList.remove('open');
        button.classList.remove('active');
        this.isOpen = false;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new AllCategoriesDropdown();
    });
} else {
    new AllCategoriesDropdown();
}
