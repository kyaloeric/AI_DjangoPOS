let product_code_to_update, product_code_to_delete, variation_id_to_update, variation_id_to_delete;
const dataTable = $("#products-datatable");
const common_product_category_selector = $('.product_categories');
const edit_product_category_selector = $('#edit_product_categories');
const add_product_category_selector = $('#add_product_categories');
let product_code_text_field_selector = $('#product_code');


const addProductDetails = function (product_form_selector, variation_form_selector) {
    const product_form_data = getFormData($(product_form_selector));
    const variation_form_data = getFormData($(variation_form_selector));

    product_form_data["product_code"] = $('#product_code').val();
    if (product_form_data["category"] === null) {
        product_form_data["category"] = [];
    } else product_form_data["category"] = add_product_category_selector.val().split(",");

    const data = {'product_data': product_form_data, 'variation_data': variation_form_data}
    console.log(data);

    let url = "/api/add-product-with-variation/"
    $.ajax(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        data: JSON.stringify(data),
        success: function (data) {
            console.log(data);
            toastr.info('Product was successfully added.');
            $(product_form_selector).trigger('reset');
            $(variation_form_selector).trigger('reset');
            $('#product_code').removeAttr('disabled');
            common_product_category_selector.tagator('refresh');
            dataTable.DataTable().draw(false);
        },
        error: function () {
            toastr.error('Product was not saved! Please try again.');
        },
        complete: function () {
            addCategoriesToInput(common_product_category_selector);
        }
    });
}

function generateProductCode(checkbox) {
    if (checkbox.checked) {
        let url = '/api/product-code-generator/';

        $.getJSON(url, {}, function (response) {
            console.log(response.unique_product_code);
            product_code_text_field_selector.val(response.unique_product_code);
            product_code_text_field_selector.attr('disabled', 'disabled');
        });
    } else {
        product_code_text_field_selector.val('');
        product_code_text_field_selector.removeAttr('disabled');
    }
}

function addCategoriesToInput(input_selector) {
    let url = '/api/product-categories/'
    $.getJSON(url, {}, function (category_data) {
        console.log(category_data);
        if (input_selector.data('tagator') !== undefined) {
            input_selector.tagator('destroy');
        }
        input_selector.tagator({
            autocomplete: category_data.categories,
            useDimmer: true,
            showAllOptionsOnFocus: true
        });
    });
}

function loadProductsData() {
    return dataTable.DataTable({
        'ajax': '/api/variations/?format=datatables',
        "fnInitComplete": function () {
            const myCustomScrollbar = document.querySelector('#products-datatable_wrapper .dataTables_scrollBody');
            const ps = new PerfectScrollbar(myCustomScrollbar);
        },
        "language": {
            "zeroRecords": `<div class="alert alert-warning text-center" role="alert">
                            No products found for your search! 
                            <a href="#" class="text-primary" data-toggle="modal" data-target="#addProductModalForm">Click Here to add product.</a></div>`
        },
        select: true,
        'columns': [
            {'data': 'product.product_code',},
            {'data': 'product.name'},
            {'data': 'cost'},
            {'data': 'mrp'},
            {'data': 'discount_price'},
            {
                'data': 'quantity', render: function (data, type, full) {
                    if (data === null) return "-";
                    if (full['quantity_unit'] === null) return data;
                    return data + " " + full['quantity_unit'];
                }
            },
            {
                'data': 'weight', render: function (data, type, full) {
                    if (data === null) return "-";
                    if (full['weight_unit'] === null) return data;
                    return data + " " + full['weight_unit'];
                }
            },
            {'data': 'product.company', render: handleBlankData},
            {'data': 'product.rack_number', render: handleBlankData},
            {
                'data': 'id', sortable: false, render: function (data, type, row) {
                    return `<a class="pr-3" href="/pos/product-label/${data}" target="_blank"><i class="fa fa-print" aria-hidden="true"></i></a>
                            <a class="pr-3"><i class="fa fa-plus" aria-hidden="true" data-toggle="modal" data-target="#addVariationModalForm" onclick="addAndUpdateVariationButtonAction('add-variation', '${data}', '${row.product.product_code}')"></i></a>
                            <a class="pr-3"><i class="fa fa-pen" aria-hidden="true" data-toggle="modal" data-target="#editProductModalForm" onclick="addAndUpdateVariationButtonAction('edit', '${data}', '${row.product.product_code}')"></i></a>
                            <a class=""><i class="fa fa-trash" aria-hidden="true" data-toggle="modal" data-target="#deleteProductPrompt" onclick="deleteProductConfirmation('${data}')"></i></a>`;
                }
            },
            {'data': 'quantity_unit', "visible": false},
            {'data': 'weight_unit', "visible": false}
        ],
    });
}

function editProductDetails(variation_id, product_code) {
    variation_id_to_update = variation_id;
    product_code_to_update = product_code;
    let url = '/api/variations/' + variation_id_to_update;
    $('#static-product-code').empty().html(product_code_to_update);

    $.getJSON(url, {}, function (response) {
        console.log(response);
        $.each(response, function (key, value) {
            let field_selector = $(`#edit-variation-form [name="${key}"]`);
            field_selector.val(value);
        })
        $.each(response.product, function (key, value) {
            let field_selector = $(`#edit-product-form [name="${key}"]`);
            field_selector.val(value);
        })
        console.log(response.product.category.join())
        edit_product_category_selector.val(response.product.category.join())
        edit_product_category_selector.tagator('refresh');
    });
}

function updateProductDetails(product_form_selector, variation_form_selector) {
    const product_form_data = getFormData($(product_form_selector));
    const variation_form_data = getFormData($(variation_form_selector));

    product_form_data["product_code"] = product_code_to_update;
    if (product_form_data["category"] === null) {
        product_form_data["category"] = [];
    } else product_form_data["category"] = edit_product_category_selector.val().split(",");

    const data = {'product_data': product_form_data, 'variation_data': variation_form_data}
    console.log(data);

    let url = "/api/variations/" + variation_id_to_update + "/";

    $.ajax(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        data: JSON.stringify(data),
        success: function (data) {
            toastr.info('Product details were successfully updated.');
            $('.close').click();
            dataTable.DataTable().draw(false);
        },
        error: function () {
            toastr.error('Product details were not updated! Please try again.');
        },
        complete: function () {
            addCategoriesToInput(common_product_category_selector);
        }
    });
}

const addVariation = (variation_form_selector) => {
    const variation_form_data = getFormData($(variation_form_selector));
    variation_form_data['product'] = product_code_to_update;

    const data = {'variation_data': variation_form_data}
    console.log(data);

    let url = "/api/add-product-with-variation/";

    $.ajax(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        data: JSON.stringify(data),
        success: function (data) {
            toastr.info('Variation was successfully added.');
            $('.close').click();
            dataTable.DataTable().draw(false);
        },
        error: function () {
            toastr.error('Variation details were not added! Please try again.');
        },
    });
}

function addAndUpdateVariationButtonAction(action, variation_id, product_code) {
    variation_id_to_update = variation_id;
    product_code_to_update = product_code;
    let url = '/api/variations/' + variation_id_to_update;
    $(`#${action}-static-product-code`).empty().html(product_code_to_update);

    const product_category_selector = `#${action}_product_categories`

    $.getJSON(url, {}, function (response) {
        console.log(response);
        $.each(response, function (key, value) {
            let field_selector = $(`#${action}-variation-form [name="${key}"]`);
            field_selector.val(value);
        })
        $.each(response.product, function (key, value) {
            let field_selector = $(`#${action}-product-form [name="${key}"]`);
            field_selector.val(value);
        })
        console.log(response.product.category.join())
        $(product_category_selector).val(response.product.category.join())
        $(product_category_selector).tagator('refresh');
    });
}

function deleteProductConfirmation(variation_id) {
    variation_id_to_delete = variation_id;
    $('#static-product-code-delete').empty().html(variation_id_to_delete);
}

function deleteProduct() {
    let url = "/api/variations/" + variation_id_to_delete + "/";

    $.ajax(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
    }).done(function () {
        toastr.info('Product was deleted successfully.');
        $('.close').click();
        dataTable.DataTable().draw(false);
    }).fail(function () {
        toastr.error('Unable to delete product! Please try again.');
    })
}

function changeDiscountPercent(discount_price_selector, discount_percent_selector, mrp_selector) {
    discount_percent_selector.val(roundToTwoDecimal(((mrp_selector.val() - discount_price_selector.val()) * 100) / mrp_selector.val()))
}

function changeDiscountPrice(discount_price_selector, discount_percent_selector, mrp_selector) {
    discount_price_selector.val(roundToTwoDecimal(mrp_selector.val() * (1 - discount_percent_selector.val() / 100)))
}


/**************************Events**************************/
$(document).ready(function () {
    $('#products-datatable thead tr').clone(true).appendTo('#products-datatable thead').attr("id", "advance-search-bar").attr("class", "d-none my-2").attr("style", "background: #f8f9fa");
    $('#products-datatable thead tr:eq(1) th').each(function (i) {
        const title = $(this).text();
        $(this).html(`<input type="text" class="form-control form-control-sm ml-1"/>`);
        if (i === 9) {
            $(this).html('<div class="mb-1 ml-4" id="advance-search-clear-button" type="button" onclick="resetAdvanceSearch()"><i class="fa fa-close" style="font-size: larger" aria-hidden="true"></i></div>');
        }
        $('input', this).on('keyup change', function () {
            if (table.column(i).search() !== this.value) {
                if (i === 1 && this.value !== "") {
                    table.column(i).search(this.value).draw();
                } else if (this.value !== "") {
                    table.column(i).search("^" + $(this).val(), true, false, true).draw();
                } else {
                    table.column(i).search(this.value).draw();
                }
            }
        });
    });
    const table = loadProductsData();
    addCategoriesToInput(common_product_category_selector)
});

/*Add Product Events*/
const add_discount_price_selector = $('#add_discount_price')
const add_discount_percent_selector = $('#add_discount_percent')
const add_mrp_selector = $('#add_mrp')

$('#generate_product_code_checkbox').change(function () {
    generateProductCode(this);
});

const productFormHandler = (action) => {
    const product_form_selector = `#${action}-product-form`
    const variation_form_selector = `#${action}-variation-form`

    if (!$(product_form_selector)[0].checkValidity()) {
        $(product_form_selector)[0].reportValidity();
    } else if (!$(variation_form_selector)[0].checkValidity()) {
        $(variation_form_selector)[0].reportValidity()
    } else {
        if (action === 'add') {
            addProductDetails(product_form_selector, variation_form_selector);
        } else if (action === 'edit') {
            updateProductDetails(product_form_selector, variation_form_selector)
        } else if (action === 'add-variation') {
            addVariation(variation_form_selector)
        }
    }
}

$('#add-product-form-submit').click(function () {
    productFormHandler('add');
});

$('#edit-product-form-submit').click(function () {
    productFormHandler('edit');
});

$('#add-variation-product-form-submit').click(function () {
    productFormHandler('add-variation');
});

add_discount_price_selector.on('input', function () {
    changeDiscountPercent(add_discount_price_selector, add_discount_percent_selector, add_mrp_selector)
});

$('#add_discount_percent, #add_mrp').on('input', function () {
    changeDiscountPrice(add_discount_price_selector, add_discount_percent_selector, add_mrp_selector)
});

/*Edit Product Events*/
const edit_discount_price_selector = $('#edit_discount_price')
const edit_discount_percent_selector = $('#edit_discount_percent')
const edit_mrp_selector = $('#edit_mrp')

$('#product-delete-yes').on('click', function (e) {
    deleteProduct();
});

edit_discount_price_selector.on('input', function () {
    changeDiscountPercent(edit_discount_price_selector, edit_discount_percent_selector, edit_mrp_selector)
});

$('#edit_discount_percent, #edit_mrp').on('input', function () {
    changeDiscountPrice(edit_discount_price_selector, edit_discount_percent_selector, edit_mrp_selector)
});

$('.product_companies').autocomplete(
    {
        serviceUrl: '/api/product-companies',
    }
);

const searchProductCodeInDatatable = (product_code) => {
    $('#toggle-advance-search-button').prop('checked', true).change();
    $('#advance-search-bar > th:nth-child(1) > input').val(product_code);
    dataTable.DataTable().column(0).search("^" + product_code + "$", true, false, true).draw();
}

$(function () {
    $(document).pos();
    $(document).on('scan.pos.barcode', function (event) {
        $('#toggle-advance-search-button').prop('checked', true).change();
        $('#advance-search-bar > th:nth-child(1) > input').val(event.code);
        dataTable.DataTable().column(0).search("^" + event.code + "$", true, false, true).draw();
    });
});

const checkProductExists = async (product_code) => {
    let url = "/api/product-and-variations/"
    let product_exists = false;
    const data = {
        'product_code': product_code,
        'action': 'product_check'
    }
    console.log(data)
    await $.ajax(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        data: data,
        success: function (data) {
            console.log(data)
            product_exists = data.product_exists;
        },
        error: function () {
            toastr.error('Could not check product code existence! Please try again.');
        },
        complete: function (data) {
        }
    });
    return product_exists;
}

product_code_text_field_selector.focusout(async () => {
    const product_code = product_code_text_field_selector.val()
    if (product_code) {
        const product_exists = await checkProductExists(product_code)
        console.log(product_exists)
        if (product_exists) {
            $('#addProductModalForm').modal('hide');
            product_code_text_field_selector.val('');
            $('#extraConfirmationPrompt h5.modal-title').html('Product Already Exists!')
            $('#extraConfirmationPrompt div.modal-body').html(`Product Code - ${product_code} already exists! Choose From Below Options.`)
            $('#modal-yes-button').html('Check Product Details').attr('onclick', `searchProductCodeInDatatable(${product_code}); $('#extraConfirmationPrompt').modal('hide');`);
            $('#modal-no-button').html('Change Product Code').attr('onclick', `$('#addProductModalForm').modal('show'); `);
            $('#extraConfirmationPrompt').modal('show');
        }
    }
})

$('.modal').on('shown.bs.modal', () => {
    $('.modal').find('input:first').trigger('focus');
})