const vm = new Vue({
    el: "#app",
    data: {
        activeCart: false,
        alertMessage: "",
        cart: [],
        product: {},
        products: [],                
        showAlertMessage: false
    },
    filters: {
        currency (value) {
            return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        }
    },
    methods: {
        cartTotalPrice () {
            let total = 0

            if (this.cart.length) {
                this.cart.forEach(item => {
                    total += item.price
                })
            }

            return total
        },
        addCartItem () {
            if (this.product.stock > 0) {
                const { id, name, price } = this.product

                const findProduct = this.cart.find((item) => {
                    return item.id === id
                })

                const index = this.cart.findIndex((item) => {
                    return item.id === id
                })

                let quantity = 1
                if (findProduct) {
                    quantity = findProduct.quantity + 1
                    const priceFinal = price * quantity

                    this.cart[index] = {
                        "id": id, 
                        "name": name, 
                        "price": priceFinal,
                        "quantity": quantity
                    }

                    window.localStorage.cart = JSON.stringify(this.cart)
                } else {
                    this.cart.push({
                        "id": id, 
                        "name": name, 
                        "price": price,
                        "quantity": quantity
                    })
                }

                this.scrollTop()            
                this.alert(`${name} Adicionado ao carrinho.`)                
            }
        },
        alert (message) {
            this.alertMessage = message
            this.showAlertMessage = true
            setTimeout(() => {
                this.alertMessage = ""
                this.showAlertMessage = false                
            }, 1500)
        },
        checkCart () {
            if (window.localStorage.cart) {
                this.cart = JSON.parse(window.localStorage.cart)
            }
        },
        closeCartModal ({ target, currentTarget }) {
            if (target === currentTarget) {
                this.activeCart = false
            }
        },
        closeProductModal ({ target, currentTarget }) {
            if (target === currentTarget) {
                this.product = {}
            }
        },
        async fetchProductDetail (name) {
            const response = await fetch(`../api/products/${name.toLowerCase()}/dados.json`)
            this.product = await response.json()
        },
        async fetchProducts () {
            const response = await fetch('../api/products.json')
            this.products = await response.json()
        },
        openProductModal (name) {
            this.fetchProductDetail(name)
            this.scrollTop()            
        },
        removeCartItem (index) {
            this.cart.splice(index, 1)
        },
        router () {
            const hash = document.location.hash
            if (hash) {
                this.openProductModal(hash.replace("#", ""))
            }
        },
        scrollTop () {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            })
        },
        stockQuantity () {
            const stockQuantity = this.product.stock
            let cartQuantity = 0

            const findProduct = this.cart.find((item) => {
                return item.id === this.product.id
            })

            if (findProduct) {
                cartQuantity = findProduct.quantity
            }
               
            return stockQuantity - cartQuantity
        }  
    },
    created () {
        this.fetchProducts()
        this.checkCart()
        this.router()
    },
    watch: {
        cart () {
            window.localStorage.cart = JSON.stringify(this.cart)
        },
        product () {
            document.title = this.product.name || "Techno"
            const route = this.product.name ? this.product.name.toLowerCase() : ""
            history.pushState(null,null,`#${route}`)
        }
    }
})