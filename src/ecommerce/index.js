(function () {
    "use strict";

    const products = {
        baseURL: 'https://dummyjson.com/products',

        fetchProducts: async function (url) {
            const controller = new AbortController();
            const signal = controller.signal;

            try {
                const endpoint = (url || `${this.baseURL}`);
                const response = await fetch(endpoint, { signal });

                setTimeout(() => { controller.abort() }, 2000);

                if (response.ok) {
                    const result = await response.json();

                    return { data: result.products }
                }

            } catch (error) {
                console.error('Something Went Wrong while Fetching Products. Please Try Again.');
            }
        },

        debounce: function (func, delay) {
            let debounceTimer;
            return function (...args) {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => { func.apply(this, args) }, delay);
            }
        },

        addToCart: async function (productId) {
            try {
                const response = await fetch(`${this.baseURL}/${productId}`);
                if (response.ok) {
                    const product = await response.json();

                    const products = await this.methods.getFromLocalStorage();

                    const existingProduct = products.find((item) => item.id === product.id);

                    if (!existingProduct) {
                        product.quantity = 1;
                        product.selected = true;
                        await products.push(product);
                        this.methods.storeToLocalStorage(products);
                    }
                }
            } catch (error) {
                console.error('Error adding product to cart:', error.message);
            }
        },

        cartCount: function () {
            const cartCount = document.querySelector('#js-cartCount');
            const products = this.methods.getFromLocalStorage();
            cartCount.innerHTML = products.length;
        },

        render: function (productsList) {
            const selectedProducts = this.methods.getFromLocalStorage();

            productsList.forEach(product =>
                product.selected = selectedProducts.some(selectedProduct => product.id === selectedProduct.id)
            )
            console.log(productsList);

            const productsListing = document.querySelector('#js-products');
            let productMarkup = '';

            productsList.forEach((product) => {
                const discountedPrice = product.price - (product.price * (product.discountPercentage / 100));
                productMarkup += `<li data-id="${product.id}"
                                class=" hover:shadow-md hover:shadow-gray-400 bg-white rounded-lg  cursor-pointer">
                                <!-- image -->
                                <div class=" w-full h-40">
                                    <img class="w-full h-full object-contain" src=${product.thumbnail}
                                        alt="Product Image">
                                </div>

                                <!--description -->
                                <div class="p-4 space-y-2">
                                    <h2 class="line-clamp-2 font-medium text-lg">${product.title}</h2>
                                    <!-- rating -->
                                    <div class="flex py-1 justify-center items-center rounded-sm space-x-1 bg-green-700 text-white w-14">
                                        <span class="text-sm  ">${product.rating}</span>
                                        <svg class="w-4 h-4 "
                                                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                <path
                                                    d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z">
                                                </path>
                                            </svg>
                                    </div>

                                    <!-- price -->
                                    <div class="flex space-x-2 items-center"><span class="font-semibold text-xl ">&#8377;${discountedPrice.toFixed(2)}</span>
                                        <span class="text-gray-500 line-through">&#8377;${Number(product.price)}</span>
                                        <div class="text-green-700 font-medium text-sm"><span>${product.discountPercentage}%</span> <span>off</span></div>
                                    </div>

                                    <!-- Add To Cart -->
                                    <button type="button"  class="js-addToCartBtn hover:bg-indigo-700 bg-blue-600 text-white w-full py-2 rounded-md" aria-label="Add To Cart">${product.selected ? "Go To Cart" : "Add To Cart"}</button>
                                </div>
                            </li>`;
            })
            productsListing.innerHTML = productMarkup;
        },

        methods: {
            pagination: function () {
                try {
                    const totalProducts = 100;
                    const limit = 30;
                    const totalpage = totalProducts / limit;

                    const btnContainer = document.querySelector('#js-btnContainer');
                    let btn;
                    for (let i = 0; i < `${totalpage}`; i++) {
                        btn = document.createElement('button');
                        btn.innerHTML = `${i + 1}`;
                        btn.className = 'bg-blue-100 px-2 rounded-md text-blue-800';
                        btn.setAttribute('aria-label', 'Pagination Buttons');
                        btn.setAttribute('value', `${i}`);
                        btnContainer.appendChild(btn)
                    }

                    btnContainer.addEventListener('click', async (e) => {
                        const skip = e.target.value * limit;
                        const response = await products.fetchProducts(`${products.baseURL}?limit=${limit}&skip=${skip}`);
                        const result = await response.data;
                        window.scrollTo(0, 0);
                        products.render(result);
                    })
                } catch (error) {
                    console.error(error);
                }
            },

            getFromLocalStorage: function () {
                try {
                    return JSON.parse(localStorage.getItem('cartProducts')) || [];
                } catch (error) {
                    console.log('Unable to fetch data from LocalStorage!');
                }
            },

            storeToLocalStorage: function (product) {
                try {
                    return localStorage.setItem('cartProducts', JSON.stringify(product));
                } catch (error) {
                    console.log('Unable to store data in LocalStorage!')
                }
            },
        },

        bind: function () {
            //Search
            const searchInput = document.querySelector('#js-searchInput');
            const productsListing = document.querySelector('#js-products');

            if (searchInput) {
                const search = this.debounce(async (searchValues) => {
                    try {
                        const response = await fetch(`${this.baseURL}/search?q=${searchValues}`);
                        if (response.ok) {
                            const data = await response.json();
                            this.render(data.products);
                        }
                    } catch (error) {
                        console.log('Something Went Wrong While Searching Products');
                    }
                }, 350)
                searchInput.addEventListener('input', () => search(searchInput.value.trim()));
            }

            // Add to cart 
            if (productsListing) {
                productsListing.addEventListener('click', async (e) => {
                    const addToCartBtn = e.target.closest('.js-addToCartBtn');
                    if (addToCartBtn) {
                        const targetedProduct = addToCartBtn.closest('LI');
                        const productId = targetedProduct.dataset.id;
                        await this.addToCart(productId);
                        this.cartCount();

                        // Update the button text
                        addToCartBtn.innerHTML = 'Go To Cart';
                    }
                })
            }

            //Image Viewer
            const products = document.querySelectorAll("#js-products li");
            products.forEach((product) => {
                const gallery = new Viewer(product, {
                    toolbar: {
                        zoomIn: 1,
                        zoomOut: 1,
                        rotateLeft: 1,
                        rotateRight: 1,
                        flipHorizontal: 1,
                        flipVertical: 1,
                    },
                    transition: true,
                });
            });

        },

        init: async function () {
            try {
                // Fetch products
                const response = await this.fetchProducts(`${this.baseURL}`);
                this.render(response.data);

                this.bind();
                this.cartCount();
                this.methods.pagination();
            } catch (error) {
                console.error('Error initializing:', error.message);
            }
        }

    }
    products.init();
})()