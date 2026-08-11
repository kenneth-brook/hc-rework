; (function ($) {
    "use strict";

    function _zeroLeading(numb) {
        return (numb < 10) ? '0' + numb : numb;
    }

    function _showClock(output) {
        var date = new Date();
        var hours = date.getHours();
        var hoursHalf = hours;
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        var session = '';

        if (hours == 0) {
            hoursHalf = 12;
        }
        if (hours > 12) {
            hoursHalf = hours - 12;
            session = '';
        }

        output = output.replace(/\%H/g, _zeroLeading(hours));
        output = output.replace(/\%h/g, _zeroLeading(hoursHalf));
        output = output.replace(/\%i/g, _zeroLeading(minutes));
        output = output.replace(/\%s/g, _zeroLeading(seconds));
        output = output.replace(/\%a/g, session);
        return output;
    }

    $.fn.clock = function (options) {
        var defaults = {
            format: '%h:%i:%s %a',
        };

        var options = $.extend(defaults, options);

        return this.each(function () {
            var format = options.format;
            var $obj = $(this);

            setInterval(() => {
                $obj.html(_showClock(format));
            }, 1000);

            $obj.html(_showClock(format));
        });
    };
})(jQuery);