/*
 * jquery.collection.js
 *
 * Copyright (c) 2042 alain tiemblo <alain at fuz dot org>
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
            prototype_name: '__name__',
            name_prefix: null,
            elements_selector: '> div',
            elements_parent_selector: '%id%',
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
            fade_in: true,
            fade_out: true,
            position_field_selector: null
        };

        // used to generate random id attributes when required and missing
        var randomNumber = function () {
            var rand = '' + Math.random() * 1000 * new Date().getTime();
            return rand.replace('.', '').split('').sort(function () {
                return 0.5 - Math.random();
            }).join('');
        };

        // return an element's id, after generating one when missing
        var getOrCreateId = function (prefix, obj) {
            if (!obj.attr('id')) {
                var generated_id;
                do {
                    generated_id = prefix + '_' + randomNumber();
                } while ($('#' + generated_id).length > 0);
                obj.attr('id', generated_id);
            }
            return obj.attr('id');
        };

        // return a field value whatever the field type
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

        // set a field value in accordance to the field type
        var putFieldValue = function (selector, value, physical) {
            try {
                var jqElem = $(selector);
            } catch (e) {
                return;
            }
            if (jqElem.length === 0) {
                return;
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

        // a callback set in an event will be considered failed if it
        // returns false, null, or 0.
        var trueOrUndefined = function (value) {
            return undefined === value || value;
        };

        // used to change element indexes in arbitary id attributes
        var pregQuote = function (string) {
            return (string + '').replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
        };

        // if we need to change CollectionType_field_42_value to CollectionType_field_84_value, this method
        // will change it in id="CollectionType_field_42_value", but also data-id="CollectionType_field_42_value"
        // or anywhere else just in case it could be used otherwise.
        var replaceAttrData = function (elements, index, toReplace, replaceWith) {

            var replaceAttrDataNode = function (node) {
                var jqNode = $(node);
                $.each(node.attributes, function (i, attrib) {
                    if ($.type(attrib.value) === 'string') {
                        jqNode.attr(attrib.name.replace(toReplace, replaceWith), attrib.value.replace(toReplace, replaceWith));
                    }
                });
                $.each(jqNode.data(), function (name, value) {
                    if ($.type(value) === 'string') {
                        jqNode.data(name.replace(toReplace, replaceWith), value.replace(toReplace, replaceWith));
                    }
                });
            };

            var element = elements.eq(index);
            replaceAttrDataNode(element[0]);
            element.find('*').each(function () {
                replaceAttrDataNode(this);
            });
        };

        // replace element names and indexes in the collection, in Symfony, names are always in format
        // CollectionType[field][42][value] and ids are in format CollectionType_field_42_value;
        // so we need to change both.
        var changeElementIndex = function (collection, elements, settings, index, oldIndex, newIndex) {
            var toReplace = new RegExp(pregQuote(settings.name_prefix + '[' + oldIndex + ']'), 'g');
            var replaceWith = settings.name_prefix + '[' + newIndex + ']';

            if (settings.children) {
                $.each(settings.children, function(key, child) {
                    var childCollection = collection.find(child.selector).eq(index);
                    var childSettings = childCollection.data('collection-settings');
                    if (childSettings) {
                        childSettings.name_prefix = childSettings.name_prefix.replace(toReplace, replaceWith);
                        childCollection.data('collection-settings', childSettings);
                    }
                });
            }

            replaceAttrData(elements, index, toReplace, replaceWith);

            toReplace = new RegExp(pregQuote(collection.attr('id') + '_' + oldIndex), 'g');
            replaceWith = collection.attr('id') + '_' + newIndex;
            replaceAttrData(elements, index, toReplace, replaceWith);
        };

        // same as above, but will replace element names and indexes in an html string instead
        // of in a dom element.
        var changeHtmlIndex = function (collection, settings, html, oldIndex, newIndex) {
            var toReplace = new RegExp(pregQuote(settings.name_prefix + '[' + oldIndex + ']'), 'g');
            var replaceWith = settings.name_prefix + '[' + newIndex + ']';
            html = html.replace(toReplace, replaceWith);

            toReplace = new RegExp(pregQuote(collection.attr('id') + '_' + oldIndex), 'g');
            replaceWith = collection.attr('id') + '_' + newIndex;
            html = html.replace(toReplace, replaceWith);

            return html;
        };

        // sometimes, setting a value will only be made in memory and not
        // physically in the dom; and we need the full dom when we want
        // to duplicate a field.
        var putFieldValuesInDom = function (element) {
            $(element).find(':input').each(function (index, inputObj) {
                putFieldValue(inputObj, getFieldValue(inputObj), true);
            });
        };

        // this method does the whole magic: in a collection, if we want to
        // move elements and keep element positions in the backend, we should
        // either move element names or element contents, but not both! thus,
        // if you just move elements in the dom, you keep field names and data
        // attached and nothing will change in the backend.
        var swapElements = function (collection, elements, oldIndex, newIndex) {

            var settings = collection.data('collection-settings');

            if (settings.position_field_selector) {
                putFieldValue(elements.eq(newIndex).find(settings.position_field_selector), oldIndex);
                putFieldValue(elements.eq(oldIndex).find(settings.position_field_selector), newIndex);
            } else {
                changeElementIndex(collection, elements, settings, oldIndex, oldIndex, '__swap__');
                changeElementIndex(collection, elements, settings, newIndex, newIndex, oldIndex);
                changeElementIndex(collection, elements, settings, oldIndex, '__swap__', newIndex);
            }

            elements.eq(oldIndex).insertBefore(elements.eq(newIndex));
            if (newIndex > oldIndex) {
                elements.eq(newIndex).insertBefore(elements.eq(oldIndex));
            } else {
                elements.eq(newIndex).insertAfter(elements.eq(oldIndex));
            }

            return collection.find(settings.elements_selector);
        };

        // moving an element down of 3 rows means increasing its index of 3, and
        // decreasing the 2 ones between of 1. Example: 0-A 1-B 2-C 3-D:
        // moving B to 3 becomes 0-A 1-C 2-D 3-B
        var swapElementsUp = function (collection, elements, settings, oldIndex, newIndex) {
            for (var i = oldIndex + 1; (i <= newIndex); i++) {
                elements = swapElements(collection, elements, i, i - 1);
            }
            return collection.find(settings.elements_selector);
        };

        // moving an element up of 3 rows means decreasing its index of 3, and
        // increasing the 2 ones between of 1. Example: 0-A 1-B 2-C 3-D:
        // moving D to 1 becomes 0-A 1-D 2-B 3-C
        var swapElementsDown = function (collection, elements, settings, oldIndex, newIndex) {
            for (var i = oldIndex - 1; (i >= newIndex); i--) {
                elements = swapElements(collection, elements, i, i + 1);
            }
            return collection.find(settings.elements_selector);
        };

        // if we create an element at position 2, all element indexes from 2 to N
        // should be increased. for example, in 0-A 1-B 2-C 3-D, adding X at position
        // 1 will create 0-A 1-X 2-B 3-C 4-D
        var shiftElementsUp = function (collection, elements, settings, index) {
            for (var i = index + 1; i < elements.length; i++) {
                elements = swapElements(collection, elements, i - 1, i);
            }
            return collection.find(settings.elements_selector);
        };

        // if we remove an element at position 3, all element indexes from 3 to N
        // should be decreased. for example, in 0-A 1-B 2-C 3-D, removing B will create
        // 0-A 1-C 2-D
        var shiftElementsDown = function (collection, elements, settings, index) {
            for (var i = elements.length - 2; i > index; i--) {
                elements = swapElements(collection, elements, i + 1, i);
            }
            return collection.find(settings.elements_selector);
        };

        // this method creates buttons for each action, according to all options set
        // (buttons enabled, minimum/maximum of elements not yet reached, rescue
        // button creation when no more elements are remaining...)
        var dumpCollectionActions = function (collection, settings, isInitialization, event) {
            var elementsParent = $(settings.elements_parent_selector);
            var init = elementsParent.find('.' + settings.prefix + '-tmp').length === 0;
            var elements = collection.find(settings.elements_selector);

            // add a rescue button that will appear only if collection is emptied
            if (settings.allow_add) {
                if (init) {
                    elementsParent.append('<span class="' + settings.prefix + '-tmp"></span>');
                    if (settings.add) {
                        collection.append(
                            $(settings.add)
                                .addClass(settings.prefix + '-action ' + settings.prefix + '-rescue-add')
                                .data('collection', collection.attr('id'))
                        );
                    }
                }
            }

            // initializes the collection with a minimal number of elements
            if (isInitialization) {
                var container = $(settings.container);
                var button = collection.find('.' + settings.prefix + '-add, .' + settings.prefix + '-rescue-add, .' + settings.prefix + '-duplicate').first();
                while (elements.length < settings.init_with_n_elements) {
                    var element = elements.length > 0 ? elements.last() : undefined;
                    var index = elements.length - 1;
                    elements = doAdd(container, button, collection, settings, elements, element, index, false);
                }
            }

            // make buttons appear/disappear in each elements of the collection according to options
            // (enabled, min/max...) and logic (for example, do not put a move up button on the first
            // element of the collection)
            elements.each(function (index) {
                var element = $(this);

                var actions = element.find('.' + settings.prefix + '-actions').addBack().filter('.' + settings.prefix + '-actions');
                if (actions.length === 0) {
                    actions = $('<div class="' + settings.prefix + '-actions"></div>');
                    element.append(actions);
                }

                var delta = 0;
                if (event === 'remove' && settings.fade_out) {
                    delta = 1;
                }

                var buttons = [
                    {
                        'enabled': settings.allow_remove,
                        'selector': settings.prefix + '-remove',
                        'html': settings.remove,
                        'condition': elements.length - delta > settings.min
                    }, {
                        'enabled': settings.allow_up,
                        'selector': settings.prefix + '-up',
                        'html': settings.up,
                        'condition': elements.length - delta > 1 && elements.index(element) !== 0
                    }, {
                        'enabled': settings.allow_down,
                        'selector': settings.prefix + '-down',
                        'html': settings.down,
                        'condition': elements.length - delta > 1 && elements.index(element) !== elements.length - 1
                    }, {
                        'enabled': settings.allow_add && !settings.add_at_the_end && !settings.custom_add_location,
                        'selector': settings.prefix + '-add',
                        'html': settings.add,
                        'condition': elements.length - delta < settings.max
                    }, {
                        'enabled': settings.allow_duplicate,
                        'selector': settings.prefix + '-duplicate',
                        'html': settings.duplicate,
                        'condition': elements.length - delta < settings.max
                    }
                ];

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
                            .data('collection', collection.attr('id'))
                            .data(settings.prefix + '-element', getOrCreateId(collection.attr('id') + '_' + index, element));
                    } else {
                        element.find('.' + button.selector).css('display', 'none');
                    }
                });

            }); // elements.each

            // make the rescue button appear / disappear according to options (add_at_the_end) and
            // logic (no more elements on the collection)
            if (settings.allow_add) {

                var delta = 0;
                if (event === 'remove' && settings.fade_out) {
                    delta = 1;
                }

                var rescueAdd = collection.find('.' + settings.prefix + '-rescue-add').css('display', '').removeClass(settings.prefix + '-action-disabled');
                var adds = collection.find('.' + settings.prefix + '-add');
                if (!settings.add_at_the_end && adds.length > delta || settings.custom_add_location) {
                    rescueAdd.css('display', 'none');
                } else if (event === 'remove' && settings.fade_out) {
                    rescueAdd.css('display', 'none');
                    rescueAdd.fadeIn('fast');
                }
                if (elements.length - delta >= settings.max) {
                    rescueAdd.addClass(settings.prefix + '-action-disabled');
                    if (settings.hide_useless_buttons) {
                        collection.find('.' + settings.prefix + '-add, .' + settings.prefix + '-rescue-add, .' + settings.prefix + '-duplicate').css('display', 'none');
                    }
                }
            }

        }; // dumpCollectionActions

        // this plugin supports nested collections, and this method enables them when the
        // parent collection is initialized. see
        // http://symfony-collection.fuz.org/symfony3/advanced/collectionOfCollections
        var enableChildrenCollections = function (collection, element, settings) {
            if (settings.children) {
                $.each(settings.children, function (index, childrenSettings) {
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

        // this method handles a click on "add" buttons, it increases all following element indexes of
        // 1 position and insert a new one in the index that becomes free. if click has been made on a
        // "duplicate" button, all element values are then inserted. finally, callbacks let user cancel
        // those actions if needed.
        var doAdd = function (container, that, collection, settings, elements, element, index, isDuplicate) {
            if (elements.length < settings.max && (isDuplicate && trueOrUndefined(settings.before_duplicate(collection, element)) || trueOrUndefined(settings.before_add(collection, element)))) {
                var prototype = collection.data('prototype');
                var freeIndex = elements.length;
                if (index === -1) {
                    index = elements.length - 1;
                }
                var regexp = new RegExp(pregQuote(settings.prototype_name), 'g');
                var code = $(prototype.replace(regexp, freeIndex));
                var elementsParent = $(settings.elements_parent_selector);
                var tmp = elementsParent.find('> .' + settings.prefix + '-tmp');
                var id = $(code).find('[id]').first().attr('id');

                if (isDuplicate) {
                    putFieldValuesInDom(elements.eq(index));
                    var oldHtml = $("<div/>").append(elements.eq(index).clone()).html();
                    var newHtml = changeHtmlIndex(collection, settings, oldHtml, index, freeIndex);
                    code = $('<div/>').html(newHtml).contents();
                    if (settings.fade_in) {
                        code.hide();
                    }
                    tmp.before(code).find(settings.prefix + '-actions').remove();
                } else {
                    if (settings.fade_in) {
                        code.hide();
                    }
                    tmp.before(code);
                }

                if (settings.position_field_selector) {
                    putFieldValue(code.find(settings.position_field_selector), freeIndex);
                }

                elements = collection.find(settings.elements_selector);
                var action = code.find('.' + settings.prefix + '-add, .' + settings.prefix + '-duplicate');
                if (action.length > 0) {
                    action.addClass(settings.prefix + '-action').data('collection', collection.attr('id'));
                }

                if (index + 1 !== freeIndex) {
                    elements = doMove(collection, settings, elements, code, freeIndex, index + 1);
                } else {
                    dumpCollectionActions(collection, settings, false);
                }

                enableChildrenCollections(collection, code, settings);

                if ((isDuplicate && !trueOrUndefined(settings.after_duplicate(collection, code))) || !trueOrUndefined(settings.after_add(collection, code))) {
                    if (index !== -1) {
                        elements = shiftElementsUp(collection, elements, settings, index + 1);
                    }
                    code.remove();
                }
            }

            if (code !== undefined && settings.fade_in) {
                code.fadeIn('fast');
            }

            return elements;
        };

        // removes the current element when clicking on a "delete" button and decrease all following
        // indexes from 1 position.
        var doDelete = function (collection, settings, elements, element, index) {
            if (elements.length > settings.min && trueOrUndefined(settings.before_remove(collection, element))) {
                var deletion = function () {
                    elements = shiftElementsUp(collection, elements, settings, index);
                    var toDelete = elements.last();
                    var backup = toDelete.clone({withDataAndEvents: true}).show();
                    toDelete.remove();
                    if (!trueOrUndefined(settings.after_remove(collection, backup))) {
                        var elementsParent = $(settings.elements_parent_selector);
                        elementsParent.find('> .' + settings.prefix + '-tmp').before(backup);
                        elements = collection.find(settings.elements_selector);
                        elements = shiftElementsDown(collection, elements, settings, index - 1);
                    }
                };
                if (settings.fade_out) {
                    element.fadeOut('fast', function () {
                        deletion();
                    });
                } else {
                    deletion();
                }
            }

            return elements;
        };

        // reverse current element and the previous one (so the current element
        // appears one place higher)
        var doUp = function (collection, settings, elements, element, index) {
            if (index !== 0 && trueOrUndefined(settings.before_up(collection, element))) {
                elements = swapElements(collection, elements, index, index - 1);
                if (!trueOrUndefined(settings.after_up(collection, element))) {
                    elements = swapElements(collection, elements, index - 1, index);
                }
            }

            return elements;
        };

        // reverse the current element and the next one (so the current element
        // appears one place lower)
        var doDown = function (collection, settings, elements, element, index) {
            if (index !== (elements.length - 1) && trueOrUndefined(settings.before_down(collection, element))) {
                elements = swapElements(collection, elements, index, index + 1);
                if (!trueOrUndefined(settings.after_down(collection, elements))) {
                    elements = swapElements(collection, elements, index + 1, index);
                }
            }

            return elements;
        };

        // move an element from a position to an arbitrary new position
        var doMove = function (collection, settings, elements, element, oldIndex, newIndex) {
            if (1 === Math.abs(newIndex - oldIndex)) {
                elements = swapElements(collection, elements, oldIndex, newIndex);
                if (!(newIndex - oldIndex > 0 ? trueOrUndefined(settings.after_up(collection, element)) : trueOrUndefined(settings.after_down(collection, element)))) {
                    elements = swapElements(collection, elements, newIndex, oldIndex);
                }
            } else {
                if (oldIndex < newIndex) {
                    elements = swapElementsUp(collection, elements, settings, oldIndex, newIndex);
                    if (!(newIndex - oldIndex > 0 ? trueOrUndefined(settings.after_up(collection, element)) : trueOrUndefined(settings.after_down(collection, element)))) {
                        elements = swapElementsDown(collection, elements, settings, newIndex, oldIndex);
                    }
                } else {
                    elements = swapElementsDown(collection, elements, settings, oldIndex, newIndex);
                    if (!(newIndex - oldIndex > 0 ? trueOrUndefined(settings.after_up(collection, element)) : trueOrUndefined(settings.after_down(collection, element)))) {
                        elements = swapElementsUp(collection, elements, settings, newIndex, oldIndex);
                    }
                }
            }
            dumpCollectionActions(collection, settings, false);

            return elements;
        };

        // we're in a $.fn., so in $('.collection').collection(), $(this) equals $('.collection')
        var elems = $(this);

        // at least one, but why not several collections should be raised
        if (elems.length === 0) {
            console.log("jquery.collection.js: given collection selector does not exist.");
            return false;
        }

        elems.each(function () {

            var settings = $.extend(true, {}, defaults, options);

            // usage of $.fn.on events using a static container just in case there would be some
            // ajax interactions inside the collection
            if ($(settings.container).length === 0) {
                console.log("jquery.collection.js: a container should exist to handle events (basically, a <body> tag).");
                return false;
            }

            // it is possible to use this plugin with a selector that will contain the collection id
            // in a data attribute
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

            // when adding elements to a collection, we should be aware of the node that will contain them
            settings.elements_parent_selector = settings.elements_parent_selector.replace('%id%', '#' + getOrCreateId('', collection));
            if (!settings.elements_parent_selector) {
                settings.elements_parent_selector = '#' + getOrCreateId('', collection);
                if ($(settings.elements_parent_selector).length === 0) {
                    console.log("jquery.collection.js: given elements parent selector does not return any object.");
                    return true;
                }
            }

            // enforcing logic between options
            if (!settings.allow_add) {
                settings.allow_duplicate = false;
                settings.add_at_the_end = false;
            }
            if (settings.init_with_n_elements > settings.max) {
                settings.init_with_n_elements = settings.max;
            }
            if (settings.min && (!settings.init_with_n_elements || settings.init_with_n_elements < settings.min)) {
                settings.init_with_n_elements = settings.min;
            }

            // user callback
            settings.before_init(collection);

            // prototype required to create new elements in the collection
            if (collection.data('prototype') === null) {
                console.log("jquery.collection.js: given collection field has no prototype, check that your field has the prototype option set to true.");
                return true;
            }

            // all the following data attributes are automatically available thanks to
            // jquery.collection.html.twig form theme
            if (collection.data('prototype-name') !== undefined) {
                settings.prototype_name = collection.data('prototype-name');
            }
            if (collection.data('allow-add') !== undefined) {
                settings.allow_add = collection.data('allow-add');
                settings.allow_duplicate = collection.data('allow-add') ? settings.allow_duplicate : false;
            }
            if (collection.data('allow-remove') !== undefined) {
                settings.allow_remove = collection.data('allow-remove');
            }
            if (collection.data('name-prefix') !== undefined) {
                settings.name_prefix = collection.data('name-prefix');
            }

            // prototype-name required for nested collections, where collection id prefix
            // isn't guessable (see https://github.com/symfony/symfony/issues/13837)
            if (!settings.name_prefix) {
                console.log("jquery.collection.js: the prefix used in descendant field names is mandatory, you can set it using 2 ways:");
                console.log("jquery.collection.js: - use the form theme given with this plugin source");
                console.log("jquery.collection.js: - set name_prefix option to  '{{ formView.myCollectionField.vars.full_name }}'");
                return true;
            }

            // drag & drop support: this is a bit more complex than pressing "up" or
            // "down" buttons because we can move elements more than one place ahead
            // or below...
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
                            that.sortable("cancel");
                            if (false === settings.drag_drop_update(event, ui, elements, element) || !(newPosition - oldPosition > 0 ? trueOrUndefined(settings.before_up(collection, element)) : trueOrUndefined(settings.before_down(collection, element)))) {
                                return;
                            }
                            newPosition = elements.index(element);
                            elements = collection.find(settings.elements_selector);
                            doMove(collection, settings, elements, element, oldPosition, newPosition);
                        }
                    }, settings.drag_drop_options));
                }
            }

            collection.data('collection-settings', settings);

            // events on buttons using a "static" container so even newly
            // created/ajax downloaded buttons doesn't need further initialization
            var container = $(settings.container);
            container
                .off('click', '.' + settings.prefix + '-action')
                .on('click', '.' + settings.prefix + '-action', function (e) {

                    var that = $(this);

                    var collection = $('#' + that.data('collection'));
                    var settings = collection.data('collection-settings');

                    if (undefined === settings) {
                        var collection = $('#' + that.data('collection')).find('.' + that.data('collection') + '-collection');
                        var settings = collection.data('collection-settings');
                        if (undefined === settings) {
                            throw "Can't find collection: " + that.data('collection');
                        }
                    }

                    var elements = collection.find(settings.elements_selector);
                    var element = that.data(settings.prefix + '-element') ? $('#' + that.data(settings.prefix + '-element')) : undefined;
                    var index = element && element.length ? elements.index(element) : -1;
                    var event = null;

                    var isDuplicate = that.is('.' + settings.prefix + '-duplicate');
                    if ((that.is('.' + settings.prefix + '-add') || that.is('.' + settings.prefix + '-rescue-add') || isDuplicate) && settings.allow_add) {
                        event = 'add';
                        elements = doAdd(container, that, collection, settings, elements, element, index, isDuplicate);
                    }

                    if (that.is('.' + settings.prefix + '-remove') && settings.allow_remove) {
                        event = 'remove';
                        elements = doDelete(collection, settings, elements, element, index);
                    }

                    if (that.is('.' + settings.prefix + '-up') && settings.allow_up) {
                        event = 'up';
                        elements = doUp(collection, settings, elements, element, index);
                    }

                    if (that.is('.' + settings.prefix + '-down') && settings.allow_down) {
                        event = 'down';
                        elements = doDown(collection, settings, elements, element, index);
                    }

                    dumpCollectionActions(collection, settings, false, event);
                    e.preventDefault();
                }); // .on

            dumpCollectionActions(collection, settings, true);
            enableChildrenCollections(collection, null, settings);

            // if collection elements are given in the wrong order, plugin
            // must reorder them graphically
            if (settings.position_field_selector) {
                var array = [];
                var elements = collection.find(settings.elements_selector);
                elements.each(function (index) {
                    var that = $(this);
                    array.push({
                        position: parseFloat(getFieldValue(that.find(settings.position_field_selector))),
                        element: that
                    });
                });

                var sorter = function (a, b) {
                    return (a.position < b.position ? -1 : (a.position > b.position ? 1 : 0));
                };
                array.sort(sorter);

                $.each(array, function(newIndex, object) {
                    var ids = [];
                    $(elements).each(function(index) {
                        ids.push($(this).attr('id'));
                    });

                    var element = object.element;
                    var oldIndex = $.inArray(element.attr('id'), ids);

                    if (newIndex !== oldIndex) {
                        elements = doMove(collection, settings, elements, element, oldIndex, newIndex);
                        putFieldValue(element.find(settings.position_field_selector), newIndex);
                    }
                });
            } // if (settings.position_field_selector) {

            settings.after_init(collection);

        }); // elem.each

        return true;
    }; // $.fn.collection

})(jQuery);
