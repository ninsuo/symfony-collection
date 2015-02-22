/*
 * jquery.collection.js v0.0.2
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
         up: '<a href="#">[ &#x25B2; ]</a>',
         before_up: function(collection, element) { return true; },
         after_up: function(collection, element) { return true; },
         enable_down: true,
         down: '<a href="#">[ &#x25BC; ]</a>',
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
         max: 100
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

      var dumpCollectionActions = function(collection, settings) {

         var init = collection.find('.collection-tmp').length === 0;
         var elements = collection.find('> div').not('.collection-tmp');

         if (settings.enable_add) {
            if (init) {
                collection.append('<div class="collection-tmp"></div>');
                if (settings.add) {
                    collection.append(
                            $(settings.add)
                                .addClass('collection-action collection-main-add')
                                .data('collection', collection.attr('id'))
                    );
                }
            }
            var mainAdd = collection.find('.collection-main-add').css('display', 'initial');
            var adds = collection.find('.collection-add');
            if (adds.length > 0) {
                mainAdd.css('display', 'none');
                collection.find('> div').not('.collection-tmp').each(function() {
                    var element = $(this);
                    element.find('.collection-add').data('element', getOrCreateId(element));
                });
            }
            if (init) {
                adds.addClass('collection-action').data('collection', collection.attr('id'));
            }
            if (elements.length >= settings.max) {
                collection.find('.collection-add, .collection-main-add').css('display', 'none');
            } else {
                collection.find('.collection-add').css('display', 'initial');
            }
         }

         elements.each(function() {
            var element = $(this);

            if (element.find('> .collection-actions').length === 0) {
                var actions = $('<div class="collection-actions"></div>');
                element.append(actions);
            }

            var buttons = [
               {'enabled': 'enable_up', 'class': 'collection-up', 'html': settings.up, 'condition': elements.index(element) !== 0},
               {'enabled': 'enable_remove', 'class': 'collection-remove', 'html': settings.remove, 'condition': elements.length > settings.min},
               {'enabled': 'enable_down', 'class': 'collection-down', 'html': settings.down, 'condition': elements.index(element) !== elements.length - 1}
            ];

            $.each(buttons, function(index, button) {
               if (settings[button.enabled] && button.condition) {
                   var action = element.find('.' + button.class);
                   if (action.length === 0 && button.html) {
                       action = $(button.html)
                           .appendTo(actions)
                           .addClass(button.class);
                   }
                   action
                     .addClass('collection-action')
                     .data('collection', collection.attr('id'))
                     .data('element', getOrCreateId(element));
               }
            });
         });

      };

      var swapFields = function(collection, elements, oldIndex, newIndex) {
         var oldField= elements.eq(oldIndex);
         var newField = elements.eq(newIndex);
         $.each(collection.data('collection-skeletons'), function(index, name) {
            var oldName = name.replace(/__name__/g, oldIndex);
            var newName = name.replace(/__name__/g, newIndex);
            var swap = getFieldValue(oldField.find("[name='" + oldName + "']"));
            putFieldValue(oldField.find("[name='" + oldName + "']"), getFieldValue(newField.find("[name='" + newName + "']")));
            putFieldValue(newField.find("[name='" + newName + "']"), swap);
         });
      };

      var settings = $.extend(true, {}, defaults, options);

      if ($(settings.container).length === 0) {
         console.log("jquery.collection.js: a container should exist to handle events.");
         return false;
      }

      var elems = $(this);
      elems.each(function() {

         var elem = $(this);
         if (elem.data('collection') !== undefined) {
            var collection = $('#' + elem.data('collection'));
            if (collection.length === 0) {
               console.log("jquery.collection.js: the given collection field does not exist.");
               return true;
            }
         } else {
             collection = elem;
         }

         if (collection.data('prototype') === null) {
            console.log("jquery.collection.js: the given collection field has no prototype, check that your field has the prototype option set to true.");
            return true;
         }

         collection.data('collection-settings', settings);

         var skeletons = [];
         $(collection.data('prototype')).find('[name]').each(function() {
            var that = $(this);
            skeletons.push(that.attr('name'));
         });
         collection.data('collection-skeletons', skeletons);

         dumpCollectionActions(collection, settings);

         var container = $(settings.container);

         container
            .undelegate('.collection-action', 'click')
            .delegate('.collection-action', 'click', function(e) {
               var that = $(this);
               var collection = $('#' + that.data('collection'));
               var settings = collection.data('collection-settings');
               var elements = collection.find('> div').not('.collection-tmp');

               if ((that.is('.collection-add') || that.is('.collection-main-add')) && settings.enable_add &&
                       elements.length < settings.max && settings.before_add(collection, element)) {
                  var prototype = collection.data('prototype');
                  for (var index = 0; (index < settings.max); index++) {
                     var code = $(prototype.replace(/__name__/g, index));
                     var tmp = collection.find('> .collection-tmp');
                     var id = tmp.html(code).find(':input').first().attr('id');
                     tmp.empty();
                     if (container.find('#' + id).length === 0) {
                        if (that.data('element') === undefined) {
                           tmp.before(code);
                        } else {
                           $('#' + that.data('element')).after(code);
                        }
                        var action = code.find('.collection-add');
                        if (action.length > 0) {
                           action.addClass('collection-action').data('collection', collection.attr('id'));
                        }
                        if (!settings.after_add(collection, element)) {
                            code.remove();
                        }
                        break;
                     }
                  }
               }

               var element = $('#' + that.data('element'));
               var index = elements.index(element);

               if (that.is('.collection-remove') && settings.enable_remove &&
                       elements.length > settings.min && settings.before_remove(collection, element)) {
                    var backup = element.clone({withDataAndEvents: true});
                    element.remove();
                    if (!settings.after_remove(collection, backup)) {
                       var elements = collection.find('> div').not('.collection-tmp');
                       if (index === elements.length) {
                           elements.eq(index - 1).after(backup);
                       } else {
                           elements.eq(index).before(backup);
                       }
                    }
               }

               if (that.is('.collection-up') && settings.enable_up) {
                  if (index !== 0 && settings.before_up(collection, element)) {
                     swapFields(collection, elements, index, index - 1);
                     if (!settings.after_up(collection, element)) {
                         swapFields(collection, elements, index - 1, index);
                     }
                  }
               }

               if (that.is('.collection-down') && settings.enable_down) {
                  if (index !== (elements.length - 1) && settings.before_down(collection, element)) {
                     swapFields(collection, elements, index, index + 1);
                     if (!settings.after_down(collection, elements)) {
                         swapFields(collection, elements, index + 1, index);
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
