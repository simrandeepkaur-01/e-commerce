(function () {
    "use strict";

    const orderSummary = {
        render: function () {
            const productsListing = document.querySelector('#js-productsListing');
            const purchasedProducts = this.methods.getFromLocalStorage('cartProducts');
            let productMarkup = '';

            purchasedProducts.forEach((product) => {
                let discountedPrice = product.price - (product.price * (product.discountPercentage / 100));
                discountedPrice *= product.quantity;

                productMarkup += `<li class="flex items-center gap-6 py-2">
                                    <div class="h-20 w-20">
                                        <img src="${product.thumbnail}"
                                            alt="Product Image" class="h-full w-full object-contain object-center mx-auto">
                                    </div>
                                    <article class="flex-1 gap-4 flex justify-between">
                                        <div class="h-20  flex flex-col justify-between">
                                            <h2 class="text-lg font-medium">${product.title}</h2>
                                            <h3 class="font-medium text-md line-clamp-1">${product.description}</h3>
                                            <dl class="flex gap-2">
                                                <dt class="font-medium">Quantity:</dt>
                                                <dd>${product.quantity}</dd>
                                            </dl>
                                        </div>
                                        <div class="text-xl font-semibold">${discountedPrice.toFixed(2)}</div>
                                    </article>
                                </li>`
            });
            productsListing.innerHTML = productMarkup;
            // localStorage.removeItem("cartProducts");
        },

        bind: function () {
            const amountToPay = this.methods.getFromLocalStorage('priceToPay');
            const orderDetails = this.methods.getFromLocalStorage('orderDetails');
            const userInfo = this.methods.getFromLocalStorage('userInfo');

            const transactionId = orderDetails[0].paymentId;
            const orderId = orderDetails[0].orderId;

            const totalAmount = amountToPay[0].amount;

            let firstName, lastName, address, city, state, zip;
            [firstName, lastName, address, city, state, zip] = [userInfo.firstName, userInfo.lastName, userInfo.address, userInfo.city, userInfo.state, userInfo.zip];
            const deliveryAddress = `${firstName} ${lastName}, ${address} ${city} ${state}, ${zip}`;

            targetElements('js-totalAmount', totalAmount);
            targetElements('js-address', deliveryAddress);
            targetElements('js-paymentInfo', transactionId);
            targetElements('js-orderId', orderId);

            function targetElements(elem, value) {
                const element = document.getElementById(elem);
                element.innerHTML = value;
                return element;
            }
        },

        methods: {
            getFromLocalStorage: function (data) {
                try {
                    return JSON.parse(localStorage.getItem(data)) || [];
                } catch (error) {
                    throw new Error('Unable to fetch data from LocalStorage!');
                }
            },
        },

        init: function () {
            this.render();
            this.bind();
            localStorage.removeItem("cartProducts");
        }
    }
    orderSummary.init();
})()