var active       = 'is-active',
    select       = $('.select'),
    show         = $('.show'),
    close        = $('.close'),
    modal        = $('.modal'),
    selectInput  = $('.select-input');



// You Tube 16:9
var $allVideos = $("iframe"),
    $fluidEl = $(".modal__video");
$allVideos.each(function() {
    $(this).data('aspectRatio', this.height / this.width).removeAttr('height').removeAttr('width');
});
$(window).resize(function() {
    var newWidth = $fluidEl.width();
    $allVideos.each(function() {
        var $el = $(this);
        $el.width(newWidth).height(newWidth * $el.data('aspectRatio'));
    });
}).resize();



//Модальные окна
function openModal(modalName, errorText) {
    console.log(modalName);
    modal.addClass(active);
    $(modalName).addClass(active);
    if (errorText) {
        $(modalName).find('.desc').text(errorText);
    }
}
function closeModal() {
    modal.removeClass(active);
    modal.find('.modal__content').removeClass(active);
}
show.click(function () {
    openModal($(this).attr('data-modal'));
    return false;
});
close.click(function () {
    closeModal();
    return false;
});


//Выпадаюший список
selectInput.click(function () {
    select.find('.select-list').addClass(active);
    selectInput.addClass(active);
    $('.city').removeClass(active);
    select.find('.select-list > li').click(function () {
        var _this = $(this).text();
        $('#user_city').attr('value', _this);
        selectInput.find('span').html('<span style="color: #333;">' + _this + '</span>');
        select.find('.select-list').removeClass(active);
        selectInput.removeClass(active);
    });
});

//Маска для ввода промокода
var options =  {
    onKeyPress: function(cep, event, currentField, options){
        currentField[0].value = currentField[0].value.toLocaleUpperCase();
        $('.error-code').removeClass(active);
    },
    onInvalid: function(val, e, f, invalid, options){
        if (invalid) {
            $('.error-code').addClass(active);
        }

    }
};

$('.code').mask('AAAAAAAA', options);



