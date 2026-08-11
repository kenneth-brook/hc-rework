; (function ($) {
    "use strict";

    $("[class*='cushycms']").each(function () {
        $(this).attr({ 'title': '' });
        if ( 'IMG' === $(this).context.nodeName && !$(this).attr('src') ) {
            $(this).remove();
        }
    });
    
    scrollPage();

    $('.amber-alert button').click(function (e) {
        $('.amber-alert').toggleClass('inactive');
    });

    $('.mobile-menu-btn, .desktop-nav .menu-list a').click(function (e) {
        e.preventDefault();
        $('.submenu-area').toggleClass('visible');
        $('.appbar-top').toggleClass('menu-visible');
    });

    $(document).click(function (event) {
        var $target = $(event.target);
        if (!$target.closest('.appbar-top').length && $('.submenu-area').hasClass('visible')) {
            $('.submenu-area').removeClass('visible');
            $('.appbar-top').removeClass('menu-visible');
        }
    });

    $('.primary-menu > li > a').click(function (e) {
        e.preventDefault();
        $(this).toggleClass('active');
        $(this).next().slideToggle(250);
        var $siblings = $(this).parent().siblings();
        $siblings.children('a').removeClass('active');
        $siblings.children('.submenu').slideUp(250);
    });

    $('.search-form-toggler, .mobile-search-btn').click(function (e) {
        $('.appbar .search-form-input').focus();
    });
    if ($('.search-form-input').is(':focus')) {
        $(this).parents('.inner').toggleClass('search-visible');
    }
    $('.search-form-input').blur(function () {
        $(this).parents('.inner').removeClass('search-visible');
    }).focus(function () {
        $(this).parents('.inner').addClass('search-visible');
    });

    $('.live-clock').clock({
        format: '%H:%i:%s <small>%a</small>',
    });

    function centerScollBar($el) {
        var $wrapper = $el.parent();
        $wrapper.scrollLeft(($el.width() - $wrapper.width()) / 2);
    }

    $(document).ready(function () {
        centerScollBar($('.incidents-list'));
    });

    $(window).on('resize', function () {
        centerScollBar($('.incidents-list'));
    });

    $('.faq-item .question').click(function(){
        var $siblings = $(this).parents('li').siblings();
        $siblings.find('.question').removeClass('active');
        $siblings.find('.answer').slideUp(300);
        $(this).toggleClass('active');
        $(this).next().slideToggle(300);
    });

})(jQuery);

function scrollPage() {
    var $target = $('.appbar-top'),
        wScrollCurrent, wScrollBefore, wScrollDiff, didScroll;

    $(window).on('scroll', function () {
        didScroll = true;
    });

    var hasScrolled = function () {
        wScrollCurrent = $(window).scrollTop();
        wScrollDiff = wScrollBefore - wScrollCurrent;
        if (wScrollCurrent === 0) {
            $target.removeClass('bottom-shadow');
        } else {
            $target.addClass('bottom-shadow');
        }
        wScrollBefore = wScrollCurrent;
    }
    hasScrolled();

    setInterval(function () {
        if (didScroll) {
            hasScrolled();
            didScroll = false;
        }
    }, 0);
}

function iframeFacebook($elem, url) {
    $elem.parent().css({ height: 0 });
    var areaHeight = $elem.parent().parent().innerHeight(),
        areaWidth = $elem.parent().innerWidth(),
        setWidth = parseInt(areaWidth),
        setHeight = parseInt(areaHeight);
    url = url.replace(/width=[\d\.]+/g, 'width=' + setWidth);
    url = url.replace(/height=[\d\.]+/g, 'height=' + setHeight);
    $elem.attr({ src: url, width: setWidth, height: setHeight });
    $elem.parent().css({ height: setHeight });
}

const mapButton = document.querySelector('.mapButton');

function dropButt() {
    mapButton.style.zIndex = "1"
}

function buttBack() {
    mapButton.style.zIndex = "9999"
}