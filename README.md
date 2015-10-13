# symfony-collection
A jQuery plugin that manages adding, deleting and moving elements from a Symfony2 collection

This is not really difficult to manage your collections using the `data-prototype` Symfony2 provides. But
after using several times collections, it appeared useful to me to create a jQuery plugin to do this job.

This is even more true when you need your elements to be moved up and down or added at a specific position: as the
form will be proceeded using field names, we should swap field contents or field names instead of moving fields themselves to get the job done. That's
not really friendly in javascript, so this plugin also aims to deal with that.

![sample](http://alain.ocarina.fr/medias/duplicate.png)

# Live demo

The `demo` directory is available live at http://symfony-collection.fuz.org

# Basic usage

Your collection type should contain `prototype`, `allow_add`, `allow_delete` options (depending on which buttons
you require of course). And a class that will be used as a selector to run the collection plugin.

```php
->add('myCollection', 'collection',
   array (
        // ...
        'allow_add' => true,
        'allow_delete' => true,
        'prototype' => true,
        'attr' => array(
                'class' => 'my-selector',
        ),
))
```

Then, render your form after applying the given custom theme:

```jinja
     {% form_theme myForm 'AcmeDemoBundle::jquery.collection.html.twig' %}
     {{ form(myForm) }}
```

Finally, put the following code at the bottom of your page.

```html
    <script src="{{ asset('js/jquery.js') }}"></script>
    <script src="{{ asset('bundles/acmedemo/js/jquery.collection.js') }}"></script>

    <script type="text/javascript">
        $('.my-selector').collection();
    </script>
```

**Notes**

If you don't want to use the form theme, you should set the `name_prefix` option manually (see below).

If you want to use the form theme, but already use one, you can use both with:

```jinja
     {%
        form_theme myForm
            'AcmeDemoBundle::jquery.collection.html.twig'
            'AcmeDemoBundle::my-own-form-theme.html.twig'
     %}
```

# Options

**Customize rendered links**

You can customize displayed links by setting `up`, `down`, `add`, `delete`and `duplicate` options.

Default values are:

```js
     $('.collection').collection({
         up: '<a href="#">&#x25B2;</a>',
         down: '<a href="#">&#x25BC;</a>',
         add: '<a href="#">[ + ]</a>',
         delete: '<a href="#">[ - ]</a>',
         duplicate: '<a href="#">[ # ]</a>'
     });
```

**Disable links**

You can disable some buttons by using `allow_up`, `allow_down`, `allow_add`, `allow_delete`
and `allow_duplicate` options. By default, all buttons except `duplicate` are enabled.

For example, if you do not want your elements to be moved up and down, use:

```js
     $('.collection').collection({
         allow_up: false,
         allow_down: false
     });
```

If you are using the given form theme, `allow_add`, `allow_delete` and `allow_duplicate` are automatically
set following your form type configuration.

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

You can initialize your collection with a minimum of elements created (even if they do not exist on the data object).

```js
     $('.collection').collection({
         init_with_n_elements: 3
     });
```

**Only one add button at the bottom**

If you prefer having only one `add` button at the bottom of the collection instead of one add button per collection element, use the `add_at_the_end` option:

```js
     $('.collection').collection({
         add_at_the_end: true
     });
```

**Hide useless buttons**

By default, `move up` button is hidden on the first item, and `move down` button on the last one. You can make them appear
anyway by setting `hide_useless_buttons` to `false`. This can be useful if you want to beautify them using CSS, for example.

```js
     $('.collection').collection({
         hide_useless_buttons: true
     });
```

**Events**

There are `before_*` and `after_*` options that let you put callbacks before and after adding, deleting or moving
elements in the collection.

- `before_up`, `before_down`, `before_add` and `before_delete` are called before modifying the collection.
The modification will be cancelled if the callback you given returned `false`, and will proceed if it returned `true`
or `undefined`.

- `after_up`, `after_down`, `after_add` and `after_delete` are called after modifying the collection.
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

**Using the plugin without form theme**

The form theme aims to reduce the number of options required when activating the plugin. This is really useful
when you are dealing with collections of form collections. But you can still do it manually if you want, using the
following equivalents:

```js
    $('.my-selector').collection({
        prototype_name: '{{ myForm.myCollection.vars.prototype.vars.name }}',
        enable_add: false,
        enable_delete: false,
        name_prefix:  '{{ myForm.myCollection.vars.full_name }}'
    });
```

Note that only `name_prefix` option is mandatory, all other ones have default values.

# Advanced usage

**Changing action's positions**

By default :
- `add`, `move up`, `move down` and `delete`are located in this order below each collection's element
- `add` button can be located at the bottom of the collection using `add_at_the_bottom` option

You can change those button's positions by creating them manually anywhere in your form theme.

You can use any custom clickable element as soon has it has one action class:
- `collection-add` for an `add` button
- `collection-delete` for a `delete` button
- `collection-up` for a `move up` button
- `collection-down` for a `move down` button

*Warning*: `collection` is taken from the `prefix` option: if you change the plugin's prefix, you should change this class too.

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
            <a href="#" class="collection-delete btn btn-default">Remove</a>
            <a href="#" class="collection-add btn btn-default">Add</a>
        </div>
    </div>

{% endblock %}
```

*Note* : do not forget to set the `add` option when enabling the plugin, because if your collection is emptied,
the plugin will generate an `add` button based on the plugin's configuraiton.

*Tip*: when `add` buttons are put inside collection's elements, new element is created next to the clicked
element instead of at the end of the collection.

**Collection of collections**

This plugin has the ability to manage collection of form collections, but to avoid collisions, you should:

In your form type:

- set a distinct `prototype_name` option and selector class for each of your collections

```php
    ->add('collections', 'collection',
       array (
            'type' => 'collection',
            'label' => 'Add, move, remove collections',
            'options' => array (
                    'type' => 'text',
                    'label' => 'Add, move, remove values',
                    'options' => array (
                            'label' => 'Value',
                    ),
                    'allow_add' => true,
                    'allow_delete' => true,
                    'prototype' => true,
                    'prototype_name' => '__children_name__',
                    'attr' => array (
                            'class' => "child-collection",
                    ),
            ),
            'allow_add' => true,
            'allow_delete' => true,
            'prototype' => true,
            'prototype_name' => '__parent_name__',
            'attr' => array (
                    'class' => "parent-collection",
            ),
    ))
```

In the plugin options:

- use a distinct collection prefix, so clicking `add` button on a collection will add an item to the right collection

- define children's selector in the `selector` attribute of `children` option (must select the root node of your children collections)

```js
     $('.parent-collection').collection({
         prefix: 'parent',
         children: [{
             selector: '.child-collection',
             prefix: 'child',
             ...
         }]
     });
```

