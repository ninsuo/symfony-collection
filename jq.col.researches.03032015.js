/*
* jquery.collection.js v0.0.42
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
         enable_up: true,
         up: '<a href="#">&#x25B2;</a>',
         before_up: function(collection, element) { return true; },
         after_up: function(collection, element) { return true; },
         enable_down: true,
         down: '<a href="#">&#x25BC;</a>',
         before_down: function(collection, element) { return true; },
         after_down: function(collection, element) { return true; },
         enable_add: true,
         add: '<a href="#">[ + ]</a>',
         before_add: function(collection, element) { return true; },
         after_add: function(collection, element) { return true; },
         enable_remove: true,
         remove: '<a href="#">[ - ]</a>',
         before_remove: function(collection, element) { return true; },
         after_remove: function(collection, element) { return true; },
         min: 0,
         max: 100,
         add_at_the_end: false,
         prefix: 'collection',
         prototype_name: '__name__',
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

      var replaceAttrData = function(element, toReplace, replaceWith) {
         element.find('*').each(function() {
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

      var resetCollectionActions = function(collection, settings) {
         collection.find('.' + settings.prefix + '-tmp').remove();
         collection.find('.' + settings.prefix + '-rescue-add').remove();
         collection.find('.' + settings.prefix + '-actions').remove();
      };

      var dumpCollectionActions = function(collection, settings) {

         var init = collection.find('.' + settings.prefix + '-tmp').length === 0;
         var elements = collection.find('> div');

         if (init) {
            collection.append('<span class="' + settings.prefix + '-tmp"></span>');
         }
          if (settings.enable_add) {
            if (init) {
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
               {'enabled': 'enable_remove', 'class': settings.prefix + '-remove', 'html': settings.remove, 'condition': elements.length > settings.min},
               {'enabled': 'enable_up', 'class': settings.prefix + '-up', 'html': settings.up, 'condition': elements.index(element) !== 0},
               {'enabled': 'enable_down', 'class': settings.prefix + '-down', 'html': settings.down, 'condition': elements.index(element) !== elements.length - 1},
               {'enabled': 'enable_add', 'class': settings.prefix + '-add', 'html': settings.add, 'condition': !settings.add_at_the_end && elements.length < settings.max},
            ];

            $.each(buttons, function(index, button) {
               if (settings[button.enabled]) {
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

         if (settings.enable_add) {
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

         var doSwap = function(collection, elements, index, oldIndex, newIndex) {

            $.each(collection.data(settings.prefix + '-children-names'), function(i, name) {
               var regexp = new RegExp(pregQuote(settings.prototype_name), 'g');
               var oldName = new RegExp(pregQuote(name.replace(regexp, oldIndex)), 'g');
               var newName = name.replace(regexp, newIndex);
               replaceAttrData(elements.eq(index), oldName, newName);
            });

            var toReplace = new RegExp(pregQuote(collection.attr('id') + '_' + oldIndex), 'g');
            var replaceWith = collection.attr('id') + '_' + newIndex;

            // name ??

            replaceAttrData(elements.eq(index), toReplace, replaceWith);
         };

         doSwap(collection, elements, oldIndex, oldIndex, '__swap__');
         doSwap(collection, elements, newIndex, newIndex, oldIndex);
         doSwap(collection, elements, oldIndex, '__swap__', newIndex);

         elements.eq(oldIndex).insertBefore(elements.eq(newIndex));
         if (newIndex > oldIndex) {
            elements.eq(newIndex).insertBefore(elements.eq(oldIndex));
         } else {
            elements.eq(newIndex).insertAfter(elements.eq(oldIndex));
         }

         return collection.find('> div');
      };

      var shiftElementsUp = function(collection, elements, index) {
         for (var i = index + 1; i < elements.length; i++) {
            elements = swapElements(collection, elements, i - 1, i);
         }
         return collection.find('> div');
      };

      var shiftElementsDown = function(collection, elements, index) {
         for (var i = elements.length - 2; i > index; i--) {
            elements = swapElements(collection, elements, i + 1, i);
         }
         return collection.find('> div');
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

      var settings = $.extend(true, {}, defaults, options);
      if (settings.children) {
         $.each(settings.children, function(i, child) {
            settings.children[i] = $.extend(true, {}, defaults, child);
         });
      }

      if ($(settings.container).length === 0) {
         console.log("jquery.collection.js: a container should exist to handle events.");
         return false;
      }

      var elems = $(this);

      if (elems.length === 0) {
         console.log("jquery.collection.js: given collection does not exist.");
         return false;
      }

      elems.each(function() {

         var elem = $(this);
         if (elem.data('collection') !== undefined) {
            var collection = $('#' + elem.data('collection'));
            if (collection.length === 0) {
               console.log("jquery.collection.js: given collection field does not exist.");
               return true;
            }
         } else {
             collection = elem;
         }

         if (collection.data('prototype') === null) {
            console.log("jquery.collection.js: given collection field has no prototype, check that your field has the prototype option set to true.");
            return true;
         }

         collection.addClass('collection-managed');
         collection.data('collection-settings', settings);

         var skeletons = [];
         $(collection.data('prototype')).find('[name]').each(function() {
            var that = $(this);
            skeletons.push(that.attr('name'));
         });
         collection.data(settings.prefix + '-skeletons', skeletons);

         resetCollectionActions(collection, settings);
         dumpCollectionActions(collection, settings);
         enableChildrenCollections(collection, null, settings);

         var childrenNamePrefixes = [];
         if (settings.children) {
            var parentPrototype = $(collection).data('prototype');
            var tmp = collection.find('> .' + settings.prefix + '-tmp');
            $.each(settings.children, function(i, child) {
               var childPrototype = tmp.html(parentPrototype).find(child.selector).data('prototype');
               var childNames = tmp.html(childPrototype).find('[name]');
               tmp.empty();
               if (childNames.length > 0) {
                  childrenNamePrefixes.push(childNames.eq(0).attr('name').substring(0, childNames.eq(0).attr('name').indexOf('[' + child.prototype_name + ']')));
               }
            });
         }
         collection.data(settings.prefix + '-children-names', childrenNamePrefixes);

         var container = $(settings.container);

         container
            .off('click', '.' + settings.prefix + '-action')
            .on('click', '.' + settings.prefix + '-action', function(e) {

               var that = $(this);
               var collection = $('#' + that.data('collection'));
               var settings = collection.data('collection-settings');
               var elements = collection.find('> div');

               var element = that.data(settings.prefix + '-element') ? $('#' + that.data(settings.prefix + '-element')) : undefined;
               if ((that.is('.' + settings.prefix + '-add') || that.is('.' + settings.prefix + '-rescue-add')) && settings.enable_add &&
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
                        elements = collection.find('> div');
                        var action = code.find('.' + settings.prefix + '-add');
                        if (action.length > 0) {
                           action.addClass(settings.prefix + '-action').data('collection', collection.attr('id'));
                        }

                        if (that.data(settings.prefix + '-element') !== undefined) {
                           var index = elements.index($('#' + that.data(settings.prefix + '-element')));
                           if (index !== -1) {
                              elements = shiftElementsDown(collection, elements, index);
                           }
                        }

                        enableChildrenCollections(collection, code, settings);

                        if (!trueOrUndefined(settings.after_add(collection, code))) {
                            if (index !== -1) {
                               elements =  shiftElementsUp(collection, elements, index + 1);
                            }
                            code.remove();
                        }
                        break;
                     }
                  }
               }

               var element = $('#' + that.data(settings.prefix + '-element'));
               var index = elements.index(element);

               if (that.is('.' + settings.prefix + '-remove') && settings.enable_remove &&
                       elements.length > settings.min && trueOrUndefined(settings.before_remove(collection, element))) {
                    elements = shiftElementsUp(collection, elements, index);
                    var toRemove = elements.last();
                    var backup = toRemove.clone({withDataAndEvents: true});
                    toRemove.remove();
                    if (!trueOrUndefined(settings.after_remove(collection, backup))) {
                       collection.find('> .' + settings.prefix + '-tmp').before(backup);
                       elements = shiftElementsDown(collection, collection.find('> div'), index - 1);
                    }
               }

               if (that.is('.' + settings.prefix + '-up') && settings.enable_up) {
                  if (index !== 0 && trueOrUndefined(settings.before_up(collection, element))) {
                     swapElements(collection, elements, index, index - 1);
                     if (!trueOrUndefined(settings.after_up(collection, element))) {
                         swapElements(collection, elements, index - 1, index);
                     }
                  }
               }

               if (that.is('.' + settings.prefix + '-down') && settings.enable_down) {
                  if (index !== (elements.length - 1) && trueOrUndefined(settings.before_down(collection, element))) {
                     swapElements(collection, elements, index, index + 1);
                     if (!trueOrUndefined(settings.after_down(collection, elements))) {
                         swapElements(collection, elements, index + 1, index);
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