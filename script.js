// --- BASE DE DATOS ---
const mainProductInfo = {
    id: 'p1',
    name: 'Trotadora Escaladora Eléctrica G750 Premium',
    sku: '158820235698',
    msrp: 2500000,
    salePrice: 1399990,
    bundlePrice: 1399990, 
    isMain: true,
    variants: [
        { hex: '#111111', colorName: 'Negro Premium' }, 
        { hex: '#888888', colorName: 'Plata Titanio' }
    ],
    galleryImages: [
        'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1554244933-d876deb6b2ff?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80'
    ]
};

const crossSellData = [
    {
        id: 'c1',
        name: 'Set Mancuernas 15 kg Pro',
        sku: '68567001554630',
        msrp: 120000,        
        salePrice: 89900,    
        bundlePrice: 85400,  
        discountText: '25% Dscto. + 5% Extra Pack',
        isMain: false,
        variants: [
            { hex: '#111111', colorName: 'Negro', img: 'https://images.pexels.com/photos/39671/physiotherapy-weight-training-dumbbell-exercise-balls-39671.jpeg?auto=compress&cs=tinysrgb&w=300' },
            { hex: '#cc0000', colorName: 'Rojo', img: 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=300' }
        ]
    },
    {
        id: 'c2',
        name: 'Disco Olímpico Bumper 20 kg',
        sku: '68567001554625',
        msrp: 80000,
        salePrice: 60000,
        bundlePrice: 57000,
        discountText: '25% Dscto. + 5% Extra Pack',
        isMain: false,
        variants: [
            { hex: '#111111', colorName: 'Negro', img: 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=300' },
            { hex: '#1e3a8a', colorName: 'Azul Marino', img: 'https://images.pexels.com/photos/39671/physiotherapy-weight-training-dumbbell-exercise-balls-39671.jpeg?auto=compress&cs=tinysrgb&w=300' }
        ]
    },
    {
        id: 'c3',
        name: 'Cinturón Levantamiento Pesas',
        sku: '69155466249784',
        msrp: 30000,
        salePrice: 20000,
        bundlePrice: 19000,
        discountText: '33% Dscto. + 5% Extra Pack',
        isMain: false,
        variants: [
            { hex: '#111111', colorName: 'Negro', img: 'https://images.pexels.com/photos/1978505/pexels-photo-1978505.jpeg?auto=compress&cs=tinysrgb&w=300' },
            { hex: '#555555', colorName: 'Gris', img: 'https://images.pexels.com/photos/1978505/pexels-photo-1978505.jpeg?auto=compress&cs=tinysrgb&w=300' }
        ]
    }
];

let cart = [];
let mainProductQty = 1;
let currentMainVariantIdx = 0;
let crossSellSelections = { 'c1': 0, 'c2': 0, 'c3': 0 };
let pdpCrossSellSelections = { 'c1': 0, 'c2': 0, 'c3': 0 };
const FREE_SHIPPING_THRESHOLD = 2000000; 

function getFallbackImg(text) {
    return `https://placehold.co/300x300/f5f5f5/333333?text=${encodeURIComponent(text)}`;
}

// Formato de Peso Chileno sin decimales
function formatMoney(amount) {
    return '$' + Math.round(amount).toLocaleString('es-CL');
}

// --- PÁGINA DE PRODUCTO A PRUEBA DE FALLOS ---
function initProductPage() {
    try {
        const thumbnailsContainer = document.getElementById('uf-thumbnails');
        const mainImg = document.getElementById('main-product-img');
        
        if (thumbnailsContainer && mainImg) {
            thumbnailsContainer.innerHTML = '';
            mainProductInfo.galleryImages.forEach((imgUrl, idx) => {
                const fallback = getFallbackImg('Trotadora');
                const imgHTML = `<img src="${imgUrl}" class="uf-thumb ${idx === currentMainVariantIdx ? 'active' : ''}" onclick="selectMainThumbnail(${idx})" onerror="this.onerror=null; this.src='${fallback}'">`;
                thumbnailsContainer.insertAdjacentHTML('beforeend', imgHTML);
            });
            
            mainImg.src = mainProductInfo.galleryImages[currentMainVariantIdx] || getFallbackImg('Trotadora');
            mainImg.onerror = function() { this.onerror=null; this.src = getFallbackImg('Trotadora'); };
        }
    } catch(err) {
        console.error("Gallery section not found or updated correctly.", err);
    }

    try {
        renderPDPCrossSells(); 
    } catch(err) {
        console.error("Cross-sell section not found or updated correctly.", err);
    }
}

function selectMainThumbnail(idx) {
    currentMainVariantIdx = idx;
    initProductPage();
}

function changeMainQty(change) {
    mainProductQty += change;
    if(mainProductQty < 1) mainProductQty = 1;
    document.getElementById('main-qty').innerText = mainProductQty;
}

// --- ACORDEONES ---
function toggleAccordion(element) {
    element.classList.toggle("active");
}

// --- RENDERIZAR CROSS SELL EN PÁGINA DE PRODUCTO ---
function changePDPCrossSellColor(productId, variantIdx) {
    pdpCrossSellSelections[productId] = variantIdx;
    renderPDPCrossSells();
}

function renderPDPCrossSells() {
    const container = document.getElementById('pdp-cross-sell-container');
    if(!container) return;
    container.innerHTML = '';

    crossSellData.forEach(product => {
        const selectedIdx = pdpCrossSellSelections[product.id];
        const currentImg = product.variants[selectedIdx].img;
        const fallback = getFallbackImg(product.name);

        const colorsHtml = product.variants.map((v, idx) => `
            <div class="color-dot ${idx === selectedIdx ? 'active' : ''}" 
                 style="background-color: ${v.hex};"
                 onclick="changePDPCrossSellColor('${product.id}', ${idx})">
            </div>
        `).join('');
        
        // ESTRUCTURA DE DOBLE DESCUENTO (MSRP Tachado / Oferta Tachada / Pack)
        const cardHTML = `
            <div class="pdp-cs-card">
                <img src="${currentImg}" alt="${product.name}" onerror="this.onerror=null; this.src='${fallback}'">
                
                <div class="pdp-cs-info">
                    <div class="pdp-cs-title">${product.name}</div>
                    <a href="#" class="pdp-cs-link">Ver Detalles</a>
                    <div class="color-dots">${colorsHtml}</div>
                </div>

                <div class="pdp-cs-action-area">
                    <div class="pdp-cs-prices">
                        <span class="pdp-msrp-price">Normal: ${formatMoney(product.msrp)}</span>
                        <div class="pdp-price-row">
                            <span class="pdp-sale-price">${formatMoney(product.salePrice)}</span>
                            <span class="pdp-bundle-price">${formatMoney(product.bundlePrice)}</span>
                        </div>
                        <div class="pdp-bundle-tag">${product.discountText}</div>
                    </div>
                    <button class="pdp-cs-add-btn" onclick="addToCartFromPDP('${product.id}')">AGREGAR</button>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}

function addToCartFromPDP(productId) {
    if(cart.length === 0) {
        addToCart(mainProductInfo, mainProductQty, currentMainVariantIdx, true); 
    }
    const product = crossSellData.find(p => p.id === productId);
    const selectedVariant = pdpCrossSellSelections[productId];
    if(product) addToCart(product, 1, selectedVariant, false, 'pdp');
    openCart();
}

// --- LÓGICA DEL CARRITO ---
function openCart() {
    document.getElementById('cartDrawer').classList.add('active');
    document.getElementById('cartOverlay').classList.add('active');
    renderCart();
    renderCrossSellsDrawer();
}

function closeCart() {
    document.getElementById('cartDrawer').classList.remove('active');
    document.getElementById('cartOverlay').classList.remove('active');
}

function addMainProduct() {
    addToCart(mainProductInfo, mainProductQty, currentMainVariantIdx, true);
    openCart();
}

function addCrossSellDrawer(id) {
    const product = crossSellData.find(p => p.id === id);
    const selectedVariant = crossSellSelections[id];
    if(product) addToCart(product, 1, selectedVariant, false, 'drawer');
}

function showRedError(elementId, msg) {
    const errDiv = document.getElementById(elementId);
    if(errDiv) {
        errDiv.innerText = msg;
        errDiv.style.display = 'block';
        setTimeout(() => { errDiv.style.display = 'none'; }, 3000);
    }
}

function addToCart(productObj, qty, variantIdx, bypassLimit = false, origin = '') {
    if (!productObj.isMain && !bypassLimit) {
        const currentTotalQty = cart.filter(item => item.id === productObj.id).reduce((sum, item) => sum + item.quantity, 0);
        
        if (currentTotalQty + qty > 3) {
            if(origin === 'drawer') {
                showRedError(`cs-error-${productObj.id}`, 'Máximo 3 unidades permitidas.');
            }
            const allowedToAdd = 3 - currentTotalQty;
            if (allowedToAdd <= 0) return; 
            qty = allowedToAdd; 
        }
    }

    const cartItemId = `${productObj.id}-v${variantIdx}`;
    const existingItem = cart.find(item => item.cartItemId === cartItemId);
    
    if (existingItem) {
        existingItem.quantity += qty;
    } else {
        cart.push({ ...productObj, cartItemId: cartItemId, quantity: qty, selectedVariantIdx: variantIdx });
    }
    renderCart();
}

function changeCartItemColor(cartItemId, newVariantIdx) {
    const itemIndex = cart.findIndex(item => item.cartItemId === cartItemId);
    if (itemIndex > -1) {
        let item = cart[itemIndex];
        const newCartItemId = `${item.id}-v${newVariantIdx}`;
        const existingMergeIndex = cart.findIndex(i => i.cartItemId === newCartItemId);
        
        if (existingMergeIndex > -1 && existingMergeIndex !== itemIndex) {
            cart[existingMergeIndex].quantity += item.quantity;
            cart.splice(itemIndex, 1);
        } else {
            item.selectedVariantIdx = newVariantIdx;
            item.cartItemId = newCartItemId;
        }
        renderCart();
    }
}

function updateQuantity(cartItemId, change) {
    const item = cart.find(item => item.cartItemId === cartItemId);
    if (item) {
        if (!item.isMain && change > 0) {
            const currentTotalQty = cart.filter(i => i.id === item.id).reduce((sum, i) => sum + i.quantity, 0);
            if (currentTotalQty >= 3) {
                showRedError(`error-${cartItemId}`, 'Máximo 3 unidades permitidas.');
                return;
            }
        }

        item.quantity += change;
        if (item.quantity <= 0) removeFromCart(cartItemId);
        else renderCart();
    }
}

function removeFromCart(cartItemId) {
    cart = cart.filter(item => item.cartItemId !== cartItemId);
    renderCart();
}

// --- RENDER CARRITO LATERAL ---
function renderCart() {
    const container = document.getElementById('cart-items-container');
    if (!container) return;
    container.innerHTML = '';
    
    let count = 0;
    let totalNormalPrice = 0; 
    let totalFinalPrice = 0;  
    const isMainProductInCart = cart.some(item => item.isMain);

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding: 20px; color:#777;">Tu carrito está vacío.</p>';
        document.getElementById('checkout-btn').style.opacity = '0.5';
        document.getElementById('checkout-btn').disabled = true;
    } else {
        document.getElementById('checkout-btn').style.opacity = '1';
        document.getElementById('checkout-btn').disabled = false;
    }

    cart.forEach(item => {
        count += item.quantity;
        const currentVariant = item.variants ? item.variants[item.selectedVariantIdx] : null;
        
        let itemImgSrc = getFallbackImg(item.name);
        if (item.isMain && item.galleryImages && item.galleryImages.length > 0) {
            itemImgSrc = item.galleryImages[0];
        } else if (!item.isMain && currentVariant && currentVariant.img) {
            itemImgSrc = currentVariant.img;
        }

        const fallback = getFallbackImg(item.name);
        
        let colorsHtml = '';
        if (item.variants && !item.isMain) {
            colorsHtml = item.variants.map((v, idx) => `
                <div class="color-dot ${idx === item.selectedVariantIdx ? 'active' : ''}" 
                     style="background-color: ${v.hex};"
                     onclick="changeCartItemColor('${item.cartItemId}', ${idx})">
                </div>
            `).join('');
        }

        totalNormalPrice += item.msrp * item.quantity;

        let effectivePrice = item.salePrice;
        
        // DISEÑO DEL PRECIO EN EL CARRITO CON DOS LÍNEAS PARA EL MENSAJE
        let htmlMSRP = `<div class="price-msrp">Normal: ${formatMoney(item.msrp)}</div>`;
        let htmlSale = `<div class="price-sale">${formatMoney(item.salePrice)}</div>`;
        let htmlTag = '';

        if (item.isMain) {
            htmlMSRP = ''; 
            effectivePrice = item.salePrice;
        } else if (!item.isMain && isMainProductInCart) {
            effectivePrice = item.bundlePrice;
            htmlTag = `
                <div class="cross-sell-tag success">
                    <div class="tag-title">
                        <span class="material-symbols-outlined" style="font-size:12px;">check_circle</span> PACK EXTRA ACTIVADO
                    </div>
                    <div class="tag-subtitle">Se aplicó: ${item.discountText}</div>
                </div>`;
        } else if (!item.isMain && !isMainProductInCart) {
            effectivePrice = item.salePrice; 
            htmlSale = ''; 
            htmlTag = `
                <div class="cross-sell-tag warning">
                    <div class="tag-title">
                        <span class="material-symbols-outlined" style="font-size:12px;">info</span> PRECIO CON DSCTO. REGULAR APLICADO
                    </div>
                    <div class="tag-subtitle">Agrega la máquina y ahorra un 5% EXTRA</div>
                </div>`;
        }
        
        totalFinalPrice += effectivePrice * item.quantity;
        const mainClass = item.isMain ? 'main-product' : '';

        // Calcula el ahorro
        let itemSavings = (item.msrp - effectivePrice);
        let savingsHtml = '';
        if (itemSavings > 0) {
            savingsHtml = `<div class="cart-item-savings">Ahorras ${formatMoney(itemSavings * item.quantity)}</div>`;
        }

        const itemHTML = `
            <div class="cart-item-container">
                <div class="cart-item ${mainClass}">
                    <img src="${itemImgSrc}" alt="${item.name}" onerror="this.onerror=null; this.src='${fallback}'">
                    
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.name}</div>
                        ${currentVariant && !item.isMain ? `<div class="cart-item-meta">Color: ${currentVariant.colorName}</div>` : ''}
                        ${item.sku ? `<div class="cart-item-meta">SKU: ${item.sku}</div>` : ''}
                        <div class="color-dots">${colorsHtml}</div>
                        ${htmlTag}
                    </div>

                    <div class="cart-item-right">
                        <div class="price-block">
                            ${htmlMSRP}
                            ${htmlSale}
                            <div class="price-new">${formatMoney(effectivePrice)}</div>
                            ${savingsHtml}
                        </div>
                        
                        <div class="controls-block">
                            <div class="quantity-control">
                                <button onclick="updateQuantity('${item.cartItemId}', -1)">-</button>
                                <span>${item.quantity}</span>
                                <button onclick="updateQuantity('${item.cartItemId}', 1)">+</button>
                            </div>
                            <button class="btn-trash" onclick="removeFromCart('${item.cartItemId}')">
                                <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="cart-limit-error" id="error-${item.cartItemId}"></div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', itemHTML);
    });

    document.getElementById('cart-header-count').innerText = count;
    document.getElementById('cart-badge-count').innerText = count;

    document.getElementById('cart-footer-subtotal').innerText = `${formatMoney(totalFinalPrice)}`;
    document.getElementById('cart-footer-total').innerText = `${formatMoney(totalFinalPrice)}`;

    let savings = totalNormalPrice - totalFinalPrice;
    if (savings > 0) {
        document.getElementById('cart-footer-old-total').style.display = 'block';
        document.getElementById('cart-footer-savings').style.display = 'block';
        document.getElementById('cart-footer-old-total').innerText = `${formatMoney(totalNormalPrice)}`;
        document.getElementById('cart-footer-savings').innerText = `Ahorras ${formatMoney(savings)}`;
    } else {
        document.getElementById('cart-footer-old-total').style.display = 'none';
        document.getElementById('cart-footer-savings').style.display = 'none';
    }

    let progress = (totalFinalPrice / FREE_SHIPPING_THRESHOLD) * 100;
    if(progress >= 100) {
        progress = 100;
        document.getElementById('shipping-text-msg').innerHTML = 'Felicitaciones, tienes <b>envío GRATIS</b>';
    } else {
        let remaining = FREE_SHIPPING_THRESHOLD - totalFinalPrice;
        document.getElementById('shipping-text-msg').innerHTML = `Te faltan <b>${formatMoney(remaining)}</b> para envío GRATIS`;
    }
    document.getElementById('shipping-progress-fill').style.width = `${progress}%`;

    document.getElementById('cross-sell-container').style.display = cart.length > 0 ? 'block' : 'none';
}

function changeDrawerCrossSellColor(productId, variantIdx) {
    crossSellSelections[productId] = variantIdx;
    renderCrossSellsDrawer(); 
}

function renderCrossSellsDrawer() {
    const container = document.getElementById('cross-sell-list');
    if (!container) return;
    container.innerHTML = '';

    crossSellData.forEach(product => {
        const selectedIdx = crossSellSelections[product.id];
        const currentImg = product.variants[selectedIdx].img;
        const fallback = getFallbackImg(product.name);

        const colorsHtml = product.variants.map((v, idx) => `
            <div class="color-dot ${idx === selectedIdx ? 'active' : ''}" 
                 style="background-color: ${v.hex};"
                 onclick="changeDrawerCrossSellColor('${product.id}', ${idx})">
            </div>
        `).join('');
        
        // DISEÑO DEL CAJON: Muestra DOBLE DESCUENTO
        const cardHTML = `
            <div class="cross-sell-card">
                <div class="img-container">
                    <img src="${currentImg}" alt="${product.name}" onerror="this.onerror=null; this.src='${fallback}'">
                </div>
                <h4>${product.name}</h4>
                
                <div class="price-block" style="align-items:center; margin-bottom:10px; display:flex; flex-direction:column;">
                    <span class="price-msrp" style="font-size: 10px; color: #aaa; text-decoration: line-through; margin-bottom: 2px;">Normal: ${formatMoney(product.msrp)}</span>
                    <div style="display:flex; align-items:baseline; gap:5px;">
                        <span class="price-old" style="font-size: 12px; color: #777; text-decoration: line-through;">${formatMoney(product.salePrice)}</span>
                        <span class="price-new" style="font-size: 15px; font-weight: 900; color: var(--premium-black);">${formatMoney(product.bundlePrice)}</span>
                    </div>
                </div>
                <div style="font-size: 10px; color: var(--brand-red); font-weight: bold; margin-bottom: 8px;">${product.discountText}</div>

                <div class="color-dots">${colorsHtml}</div>
                <button class="cross-sell-btn" onclick="addCrossSellDrawer('${product.id}')">AGREGAR</button>
                <div class="cs-card-error" id="cs-error-${product.id}"></div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}

function scrollCarousel(direction) {
    const carousel = document.getElementById('cross-sell-list');
    if (carousel) carousel.scrollBy({ left: 175 * direction, behavior: 'smooth' });
}

// --- FLUJO DE CHECKOUT ---
function processCheckout() {
    if (cart.length === 0) return;
    closeCart();
    document.getElementById('store-view').style.display = 'none';
    document.getElementById('checkout-view').style.display = 'block';
    window.scrollTo(0, 0);
    renderCheckoutSummary();
}

function backToStore() {
    document.getElementById('checkout-view').style.display = 'none';
    document.getElementById('store-view').style.display = 'block';
}

function renderCheckoutSummary() {
    const container = document.getElementById('checkout-summary-items');
    if (!container) return;
    container.innerHTML = '';
    let total = 0; let totalItems = 0;
    const isMainProductInCart = cart.some(item => item.isMain);

    cart.forEach(item => {
        let effectivePrice = item.salePrice;
        let htmlTag = '';

        if (!item.isMain && isMainProductInCart) {
            effectivePrice = item.bundlePrice;
            htmlTag = `<div style="font-size:11px; color:#059669; font-weight: bold; margin-top:2px;">Pack descuento activado</div>`;
        } else if (!item.isMain && !isMainProductInCart) {
            htmlTag = `<div style="font-size:11px; color:var(--brand-red); font-weight: bold; margin-top:2px;">Dscto. regular aplicado (Falta máquina para 5% extra)</div>`;
        }

        const itemTotal = effectivePrice * item.quantity;
        total += itemTotal; totalItems += item.quantity;
        
        const currentVariant = item.variants ? item.variants[item.selectedVariantIdx] : null;
        
        let currentImg = getFallbackImg(item.name);
        if (item.isMain && item.galleryImages && item.galleryImages.length > 0) {
            currentImg = item.galleryImages[0];
        } else if (!item.isMain && currentVariant && currentVariant.img) {
            currentImg = currentVariant.img;
        }

        const fallback = getFallbackImg(item.name);

        const html = `
            <div class="checkout-summary-item">
                <div class="cs-img-wrap">
                    <img src="${currentImg}" alt="" onerror="this.onerror=null; this.src='${fallback}'">
                    <div class="cs-qty">${item.quantity}</div>
                </div>
                <div class="cs-info">
                    <div class="cs-title">${item.name}</div>
                    ${currentVariant && !item.isMain ? `<div class="cs-price" style="font-size:12px; color:#777;">${currentVariant.colorName}</div>` : ''}
                    ${htmlTag}
                </div>
                <div class="cs-price">${formatMoney(itemTotal)}</div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });

    document.getElementById('checkout-item-count').innerText = totalItems;
    document.getElementById('checkout-subtotal').innerText = `${formatMoney(total)}`;
    document.getElementById('checkout-total').innerText = formatMoney(total);
}

document.addEventListener("DOMContentLoaded", () => {
    initProductPage();
    renderCart();
});