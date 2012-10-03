(function($) {
	$.extend({
		placeholder : {
			settings : {
				focusClass: 'placeholderFocus',
				activeClass: 'placeholder',
				overrideSupport: false,
				preventRefreshIssues: true
			},
			debug : false,
			log : function(msg){
				if(!$.placeholder.debug) return;
				msg = "[Placeholder] " + msg;
				$.placeholder.hasFirebug ?
				console.log(msg) :
				$.placeholder.hasConsoleLog ?
					window.console.log(msg) :
					alert(msg);
			},
			hasFirebug : "console" in window && "firebug" in window.console,
			hasConsoleLog: "console" in window && "log" in window.console
		}
	});

    // check browser support for placeholder
    $.support.placeholder = 'placeholder' in document.createElement('input');

	// Replace the val function to never return placeholders
	$.fn.plVal = $.fn.val;

	$.fn.val = function(value) {
		$.placeholder.log('in val');

		if (this[0]) {
			$.placeholder.log('have found an element');

			var el = $(this[0]);

			if (value != undefined) {
				$.placeholder.log('in setter');

				var currentValue = el.plVal(),
				returnValue = $(this).plVal(value);

				if (el.hasClass($.placeholder.settings.activeClass) && currentValue == el.attr('placeholder')) {
					el.removeClass($.placeholder.settings.activeClass);
				}

				return returnValue;
			}

			if (el.hasClass($.placeholder.settings.activeClass) && el.plVal() == el.attr('placeholder')) {
				$.placeholder.log('returning empty because it\'s a placeholder');

				return '';
			} else {
				$.placeholder.log('returning original val');

				return el.plVal();
			}
		}

		$.placeholder.log('returning undefined');

		return undefined;
	};

	// Clear placeholder values upon page reload
	$(window).bind('beforeunload.placeholder', function() {
		var els = $('input.' + $.placeholder.settings.activeClass);

		if (els.length > 0) {
			els.val('').attr('autocomplete', 'off');
		}
	});


	// plugin code
	$.fn.placeholder = function(opts) {
		opts = $.extend({},$.placeholder.settings, opts);

		// we don't have to do anything if the browser supports placeholder
		if(!opts.overrideSupport && $.support.placeholder) {
		    return this;
		}
		
		var resetCursorPosition = function(){
			if (this.setSelectionRange) {
			    this.setSelectionRange(0,0);
			} else {
				var range = this.createTextRange();

				range.collapse(true);
				range.moveStart('character', 0);
				range.moveEnd('character', 0);
				range.select();
			}
		};
		
		return this.each(function() {
			var $el = $(this);

			// skip if we do not have the placeholder attribute or input is of the password type
			if (!$el.is('[placeholder]') || $el.is(':password')) {
				return;
			}

			// Prevent values from being reapplied on refresh
			if (opts.preventRefreshIssues) {
				$el.attr('autocomplete','off');
			}

			$el.bind('focus.placeholder', function() {
		                var $el = $(this);

				if ((this.value == $el.attr('placeholder') || this.value == "")) {
					$el.val($el.attr('placeholder')).removeClass(opts.focusClass).addClass(opts.activeClass);
				} else if ($el.hasClass('error')) {
					// add this class so text will be cleared on keypress after error
					// NOTE: login.js also adds this class on error so keypress will clear on any error that is not just date-related
					$el.addClass('toClear');
				}

				resetCursorPosition.call(this);
			});

			$el.bind('keydown.placeholder',function(e) {
				var $el = $(this);

				if (this.value == $el.attr('placeholder') || this.value == "") {
					$el.val('').removeClass(opts.activeClass).addClass(opts.focusClass);
				} else if ($el.hasClass('toClear')) {
					$el.val('').removeClass('toClear');
				}
			});

			$el.bind('blur.placeholder', function() {
				var $el = $(this);

				$el.removeClass(opts.focusClass);

				if (this.value == '') {
					$el.val($el.attr('placeholder')).addClass(opts.activeClass);
				}
			});
			
			$el.bind('mousedown.placeholder',function(){
				resetCursorPosition.call(this);
				});

			$el.triggerHandler('blur');

			// Prevent incorrect form values being posted
			$el.parents('form').submit(function() {
				$el.triggerHandler('focus.placeholder');
			});
		});
	};
})(jQuery);
