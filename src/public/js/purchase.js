async function deleteThis(id) {
    const currentURL = window.location.href;
    const purchaseURL = currentURL + `/products/${id}`
    let url = purchaseURL.toString()
    await fetch(url, {
        method: 'delete'
    })
        .then(res => res.json())
        .then(response => {
            window.alert(response.message)
        })
        .then(setTimeout(() => {
            location.reload()
        }, 1000))
}


async function goToPurchase() {
    const currentURL = window.location.href;
    const purchaseURL = currentURL + "/purchase";
    window.location.href = purchaseURL;
}