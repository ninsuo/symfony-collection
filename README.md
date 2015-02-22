# symfony2-collection
A jQuery plugin that manages adding, deleting and moving elements from a Symfony2 collection

This is not really difficult to manage your collections using the `data-prototype` Symfony2 provides. But
after using several times collections, it appeared useful to me to create a jQuery plugin to do this job.
This is even more true when you need your elements to be moved up and down: as the form will be proceeded
using field names, we should swap field contents instead of moving fields themselves to get the job done, that's
not really friendly in javascript, so this plugin aims to deal with that.

# Basic usage

Your collection type should contain `prototype`, `allow_add`, `allow_delete` options and a collection selector (here
the css `collection` class).

```php
->add('myCollection', 'collection',
   array (
        // ...
        'allow_add' => true,
        'allow_delete' => true,
        'prototype' => true,
        'attr' => array (
                'class' => 'collection',
        ),
))
```

Then, simply put the following javascript code at the bottom of your page.

```html
    <script src="{{ asset('js/jquery.js') }}"></script>
    <script src="{{ asset('bundles/fuzapp/js/jquery.collection.js') }}"></script>
    <script type="text/javascript">
        $('.collection').collection();
    </script>
```

# Options

**Customize rendered links**

You can customize displayed links by setting `up`, `down`, `add` and `remove` options.

Default values are:

```js
     $('.collection').collection({
         up: '<a href="#" class="collection-up">[ &#x25B2; ]</a>',
         down: '<a href="#" class="collection-down">[ &#x25BC; ]</a>',
         add: '<a href="#" class="collection-add">[ + ]</a>',
         remove: '<a href="#" class="collection-remove">[ - ]</a>'
     });
```

**Disable links**

You can disable some buttons by using `enable_up`, `enable_down`, `enable_add` and `enable_remove` options.

For example, if you do not want your elements to be moved up and down, use:

```js
     $('.collection').collection({
         enable_up: false,
         enable_down: false
     });
```

**Set minimum and maximum of elements in the collection**

You can set the minimum of elements allowed in the collection by using the `min` option. By default, it is disabled (set to 0).

```js
     $('.collection').collection({
         min: 0
     });
```

You can set the maximum of elements allowed in the collection by using the `max` option. By default, it is set to 100.

```js
     $('.collection').collection({
         max: 100
     });
```

**Events**

There are `before_*` and `after_*` options that let you put callbacks before and after adding, deleting or moving
elements in the collection.

- `before_up`, `before_down`, `before_add` and `before_remove` are called before modifying the collection.
The modification will be cancelled if the callback you given returned `false`, and will proceed if it returned true.

- `after_up`, `after_down`, `after_add` and `after_remove` are called after modifying the collection.
The modification will be reverted if the callback you given returned `false`.

Callback functions receive 2 arguments:

- `collection` references the div that contains your whole collection (the symfony2 field)

- `element` is the element in the collection that have been added (or moved/deleted)

```js
     $('.collection').collection({
         after_add: function(collection, element) {
            // automatic backup or whatever
            return true;
         }
     });
```

# Advanced usage

If you do not want to put the collection selector in your form type but want to place it in your view instead, you can do:

```jinja
<div class="collection" data-collection="{{ form.myCollection.vars.id }}">
```

