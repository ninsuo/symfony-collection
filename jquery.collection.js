/*
* jquery.collection.js v1.2.3
*
* Copyright (c) 2015 alain tiemblo <alain at fuz dot org>
*
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the
* "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
* distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
* following conditions:
*
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
* MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
* CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
* OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

;(function($) {

    $.fn.collection = function(options) {

        var defaults = {
            container: 'body',
            allow_up: true,
            up: '<a href="#">&#x25B2;</a>',
            before_up: function(collection, element) { return true; },
            after_up: function(collection, element) { return true; },
            allow_down: true,
            down: '<a href="#">&#x25BC;</a>',
            before_down: function(collection, element) { return true; },
            after_down: function(collection, element) { return true; },
            allow_add: true,
            add: '<a href="#">[ + ]</a>',
            before_add: function(collection, element) { return true; },
            after_add: function(collection, element) { return true; },
            allow_delete: true,
            delete: '<a href="#">[ - ]</a>',
            before_delete: function(collection, element) { return true; },
            after_delete: function(collection, element) { return true; },
            allow_duplicate: false,
            duplicate: '<a href="#">[ # ]</a>',
            before_duplicate: function(collection, element) { return true; },
            after_duplicate: function(collection, element) { return true; },
            min: 0,
            max: 100,
            add_at_the_end: false,
            prefix: 'collection',
            prototype_name: '__name__',
            name_prefix: null,
            elements_selector: '> div',
            children: null,
            init_with_n_elements: 0,
            hide_useless_buttons: true,
            drag_drop: true,
            drag_drop_options: {
                'placeholder': 'ui-state-highlight'
            },
            drag_drop_start: function(event, ui) { return true; },
            drag_drop_update: function(event, ui) { return true; }
        };

        var randomNumber = function() {
            var rand = '' + Math.random() * 1000 * new Date().getTime();
            return rand.replace('.', '').split('').sort(function () {
                return 0.5 - Math.random();
            }).join('');
        };

        var getOrCreateId = function(prefix, obj) {
            if (!obj.attr('id')) {
                var generated_id;
                do {
                    generated_id = prefix + '_' + randomNumber();
                } while ($('#' + generated_id).length > 0);
                obj.attr('id', generated_id);
            }
            return obj.attr('id');
        };

        var getFieldValue = function (selector) {
            try {
                var jqElem = $(selector);
            } catch (e) {
                return null;
            }
            if (jqElem.length === 0) {
                return null;
            } else if (jqElem.is('input[type="checkbox"]')) {
                return (jqElem.prop('checked') === true ? true : false);
            } else if (jqElem.is('input[type="radio"]') && jqElem.attr('name') !== undefined) {
                return $('input[name="' + jqElem.attr('name') + '"]:checked').val();
            } else if (jqElem.prop('value') !== undefined) {
                return jqElem.val();
            } else {
                return jqElem.html();
            }
        };

        var putFieldValue = function (selector, value, physical) {
            try {
                var jqElem = $(selector);
            } catch (e) {
                return;
            }
            if (jqElem.length === 0) {
                return null;
            } else if (jqElem.is('input[type="checkbox"]')) {
                if (value) {
                    jqElem.attr('checked', true);
                } else {
                        jqElem.removeAttr('checked');
                }
            } else if (jqElem.prop('value') !== undefined) {
                if (physical) {
                    jqElem.attr('value', value);
                } else {
                    jqElem.val(value);
                }
            } else {
                jqElem.html(value);
            }
        };

        var trueOrUndefined = function(value) {
            return undefined === value || value;
        };

        var pregQuote = function(string) {
            return (string + '').replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
        };

        var replaceAttrData = function(elements, index, toReplace, replaceWith) {

            var replaceAttrDataNode = function(node) {
                var jqNode = $(node);
                $.each(node.attributes, function(i, attrib) {
                    if ($.type(attrib.value) === 'string') {
                        jqNode.attr(attrib.name.replace(toReplace, replaceWith), attrib.value.replace(toReplace, replaceWith));
                    }
                });
                $.each(jqNode.data(), function(name, value) {
                    if ($.type(value) === 'string') {
                        jqNode.data(name.replace(toReplace, replaceWith), value.replace(toReplace, replaceWith));
                    }
                });
            };

            var element = elements.eq(index);
            replaceAttrDataNode(element[0]);
            element.find('*').each(function() {
                replaceAttrDataNode(this);
            });
        };

        var changeElementIndex = function(collection, elements, settings, index, oldIndex, newIndex) {
            var toReplace = new RegExp(pregQuote(settings.name_prefix + '[' + oldIndex + ']'), 'g');
            var replaceWith = settings.name_prefix + '[' + newIndex + ']';
            replaceAttrData(elements, index, toReplace, replaceWith);

            var toReplace = new RegExp(pregQuote(collection.attr('id') + '_' + oldIndex), 'g');
            var replaceWith = collection.attr('id') + '_' + newIndex;
            replaceAttrData(elements, index, toReplace, replaceWith);
        };

        var changeHtmlIndex = function(collection, settings, html, oldIndex, newIndex) {
            var toReplace = new RegExp(pregQuote(settings.name_prefix + '[' + oldIndex + ']'), 'g');
            var replaceWith = settings.name_prefix + '[' + newIndex + ']';
            html = html.replace(toReplace, replaceWith);

            var toReplace = new RegExp(pregQuote(collection.attr('id') + '_' + oldIndex), 'g');
            var replaceWith = collection.attr('id') + '_' + newIndex;
            html = html.replace(toReplace, replaceWith);

            return html;
        };

        var putFieldValuesInDom = function(element) {
            $(element).find(':input').each(function(index, inputObj) {
                putFieldValue(inputObj, getFieldValue(inputObj), true);
            });
        };

        var swapElements = function(collection, elements, oldIndex, newIndex) {

            var settings = collection.data('collection-settings');

            changeElementIndex(collection, elements, settings, oldIndex, oldIndex, '__swap__');
            changeElementIndex(collection, elements, settings, newIndex, newIndex, oldIndex);
            changeElementIndex(collection, elements, settings, oldIndex, '__swap__', newIndex);

            elements.eq(oldIndex).insertBefore(elements.eq(newIndex));
            if (newIndex > oldIndex) {
                elements.eq(newIndex).insertBefore(elements.eq(oldIndex));
            } else {
                elements.eq(newIndex).insertAfter(elements.eq(oldIndex));
            }

            return collection.find(settings.elements_selector);
        };

        var swapElementsUp = function(collection, elements, settings, oldIndex, newIndex) {
            for (var i = oldIndex + 1; (i <= newIndex); i++) {
                elements = swapElements(collection, elements, i, i - 1);
            }
            return collection.find(settings.elements_selector);
        };

        var swapElementsDown = function(collection, elements, settings, oldIndex, newIndex) {
            for (var i = oldIndex - 1; (i >= newIndex); i--) {
                elements = swapElements(collection, elements, i, i + 1);
            }
            return collection.find(settings.elements_selector);
        };

        var shiftElementsUp = function(collection, elements, settings, index) {
            for (var i = index + 1; i < elements.length; i++) {
                elements = swapElements(collection, elements, i - 1, i);
            }
            return collection.find(settings.elements_selector);
        };

        var shiftElementsDown = function(collection, elements, settings, index) {
            for (var i = elements.length - 2; i > index; i--) {
                elements = swapElements(collection, elements, i + 1, i);
            }
            return collection.find(settings.elements_selector);
        };

        var dumpCollectionActions = function(collection, settings, isInitialization) {
            var init = collection.find('.' + settings.prefix + '-tmp').length === 0;
            var elements = collection.find(settings.elements_selector);

            if (settings.allow_add) {
                if (init) {
                    collection.append('<span class="' + settings.prefix + '-tmp"></span>');
                    if (settings.add) {
                        collection.append(
                            $(settings.add)
                                .addClass(settings.prefix + '-action ' + settings.prefix + '-rescue-add')
                                .data('collection', collection.attr('id'))
                        );
                    }
                }
            }

            if (isInitialization) {
                var container = $(settings.container);
                var button = collection.find('.' + settings.prefix + '-add, .' + settings.prefix + '-rescue-add, .' + settings.prefix + '-duplicate').first();
                while (elements.length < settings.init_with_n_elements) {
                    var element = elements.length > 0 ? elements.last() : undefined;
                    var index = elements.length + 1;
                    elements = doAdd(container, button, collection, settings, elements, element, index, false);
                }
            }

            elements.each(function(index) {
                var element = $(this);

                var actions = element.find('.' + settings.prefix + '-actions').andSelf().filter('.' + settings.prefix + '-actions');
                if (actions.length === 0) {
                    actions = $('<div class="' + settings.prefix + '-actions"></div>');
                    element.append(actions);
                }

                var buttons = [
                    {'enabled': settings.allow_delete, 'class': settings.prefix + '-delete', 'html': settings.delete, 'condition': elements.length > settings.min},
                    {'enabled': settings.allow_up, 'class': settings.prefix + '-up', 'html': settings.up, 'condition': elements.index(element) !== 0},
                    {'enabled': settings.allow_down, 'class': settings.prefix + '-down', 'html': settings.down, 'condition': elements.index(element) !== elements.length - 1},
                    {'enabled': settings.allow_add && !settings.add_at_the_end, 'class': settings.prefix + '-add', 'html': settings.add, 'condition': elements.length < settings.max},
                    {'enabled': settings.allow_duplicate, 'class': settings.prefix + '-duplicate', 'html': settings.duplicate, 'condition': elements.length < settings.max},
                ];

                $.each(buttons, function(i, button) {
                    if (button.enabled) {
                        var action = element.find('.' + button.class);
                        if (action.length === 0 && button.html) {
                            action = $(button.html)
                                .appendTo(actions)
                                .addClass(button.class);
                        }
                        if (button.condition) {
                            action.removeClass(settings.prefix + '-action-disabled');
                            if (settings.hide_useless_buttons) {
                                action.css('display', '');
                            }
                        } else {
                            action.addClass(settings.prefix + '-action-disabled');
                            if (settings.hide_useless_buttons) {
                                action.css('display', 'none');
                            }
                        }
                        action
                            .addClass(settings.prefix + '-action')
                            .data('collection', collection.attr('id'))
                            .data(settings.prefix + '-element', getOrCreateId(collection.attr('id') + '_' + index, element));
                    } else {
                        element.find('.' + button.class).css('display', 'none');
                    }
                });
            });

            if (settings.allow_add) {
                var rescueAdd = collection.find('.' + settings.prefix + '-rescue-add').css('display', '');
                var adds = collection.find('.' + settings.prefix + '-add');
                if (adds.length > 0) {
                    rescueAdd.css('display', 'none');
                }
                if (elements.length >= settings.max) {
                    collection.find('.' + settings.prefix + '-add, .' + settings.prefix + '-rescue-add, .' + settings.prefix + '-duplicate').css('display', 'none');
                }
            }

        };

        var enableChildrenCollections = function(collection, element, settings) {
            if (settings.children) {
                $.each(settings.children, function(index, childrenSettings) {
                    if (!childrenSettings.selector) {
                        console.log("jquery.collection.js: given collection " + collection.attr('id') + " has children collections, but children's root selector is undefined.");
                        return true;
                    }
                    if (element !== null) {
                        element.find(childrenSettings.selector).collection(childrenSettings);
                    } else {
                        collection.find(childrenSettings.selector).collection(childrenSettings);
                    }
                });
            }
        };

        var doAdd = function (container, that, collection, settings, elements, element, index, isDuplicate) {
            if (elements.length < settings.max && (isDuplicate && trueOrUndefined(settings.before_duplicate(collection, element)) || trueOrUndefined(settings.before_add(collection, element)))) {
                var prototype = collection.data('prototype');
                for (var freeIndex = 0; (freeIndex < settings.max); freeIndex++) {
                    var regexp = new RegExp(pregQuote(settings.prototype_name), 'g');
                    var code = $(prototype.replace(regexp, freeIndex));
                    var tmp = collection.find('> .' + settings.prefix + '-tmp');
                    var id = tmp.html(code).find('[id]').first().attr('id');
                    tmp.empty();
                    if (container.find('#' + id).length === 0) {

                        if (isDuplicate) {
                            putFieldValuesInDom(elements.eq(index));
                            var oldHtml = $("<div/>").append(elements.eq(index).clone()).html();
                            var newHtml = changeHtmlIndex(collection, settings, oldHtml, index, freeIndex);
                            code = $('<div/>').html(newHtml).contents();
                            tmp.before(code).find(settings.prefix + '-actions').remove();
                        } else {
                            tmp.before(code);
                        }

                        elements = collection.find(settings.elements_selector);
                        var action = code.find('.' + settings.prefix + '-add, .' + settings.prefix + '-duplicate');
                        if (action.length > 0) {
                            action.addClass(settings.prefix + '-action').data('collection', collection.attr('id'));
                        }

                        if (that.data(settings.prefix + '-element') !== undefined) {
                            var index = elements.index($('#' + that.data(settings.prefix + '-element')));
                            if (index !== -1) {
                                elements = shiftElementsDown(collection, elements, settings, index);
                            }
                        }

                        enableChildrenCollections(collection, code, settings);

                        if ((isDuplicate && !trueOrUndefined(settings.after_duplicate(collection, code))) || !trueOrUndefined(settings.after_add(collection, code))) {
                            if (index !== -1) {
                                elements = shiftElementsUp(collection, elements, settings, index + 1);
                            }
                            code.remove();
                        }

                        break;
                    }
                }
            }

            return elements;
        };

        var doDelete = function (collection, settings, elements, element, index) {
            if (elements.length > settings.min && trueOrUndefined(settings.before_delete(collection, element))) {
                elements = shiftElementsUp(collection, elements, settings, index);
                var toDelete = elements.last();
                var backup = toDelete.clone({withDataAndEvents: true});
                toDelete.remove();
                if (!trueOrUndefined(settings.after_delete(collection, backup))) {
                    collection.find('> .' + settings.prefix + '-tmp').before(backup);
                    elements = collection.find(settings.elements_selector);
                    elements = shiftElementsDown(collection, elements, settings, index - 1);
                }
            }

            return elements;
        };

        var doUp = function (collection, settings, elements, element, index) {
            if (index !== 0 && trueOrUndefined(settings.before_up(collection, element))) {
                elements = swapElements(collection, elements, index, index - 1);
                if (!trueOrUndefined(settings.after_up(collection, element))) {
                    elements = swapElements(collection, elements, index - 1, index);
                }
            }

            return elements;
        };

        var doDown = function (collection, settings, elements, element, index) {
            if (index !== (elements.length - 1) && trueOrUndefined(settings.before_down(collection, element))) {
                elements = swapElements(collection, elements, index, index + 1);
                if (!trueOrUndefined(settings.after_down(collection, elements))) {
                    elements = swapElements(collection, elements, index + 1, index);
                }
            }

            return elements;
        };

        var elems = $(this);

        if (elems.length === 0) {
            console.log("jquery.collection.js: given collection selector does not exist.");
            return false;
        }

        elems.each(function() {

            var settings = $.extend(true, {}, defaults, options);

            if ($(settings.container).length === 0) {
                console.log("jquery.collection.js: a container should exist to handle events (basically, a <body> tag).");
                return false;
            }

            var elem = $(this);
            if (elem.data('collection') !== undefined) {
                var collection = $('#' + elem.data('collection'));
                if (collection.length === 0) {
                    console.log("jquery.collection.js: given collection id does not exist.");
                    return true;
                }
            } else {
                collection = elem;
            }

            if (collection.data('prototype') === null) {
                console.log("jquery.collection.js: given collection field has no prototype, check that your field has the prototype option set to true.");
                return true;
            }

            if (collection.data('prototype-name') !== undefined) {
                settings.prototype_name = collection.data('prototype-name');
            }
            if (collection.data('allow-add') !== undefined) {
                settings.allow_add = collection.data('allow-add');
                settings.allow_duplicate = collection.data('allow-add') ? settings.allow_duplicate : false;
            }
            if (collection.data('allow-delete') !== undefined) {
                settings.allow_delete = collection.data('allow-delete');
            }
            if (collection.data('name-prefix') !== undefined) {
                settings.name_prefix = collection.data('name-prefix');
            }

            if (!settings.name_prefix) {
                console.log("jquery.collection.js: the prefix used in descendant field names is mandatory, you can set it using 2 ways:");
                console.log("jquery.collection.js: - use the form theme given with this plugin source");
                console.log("jquery.collection.js: - set name_prefix option to  '{{ formView.myCollectionField.vars.full_name }}'");
                return true;
            }

            if (settings.init_with_n_elements < settings.min) {
                settings.init_with_n_elements = settings.min;
            }

            if (settings.drag_drop && settings.allow_up && settings.allow_down) {
                var oldPosition;
                var newPosition;
                if (typeof jQuery.ui === 'undefined' || typeof jQuery.ui.sortable === 'undefined') {
                    settings.drag_drop = false;
                } else {
                    collection.sortable($.extend(true, {}, {
                        start: function(event, ui) {
                            var elements = collection.find(settings.elements_selector);
                            var element = ui.item;
                            var that = $(this);
                            if (!trueOrUndefined(settings.drag_drop_start(event, ui, elements, element))) {
                                that.sortable("cancel");
                                return ;
                            }
                            ui.placeholder.height(ui.item.height());
                            ui.placeholder.width(ui.item.width());
                            oldPosition = elements.index(element);
                        },
                        update: function(event, ui) {
                            var elements = collection.find(settings.elements_selector);
                            var element = ui.item;
                            var that = $(this);
                            that.sortable("cancel");
                            if (false === settings.drag_drop_update(event, ui, elements, element) || !(newPosition - oldPosition > 0 ? trueOrUndefined(settings.before_up(collection, element)) : trueOrUndefined(settings.before_down(collection, element)))) {
                                return ;
                            }
                            newPosition = elements.index(element);
                            elements = collection.find(settings.elements_selector);
                            if (1 === Math.abs(newPosition - oldPosition)) {
                                elements = swapElements(collection, elements, oldPosition, newPosition);
                                if (!(newPosition - oldPosition > 0 ? trueOrUndefined(settings.after_up(collection, element)) : trueOrUndefined(settings.after_down(collection, element)))) {
                                    elements = swapElements(collection, elements, newPosition, oldPosition);
                                }
                            } else {
                                if (oldPosition < newPosition) {
                                    elements = swapElementsUp(collection, elements, settings, oldPosition, newPosition);
                                    if (!(newPosition - oldPosition > 0 ? trueOrUndefined(settings.after_up(collection, element)) : trueOrUndefined(settings.after_down(collection, element)))) {
                                        elements = swapElementsDown(collection, elements, settings, newPosition, oldPosition);
                                    }
                                } else {
                                    elements = swapElementsDown(collection, elements, settings, oldPosition, newPosition);
                                    if (!(newPosition - oldPosition > 0 ? trueOrUndefined(settings.after_up(collection, element)) : trueOrUndefined(settings.after_down(collection, element)))) {
                                        elements = swapElementsUp(collection, elements, settings, newPosition, oldPosition);
                                    }
                                }
                            }
                            dumpCollectionActions(collection, settings, false);
                        }
                    }, settings.drag_drop_options));
                }
            }

            collection.data('collection-settings', settings);

            var container = $(settings.container);

            container
                .off('click', '.' + settings.prefix + '-action')
                .on('click', '.' + settings.prefix + '-action', function(e) {

                    var that = $(this);

                    var collection = $('#' + that.data('collection'));
                    var settings = collection.data('collection-settings');

                    var elements = collection.find(settings.elements_selector);
                    var element = that.data(settings.prefix + '-element') ? $('#' + that.data(settings.prefix + '-element')) : undefined;
                    var index = element && element.length ? elements.index(element) : -1;

                    var isDuplicate = that.is('.' + settings.prefix + '-duplicate');
                    if ((that.is('.' + settings.prefix + '-add') || that.is('.' + settings.prefix + '-rescue-add') || isDuplicate) && settings.allow_add) {
                        elements = doAdd(container, that, collection, settings, elements, element, index, isDuplicate);
                    }

                    if (that.is('.' + settings.prefix + '-delete') && settings.allow_delete) {
                        elements = doDelete(collection, settings, elements, element, index);
                    }

                    if (that.is('.' + settings.prefix + '-up') && settings.allow_up) {
                        elements = doUp(collection, settings, elements, element, index);
                    }

                    if (that.is('.' + settings.prefix + '-down') && settings.allow_down) {
                        elements = doDown(collection, settings, elements, element, index);
                    }

                    dumpCollectionActions(collection, settings, false);
                    e.preventDefault();
                })
            ;

            dumpCollectionActions(collection, settings, true);
            enableChildrenCollections(collection, null, settings);
        });

        return true;
    };

})(jQuery);
