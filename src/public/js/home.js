function deleteProduct(id) {
    fetch(`/api/products/${id}`, {
        method: "DELETE",
    })
}


async function finishPurchase(cartid) {
    let redirectUrl = `/carts/${cartid}/checkout`
    fetch(`/carts/${cartid}/purchase`, {
        method: 'POST',
    })
    window.location.href = redirectUrl
}
