$('.custom-select').each(function(){
    var wrapperClass = 'custom-select-wrapper',
        selectClass = 'custom-select-styled',
        optionClass = 'custom-select-option',
        activeClass = 'is-active',
        selectedClass = 'is-selected';
    var $this = $(this),
        numberOfOptions = $(this).children('option').length;
    $this.wrap('<div class="' + wrapperClass + '"></div>');
    $this.after('<div class="' + selectClass + '"></div>');

    var $styledSelect = $this.next('div.' + selectClass);
    $styledSelect.text($this.children('option').eq(0).text());

    var $list = $('<ul />', {
        'class': optionClass
    }).insertAfter($styledSelect);

    for (var i = 0; i < numberOfOptions; i++) {
        $('<li />', {
            text: $this.children('option').eq(i).text(),
            rel: $this.children('option').eq(i).val()
        }).appendTo($list);
        if ($this.children('option').eq(i).is(':selected')){
            $styledSelect.text($this.children('option').eq(i).text());
            $('li[rel="' + $this.children('option').eq(i).val() + '"]').addClass(selectedClass);
        }
    }

    var $listItems = $list.children('li');

    $styledSelect.click(function(e) {
        e.stopPropagation();
        $('div.' + selectClass + '.' + activeClass).not(this).each(function(){
            $(this).removeClass(activeClass).next('ul.' + optionClass).hide();
        });
        $(this).toggleClass(activeClass).next('ul.' + optionClass).toggle();
    });

    $listItems.click(function(e) {
        e.stopPropagation();
        $styledSelect.text($(this).text()).removeClass(activeClass);
        $this.val($(this).attr('rel'));
        $listItems.removeClass(selectedClass);
        $(this).addClass(selectedClass);
        $list.hide();
    });

    $(document).click(function() {
        $styledSelect.removeClass(activeClass);
        $list.hide();
    });
});