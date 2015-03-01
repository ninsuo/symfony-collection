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

      var resetCollectionActions = function(collection, settings) {
         collection.find('.' + settings.prefix + '-tmp').remove();
         collection.find('.' + settings.prefix + '-rescue-add').remove();
         collection.find('.' + settings.prefix + '-actions').remove();
      };

      var dumpCollectionActions = function(collection, settings) {

         var init = collection.find('.' + settings.prefix + '-tmp').length === 0;
         var elements = collection.find('> div');

          if (settings.enable_add) {
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
         // todo: manage collection swapping
         var settings = collection.data('collection-settings');
         var oldField= elements.eq(oldIndex);
         var newField = elements.eq(newIndex);
         $.each(collection.data(settings.prefix + '-skeletons'), function(index, name) {
            var regexp = new RegExp(settings.prototype_name, 'g');
            var oldName = name.replace(regexp, oldIndex);
            var newName = name.replace(regexp, newIndex);
            var swap = getFieldValue(oldField.find("[name='" + oldName + "']"));
            putFieldValue(oldField.find("[name='" + oldName + "']"), getFieldValue(newField.find("[name='" + newName + "']")));
            putFieldValue(newField.find("[name='" + newName + "']"), swap);
         });
      };

      var shiftElementsUp = function(collection, elements, index) {
         for (var i = index + 1; i < elements.length; i++) {
            swapElements(collection, elements, i - 1, i);
         }
      };

      var shiftElementsDown = function(collection, elements, index) {
         for (var i = elements.length - 2; i > index; i--) {
            swapElements(collection, elements, i + 1, i);
         }
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
                     var regexp = new RegExp(settings.prototype_name, 'g');
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

                        enableChildrenCollections(collection, code, settings);

                        if (that.data(settings.prefix + '-element') !== undefined) {
                           var index = elements.index($('#' + that.data(settings.prefix + '-element')));
                           if (index !== -1) {
                              shiftElementsDown(collection, elements, index);
                           }
                        }

                        if (!trueOrUndefined(settings.after_add(collection, code))) {
                            if (index !== -1) {
                                shiftElementsUp(collection, elements, index + 1);
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
                    shiftElementsUp(collection, elements, index);
                    var toRemove = elements.last();
                    var backup = toRemove.clone({withDataAndEvents: true});
                    toRemove.remove();
                    if (!trueOrUndefined(settings.after_remove(collection, backup))) {
                       collection.find('> .' + settings.prefix + '-tmp').before(backup);
                       elements = collection.find('> div');
                       shiftElementsDown(collection, elements, index - 1);
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
