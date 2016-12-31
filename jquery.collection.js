/*
 * jquery.collection.js
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

;
(function ($) {

    $.fn.collection = function (options) {

        /**
         * DEFAULT OPTIONS
         */

        var defaults = {
            container: 'body',
            allow_up: true,
            up: '<a href="#">&#x25B2;</a>',
            before_up: function (collection, element) {
                return true;
            },
            after_up: function (collection, element) {
                return true;
            },
            allow_down: true,
            down: '<a href="#">&#x25BC;</a>',
            before_down: function (collection, element) {
                return true;
            },
            after_down: function (collection, element) {
                return true;
            },
            allow_add: true,
            add: '<a href="#">[ + ]</a>',
            before_add: function (collection, element) {
                return true;
            },
            after_add: function (collection, element) {
                return true;
            },
            allow_remove: true,
            remove: '<a href="#">[ - ]</a>',
            before_remove: function (collection, element) {
                return true;
            },
            after_remove: function (collection, element) {
                return true;
            },
            allow_duplicate: false,
            duplicate: '<a href="#">[ # ]</a>',
            before_duplicate: function (collection, element) {
                return true;
            },
            after_duplicate: function (collection, element) {
                return true;
            },
            before_init: function (collection) {
            },
            after_init: function (collection) {
            },
            min: 0,
            max: 100,
            add_at_the_end: false,
            prefix: 'collection',
            prototype: null,
            prototype_name: '__name__',
            name_prefix: null,
            elements_selector: '.collection-element',
            children: null,
            init_with_n_elements: 0,
            hide_useless_buttons: true,
            drag_drop: true,
            drag_drop_options: {
                'placeholder': 'ui-state-highlight'
            },
            drag_drop_start: function (event, ui) {
                return true;
            },
            drag_drop_update: function (event, ui) {
                return true;
            },
            custom_add_location: false,
            order_field_selector: null
        };

        /**
         * METHODS
         */

        /**
         * Shortcut to check callbacks.
         *
         * @param value
         * @returns {boolean|*}
         */
        var trueOrUndefined = function (value) {
            return undefined === value || value;
        };

        /**
         * Get regex for prototype field name placeholder (default: __name__)
         *
         * @param string
         * @returns {string}
         */
        var pregQuote = function (string) {
            return (string + '').replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
        };

        /**
         * Initializes collection actions.
         *
         * @param collection
         * @param settings
         * @param isInitialization
         */
        var dumpCollectionActions = function (collection, settings, isInitialization) {
            var elements = collection.find(settings.elements_selector);

            // add rescue-add button on initialization
            if (settings.allow_add && settings.add && isInitialization) {
                collection.append(
                    $(settings.add)
                        .addClass(settings.prefix + '-action ' + settings.prefix + '-rescue-add')
                        .data('collection', collection.attr('id'))
                );
            }

            // handle all add buttons display
            if (settings.allow_add) {
                var rescueAdd = collection.find('.' + settings.prefix + '-rescue-add');
                var adds = collection.find('.' + settings.prefix + '-add');

                // handle rescue-add button display
                rescueAdd.css('display', '');
                if (!settings.add_at_the_end && adds.length > 0 || settings.custom_add_location) {
                    rescueAdd.css('display', 'none');
                }

                // don't show any add button if maximum elements are reached
                if (elements.length >= settings.max) {
                    collection.find('.' + settings.prefix + '-add, .' + settings.prefix + '-rescue-add, .' + settings.prefix + '-duplicate').css('display', 'none');
                }
            }

            elements.each(function () {
                var element = $(this);

                // look for actions container, add if not exists
                var actions = element.find('.' + settings.prefix + '-actions').addBack().filter('.' + settings.prefix + '-actions');
                if (actions.length === 0) {
                    actions = $('<div class="' + settings.prefix + '-actions"></div>');
                    element.append(actions);
                }

                // prepare buttons
                var buttons = [
                    {
                        'enabled': settings.allow_remove,
                        'selector': settings.prefix + '-remove',
                        'html': settings.remove,
                        'condition': elements.length > settings.min
                    }, {
                        'enabled': settings.allow_up,
                        'selector': settings.prefix + '-up',
                        'html': settings.up,
                        'condition': elements.index(element) !== 0
                    }, {
                        'enabled': settings.allow_down,
                        'selector': settings.prefix + '-down',
                        'html': settings.down,
                        'condition': elements.index(element) !== elements.length - 1
                    }, {
                        'enabled': settings.allow_add && !settings.add_at_the_end && !settings.custom_add_location,
                        'selector': settings.prefix + '-add',
                        'html': settings.add,
                        'condition': elements.length < settings.max
                    }, {
                        'enabled': settings.allow_duplicate,
                        'selector': settings.prefix + '-duplicate',
                        'html': settings.duplicate,
                        'condition': elements.length < settings.max
                    }
                ];

                // add buttons
                $.each(buttons, function (i, button) {
                    if (button.enabled) {
                        var action = element.find('.' + button.selector);
                        if (action.length === 0 && button.html) {
                            action = $(button.html)
                                .appendTo(actions)
                                .addClass(button.selector);
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
                            .data('collection', collection.attr('id'));
                    } else {
                        element.find('.' + button.selector).css('display', 'none');
                    }
                });
            });
        };

        /**
         * Sets the order values in the order fields if order_field_selector is set.
         *
         * @param collection
         * @param settings
         */
        var setOrderValues = function (collection, settings) {
            if (settings.order_field_selector) {
                var orderValue = 1,
                    elements = collection.find(settings.elements_selector);
                elements.each(function (i, element) {
                    $(element).find(settings.order_field_selector).val(orderValue);
                    orderValue++;
                });
            }
        };

        /**
         * Enables the plugin on child collections.
         *
         * @param collection
         * @param element
         * @param settings
         */
        var enableChildrenCollections = function (collection, element, settings) {
            if (settings.children) {
                $.each(settings.children, function (i, childrenSettings) {
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

        /**
         * Adds items.
         *
         * @param container
         * @param that
         * @param collection
         * @param settings
         * @param elements
         * @param element
         * @param isDuplicate
         * @returns {*}
         */
        var doAdd = function (container, that, collection, settings, elements, element, isDuplicate) {
            if (elements.length < settings.max && (isDuplicate && trueOrUndefined(settings.before_duplicate(collection, element)) || trueOrUndefined(settings.before_add(collection, element)))) {

                // increase index
                collection.data('index', parseInt(collection.data('index')) + 1);

                var prototype = collection.data('prototype'),
                    index = collection.data('index'),
                    regexp = new RegExp(pregQuote(settings.prototype_name), 'g'),
                    code = $(prototype.replace(regexp, index)).addClass(settings.elements_selector.replace('.', ''));

                if (element.length) { // add after or duplicate element
                    if (isDuplicate) {
                        code = element.clone();
                        // replace indexes
                        $(':input', code).each(function(i, input) {
                            if ($(input).attr('id')) {
                                $(input).attr('id', $(input).attr('id').replace(/_\d+_/, '_' + index + '_'));
                            }
                            if ($(input).attr('name')) {
                                $(input).attr('name', $(input).attr('name').replace(/\[\d+\]/, '[' + index + ']'));
                            }
                        });
                    }
                    code.hide();
                    element.after(code);
                    code.fadeIn();
                } else { // add element to end of collection
                    code.hide();
                    collection.append(code);
                    code.fadeIn();
                }

                enableChildrenCollections(collection, code, settings);

                // fire event
                isDuplicate ? settings.after_duplicate(collection, code) : settings.after_add(collection, code);
            }

            return elements;
        };

        /**
         * Remove element from collection.
         *
         * @param collection
         * @param settings
         * @param elements
         * @param element
         * @returns {*}
         */
        var doDelete = function (collection, settings, elements, element) {
            if (elements.length > settings.min && trueOrUndefined(settings.before_remove(collection, element))) {
                var clone = element.clone();
                element.fadeOut(function () {
                    $(this).remove();
                    dumpCollectionActions(collection, settings, false);
                    setOrderValues(collection, settings);
                });
                settings.after_remove(collection, clone);
            }

            return elements;
        };

        /**
         * Move element up in the collection, if 'before_up' callback doesn't abort.
         *
         * @param collection
         * @param settings
         * @param elements
         * @param element
         * @returns {*}
         */
        var doUp = function (collection, settings, elements, element) {
            if (element.prev().length && trueOrUndefined(settings.before_up(collection, element))) {
                element.after(element.prev());
                settings.after_up(collection, elements);
            }

            return elements;
        };

        /**
         * Move element down in the collection, if 'before_down' callback doesn't abort.
         *
         * @param collection
         * @param settings
         * @param elements
         * @param element
         * @returns {*}
         */
        var doDown = function (collection, settings, elements, element) {
            if (element.next().length && trueOrUndefined(settings.before_down(collection, element))) {
                element.before(element.next());
                settings.after_up(collection, elements);
            }

            return elements;
        };

        /**
         * INITIALIZATION
         */

        var settings = $.extend(true, {}, defaults, options);

        if ($(settings.container).length === 0) {
            console.log("jquery.collection.js: a container should exist to handle events (basically, a <body> tag).");
            return false;
        }

        var collections = $(this);

        collections.each(function (i, collection) {
            collection = $(collection);

            settings.before_init(collection);

            // merge data-attributes into settings
            if (!settings.prototype) {
                if (collection.data('prototype') !== undefined) {
                    settings.prototype = collection.data('prototype');
                } else {
                    console.log("jquery.collection.js: given collection field has no prototype, check that your field has the prototype option set to true (in symfony form builder) or provide the prototype option yourself.");
                    return true;
                }
            }
            if (collection.data('prototype-name') !== undefined) {
                settings.prototype_name = collection.data('prototype-name');
            }
            if (collection.data('allow-add') !== undefined) {
                settings.allow_add = collection.data('allow-add');
                settings.allow_duplicate = settings.allow_add ? settings.allow_duplicate : false;
            }
            if (collection.data('allow-remove') !== undefined) {
                settings.allow_remove = collection.data('allow-remove');
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

            // make sure init_with_n_elements is in the min/max range if provided
            if (settings.init_with_n_elements < settings.min) {
                settings.init_with_n_elements = settings.min;
            }
            if (settings.init_with_n_elements > settings.max) {
                settings.init_with_n_elements = settings.max;
            }

            // save processed settings to data attribute
            collection.data('collection-settings', settings);

            // add element class to all elements if not exists
            collection.find('> div').each(function (i, element) {
                $(element).addClass(settings.elements_selector.replace('.', ''));
            });

            // add initial elements (defined by init_with_n_elements)
            var elements = collection.find(settings.elements_selector);
            while (elements.length < settings.init_with_n_elements) {
                elements = doAdd($(settings.container), button, collection, settings, elements, null, false);
            }

            // calc index
            collection.data('index', elements.length);

            // handle drag/drop support from jquery ui and trigger events
            if (settings.drag_drop && settings.allow_up && settings.allow_down) {
                var oldPosition;
                var newPosition;
                if (typeof jQuery.ui === 'undefined' || typeof jQuery.ui.sortable === 'undefined') {
                    settings.drag_drop = false;
                } else {
                    collection.sortable($.extend(true, {}, {
                        start: function (event, ui) {
                            var elements = collection.find(settings.elements_selector);
                            var element = ui.item;
                            var that = $(this);
                            if (!trueOrUndefined(settings.drag_drop_start(event, ui, elements, element))) {
                                that.sortable("cancel");
                                return;
                            }
                            ui.placeholder.height(ui.item.height());
                            ui.placeholder.width(ui.item.width());
                            oldPosition = elements.index(element);
                        },
                        update: function (event, ui) {
                            var elements = collection.find(settings.elements_selector);
                            var element = ui.item;
                            var that = $(this);
                            newPosition = elements.index(element);
                            if (false === settings.drag_drop_update(event, ui, elements, element) || !(newPosition - oldPosition < 0 ? trueOrUndefined(settings.before_up(collection, element)) : trueOrUndefined(settings.before_down(collection, element)))) {
                                that.sortable("cancel");
                                return;
                            }
                            dumpCollectionActions(collection, settings, false);
                            setOrderValues(collection, settings);
                            newPosition - oldPosition < 0 ? trueOrUndefined(settings.after_up(collection, element)) : trueOrUndefined(settings.after_down(collection, element));
                        }
                    }, settings.drag_drop_options));
                }
            }

            // add events to action buttons
            var container = $(settings.container);
            container
                .off('click', '.' + settings.prefix + '-action')
                .on('click', '.' + settings.prefix + '-action', function (e) {

                    var that = $(this);

                    var collection = $('#' + that.data('collection')),
                        settings = collection.data('collection-settings'),
                        elements = collection.find(settings.elements_selector);

                    var element = that.parents(settings.elements_selector);

                    if (that.is('.' + settings.prefix + '-duplicate') && settings.allow_add && settings.allow_duplicate) {
                        doAdd(container, that, collection, settings, elements, element, true);
                    }

                    if (that.is('.' + settings.prefix + '-rescue-add') && settings.allow_add) {
                        doAdd(container, that, collection, settings, elements, element, false);
                    }

                    if (that.is('.' + settings.prefix + '-add') && settings.allow_add) {
                        doAdd(container, that, collection, settings, elements, element, false);
                    }

                    if (that.is('.' + settings.prefix + '-remove') && settings.allow_remove) {
                        doDelete(collection, settings, elements, element);
                    }

                    if (that.is('.' + settings.prefix + '-up') && settings.allow_up) {
                        doUp(collection, settings, elements, element);
                    }

                    if (that.is('.' + settings.prefix + '-down') && settings.allow_down) {
                        doDown(collection, settings, elements, element);
                    }

                    dumpCollectionActions(collection, settings, false);
                    setOrderValues(collection, settings);
                    e.preventDefault();
                });

            dumpCollectionActions(collection, settings, true);
            enableChildrenCollections(collection, null, settings);

            settings.after_init(collection);
        });

        return true;
    };

})(jQuery);
