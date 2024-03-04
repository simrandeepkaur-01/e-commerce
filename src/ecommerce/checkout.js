(function () {
    "use strict";

    const cart = {
        render: function (products) {
            const productsListing = document.querySelector('#js-products');

            let productMarkup = '';
            let totalPrice = 0;
            let totalDiscountedPrice = 0;

            products.forEach((product) => {
                const discountedPrice = product.price - (product.price * product.discountPercentage / 100);
                totalDiscountedPrice += product.quantity * discountedPrice;

                productMarkup += ` <li data-id=${product.id} class="flex items-center gap-4 p-4 relative">
                                        <!-- Product Image -->
                                        <div class="w-32 h-28">
                                            <img src="${product.thumbnail}" class="w-full h-full object-contain"
                                                alt="Product Image">
                                        </div>

                                        <!-- Product Description -->
                                        <div class="absolute  right-2 top-2">
                                            <button type="button" onclick="cart.methods.removeProduct(${product.id})"
                                            class="text-gray-400 font-medium cursor-pointer">
                                            <svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21" fill="currentColor"><g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" transform="translate(2 2)"><circle cx="8.5" cy="8.5" r="8">
                                                </circle><g transform="matrix(0 1 -1 0 17 0)"><path d="m5.5 11.5 6-6"></path><path d="m5.5 5.5 6 6"></path></g></g></svg></button>
                                        </div>
                                        <div class="space-y-1 w-full">
                                            <h2 class="text-lg font-medium">${product.title}</h2>
                                            <h3 class="text-md ">${product.description}</h3>

                                            <div class="flex justify-between">
                                                <!-- price -->
                                                <div class="flex space-x-2 items-center">
                                                    <span class="font-semibold text-xl ">&#8377;${(product.quantity * discountedPrice).toFixed(2)}</span>
                                                    <span class="text-gray-500 line-through">&#8377;${product.price * product.quantity}</span>
                                                    <div class="text-green-700 font-medium text-sm"><span>${product.discountPercentage}%</span>
                                                        <span>off</span>
                                                    </div>
                                                </div>

                                                <!-- Quantity -->
                                                <div class="flex gap-1">
                                                    <button type="button" aria-label="decrease product quantity" onclick="cart.methods.decreaseQuantity(${product.id})" 
                                                        class="border border-gray-500 rounded-md p-1.5 shadow-sm shadow-gray-400">
                                                        <svg class="w-3 h-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" width="24"
                                                            height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                                            stroke-linecap="round" stroke-linejoin="round">
                                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                                        </svg>
                                                    </button>

                                                    <input type="number" value="${product.quantity}" onchange="cart.methods.updateQuantity(${product.id}, this.value)"
                                                        class="border border-gray-500 w-12 rounded-sm px-2 shadow-sm shadow-gray-400">

                                                    <button type="button" aria-label="increase product quantity" onclick="cart.methods.increaseQuantity(${product.id})" 
                                                        class="border border-gray-500 rounded-md p-1.5  shadow-sm shadow-gray-400">
                                                        <svg class="w-3 h-3 text-gray-500" xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 24 24" fill="currentColor">
                                                            <path fill="none" stroke="currentColor" stroke-width="2"
                                                                d="M12,22 L12,2 M2,12 L22,12">
                                                            </path>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </li>`;
                totalPrice += product.price * product.quantity;
            });
            productsListing.innerHTML = productMarkup;

            const priceDetails = document.querySelector('#js-priceDetails');
            priceDetails.innerHTML = `<h2 class="text-gray-500 text-lg font-medium p-3">PRICE DETAILS</h2>

                                        <!-- Price & Discount -->
                                        <dl class="p-4 space-y-3">
                                            <div class="flex justify-between">
                                                <dt class="font-medium">Price</dt>
                                                <dd class="font-medium text-lg">&#8377;${totalPrice.toFixed(2)}</dd>
                                            </div>
                                            <div class="flex justify-between">
                                                <dt class="font-medium">Discount</dt>
                                                <dd class="text-green-600 font-medium">-&#8377;${(totalPrice - totalDiscountedPrice).toFixed(2)}</dd>
                                            </div>
                                        </dl>

                                        <!-- Total Amount -->
                                        <dl class="flex justify-between text-xl font-semibold p-4">
                                            <dt>Total Amount</dt>
                                            <dd>&#8377;${totalDiscountedPrice.toFixed(2)}</dd>
                                        </dl>`;
            this.methods.amountToPay(totalDiscountedPrice);
        },

        methods: {
            amountToPay: function (totalDiscountedPrice) {
                const amount = {
                    amount: totalDiscountedPrice.toFixed(2)
                }
                localStorage.setItem('priceToPay', JSON.stringify([amount]));
            },

            increaseQuantity: function (productId) {
                const localStorageData = cart.methods.getFromLocalStorage();
                const updatedCart = localStorageData.map((product) => {
                    if (product.id === productId) {
                        if (product.quantity < product.stock) {
                            product.quantity = (product.quantity || 1) + 1;
                        } else {
                            alert("Quantity exceeds stock!");
                        }
                    }
                    return product;
                });
                cart.methods.storeToLocalStorage(updatedCart);
                cart.render(updatedCart);
            },

            decreaseQuantity: function (productId) {
                const localStorageData = cart.methods.getFromLocalStorage();

                const updatedCart = localStorageData.map(product => {
                    if (product.id === productId && product.quantity > 0) {
                        if (product.quantity === 1) {
                            const confirmRemove = window.confirm("Are you sure you want to remove this product?");
                            if (!confirmRemove) {
                                return product;
                            }
                        }
                        return { ...product, quantity: product.quantity - 1 };
                    }
                    return product;
                }).filter(product => product.quantity > 0);

                cart.methods.storeToLocalStorage(updatedCart);
                cart.render(updatedCart);
            },

            updateQuantity: function (productId, newQuantity) {
                const localStorageData = cart.methods.getFromLocalStorage();
                const updatedCart = localStorageData.map((product) => {
                    if (product.id === productId) {
                        product.quantity = parseInt(newQuantity, 10) || 1;
                    }
                    return product;
                });
                cart.methods.storeToLocalStorage(updatedCart);
                cart.render(updatedCart);
            },

            removeProduct: function (productId) {
                const localStorageData = cart.methods.getFromLocalStorage();
                const updatedCart = localStorageData.filter((product) => product.id !== productId);

                const confirmRemove = window.confirm("Are you sure you want to remove this product?");
                if (!confirmRemove) {
                    return;
                }

                cart.methods.storeToLocalStorage(updatedCart);
                cart.render(updatedCart);
            },

            getFromLocalStorage: function () {
                try {
                    return JSON.parse(localStorage.getItem('cartProducts')) || [];
                } catch (error) {
                    throw new Error('Unable to fetch data from LocalStorage!');
                }
            },

            storeToLocalStorage: function (product) {
                try {
                    return localStorage.setItem('cartProducts', JSON.stringify(product));
                } catch (error) {
                    throw new Error('Unable to store data in LocalStorage!')
                }
            },
        },

        init: function () {
            this.render(this.methods.getFromLocalStorage());
        }
    }

    window.cart = cart;
    cart.init();
})()