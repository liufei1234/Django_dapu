/*
 *自动完成
 *默认选中第一项并显示在当前输入框内。
 * */
var Observer = new Class({
	Implements: [Options, Events],
	options: {
		periodical: false,
		delay: 1000
	},

	initialize: function(el, onFired, options){
		this.element = $(el) || $$(el);
		this.addEvent('onFired', onFired);
		this.setOptions(options);
		this.bound = this.changed.bind(this);
		this.resume();
	},

	changed: function() {
		var value = this.element.get('value');
		if ($equals(this.value, value)) return;
		this.clear();
		this.value = value;
		this.timeout = this.onFired.delay(this.options.delay, this);
	},

	setValue: function(value) {
		this.value = value;
		this.element.set('value', value);
		return this.clear();
	},

	onFired: function() {
		this.fireEvent('onFired', [this.value, this.element]);
	},

	clear: function() {
		$clear(this.timeout || null);
		return this;
	},

	pause: function(){
		if (this.timer) $clear(this.timer);
		else this.element.removeEvent('keyup', this.bound);
		return this.clear();
	},

	resume: function(){
		this.value = this.element.get('value');
		if (this.options.periodical) this.timer = this.changed.periodical(this.options.periodical, this);
		else this.element.addEvent('keyup', this.bound);
		return this;
	}

});

var $equals = function(obj1, obj2) {
	return (obj1 == obj2 || JSON.encode(obj1) == JSON.encode(obj2));
};

var Autocompleter = new Class({
	Implements: [Options, Events],
	options: {/*
		onOver: $empty,
		onSelect: $empty,
		onSelection: $empty,
		onShow: $empty,
		onHide: $empty,
		onBlur: $empty,
		onFocus: $empty,
		onLoad: $empty,*/
		minLength: 1,
		markQuery: true,
		width: 'inherit',
		maxChoices: 10,
		injectChoice: null,
		customChoices: null,
		emptyChoices: null,
		visibleChoices: true,
		className: 'autocompleter-choices',
		zIndex: 65535,
		delay: 1000,
		observerOptions: {},
		fxOptions: {},

		autoSubmit: false,
		overflow: false,
		overflowMargin: 25,
		selectFirst: true,
		filter: null,
		filterCase: false,
		filterSubset: true,
		forceSelect: false,
		selectMode: true,
		choicesMatch: null,

		multiple: false,
		separator: ', ',
		separatorSplit: /\s*[,;]\s*/,
		autoTrim: false,
		allowDupes: false,

		cache: true,
		relative: true
	},
	initialize: function(element, options) {
		this.element = $(element);
		this.setOptions(options);
		this.build();
		this.observer = new Observer(this.element, this.prefetch.bind(this), $merge({
			'delay': this.options.delay
		}, this.options.observerOptions));
		this.queryValue = null;
		if (this.options.filter) this.filter = this.options.filter.bind(this);
		var mode = this.options.selectMode;
		this.typeAhead = (mode == 'type-ahead');
		this.selectMode = (mode === true) ? 'selection' : mode;
		this.cached = [];
	},

	/*
	 * build - Initialize DOM
	 *
	 * Builds the html structure for choices and appends the events to the element.
	 * Override this function to modify the html generation.
	 */
	build: function() {
		if ($(this.options.customChoices)) {
			this.choices = this.options.customChoices;
		} else {
			this.choices = new Element('ul', {
				'class': this.options.className,
				'styles': {
					display: 'none',
					'zIndex': this.options.zIndex
				}
			}).inject(document.body);
			this.relative = false;
			if (this.options.relative) {
				this.choices.inject(this.element, 'after');
				this.relative = this.element.getOffsetParent();
			}
			this.fix = new OverlayFix(this.choices);
		}
		if (!this.options.separator.test(this.options.separatorSplit)) {
			this.options.separatorSplit = this.options.separator;
		}
		this.fx = (!this.options.fxOptions) ? null : new Fx.Tween(this.choices, $merge({
			'property': 'opacity',
			'link': 'cancel',
			'duration': 200
		}, this.options.fxOptions)).addEvent('onStart', Chain.prototype.clearChain).set(0);
		//focus和blur先于click触发，增加choices事件变量记录防止click失效。
		this.choices.addEvents({
			'mouseover': function(e){
				this.store('focussed',true);
			},
			'mouseout':function(e){
				this.store('focussed',false);
			},
			'mousedown':function(){
				this.store('focussed',true);
			}
		});
		this.element.setProperty('autocomplete', 'off')
			//.addEvent((Browser.Engine.trident || Browser.Engine.webkit) ? 'keydown' : 'keypress', this.onCommand.bind(this))
			.addEvent('keydown', this.onCommand.bind(this))
			.addEvent('click', this.onCommand.bind(this, [false]))
			.addEvent('focus', this.toggleFocus.create({bind: this, arguments: true, delay: 100}))
			.addEvent('blur', this.toggleFocus.create({bind: this, arguments: false, delay: 100}));
	},

	destroy: function() {
		if (this.fix) this.fix.destroy();
		this.choices = this.selected = this.choices.destroy();
	},

	toggleFocus: function(state) {
		this.focussed = state;
		if (!state && this.choices && !this.choices.retrieve('focussed')) this.hideChoices(true);
		this.fireEvent((state) ? 'onFocus' : 'onBlur', [this.element]);
	},

	onCommand: function(e) {
		if (!e && this.focussed) return this.prefetch();
		if (e && e.key && !e.shift) {
			switch (e.key) {
				case 'enter':
					if (this.element.value != this.opted) return true;
					if (this.selected && this.visible) {
						this.choiceSelect(this.selected);
						return !!(this.options.autoSubmit);
					}
					break;
				case 'up': case 'down':
					if (!this.prefetch() && this.queryValue !== null) {
						var up = (e.key == 'up');
						this.choiceOver((this.selected || this.choices)[
							(this.selected) ? ((up) ? 'getPrevious' : 'getNext') : ((up) ? 'getLast' : 'getFirst')
						](this.options.choicesMatch), true);
					}
					return false;
				case 'esc': case 'tab':
					this.hideChoices(true);
					break;
			}
		}
		return true;
	},

	setSelection: function(finish) {
		var input = this.selected.inputValue, value = input;
		var start = this.queryValue.length, end = input.length;
		if (input.substr(0, start).toLowerCase() != this.queryValue.toLowerCase()) start = 0;
		if (this.options.multiple) {
			var split = this.options.separatorSplit;
			value = this.element.value;
			start += this.queryIndex;
			end += this.queryIndex;
			var old = value.substr(this.queryIndex).split(split, 1)[0];
			value = value.substr(0, this.queryIndex) + input + value.substr(this.queryIndex + old.length);
			if (finish) {
				var tokens = value.split(this.options.separatorSplit).filter(function(entry) {
					return this.test(entry);
				}, /[^\s,]+/);
				if (!this.options.allowDupes) tokens = [].combine(tokens);
				var sep = this.options.separator;
				value = tokens.join(sep) + sep;
				end = value.length;
			}
		}
		this.observer.setValue(value);
		this.opted = value;
		if (finish || this.selectMode == 'pick') start = end;
		this.element.selectRange(start, end);
		this.fireEvent('onSelection', [this.element, this.selected, value, input]);
	},

	showChoices: function() {
		var match = this.options.choicesMatch, first = this.choices.getFirst(match);
		this.selected = this.selectedValue = null;
		if (this.fix) {
			var pos = this.element.getCoordinates(this.relative), width = this.options.width || 'auto';
			this.choices.setStyles({
				'left': pos.left,
				'position':'relative'
				//'top': pos.bottom,
				//'width': (width === true || width == 'inherit') ? pos.width : width
			});
		}
		if (!first) return;
		if (!this.visible) {
			this.visible = true;
			this.choices.setStyle('display', 'block');
			if (this.fx) this.fx.start(1);
			this.fireEvent('onShow', [this.element, this.choices]);
		}
		if (this.options.selectFirst) this.typeAhead = true;
		if (this.options.selectFirst || this.typeAhead || first.inputValue == this.queryValue) this.choiceOver(first, this.typeAhead);
		var items = this.choices.getChildren(match), max = this.options.maxChoices;
		var styles = {'overflowY': 'hidden', 'height': ''};
		this.overflown = false;
		if (items.length > max) {
			var item = items[max - 1];
			styles.overflowY = 'scroll';
			styles.height = item.getCoordinates(this.choices).bottom;
			this.overflown = true;
		}
		this.choices.setStyles(styles);
		this.fix.show();
		if (this.options.visibleChoices) {
			var scroll = document.getScroll(),
			size = document.getSize(),
			coords = this.choices.getCoordinates();
			if (coords.right > scroll.x + size.x) scroll.x = coords.right - size.x;
			if (coords.bottom > scroll.y + size.y) scroll.y = coords.bottom - size.y;
			window.scrollTo(Math.min(scroll.x, coords.left), Math.min(scroll.y, coords.top));
		}
	},

	hideChoices: function(clear) {
		if (clear) {
			var value = this.element.value;
			if (this.options.forceSelect) value = this.opted;
			if (this.options.autoTrim) {
				value = value.split(this.options.separatorSplit).filter($arguments(0)).join(this.options.separator);
			}
			this.observer.setValue(value);
		}
		if (!this.visible) return;
		this.visible = false;
		if (this.selected) this.selected.removeClass('autocompleter-selected');
		this.observer.clear();
		var hide = function(){
			this.choices.hide();
			this.fix.hide();
		}.bind(this);
		if (this.fx) this.fx.start(0).chain(hide);
		else hide();
		this.fireEvent('onHide', [this.element, this.choices]);
	},

	prefetch: function() {
		var value = this.element.value, query = value;
		if (this.options.multiple) {
			var split = this.options.separatorSplit;
			var values = value.split(split);
			var index = this.element.getSelectedRange().start;
			var toIndex = value.substr(0, index).split(split);
			var last = toIndex.length - 1;
			index -= toIndex[last].length;
			query = values[last];
		}
		if (query.length < this.options.minLength) {
			this.hideChoices();
		} else {
			if (query === this.queryValue || (this.visible && query == this.selectedValue)) {
				if (this.visible) return false;
				this.showChoices();
			} else {
				this.queryValue = query;
				this.queryIndex = index;
				if (!this.fetchCached()) this.query();
			}
		}
		return true;
	},

	fetchCached: function() {
		return false;
		/* if (!this.options.cache
			|| !this.cached
			|| !this.cached.length
			|| this.cached.length >= this.options.maxChoices
			|| this.queryValue) return false;
		this.update(this.filter(this.cached));
		return true; */
	},

	update: function(tokens) {

		global_words = tokens['words'];
		tokens = tokens['goods'];

		this.choices.empty();
		this.cached = tokens;
		var type = tokens && $type(tokens);
		if (!type || (type == 'array' && !tokens.length) || (type == 'hash' && !tokens.getLength())) {
			(this.options.emptyChoices || this.hideChoices).call(this);
		} else {
			if (this.options.maxChoices < tokens.length && !this.options.overflow) tokens.length = this.options.maxChoices;
			tokens.each(this.options.injectChoice || function(token){
				var choice = new Element('li', {'html': this.markQueryValue(token)});
				choice.inputValue = token;
				this.addChoiceEvents(choice).inject(this.choices);
			}, this);
			this.showChoices();
		}
	},

	choiceOver: function(choice, selection) {
		if (!choice || choice == this.selected) return;
		if (this.selected) this.selected.removeClass('autocompleter-selected');
		this.selected = choice.addClass('autocompleter-selected');
		this.fireEvent('onSelect', [this.element, this.selected, selection]);
		if (!this.selectMode) this.opted = this.element.value;
		if (!selection) return;
		this.selectedValue = this.selected.inputValue;
		if (this.overflown) {
			var coords = this.selected.getCoordinates(this.choices), margin = this.options.overflowMargin,
				top = this.choices.scrollTop, height = this.choices.offsetHeight, bottom = top + height;
			if (coords.top - margin < top && top) this.choices.scrollTop = Math.max(coords.top - margin, 0);
			else if (coords.bottom + margin > bottom) this.choices.scrollTop = Math.min(coords.bottom - height + margin, bottom);
		}
		if (this.selectMode) this.setSelection();
	},

	choiceSelect: function(choice) {
		if (choice) this.choiceOver(choice);
		this.setSelection(true);
		this.queryValue = false;
		this.fireEvent('submit');
		this.hideChoices();
	},

	filter: function(tokens) {
		return (tokens || this.tokens).filter(function(token) {
			return this.test(token);
		}, new RegExp(((this.options.filterSubset) ? '' : '^') + this.queryValue.escapeRegExp(), (this.options.filterCase) ? '' : 'i'));
	},

	/*
	 * markQueryValue
	 *
	 * Marks the queried word in the given string with <span class="autocompleter-queried">*</span>
	 * Call this i.e. from your custom parseChoices, same for addChoiceEvents
	 *
	 * @param		{String} Text
	 * @return		{String} Text
	 */
	markQueryValue: function(str) {
		/*
		return (!this.options.markQuery || !this.queryValue) ? str :
			str.replace(new RegExp('(' + ((this.options.filterSubset) ? '' : '^') + this.queryValue.escapeRegExp() + ')', (this.options.filterCase) ? '' : 'i'), '<span class="autocompleter-queried">$1</span>');
*/
		if(!this.options.markQuery || !this.queryValue){
			return str;
		}else{
			if(global_words){
				for(var i=0; i < global_words.length; i++){
					var reg = '('+ global_words[i].escapeRegExp() + ')';
					str = str.replace(new RegExp(reg, (this.options.filterCase) ? '' : 'ig'), '<'+i+'>');
				}
				for(var i=0; i < global_words.length; i++){
					var reg = '(<'+i+'>)';
					str = str.replace(new RegExp(reg, 'ig'), '<span class="autocompleter-queried">'+global_words[i]+'</span>');
				}
			}
			/*
			var reg = '(' + ((this.options.filterSubset) ? '' : '^') + this.queryValue.escapeRegExp() + ')';
			str = str.replace(new RegExp(reg, (this.options.filterCase) ? '' : 'i'), '<span class="autocompleter-queried">$1</span>');
			if(global_words){
				for(var i=0; i < global_words.length; i++){
					if(global_words[i] == this.queryValue){
						continue;
					}
					var subreg = '(' + ((this.options.filterSubset) ? '' : '^') + global_words[i].escapeRegExp() + ')';
					str = str.replace(new RegExp(subreg, (this.options.filterCase) ? '' : 'i'), '<span class="autocompleter-queried">$1</span>');
				}
			}
			*/
			return str;
		}
	},

	/*
	 * addChoiceEvents
	 *
	 * Appends the needed event handlers for a choice-entry to the given element.
	 *
	 * @param		{Element} Choice entry
	 * @return		{Element} Choice entry
	 */
	addChoiceEvents: function(el) {
		return el.addEvents({
			'mouseover': this.choiceOver.bind(this, [el]),
			'click': this.choiceSelect.bind(this, [el])
		});
	}
});

var OverlayFix = new Class({

	initialize: function(el) {
		//if (Browser.Engine.trident) {
			this.element = $(el);
			this.relative = this.element.getOffsetParent();
			/*
			this.fix = new Element('iframe', {
				'frameborder': '0',
				'scrolling': 'no',
				'src': 'javascript:false;',
				'styles': {
					'position': 'absolute',
					'border': 'none',
					'display': 'none',
					'filter': 'progid:DXImageTransform.Microsoft.Alpha(opacity=0)'
				}
			}).inject(this.element, 'after');
			*/
		//}
	},

	show: function() {
		if (this.fix) {
			var coords = this.element.getCoordinates(this.relative);
			delete coords.right;
			delete coords.bottom;
			this.fix.setStyles($extend(coords, {
				'display': '',
				'zIndex': (this.element.getStyle('zIndex') || 1) - 1
			}));
		}
		return this;
	},

	hide: function() {
		if (this.fix) this.fix.setStyle('display', 'none');
		return this;
	},

	destroy: function() {
		if (this.fix) this.fix = this.fix.destroy();
	}

});



Autocompleter.script=new Class({
	Extends:Autocompleter,
	options: {/*
		indicator: null,
		indicatorClass: null,*/
		getData: {},
		callJSON:$empty,
		getVar: 'value'
	},
	initialize: function(el, url, options) {
		this.parent(el, options);
		this.url=url;
	},
	query:function(){
		this.fireEvent('onLoad');
		//var data = $unlink(this.options.getData) || {};
		var data =  {};
		data[this.options.getVar] = this.queryValue;
		var indicator = $(this.options.indicator);
		if (indicator) indicator.setStyle('display', '');
		var cls = this.options.indicatorClass;
		if (cls) this.element.addClass(cls);
		this.fireEvent('onRequest', [this.element,data,this.queryValue]);
		this.requestScript(data);
	},
	requestScript:function(){
		var frm_id= this.options.script||'aotuScript';
		if($(frm_id)){$(frm_id).destroy();}
		var src=this.url+'&'+$H(arguments[0]).toQueryString();
		var load=this.queryResponse.bind(this);

		var new_script = document.createElement("script");
		new_script.src = src;
		new_script.id = frm_id;
		new_script.onload = load;
		new_script.onreadystatechange = function(){
			if (['loaded', 'complete'].contains(this.readyState)) load();
		}
		$(new_script).inject(this.element,'after');

		this.script = new_script;
		/*
		this.script=new Element('script',{src:src,id:frm_id}).inject(this.element,'after');
		this.script.addEvents({
            load: load,
            readystatechange: function(){
                if (['loaded', 'complete'].contains(this.readyState)) load();
            }
    	});
    	*/
	},
	queryResponse: function() {

		this.script.removeEvents();
		var indicator = $(this.options.indicator);
		if (indicator) indicator.hide();
		var cls = this.options.indicatorClass;
		if (cls) this.element.removeClass(cls);
		var response=this.options.callJSON();
		this.update(response);
		this.fireEvent('onComplete', [this.element]);
	}
});