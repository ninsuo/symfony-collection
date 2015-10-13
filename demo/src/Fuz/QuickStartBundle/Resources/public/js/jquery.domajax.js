/*
 * jquery.domajax.js v2.0.3
 * http://www.domajax.com
 *
 * Copyright (c) 2012-2014 alain tiemblo <ninsuo at gmail dot com>
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
(function ($, windowObj) {

    $.fn.domAjax = function (overwriteSettings) {

        /*
         * ------------------------------------------
         * Default settings
         * ------------------------------------------
         */

        var defaults = {
            'endpoint': null,
            'endpoint-container': null,
            'input': null,
            'input-attr': '',
            'output': null,
            'output-complete': null,
            'output-success': null,
            'output-failure': null,
            'output-empty': null,
            'output-not-empty': null,
            'output-json': null,
            'confirm': null,
            'lock': null,
            'lock-before': null,
            'lock-complete': null,
            'lock-success': null,
            'lock-failure': null,
            'lock-empty': null,
            'lock-not-empty': null,
            'unlock': null,
            'unlock-before': null,
            'unlock-complete': null,
            'unlock-success': null,
            'unlock-failure': null,
            'unlock-empty': null,
            'unlock-not-empty': null,
            'method': 'post',
            'cache': 'false',
            'cache-name': 'ajax',
            'raw': null,
            'raw-type': null,
            'limit': -1,
            'counter': 0,
            'highlight': null,
            'highlight-before': null,
            'highlight-complete': null,
            'highlight-success': null,
            'highlight-failure': null,
            'highlight-empty': null,
            'highlight-not-empty': null,
            'highlight-color': null,
            'highlight-color-before': null,
            'highlight-color-complete': null,
            'highlight-color-success': null,
            'highlight-color-failure': null,
            'highlight-color-empty': null,
            'highlight-color-not-empty': null,
            'callback-before': null,
            'callback-complete': null,
            'callback-success': null,
            'callback-failure': null,
            'callback-empty': null,
            'callback-not-empty': null,
            'alias': null,
            'script-before': null,
            'script-complete': null,
            'script-success': null,
            'script-failure': null,
            'script-empty': null,
            'script-not-empty': null,
            'replace': null,
            'replace-by': null,
            'delay': 0,
            'value': null,
            'domajax-before': null,
            'domajax-complete': null,
            'domajax-success': null,
            'domajax-failure': null,
            'domajax-empty': null,
            'domajax-not-empty': null,
            'poll': null,
        };

        if (overwriteSettings === undefined) {
            overwriteSettings = {};
        }

        var events = ['before', 'complete', 'success', 'failure', 'empty', 'not-empty', ];

        /*
         * ------------------------------------------
         * Initialization
         * ------------------------------------------
         */

        var context = $('body');

        var elems = this;
        if (elems.length === 0) {
            return elems;
        }

        /*
         * ------------------------------------------
         * Options treatment before ajax request
         * ------------------------------------------
         */

        return $(elems).each(function () {

            var settings = {};

            var elem = $(this);

            // --- data-alias
            var aliases_seen = [];
            while ((elem.data('alias') !== undefined) && (elem.data('alias') !== null)) {
                var aliases = $(elem.data('alias'));
                elem.data('alias', null);
                if (aliases.length > 0) {
                    $(aliases).each(function () {
                        var alias = $(this);
                        var alias_id = tools.getOrCreateId(alias);
                        if ($.inArray(alias_id, aliases_seen) >= 0) {
                            return true;
                        }
                        aliases_seen.push(alias_id);
                        $.each(defaults, function (key) {
                            if (((elem.data(key) === undefined) || (elem.data(key) === null)) && (alias.data(key) !== undefined)) {
                                elem.data(key, alias.data(key));
                            }
                        });
                    });
                }
            }

            // --- settings
            settings = $.extend(true, {}, defaults);
            $.each(settings, function (key) {
                if (elem.data(key) !== undefined) {
                    settings[key] = elem.data(key);
                }
            });
            settings = $.extend(true, settings, overwriteSettings);

            // --- data-delay
            if (settings['delay'] > 0) {
                var typeWatch = elem.data('delay-watcher');
                if ((typeWatch !== undefined) && (typeWatch !== null)) {
                    clearTimeout(typeWatch);
                }
                typeWatch = setTimeout(function () {
                    elem.data('delay-watcher', null);
                    elem.domAjax({
                        delay: 0
                    });
                }, settings['delay']);
                elem.data('delay-watcher', typeWatch);
                return true;
            }

            // --- data-value
            if (settings['value'] !== null) {
                if (settings['value'] === '') {
                    settings['value'] = '#' + tools.getOrCreateId(elem);
                }
                var curValue = JSON.stringify(tools.getInputs(settings['value'], elem, context));
                var oldValue = elem.data('delay-old-value');
                if (curValue === oldValue) {
                    return true;
                }
                elem.data('delay-old-value', curValue);
            }

            // --- data-endpoint
            // --- data-endpoint-container
            if ((settings['endpoint'] === null) && (elem.attr('href') !== undefined)) {
                settings['endpoint'] = elem.attr('href');
            }
            var endpoint = settings['endpoint'];
            if (endpoint === null) {
                endpoint = tools.getValue(settings['endpoint-container'], context);
                if (endpoint === null) {
                    throw "Element has no endpoint data.";
                }
            }
            settings['endpoint'] = endpoint;

            // --- data-confirm
            if ((settings['confirm'] !== null) && (confirm(settings['confirm']) === false)) {
                return true;
            }

            // --- priority events
            if (processPriorityEvents(settings, elem, 'before') === false) {
                return true;
            }

            // --- data-counter, data-limit
            var counter = parseInt(settings['counter']);
            settings['counter'] = (isNaN(counter) ? 0 : counter) + 1;
            if ((settings['limit'] >= 0) && (settings['counter'] > settings['limit'])) {
                return true;
            }
            elem.data('counter', settings['counter']);

            // --- data-cache
            // --- data-cache-name
            settings['cache'] += '';
            settings['cache-name'] += '';
            if (settings['cache'].toLowerCase() === 'true') {
                if (settings['endpoint'].indexOf('?') === -1) {
                    settings['endpoint'] = settings['endpoint'] + '?';
                } else {
                    settings['endpoint'] = settings['endpoint'] + '&';
                }
                settings['cache-name'].replace(/[^a-zA-Z_]/g, '_');
                var cacheVar = settings['cache-name'] + '=' + new Date().getTime() + Math.random();
                settings['endpoint'] = settings['endpoint'] + cacheVar.replace('.', '');
            }

            // --- data-input
            var inputs = {};
            if (settings['input'] !== null) {
                inputs = tools.getInputs(settings['input'], elem, context);
            }
            settings['input'] = inputs;

            // --- data-input-attr
            var inputAttrs = {};
            $.each(settings['input-attr'].split(' '), function (index, attribute) {
                if ((attribute + '').length > 0) {
                    inputAttrs[attribute] = $(elem).data(attribute);
                }
            });
            settings['input-attr'] = inputAttrs;

            // --- data-output
            if (settings['output'] !== null) {
                settings['output-success'] = settings['output'];
            }
            $.each(events, function (index, event) {
                var output = 'output-' + event;
                if (settings[output] === '') {
                    settings[output] = '#' + tools.getOrCreateId(elem);
                }
            });

            // --- data-output-json
            if (settings['output-json'] !== null) {
                var outputAttrs = {};
                $.each(settings['output-json'].split(' '), function (index, attribute) {
                    if ($(elem).data('json-' + attribute) !== undefined) {
                        outputAttrs[attribute] = $(elem).data('json-' + attribute);
                    }
                });
                settings['output-json'] = outputAttrs;
            }

            // --- data-lock
            if (settings['lock'] !== null) {
                settings['lock-before'] = settings['lock'];
                settings['unlock-complete'] = settings['lock'];
            }

            // --- data-unlock
            if (settings['unlock'] !== null) {
                settings['unlock-complete'] = settings['unlock'];
            }

            // --- data-raw
            if (settings['raw'] !== null) {
                var selector = settings['raw'];
                settings['raw'] = tools.getValue(selector, context);
                if (settings['raw'] === null) {
                    settings['raw'] = selector;
                }
            }

            // --- data-highlight, data-highlight-color
            var counter = 0;
            $.each(events, function (index, event) {
                var highlight_selector = 'highlight-' + event;
                var highlight_color = 'highlight-color-' + event;
                if ((settings[highlight_selector] === null) && (settings['highlight'] === null)) {
                    if ((settings[highlight_color] !== null) || (settings['highlight-color'] !== null)) {
                        settings['highlight'] = '#' + tools.getOrCreateId(elem);
                    }
                }
            });
            if (settings['highlight-color'] === null) {
                settings['highlight-color'] = 'blue';
            }
            $.each(events, function (index, event) {
                var highlight_selector = 'highlight-' + event;
                var highlight_color = 'highlight-color-' + event;
                if (settings[highlight_color] === null) {
                    settings[highlight_color] = settings['highlight-color'];
                } else {
                    if ((settings[highlight_selector] === null) && (settings['highlight'] !== null)) {
                        settings[highlight_selector] = settings['highlight'];
                        counter++;
                    }
                }
            });
            if ((counter === 0) && (settings['highlight'] !== null)) {
                settings['highlight-success'] = settings['highlight'];
            }
            $.each(events, function (index, event) {
                var highlight_selector = 'highlight-' + event;
                if (settings[highlight_selector] !== null) {
                    if (settings[highlight_selector] === '') {
                        settings[highlight_selector] = '#' + tools.getOrCreateId(elem);
                    }
                    $(settings[highlight_selector]).each(function (index2, toHighlight) {
                        if (!$(toHighlight).data('highlight-original-color')) {
                            $(toHighlight).data('highlight-original-color', $(toHighlight).css('color'));
                        }
                    });
                }
            });

            // --- data-replace, data-replace-by
            if (settings['replace'] === '') {
                settings['replace'] = '#' + tools.getOrCreateId(elem);
            }
            if (settings['replace-by'] === '') {
                settings['replace-by'] = '#' + tools.getOrCreateId(elem);
            }
            if ((settings['replace'] === settings['replace-by']) || ((settings['replace'] !== null) && (settings['replace-by'] === null)) || ((settings['replace'] === null) && (settings['replace-by'] !== null))) {
                settings['replace'] = null;
                settings['replace-by'] = null;
            }
            if (settings['replace'] !== null) {
                var replaceBackup = '';
                if (elem.data('replace-backup') !== undefined) {
                    $(elem.data('replace-backup')).remove();
                    elem.removeData('replace-backup');
                }
                $(settings['replace']).each(function () {
                    var objectToBackup = $(this);
                    var originalContainer = tools.getOrCreateId(objectToBackup);
                    var backup = tools.getValue(objectToBackup, context);
                    var backupContainer = $('<div></div>');
                    var backupId = tools.getOrCreateId(backupContainer);
                    if (replaceBackup !== '') {
                        replaceBackup += ', ';
                    }
                    replaceBackup += '#' + backupId;
                    backupContainer.css('display', 'none').data('replace-backup-original-container', '#' + originalContainer).html(backup).appendTo(context);
                });
                elem.attr('data-replace-backup', replaceBackup);
                var replace_by_value = tools.getValue(settings['replace-by']);
                tools.putValue(settings['replace'], replace_by_value);
            }

            // --- data-domajax
            $.each(events, function (index, event) {
                var domajax = 'domajax-' + event;
                if (settings[domajax] === '') {
                    settings[domajax] = '#' + tools.getOrCreateId(elem);
                }
            });

            processEvents(settings, elem, 'before');

            /*
             * ------------------------------------------
             * Options treatment after ajax request
             * ------------------------------------------
             */

            var responseIsEmpty = true;
            var responseCopy = null;

            $.ajax({
                url: settings['endpoint'],
                type: settings['method'],
                data: settings['raw'] || $.extend(true, {}, settings['input'], settings['input-attr']),
                dataType: settings['raw-type'] || undefined,
                processData: settings['raw'] ? false : true,
                success: function (response, textStatus, jqXHR) {

                    responseCopy = response;

                    processRevertReplace(context, settings, elem);

                    if (response) {
                        responseIsEmpty = false;
                        if (processPriorityEvents(settings, elem, 'not-empty', response, textStatus, jqXHR) === false) {
                            return true;
                        }
                        processEvents(settings, elem, 'not-empty', response);
                    } else {
                        if (processPriorityEvents(settings, elem, 'empty', response, textStatus, jqXHR) === false) {
                            return true;
                        }
                        processEvents(settings, elem, 'empty', response);
                    }

                    if (processPriorityEvents(settings, elem, 'success', response, textStatus, jqXHR) === false) {
                        return true;
                    }

                    // --- data-output-json
                    if (settings['output-json'] !== null) {
                        var jsonResponse = null;
                        if (typeof (response) === 'object') {
                            jsonResponse = response;
                        } else {
                            try {
                                jsonResponse = $.parseJSON(response);
                            } catch (e) {}
                        }
                        if (jsonResponse !== null) {
                            $.each(settings['output-json'], function (attribute, container) {
                                if ((jsonResponse[attribute] !== undefined) && ($(container).length > 0)) {
                                    tools.putValue(container, jsonResponse[attribute]);
                                }
                            });
                        }
                    }

                    processEvents(settings, elem, 'success', response);

                },
                error: function (jqXHR, textStatus, errorThrown) {

                    if (processPriorityEvents(settings, elem, 'failure', errorThrown, textStatus, jqXHR) === false) {
                        return true;
                    }

                    processRevertReplace(context, settings, elem);

                    processEvents(settings, elem, 'failure', jqXHR.status + ' ' + jqXHR.statusText);

                },
                complete: function () {

                    if (processPriorityEvents(settings, elem, 'complete') === false) {
                        return true;
                    }

                    processEvents(settings, elem, 'complete');

                    // --- data-poll
                    if (settings['poll'] !== null) {
                        var pollReturn = true;
                        var pollCallback = settings['poll'];
                        var pollClosure = tools.getClosureFronString(pollCallback, windowObj);
                        if ($.isFunction(pollClosure)) {
                            pollReturn = pollClosure(elem, responseCopy);
                        }
                        if (pollReturn) {
                            elem.domAjax();
                        }
                    }

                }
            });

            return true;

        }); // $(elems).each

    }; // $.fn.domAjax
    /*
     * ------------------------------------------
     * Options treatment on events, according to events
     * ------------------------------------------
     */

    $.fn.domAjax.processPriorityEvents = function (settings, elem, event, response, textStatus, jqXHR) {

        // --- data-script-event
        var option = 'script-' + event;
        if (settings[option] !== null) {
            var code = "(function(){" + settings[option] + ";})();";
            try {
                var scriptReturn = eval(code);
                if (scriptReturn === false) {
                    return false;
                }
            } catch (e) {
                throw 'data-script thrown an exception: '.e.message;
            }
        }

       // --- data-callback-event
        var option = 'callback-' + event;
        if (settings[option] !== null) {
            var callbacks = settings[option].split(' ');
          $.each(callbacks, function(index, callback) {
                var closure = tools.getClosureFronString(callback, windowObj);
                if ($.isFunction(closure)) {
                    var callbackReturn = closure(elem, response, textStatus, jqXHR);
                    if (callbackReturn === false) {
                        return false;
                    }
                } else {
                    throw 'data-callback must contain JavaScript function(s).';
                }
            });
        }

    };

    $.fn.domAjax.processEvents = function (settings, elem, event, response) {

        // ~~~ data-output
        var option = 'output-' + event;
        if ((settings[option] !== null) && (settings[option] !== undefined)) {
            $(settings[option]).each(function () {
                tools.putValue(this, response);
            });
        }

        // --- data-lock[-event]
        var option = 'lock-' + event;
        var lockList = {};
        if ((settings[option] !== null) && ($.type(settings[option]) !== 'object')) {
            lockList = tools.listElements(elem, settings[option], function (node) {
                return node.attr('disabled') === undefined;
            });
        }
        $.each(lockList, function (index, selector) {
            $(selector).attr('disabled', 'disabled');
            if ((event === 'before') && (settings['lock-before'] === settings['unlock-complete'])) {
               $(selector).data('locked', true);
            }
        });

        // --- data-unlock[-event]
        var option = 'unlock-' + event;
        var unlockList = {};
        if ((settings[option] !== null) && ($.type(settings[option]) !== 'object')) {
            unlockList = tools.listElements(elem, settings[option], function (node) {
                return node.attr('disabled') !== undefined;
            });
        }
        $.each(unlockList, function (index, selector) {
            if ((event === 'complete') && (settings['lock-before'] === settings['unlock-complete'])) {
                if ($(selector).data('locked')) {
                    $(selector).removeAttr('disabled');
                    $(selector).removeData('locked');
                }
            } else {
                $(selector).removeAttr('disabled');
            }
        });

        // --- data-highlight[-event]
        var option = 'highlight-' + event;
        if (settings[option] !== null) {
            var color_key = 'highlight-color-' + event;
            var color = settings[color_key] || settings['highlight-color'];
            if (color !== null) {
                $(settings[option]).each(function (index, toHighlight) {
                    var qToHighlight = $(toHighlight);
                    setTimeout(function () {
                        qToHighlight.stop().css({
                            'color': color
                        }).animate({
                            'color': qToHighlight.data('highlight-original-color')
                        }, 2500);
                    }, 0);
                });
            }
        }

        // --- data-domajax[-event]
        var option = 'domajax-' + event;
        if (settings[option] !== null) {
            $(settings[option]).domAjax();
        }

    };

    $.fn.domAjax.processRevertReplace = function (context, settings, elem) {

        // --- data-replace, data-replace-by
        if (settings['replace'] !== null) {
            $(elem.data('replace-backup')).each(function () {
                var objectToRestore = $(this);
                var backup = tools.getValue(objectToRestore, context);
                var originalContainer = objectToRestore.data('replace-backup-original-container');
                objectToRestore.remove();
                tools.putValue(originalContainer, backup);
            });
            $(settings['replace']).removeData('replace-backup');
        }

    };

    /*
     * ------------------------------------------
     * General methods
     * ------------------------------------------
     */

    $.fn.domAjax.tools = {

        // Get value fron one element according to its type
        getValue: function (selector, contextSelector) {
            try {
                var jqElem = $(selector);
            } catch (e) {
                return null;
            }
            if (jqElem.length === 0) {
                return null;
            } else if (jqElem.is('input[type="checkbox"]')) {
                return ((jqElem.prop('checked') === true) ? (true) : (undefined));
            } else if ((jqElem.is('input[type="radio"]')) && (jqElem.attr('name') !== undefined)) {
                return $('input[name="' + jqElem.attr('name') + '"]:checked', contextSelector).val();
            } else if (jqElem.prop('value') !== undefined) {
                return ((jqElem.is(':disabled') === false) ? (jqElem.val()) : (undefined));
            } else {
                return jqElem.html();
            }
        },

        // Set new value to a field or a container
        putValue: function (selector, value) {
            try {
                var jqElem = $(selector);
            } catch (e) {
                return;
            }
            if (jqElem.prop('value') !== undefined) {
                jqElem.val(value);
            } else {
                jqElem.html(value);
            }
        },

        // Get a random number
        randomNumber: function () {
            var rand = '' + Math.random() * 1000 * new Date().getTime();
            return rand.replace('.', '').split('').sort(function () {
                return 0.5 - Math.random()
            }).join('');
        },

        // Get element id or create it if it does not exists
        getOrCreateId: function (obj) {
            if (!obj.attr('id')) {
                var generated_id;
                do {
                    generated_id = 'i' + this.randomNumber();
                } while ($('#' + generated_id).length > 0);
                obj.attr('id', generated_id);
            }
            return obj.attr('id');
        },

        // List input fields of a container
        listElements: function (elem, container, filter) {
            var list = {};
            if (container !== '') {
                $.each($(container), function (index, node) {
                    node = $(node);
                    if (node.prop('value') !== undefined) {
                        if ((filter === undefined) || filter(node)) {
                            list[index] = '#' + tools.getOrCreateId(node);
                        }
                    }
                });
                container = container + ' :input';
                $.each($(container), function (index, node) {
                    node = $(node);
                    if ((filter === undefined) || filter(node)) {
                        list[index] = '#' + tools.getOrCreateId(node);
                    }
                });
            } else {
                list[0] = '#' + tools.getOrCreateId(elem);
            }
            return list;
        },

        // Returns a callable function from a given path
        getClosureFronString: function (fullname, context) {
            var namespaces = fullname.split(".");
            var func = namespaces.pop();
            for (var i = 0;
            (i < namespaces.length); i++) {
                context = context[namespaces[i]];
            }
            return context[func];
        },

        getInputs: function (selector, elem, context) {
            var inputs = {};
            if (selector === '') {
                var key = elem.attr('name') || elem.attr('id') || 'data';
                var value = tools.getValue(elem, context);
                inputs[key] = value;
            } else {
                var selectorContainer = '';
                $.each(selector.split(','), function(i, e) {
                    if (i > 0) {
                        selectorContainer += ',';
                    }
                    selectorContainer += e + ' :input';
                });
                var inputsSelectors = [selectorContainer, selector];
                $.each(inputsSelectors, function (index, inputsSelector) {
                    var jqInputsSelector = $(inputsSelector);
                    if (jqInputsSelector.length > 0) {
                        jqInputsSelector.each(function (key, inputSelector) {
                            var jqInputSelector = $(inputSelector);
                            if (!jqInputSelector.attr('name') && !jqInputSelector.attr('id')) {
                                return true;
                            }
                            var key = jqInputSelector.attr('name') || jqInputSelector.attr('id');
                            var value = tools.getValue(jqInputSelector, context);
                            inputs[key] = value;
                        });
                        return false;
                    }
                });
            }
            return inputs;
        },

        setOptionDefault: function (elem, option, value) {
            elem.each(function () {
                var that = $(this);
                if (that.data(option) === undefined) {
                    that.data(option, value);
                }
            });
            return elem;
        }

    };

    var processPriorityEvents = $.fn.domAjax.processPriorityEvents;
    var tools = $.fn.domAjax.tools;
    var processEvents = $.fn.domAjax.processEvents;
    var processRevertReplace = $.fn.domAjax.processRevertReplace;

})(jQuery, window);

/*
 * ------------------------------------------
 * Event Listeners
 *
 * This is not recommanded to embed event listeners
 * with non-user defined selectors inside a jquery
 * plugin, but I promised to let you do ajax without
 * any javascript code.
 * ------------------------------------------
 */
$(document).ready(function () {

    var body = $('body');

    // domAjax requirement
    if (body.length === 0) {
        throw "Document must have <body> / </body> tags.";
    }

    // click
    body
        .off('click', '.domajax.click')
        .on('click', '.domajax.click', function (e) {
            var that = $(this);
            that.domAjax();
            e.preventDefault();
    });

    // keyup (with type watching)
    var typeWatch = null;
    body
        .off('keyup', '.domajax.keyup')
        .on('keyup', '.domajax.keyup', function (e) {
            var that = $(this);
            body.domAjax.tools.setOptionDefault(that, 'value', '');
            body.domAjax.tools.setOptionDefault(that, 'delay', 800);
            that.domAjax();
    });

    // change (with enter-key launcher)
    body
        .off('change', '.domajax.change')
        .on('change', '.domajax.change', function (e) {
            var that = $(this);
            body.domAjax.tools.setOptionDefault(that, 'value', '');
            that.domAjax();
            e.preventDefault();
    });
    body
        .off('keypress', '.domajax.change')
        .on('keypress', '.domajax.change', function (e) {
            var that = $(this);
            body.domAjax.tools.setOptionDefault(that, 'value', '');
            if ((e.which === 13) && !(that.is('textarea'))) {
                that.domAjax();
                e.preventDefault();
            }
    });

    // ajax form submit
    body
        .off('click', 'input[type="submit"].domajax, button[type="submit"].domajax')
        .on('click', 'input[type="submit"].domajax, button[type="submit"].domajax', function (e) {
            var jqSubmit = $(this);
            var jqForms = $(this).closest('form');
            if (jqForms.length > 0) {
                jqForms.each(function () {
                    var jqForm = $(this);
                    var formId = body.domAjax.tools.getOrCreateId(jqForm);
                    jqSubmit.data('endpoint', jqForm.attr('action') || jqForm.data('endpoint'));
                    jqSubmit.data('method', jqForm.attr('method') || 'GET');
                    jqSubmit.data('input', '#' + formId);
                    jqSubmit.data('alias', '#' + formId);
                    jqSubmit.domAjax();
                });
                e.preventDefault();
            }
    });

    $('.domajax.ready').domAjax();

    return true;
});