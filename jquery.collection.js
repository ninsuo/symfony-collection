/*
* jquery.collection.js v1.0.1
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
         min: 0,
         max: 100,
         add_at_the_end: false,
         prefix: 'collection',
         prototype_name: '__name__',
         name_prefix: null,
         elements_selector: '> div',
         children: null
      };

      var randomNumber = function() {
         var rand = '' + Math.random() * 1000 * new Date().getTime();
         return rand.replace('.', '').split('').sort(function () {
            return 0.5 - Math.random();
         }).join('');
      };

      var getOrCreateId = function(obj) {
         if (!obj.attr('id')) {
            var generated_id;
            do {
               generated_id = 'i' + randomNumber();
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

      var putFieldValue = function (selector, value) {
         try {
            var jqElem = $(selector);
         } catch (e) {
            return;
         }
         if (jqElem.length === 0) {
            return null;
         } else if (jqElem.is('input[type="checkbox"]') && value) {
            jqElem.attr('checked', true);
         } else if (jqElem.prop('value') !== undefined) {
            jqElem.val(value);
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

      var resetCollectionActions = function(collection, settings) {
         collection.find('.' + settings.prefix + '-tmp').remove();
         collection.find('.' + settings.prefix + '-rescue-add').remove();
         collection.find('.' + settings.prefix + '-actions').remove();
      };

      var dumpCollectionActions = function(collection, settings) {
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

         elements.each(function() {
            var element = $(this);

            if (element.find('> .' + settings.prefix + '-actions').length === 0) {
                var actions = $('<div class="' + settings.prefix + '-actions"></div>');
                element.append(actions);
            }

            var buttons = [
               {'enabled': settings.allow_delete, 'class': settings.prefix + '-delete', 'html': settings.delete, 'condition': elements.length > settings.min},
               {'enabled': settings.allow_up, 'class': settings.prefix + '-up', 'html': settings.up, 'condition': elements.index(element) !== 0},
               {'enabled': settings.allow_down, 'class': settings.prefix + '-down', 'html': settings.down, 'condition': elements.index(element) !== elements.length - 1},
               {'enabled': settings.allow_add, 'class': settings.prefix + '-add', 'html': settings.add, 'condition': !settings.add_at_the_end && elements.length < settings.max},
            ];

            $.each(buttons, function(index, button) {
               if (button.enabled) {
                  var action = element.find('.' + button.class);
                  if (action.length === 0 && button.html) {
                      action = $(button.html)
                          .appendTo(actions)
                          .addClass(button.class);
                  }
                  if (button.condition) {
                     action.css('display', 'initial');
                  } else {
                      action.css('display', 'none');
                  }
                  action
                    .addClass(settings.prefix + '-action')
                    .data('collection', collection.attr('id'))
                    .data(settings.prefix + '-element', getOrCreateId(element));
               } else {
                  element.find('.' + button.class).css('display', 'none');
               }
            });
         });

         if (settings.allow_add) {
            var rescueAdd = collection.find('.' + settings.prefix + '-rescue-add').css('display', 'initial');
            var adds = collection.find('.' + settings.prefix + '-add:visible');
            if (adds.length > 0) {
                rescueAdd.css('display', 'none');
            }
            if (elements.length >= settings.max) {
                collection.find('.' + settings.prefix + '-add, .' + settings.prefix + '-rescue-add').css('display', 'none');
            }
         }

      };

      var swapElements = function(collection, elements, oldIndex, newIndex) {

         var settings = collection.data('collection-settings');

         var replaceAttrData = function(index, toReplace, replaceWith) {
            elements.eq(index).find('*').each(function() {
                var node = $(this);
                $.each(this.attributes, function(i, attrib) {
                    if ($.type(attrib.value) === 'string') {
                        node.attr(attrib.name.replace(toReplace, replaceWith), attrib.value.replace(toReplace, replaceWith));
                    }
                });
                $.each(node.data(), function(name, value) {
                    if ($.type(value) === 'string') {
                        node.data(name.replace(toReplace, replaceWith), value.replace(toReplace, replaceWith));
                    }
                });
            });
         };

         var doSwap = function(index, oldIndex, newIndex) {
            var toReplace = new RegExp(pregQuote(settings.name_prefix + '[' + oldIndex + ']'), 'g');
            var replaceWith = settings.name_prefix + '[' + newIndex + ']';
            replaceAttrData(index, toReplace, replaceWith);

            var toReplace = new RegExp(pregQuote(collection.attr('id') + '_' + oldIndex), 'g');
            var replaceWith = collection.attr('id') + '_' + newIndex;
            replaceAttrData(index, toReplace, replaceWith);
         };

         doSwap(oldIndex, oldIndex, '__swap__');
         doSwap(newIndex, newIndex, oldIndex);
         doSwap(oldIndex, '__swap__', newIndex);

         elements.eq(oldIndex).insertBefore(elements.eq(newIndex));
         if (newIndex > oldIndex) {
            elements.eq(newIndex).insertBefore(elements.eq(oldIndex));
         } else {
            elements.eq(newIndex).insertAfter(elements.eq(oldIndex));
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

      var enableChildrenCollections = function(collection, elements, settings) {
         if (settings.children) {
            $.each(settings.children, function(index, childrenSettings) {
               if (!childrenSettings.selector) {
                 console.log("jquery.collection.js: given collection " + collection.attr('id') + " has children collections, but children's root selector is undefined.");
                 return true;
               }
               if (elements !== null) {
                  elements.find(childrenSettings.selector).collection(childrenSettings);
               } else {
                  collection.find(childrenSettings.selector).collection(childrenSettings);
               }
            });
         }
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

         collection.addClass('collection-managed');
         collection.data('collection-settings', settings);

         resetCollectionActions(collection, settings);
         dumpCollectionActions(collection, settings);
         enableChildrenCollections(collection, null, settings);

         var container = $(settings.container);

         container
            .off('click', '.' + settings.prefix + '-action')
            .on('click', '.' + settings.prefix + '-action', function(e) {

               var that = $(this);

               var collection = $('#' + that.data('collection'));
               var settings = collection.data('collection-settings');

               var elements = collection.find(settings.elements_selector);

               var element = that.data(settings.prefix + '-element') ? $('#' + that.data(settings.prefix + '-element')) : undefined;
               if ((that.is('.' + settings.prefix + '-add') || that.is('.' + settings.prefix + '-rescue-add')) && settings.allow_add &&
                       elements.length < settings.max && trueOrUndefined(settings.before_add(collection, element))) {
                  var prototype = collection.data('prototype');
                  for (var index = 0; (index < settings.max); index++) {
                     var regexp = new RegExp(pregQuote(settings.prototype_name), 'g');
                     var code = $(prototype.replace(regexp, index));
                     var tmp = collection.find('> .' + settings.prefix + '-tmp');
                     var id = tmp.html(code).find('[id]').first().attr('id');
                     tmp.empty();
                     if (container.find('#' + id).length === 0) {
                        tmp.before(code);
                        elements = collection.find(settings.elements_selector);
                        var action = code.find('.' + settings.prefix + '-add');
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

                        if (!trueOrUndefined(settings.after_add(collection, code))) {
                            if (index !== -1) {
                                elements = shiftElementsUp(collection, elements, settings, index + 1);
                            }
                            code.remove();
                        }
                        break;
                     }
                  }
               }

               var element = $('#' + that.data(settings.prefix + '-element'));
               var index = elements.index(element);

               if (that.is('.' + settings.prefix + '-delete') && settings.allow_delete &&
                       elements.length > settings.min && trueOrUndefined(settings.before_delete(collection, element))) {
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

               if (that.is('.' + settings.prefix + '-up') && settings.allow_up) {
                  if (index !== 0 && trueOrUndefined(settings.before_up(collection, element))) {
                     elements = swapElements(collection, elements, index, index - 1);
                     if (!trueOrUndefined(settings.after_up(collection, element))) {
                         elements = swapElements(collection, elements, index - 1, index);
                     }
                  }
               }

               if (that.is('.' + settings.prefix + '-down') && settings.allow_down) {
                  if (index !== (elements.length - 1) && trueOrUndefined(settings.before_down(collection, element))) {
                     elements = swapElements(collection, elements, index, index + 1);
                     if (!trueOrUndefined(settings.after_down(collection, elements))) {
                         elements = swapElements(collection, elements, index + 1, index);
                     }
                  }
               }

               dumpCollectionActions(collection, settings);
               e.preventDefault();
            })
         ;

      });

      return true;
   };

})(jQuery);
