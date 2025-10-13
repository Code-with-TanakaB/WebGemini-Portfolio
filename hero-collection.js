// Hero Slider and Collection Functionality
document.addEventListener('DOMContentLoaded', function() {
    initHeroSlider();
    initCollectionFilters();
});

// Hero Slider Functionality
function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    const prevBtn = document.querySelector('.hero-arrow.prev');
    const nextBtn = document.querySelector('.hero-arrow.next');
    
    if(!slides.length) return;
    
    let currentSlide = 0;
    let slideInterval = setInterval(nextSlide, 5000);
    
    // Initialize the first slide
    slides[0].classList.add('active');
    dots[0].classList.add('active');
    
    // Next slide function
    function nextSlide() {
        goToSlide((currentSlide + 1) % slides.length);
    }
    
    // Previous slide function
    function prevSlide() {
        goToSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1);
    }
    
    // Go to specific slide
    function goToSlide(n) {
        // Remove active class from current slide and dot
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        
        // Set new current slide
        currentSlide = n;
        
        // Add active class to new slide and dot
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
        
        // Reset the interval timer
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
    }
    
    // Event listeners
    if(prevBtn) prevBtn.addEventListener('click', function() {
        prevSlide();
    });
    
    if(nextBtn) nextBtn.addEventListener('click', function() {
        nextSlide();
    });
    
    // Add click events to dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            goToSlide(index);
        });
    });
}

// Collection Filters Functionality
function initCollectionFilters() {
    const categoryButtons = document.querySelectorAll('.category-tabs .tab-btn');
    const filterCheckboxes = document.querySelectorAll('.filter-checkbox input');
    const sortSelect = document.querySelector('.sorting-options select');
    const searchInput = document.querySelector('.search-box input');
    const searchBtn = document.querySelector('.search-btn');
    
    // Collection items
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    // Update result count
    function updateResultCount() {
        const visibleItems = document.querySelectorAll('.gallery-item:not([style*="display: none"])');
        const resultsInfo = document.querySelector('.results-info');
        
        if (resultsInfo) {
            resultsInfo.textContent = `${visibleItems.length} vehicles found`;
        }
    }
    
    // Filter by category
    if (categoryButtons) {
        categoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                const category = this.getAttribute('data-category');
                
                // Filter gallery items
                galleryItems.forEach(item => {
                    if (category === 'all') {
                        item.style.display = 'flex';
                    } else {
                        if (item.getAttribute('data-category') === category) {
                            item.style.display = 'flex';
                        } else {
                            item.style.display = 'none';
                        }
                    }
                });
                
                updateResultCount();
            });
        });
    }
    
    // Filter by checkbox filters
    if (filterCheckboxes) {
        filterCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                filterItems();
            });
        });
    }
    
    // Sort functionality
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortValue = this.value;
            const itemsArray = Array.from(galleryItems);
            
            itemsArray.sort((a, b) => {
                if (sortValue === 'price-asc') {
                    return getPriceValue(a) - getPriceValue(b);
                } else if (sortValue === 'price-desc') {
                    return getPriceValue(b) - getPriceValue(a);
                } else if (sortValue === 'name-asc') {
                    return getNameValue(a).localeCompare(getNameValue(b));
                } else if (sortValue === 'name-desc') {
                    return getNameValue(b).localeCompare(getNameValue(a));
                }
                return 0;
            });
            
            // Re-append items in new order
            const galleryGrid = document.querySelector('.gallery-grid');
            if (galleryGrid) {
                itemsArray.forEach(item => {
                    galleryGrid.appendChild(item);
                });
            }
        });
    }
    
    // Helper function to get price value for sorting
    function getPriceValue(item) {
        const priceElement = item.querySelector('.gallery-item-price');
        if (priceElement) {
            const price = priceElement.textContent.replace(/[^\d.]/g, '');
            return parseFloat(price) || 0;
        }
        return 0;
    }
    
    // Helper function to get name value for sorting
    function getNameValue(item) {
        const nameElement = item.querySelector('.gallery-item-title');
        if (nameElement) {
            return nameElement.textContent.trim();
        }
        return '';
    }
    
    // Search functionality
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', function() {
            searchItems();
        });
        
        searchInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                searchItems();
            }
        });
    }
    
    // Search items function
    function searchItems() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        galleryItems.forEach(item => {
            const title = item.querySelector('.gallery-item-title').textContent.toLowerCase();
            const subtitle = item.querySelector('.gallery-item-subtitle')?.textContent.toLowerCase() || '';
            
            if (title.includes(searchTerm) || subtitle.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
        
        updateResultCount();
    }
    
    // Combined filter function
    function filterItems() {
        const checkedFilters = Array.from(filterCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
        
        galleryItems.forEach(item => {
            // Skip items already hidden by category filter
            if (item.style.display === 'none') return;
            
            // If no filters are selected, show all items
            if (checkedFilters.length === 0) {
                item.style.display = 'flex';
                return;
            }
            
            // Check if item matches any selected filter
            const features = Array.from(item.querySelectorAll('.gallery-item-feature'))
                .map(feature => feature.textContent.toLowerCase().trim());
            
            const hasMatchingFeature = checkedFilters.some(filter => 
                features.some(feature => feature.includes(filter.toLowerCase()))
            );
            
            item.style.display = hasMatchingFeature ? 'flex' : 'none';
        });
        
        updateResultCount();
    }
    
    // Initialize the result count
    updateResultCount();
    
    // Add favorite functionality
    const favoriteButtons = document.querySelectorAll('.gallery-item-favorite');
    favoriteButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Toggle the 'active' class
            this.classList.toggle('active');
            
            // Change the icon
            const icon = this.querySelector('i');
            if (this.classList.contains('active')) {
                icon.className = 'fas fa-heart';
            } else {
                icon.className = 'far fa-heart';
            }
        });
    });
    
    // Pagination functionality
    const pageButtons = document.querySelectorAll('.page-btn');
    const pageIndicator = document.querySelector('.current-page');
    
    if (pageButtons.length && pageIndicator) {
        const itemsPerPage = 6;
        let currentPage = 1;
        const totalItems = galleryItems.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        // Update displayed page number
        pageIndicator.textContent = currentPage;
        
        // Show items for current page
        function showPage(page) {
            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            
            galleryItems.forEach((item, index) => {
                // Skip items filtered out
                if (item.style.display === 'none') return;
                
                if (index >= start && index < end) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
            
            // Update page indicator
            pageIndicator.textContent = page;
            
            // Disable/Enable page buttons
            document.querySelector('.page-btn.prev').disabled = page === 1;
            document.querySelector('.page-btn.next').disabled = page === totalPages;
        }
        
        // Next page button
        document.querySelector('.page-btn.next').addEventListener('click', function() {
            if (currentPage < totalPages) {
                currentPage++;
                showPage(currentPage);
            }
        });
        
        // Previous page button
        document.querySelector('.page-btn.prev').addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                showPage(currentPage);
            }
        });
        
        // Initialize first page
        showPage(1);
    }
}