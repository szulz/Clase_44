let prodForm = document.getElementById('prod-form')

prodForm.addEventListener('submit', async function (e) {
    e.preventDefault()
    let product = document.getElementsByTagName('input')[0].value
    await fetch(`/products/list/${product}/`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(parsedRes => {
            if (parsedRes.status === 'Error') return window.alert(parsedRes.message)
            let response = document.getElementsByTagName('div')[0]
            response.innerHTML = `
            <h2> Current product: ${product}</h2>
            <h3>Status: ${parsedRes.message}</h3>
            *you might want to reload the page to see the changes*
            `
        })
})


/*
let from = document.getElementById('form-id')
 
from.addEventListener('submit', async function (e) {
    e.preventDefault()
    let inputText = document.getElementsByTagName('input')[0].value
    await fetch(`/products/get-one/${inputText}`, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(parsedResponse => {
            let payload = parsedResponse.payload
            if (payload) {
                if (payload.stock === 0) {
                    return window.alert('No hay stock')
                }
            } else {
                return window.alert('Id incorrecto')
            }
            let hText = document.getElementsByTagName('h1')[0];
            hText.innerHTML = payload._id
        })
})
*/
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
                        .then(res => res.json())
                        .then(parseRes => {
                            if (parseRes.status === 'Error') return window.alert(parseRes.message)
                            return window.alert("Product added to the cart")
                        })
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
    redirectToURL(`/auth/logOut`)
}

async function goToPurchase() {
    const currentURL = window.location.href;
    const purchaseURL = currentURL + "/purchase";
    window.location.href = purchaseURL;
}
