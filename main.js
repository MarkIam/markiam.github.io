var baseInvoicesUrl = "https://markb-invoices-project.herokuapp.com/invoices";
var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var invoiceIdToEdit = '';

function updateData(){
    var filterValue = $('#searchInput').val();
    var filterFieldValue = $('#filterFieldSelect').val();
    var orderFieldValue = $('#orderFieldSelect').val();
    var orderDirectionValue = $('#orderDirectionSelect').val();
    
    var urlParameters = filterFieldValue == 'all' ?
                        (filterValue.length > 0 ? '?q=' + filterValue : ''):
                        '?' + filterFieldValue + '=' + filterValue;
    if (orderDirectionValue != 'no'){
        urlParameters += urlParameters.length == 0 ? '?' : '&';
        urlParameters += '_sort=' + orderFieldValue + '&_order=' + orderDirectionValue;
    }
    $("#invoicesTable tbody").empty();
    $.get(baseInvoicesUrl + urlParameters, function( data ) {
        $(data).each(function(idx, elem){
            $('#invoicesTable tbody').append('<tr id="' + elem.id + '">'+
                                                '<td>' + elem.date_created + '</td>'+
                                                '<td>' + elem.number + '</td>'+
                                                '<td style="display:none;">' + elem.date_due + '</td>'+
                                                '<td>' + elem.date_supply + '</td>'+
                                                '<td>' + elem.comment + '</td>'+
                                                '<td>' +
                                                '<a href="javascript:void(0);" onclick="editInvoice(\'' + elem.id + '\');">Редактировать</a>'+
                                                '<a href="javascript:void(0);" onclick="DeleteInvoice(\'' + elem.id + '\')";>Удалить</a>'+
                                                '</td>'+
                                              '</tr>');
        });
    });
}

function getObject(){
    var obj = {
        number: $('#numberInput').val(),
        date_created: FormatNativeDate(new Date()),
        date_due: FormatDateFromInput($('#invoiceDateInput').val()),
        date_supply: FormatDateFromInput($('#supplyDateInput').val()),
        comment: $('#commentInput').val()
    };
    if (invoiceIdToEdit)
        delete obj.date_created;
    return obj;
}

function ClearInputs(){
    $('#numberInput').val(''),
    $('#invoiceDateInput').val(''),
    $('#supplyDateInput').val(''),
    $('#commentInput').val('')
}

function FormatNativeDate(dat){
    var day = dat.getDate().toString();
    day = day.length == 1 ? '0' + day : day;
    return day + ' ' + monthNames[dat.getMonth()] + ' ' + dat.getFullYear();
}

function FormatDateFromInput(inputVal){
    var datCmpnts = inputVal.split("-");
    return FormatNativeDate(new Date(datCmpnts[0], datCmpnts[1] - 1, datCmpnts[2]));
}

function InvoiceDateToInputFormat(dateStr){
    var datCmpnts = dateStr.split(" ");
    var month = (monthNames.indexOf(datCmpnts[1]) + 1).toString();
    month = month.length == 1 ? '0' + month : month;
    return datCmpnts[2] + "-" + month + "-" + datCmpnts[0];
}

function IsValid(){
    return $('#numberInput').val() && $('#invoiceDateInput').val() && $('#supplyDateInput').val() && $('#commentInput').val();
}

function CreateInvoice(){
    if (!IsValid()){
        alert('Please fill all the invoice attributes.');
        return;
    }
    var obj = getObject();
    if (invoiceIdToEdit){
        $.ajax({
            url: baseInvoicesUrl + '/' + invoiceIdToEdit,
            type: 'PATCH',
            data: obj,
            success: function(result) {
                updateData();
            }
        });
    }
    else{
        $.post(baseInvoicesUrl, obj, function(){
            updateData();
        });
    }
}

function ShowInvoiceDialog(pTitle){
    $('#invoiceInfo').dialog({
        title: pTitle,
        height: "auto",
        width: 400,
        modal: true,
        buttons: {
            "OK": function() {
                CreateInvoice();
                $(this).dialog( "close" );
            },
            Cancel: function() {
                $(this).dialog( "close" );
            }
        }
    });
}

function editInvoice(invoiceId){
    invoiceIdToEdit = invoiceId;
    var rowToEdit = $('tr#' + invoiceId);
    $('#numberInput').val(rowToEdit.children()[1].innerText);
    $('#invoiceDateInput').val(InvoiceDateToInputFormat(rowToEdit.children()[2].innerText));
    $('#supplyDateInput').val(InvoiceDateToInputFormat(rowToEdit.children()[3].innerText));
    $('#commentInput').val(rowToEdit.children()[4].innerText);

    ShowInvoiceDialog('Edit invoice');
}

function DeleteInvoice(invoiceId){
    if (confirm("Do you really want to delete the invoice?")){
        $.ajax({
            url: baseInvoicesUrl + '/' + invoiceId,
            type: 'DELETE',
            success: function(result) {
                updateData();
            }
        });
    }
}

$(document).ready(function(){
    $('#goButton').click(function(){
        updateData();
    });
    $('#addInvoiceButton').click(function(){
        invoiceIdToEdit = '';
        ClearInputs();
        ShowInvoiceDialog('Create invoice');
    });
    updateData();
});