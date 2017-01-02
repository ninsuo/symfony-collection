# symfony-collection
A jQuery plugin that manages adding, deleting and moving elements in a Symfony collection

It is not really difficult to manage your collections using the `data-prototype` attribute Symfony provides. But
after using collections several times, it appeared useful to me to create a jQuery plugin to do this job.

This is even more true when you need your elements to be moved up and down or added at a specific position.

![sample](http://ocarina.fr/medias/duplicate.png)

# Live demo

Demo of this plugin is available live at: http://symfony-collection.fuz.org

Demo source code is here: https://github.com/ninsuo/symfony-collection-demo

# Basic usage

Your collection type should contain `prototype`, `allow_add`, `allow_remove` options (depending on which buttons
you require of course) and a class that will be used as a selector to run the collection plugin (if you don't want to use the id symfony generates).

```php
$builder
    // ...
    ->add('myCollection', 'collection', [
        // ...
        'allow_add' => true,
        'allow_remove' => true,
        'prototype' => true, // default, can be omitted
        'attr' => [
            'class' => 'my-collection',
        ],
    ])
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
    $('.my-collection').collection();
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

You can customize displayed links by setting `up`, `down`, `add`, `remove`and `duplicate` options.

Default values are:

```js
$('.my-collection').collection({
    up: '<a href="#">&#x25B2;</a>',
    down: '<a href="#">&#x25BC;</a>',
    add: '<a href="#">[ + ]</a>',
    remove: '<a href="#">[ - ]</a>',
    duplicate: '<a href="#">[ # ]</a>'
});
```

**Disable links**

You can disable some buttons by using `allow_up`, `allow_down`, `allow_add`, `allow_remove`
and `allow_duplicate` options. By default, all buttons except `duplicate` are enabled.

For example, if you do not want your elements to be moved up and down, use:

```js
$('.my-collection').collection({
    allow_up: false,
    allow_down: false
});
```

If you are using the given form theme, `allow_add`, `allow_remove` and `allow_duplicate` are automatically
set following your form type configuration.

**Set minimum and maximum of elements in the collection**

You can set the minimum of elements allowed in the collection by using the `min` option. By default, it is disabled (set to 0).

```js
$('.my-collection').collection({
    min: 0
});
```

You can set the maximum of elements allowed in the collection by using the `max` option. By default, it is set to 100.

```js
$('.my-collection').collection({
    max: 100
});
```

You can initialize your collection with a minimum of elements created (even if they do not exist on the data object).

```js
$('.my-collection').collection({
    init_with_n_elements: 3
});
```

**Only one add button at the bottom**

If you prefer having only one `add` button at the bottom of the collection instead of one add button per collection element, use the `add_at_the_end` option:

```js
$('.my-collection').collection({
    add_at_the_end: true
});
```

**Customise add button location**

If you want to set a specific location for your add button (not close to each collection element, nor at the bottom of the collection),
you can use the `custom_add_location` option.

JS:
```js
$('.my-collection').collection({
    custom_add_location: true
});
```

HTML:
```html
<button 
    data-collection="collection" 
    class="collection-action collection-add btn btn-success">
    Add element to collection
</button>
```

**Hide useless buttons**

By default, `move up/down` buttons are hidden on the first/last item. You can make them appear
anyway by setting `hide_useless_buttons` to `false`. This can be useful if you want to style them yourself using CSS.

```js
$('.my-collection').collection({
    hide_useless_buttons: true
});
```

**Ordering**

Of course ordering the collection elements by moving them up/down will not be persisted into your database where your collection entity probably has some kind of property for ordering, e.g.:

```php
/**
 * @var integer
 *
 * @ORM\Column(name="order", type="integer")
 */
private $order;
```

You can provide the `order_field_selector` option, to update this field on manipulating the collection. Therefore your order property field has to be rendered in your forms with a specific class (the class you provide in `order_field_selector`).
So your collection entity's form type might look like this:

```php
$builder
    // ...
    ->add('order', null, ['attr' => ['class' => 'order']])
```

And the according plugin configuration:
```js
$('.my-collection').collection({
    // ...
    order_field_selector: '.order'
});
```
Of course you are free to hide this field in your forms by using some additonal CSS class or making it a hidden field.

```php
$builder
    // ...
    ->add('order', HiddenType::class, ['attr' => ['class' => 'order']])
```

**Events**

There are `before_*` and `after_*` options that let you put callbacks before and after adding, deleting or moving
elements in the collection.

- `before_up`, `before_down`, `before_add` and `before_remove` are called before modifying the collection.
The modification will be cancelled if the callback you provided returned `false`, and will proceed if it returned `true`
or `undefined`.

- `after_up`, `after_down`, `after_add` and `after_remove` are called after modifying the collection.

- `before_init` and `after_init` are called when a collection is initialized. No return value is expected.

Callback functions receive 2 arguments:

- `collection` references the div that contains your whole collection.

- `element` is the element in the collection that has been added/moved/deleted.

```js
$('.my-collection').collection({
    before_add: function(collection, element) {
        if (myCondition) {
            return false;
        }
        return true;
    }
});
```

**Using the plugin without form theme**

The form theme aims to reduce the number of options required when activating the plugin. This is really useful
when you are dealing with collections of form collections. But you can still do it manually if you want, using the
following equivalents:

```js
$('.my-collection').collection({
    prototype_name: '{{ myForm.myCollection.vars.prototype.vars.name }}',
    allow_add: false,
    allow_remove: false,
    name_prefix:  '{{ myForm.myCollection.vars.full_name }}'
});
```

Note that only `name_prefix` option is mandatory, all others have default values.

**Drag & drop support**

If you are using Jquery UI and have the `sortable` component available in your application, the `drag_drop` option is
automatically enabled and lets you change your elements position using drag & drop. You can disable this behavior by explicitly
setting `drag_drop` option to false.

If required, you can customize `sortable` by overriding options given to `jQuery.ui.sortable` using the `drag_drop_options` option.

By default, your collection is initialized with the following options:

```js
$('.my-collection').collection({
    drag_drop: true,
    drag_drop_options: {
        placeholder: 'ui-state-highlight'
    }
});
```

Note that you should not override `start` and `update` callbacks as they are used by this plugin, see
`drag_drop_start` and `drag_drop_update` callback options in advanced usage below for more details.

# Advanced usage

**Changing action's positions**

By default :
- `add`, `move up`, `move down` and `remove`are located in this order below each collection's element
- `add` button can be located at the bottom of the collection using `add_at_the_bottom` option

You can change those button's positions by creating them manually anywhere in your form theme.

You can use any custom clickable element as soon has it has one action class:
- `collection-add` for an `add` button
- `collection-remove` for a `remove` button
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
            <a href="#" class="collection-remove btn btn-default">Remove</a>
            <a href="#" class="collection-add btn btn-default">Add</a>
        </div>
    </div>

{% endblock %}
```

*Note* : do not forget to set the `add` option when enabling the plugin, because if your collection is emptied,
the plugin will generate an `add` button based on the plugin's configuraiton.

*Tip*: when `add` buttons are put inside collection's elements, new element is created next to the clicked
element instead of at the end of the collection.

**Advanced drag & drop support**

If you need to listen for `start` and/or `update` events from `jQuery.ui.sortable` in your collection,
you should not overload the `start` and `update` options in `drag_drop_options`, but use the built-in
`drag_drop_start` and `drag_drop_update` options instead:

```js
$('.my-collection').collection({
    drag_drop_start: function (event, ui, elements, element) {
        // ...
    },
    drag_drop_update: function (event, ui, elements, element) {
        // ...
    }
});
```

Notes:

- `event` and `ui` come from `jQuery.ui.sortable` `start` callback.
- `elements` contains all elements from the impacted collection
- `element` is the moved element in the collection
- If your callback return false, the position change will be cancelled/reverted.

**Collection of collections**

This plugin has the ability to manage collection of form collections, but to avoid collisions, you should:

In your form type:

- set a distinct `prototype_name` option and selector class for each of your collections

```php
$builder
    // ...
    ->add('collections', 'collection', [
        'type' => 'collection',
        'label' => 'Add, move, remove collections',
        'options' => [
            'type' => 'text',
            'label' => 'Add, move, remove values',
            'options' => [
                'label' => 'Value',
            ],
            'allow_add' => true,
            'allow_remove' => true,
            'prototype' => true,
            'prototype_name' => '__children_name__',
            'attr' => [
                'class' => "child-collection",
            ],
        ],
        'allow_add' => true,
        'allow_remove' => true,
        'prototype' => true,
        'prototype_name' => '__parent_name__',
        'attr' => [
                'class' => "parent-collection",
        ],
    ])
```

In the plugin options:

- use a distinct collection prefix, so clicking `add` button on a collection will add an item to the right collection

- define children's selector in the `selector` attribute of `children` option (must select the root node of your children collections)

```js
$('.my-collection').collection({
    prefix: 'parent',
    children: [{
        selector: '.child-collection',
        prefix: 'child',
        // ...
    }],
    // ...
});
```