# symfony2-collection
A jQuery plugin that manages adding, deleting and moving elements from a Symfony2 collection

This is not really difficult to manage your collections using the `data-prototype` Symfony2 provides. But
after using several times collections, it appeared useful to me to create a jQuery plugin to do this job.

This is even more true when you need your elements to be moved up and down or added at a specific position: as the
form will be proceeded using field names, we should swap field contents instead of moving fields themselves to get the job done. That's
not really friendly in javascript, so this plugin also aims to deal with that.

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
         up: '<a href="#">&#x25B2;</a>',
         down: '<a href="#">&#x25BC;</a>',
         add: '<a href="#">[ + ]</a>',
         remove: '<a href="#">[ - ]</a>'
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

**MVC compliance**

If you do not want to put the collection selector in your form type but want to place it in your view instead, you can use:

```jinja
<div class="collection" data-collection="{{ form.myCollection.vars.id }}">
```

**Changing action's positions**

By default :
- `add` button is located at the bottom of the collection
- `move up`, `remove` and `move down` are located in this order below each element of the collection

You can change those button's positions by creating them manually anywhere in your form theme.

You can use any custom clickable element as soon has it has one action class:
- `collection-add` for an `add` button
- `collection-remove` for a `remove` button
- `collection-up` for a `move up` button
- `collection-down` for a `move down` button

Example:

If we have a collection of text fields and want to display actions at the right side of each value instead of below,
we will use something like this:

```jinja
{% block MyType_label %}{% endblock %}
{% block MyType_errors %}{% endblock %}

{% block MyType_widget %}

    <div class="row">
        <div class="col-md-8">
            {{ form_widget(form.value) }}
        </div>
        <div class="col-md-2">
            <a href="#" class="collection-up btn btn-default">Move up</a>
            <a href="#" class="collection-down btn btn-default">Move Down</a>
        </div>
        <div class="col-md-2">
            <a href="#" class="collection-remove btn btn-default">Remove</a>
            <a href="#" class="collection-add btn btn-default">Add</a>
        </div>
    </div>

{% endblock %}
```

Note: do not forget to set the `add` option when enabling the plugin, because if your collection is emptied,
the plugin will generate an `add` button based on the plugin configuraiton.

*Tip*: when `add` buttons are put inside collection's elements, new element is created next to the clicked
element instead of at the end of the collection.

