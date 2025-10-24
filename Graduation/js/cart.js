/**
 * シーシャ・水たばこ紹介ウェブサイト Almalla - ショッピングカート機能
 * Shopping Cart Management System
 */

class ShoppingCart {
    constructor() {
        this.storageKey = 'almalla_cart';
        this.cart = this.loadCartFromStorage();
        this.initializeCart();
    }

    // Initialize cart functionality
    initializeCart() {
        this.injectCartIcon();
        this.bindCartIconClicks();
        this.updateCartDisplay();
        this.bindEvents();
    }

    // Inject a global cart icon at the top-left of the page if missing
    injectCartIcon() {
        const existing = document.querySelector('.cart-icon');
        if (existing) {
            // Ensure a badge exists on existing icon
            if (!existing.querySelector('.cart-badge')) {
                const badge = document.createElement('span');
                badge.className = 'cart-badge';
                badge.style.display = 'none';
                badge.textContent = '0';
                existing.appendChild(badge);
            }
        }

        // Always ensure a fixed fallback icon exists
        if (!document.querySelector('.cart-icon.cart-fixed')) {
            const cartIcon = document.createElement('a');
            cartIcon.href = '#';
            cartIcon.className = 'cart-icon cart-fixed';
            cartIcon.setAttribute('aria-label', 'My Cart');
            cartIcon.innerHTML = `
                <img src="img/shopping_bag_26px.png" alt="My Cart">
                <span class="cart-badge" style="display:none">0</span>
            `;
            document.body.appendChild(cartIcon);
        }
        // Bind click to any icons present after injection
        this.bindCartIconClicks();
    }

    // Bind click handlers directly to cart icons (robust to event-blocking)
    bindCartIconClicks() {
        const icons = document.querySelectorAll('.cart-icon');
        icons.forEach(icon => {
            if (!icon.dataset.cartBound) {
                icon.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showCartModal();
                });
                icon.dataset.cartBound = 'true';
            }
        });
    }

    // Update cart display (badge count)
    updateCartDisplay() {
        const badges = document.querySelectorAll('.cart-badge');
        const icons = document.querySelectorAll('.cart-icon');

        if (badges.length === 0 || icons.length === 0) {
            // Attempt to ensure an icon exists if none found
            this.injectCartIcon();
        }

        badges.forEach(badge => {
            badge.textContent = this.cart.totalItems;
            badge.style.display = this.cart.totalItems > 0 ? 'block' : 'none';
        });

        icons.forEach(icon => {
            icon.classList.toggle('has-items', this.cart.totalItems > 0);
        });
    }

    // Load cart data from localStorage
    loadCartFromStorage() {
        try {
            const cartData = localStorage.getItem(this.storageKey);
            if (cartData) {
                return JSON.parse(cartData);
            }
        } catch (error) {
            console.error('Error loading cart from storage:', error);
        }
        
        return {
            items: [],
            totalItems: 0,
            lastUpdated: Date.now()
        };
    }

    // Save cart data to localStorage
    saveCartToStorage() {
        try {
            this.cart.lastUpdated = Date.now();
            localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
        } catch (error) {
            console.error('Error saving cart to storage:', error);
        }
    }

    // Add product to cart
    addToCart(productId, productName, productImage, price = 0) {
        const existingItem = this.cart.items.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.items.push({
                id: productId,
                name: productName,
                image: productImage,
                price: price,
                quantity: 1
            });
        }
        
        this.updateTotalItems();
        this.saveCartToStorage();
        this.updateCartDisplay();
        this.showAddToCartNotification(productName);
    }

    // Remove product from cart
    removeFromCart(productId) {
        this.cart.items = this.cart.items.filter(item => item.id !== productId);
        this.updateTotalItems();
        this.saveCartToStorage();
        this.updateCartDisplay();
        this.updateCartModal();
    }

    // Update product quantity in cart
    updateCartQuantity(productId, quantity) {
        const item = this.cart.items.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.updateTotalItems();
                this.saveCartToStorage();
                this.updateCartDisplay();
                this.updateCartModal();
            }
        }
    }

    // Clear entire cart
    clearCart() {
        this.cart = {
            items: [],
            totalItems: 0,
            lastUpdated: Date.now()
        };
        this.saveCartToStorage();
        this.updateCartDisplay();
        this.updateCartModal();
    }

    // Update total items count
    updateTotalItems() {
        this.cart.totalItems = this.cart.items.reduce((total, item) => total + item.quantity, 0);
    }

    // Get cart items
    getCartItems() {
        return this.cart.items;
    }

    // Get cart item count
    getCartItemCount() {
        return this.cart.totalItems;
    }

    // Update cart display (badge count)
    updateCartDisplay() {
        const cartBadge = document.querySelector('.cart-badge');
        const cartIcon = document.querySelector('.cart-icon');
        
        if (cartBadge) {
            cartBadge.textContent = this.cart.totalItems;
            cartBadge.style.display = this.cart.totalItems > 0 ? 'block' : 'none';
        }
        
        if (cartIcon) {
            cartIcon.classList.toggle('has-items', this.cart.totalItems > 0);
        }
    }

    // Show cart modal
    showCartModal() {
        let modal = document.querySelector('.cart-modal');
        if (!modal) {
            modal = this.createCartModal();
        }
        
        this.updateCartModal();
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // Hide cart modal
    hideCartModal() {
        const modal = document.querySelector('.cart-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    // Create cart modal HTML
    createCartModal() {
        const modal = document.createElement('div');
        modal.className = 'cart-modal';
        modal.innerHTML = `
            <div class="cart-modal-overlay">
                <div class="cart-modal-content">
                    <div class="cart-modal-header">
                        <h3>ショッピングカート</h3>
                        <button class="cart-modal-close">&times;</button>
                    </div>
                    <div class="cart-modal-body">
                        <div class="cart-items-container"></div>
                        <div class="cart-empty-message" style="display: none;">
                            <p>カートは空です</p>
                        </div>
                    </div>
                    <div class="cart-modal-footer">
                        <button class="cart-clear-btn">カートをクリア</button>
                        <div class="cart-total">
                            合計: <span class="cart-total-count">0</span> 点
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        return modal;
    }

    // Update cart modal content
    updateCartModal() {
        const modal = document.querySelector('.cart-modal');
        if (!modal) return;
        
        const container = modal.querySelector('.cart-items-container');
        const emptyMessage = modal.querySelector('.cart-empty-message');
        const totalCount = modal.querySelector('.cart-total-count');
        
        if (this.cart.items.length === 0) {
            container.innerHTML = '';
            emptyMessage.style.display = 'block';
        } else {
            emptyMessage.style.display = 'none';
            container.innerHTML = this.cart.items.map(item => `
                <div class="cart-item" data-product-id="${item.id}">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-controls">
                            <button class="quantity-btn minus" data-action="decrease">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn plus" data-action="increase">+</button>
                            <button class="remove-item-btn" data-action="remove">削除</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        if (totalCount) {
            totalCount.textContent = this.cart.totalItems;
        }
    }

    // Show add to cart notification
    showAddToCartNotification(productName) {
        // Remove existing notification
        const existingNotification = document.querySelector('.cart-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create new notification
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <div class="cart-notification-content">
                <span>「${productName}」をカートに追加しました</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    // Bind event listeners
    bindEvents() {
        // Cart icon click
        document.addEventListener('click', (e) => {
            if (e.target.closest('.cart-icon')) {
                e.preventDefault();
                this.showCartModal();
            }
        });

        // Modal close events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('cart-modal-close') || 
                e.target.classList.contains('cart-modal-overlay')) {
                this.hideCartModal();
            }
        });

        // Cart item controls
        document.addEventListener('click', (e) => {
            const cartItem = e.target.closest('.cart-item');
            if (!cartItem) return;
            
            const productId = cartItem.dataset.productId;
            const action = e.target.dataset.action;
            
            if (action === 'increase') {
                const currentQuantity = parseInt(cartItem.querySelector('.quantity').textContent);
                this.updateCartQuantity(productId, currentQuantity + 1);
            } else if (action === 'decrease') {
                const currentQuantity = parseInt(cartItem.querySelector('.quantity').textContent);
                this.updateCartQuantity(productId, currentQuantity - 1);
            } else if (action === 'remove') {
                this.removeFromCart(productId);
            }
        });

        // Clear cart button
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('cart-clear-btn')) {
                if (confirm('カートをクリアしますか？')) {
                    this.clearCart();
                }
            }
        });

        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-btn')) {
                e.preventDefault();
                const productData = e.target.dataset;
                this.addToCart(
                    productData.productId,
                    productData.productName,
                    productData.productImage,
                    parseFloat(productData.productPrice) || 0
                );
            }
        });

        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideCartModal();
            }
        });
    }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.shoppingCart = new ShoppingCart();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShoppingCart;
}