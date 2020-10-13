function send_receipt_whatsapp(id) {
    let phone_number=document.getElementById("phone_number").value;
    let cart = '/api/cart';
    let message = "Thank you for shopping at ShopRight Supermarket. Your receipt for recent order is as follows:%0a";

    $.ajax({
        method: "GET",
        data: {'order_id': id},
        url: cart,
        success: function (data) {
            $.each(data.items, function (i, item) {
                // console.log(item.product.name)
                message = message.concat(
                    `${item.quantity}x${item.product.name}=₹${item.amount}%0a`);
            }

            );
            console.log(data.cart_items_quantity)
            message = message.concat(`*total_quantities=${data.cart_items_quantity}*%0a*total_bill_amount=₹${data.cart_total}*`)
            let url = "https://web.whatsapp.com/send?text=" + message + "&phone="+ '91' + phone_number
            // var win = window.open(`https://wa.me/${num}?text=I%27m%20api%20msg%20hello%20${name}%20friend%20${msg}`, '_blank');
            const win = window.open(url, '_blank');
            win.focus();
        },
        error: function (error_data) {
            console.log("error in sending whatsapp recipt");
            console.log(error_data)
        }

    }).done(function () {
        //on return, add here
    });
}