function deleteProduct(id) {
    fetch(`/api/products/${id}`, {
        method: "DELETE",
    })
}


//cuando preciono agregar, crear un carrito y si agrego, la proxima vez que toque, no crea otro carro, capturo el id => agrego el producto al carro.
async function addProduct(productId) {
    try {
        let checkStock = 0
        fetch(`/products/stock/${productId}`, {
            method: "GET",
        })
            .then(response => response.json())
            .then(parsedResponse => {
                checkStock = parsedResponse.data
                if (checkStock > 0) {
                    fetch(`/carts/products/${productId}`, {
                        method: "POST",
                    })
                    window.alert("Product added to the cart")
                } else {
                    window.alert("Whops! it seems theres no more of these in stock, please refresh the page to see the actual stock")
                }
            })
    } catch (e) {
        res.send({ msg: e })
    }
}


function redirectToURL(url) {
    window.location.href = url;
}


async function logOut() {
    localStorage.clear()
    redirectToURL(`http://localhost:8080/auth/logOut`)
}

async function goToPurchase() {
    const currentURL = window.location.href;
    const purchaseURL = currentURL + "/purchase";
    window.location.href = purchaseURL;
}
