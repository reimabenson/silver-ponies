class CartRemoveAllButton extends HTMLElement {
    constructor() {
        super();

        this.clearButton = this.querySelector('button');

        this.clearButton.addEventListener('click', this.clearAll.bind(this));
    }

    clearAll(event) {
        event.preventDefault();
        
        if (this.clearButton.getAttribute('aria-disabled') === 'true') return;

        this.clearButton.setAttribute('aria-disabled', true);
        this.clearButton.classList.add('loading');
        this.querySelector('.loading__spinner').classList.remove('hidden');

        const {
            source,
            container
        } = this.dataset;

        const cartContainer = document.querySelector(container);

        if (!cartContainer) return;

        const body = JSON.stringify({
            sections: cartContainer.getSectionsToRender().map((section) => section.section),
            sections_url: window.location.pathname,
        });

        fetch(`${routes.cart_clear_url}`, { ...fetchConfig(), ...{ body }})
            .then((response) => {
                return response.text();
            })
            .then((state) => {
                const parsedState = JSON.parse(state);

                const cartItems = document.querySelector('cart-items');
                const cartDrawerWrapper = document.querySelector('cart-drawer');
                const cartFooter = document.getElementById('main-cart-footer');
                
                if (cartItems) cartItems.classList.toggle('is-empty', parsedState.item_count === 0);
                if (cartFooter) cartFooter.classList.toggle('is-empty', parsedState.item_count === 0);
                if (cartDrawerWrapper) cartDrawerWrapper.classList.toggle('is-empty', parsedState.item_count === 0);

                publish(PUB_SUB_EVENTS.cartClear, { source, cartData: parsedState });

                if (parsedState.item_count === 0 && cartDrawerWrapper) {
                    console.log('trapFocus function!');
                    trapFocus(cartDrawerWrapper.querySelector('.drawer__inner-empty'), cartDrawerWrapper.querySelector('a'));
                }
            })
            .catch(() => {
                const errors = this.querySelector('span.error-message');
                errors.textContent = window.cartStrings.error;
            })
            .finally(() => {
                this.clearButton.classList.remove('loading');
                this.clearButton.removeAttribute('aria-disabled');
                this.querySelector('.loading__spinner').classList.add('hidden');
            });
    }
}

customElements.define('cart-remove-all-button', CartRemoveAllButton);
