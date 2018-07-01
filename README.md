# symfony-collection
A jQuery plugin that manages adding, deleting and moving elements from a Symfony collection

![sample](http://ocarina.fr/medias/collection.png)

This is not really difficult to manage your collections using the `data-prototype` Symfony provides. But
after using several times collections, it appeared useful to me to create a jQuery plugin to do this job.

This is even more true when you need your elements to be moved up and down or added at a specific position: as the
form will be proceeded using field names, we should swap field contents or field names instead of moving fields themselves to get the job done. That's
not really friendly in javascript, so this plugin also aims to deal with that.

# Live demo

Demo of this plugin is available live at: http://symfony-collection.fuz.org

Demo source code is here: https://github.com/ninsuo/symfony-collection-demo

# Installation

This plugin is a set of 2 files:

- the jquery plugin itself, it should be located with your assets

- a twig form theme that will ease use of it, it should be located in your views

## Installation using Composer

To automate the plugin download and installation, edit composer.json and add:

```json
    "require": {
        ...
        "ninsuo/symfony-collection": "dev-master"
    },
    "scripts": {
        "post-install-cmd": [
            ...
            "Fuz\\Symfony\\Collection\\ScriptHandler::postInstall"
        ],
        "post-update-cmd": [
            ...
            "Fuz\\Symfony\\Collection\\ScriptHandler::postUpdate"
        ]
    }
```
Files will be automatically installed at:

- symfony-collection form theme will be installed in `app/Resources/views`

- symfony-collection jquery plugin will be installed in `web/js`.

Tips:

- Replace `dev-master` by the current stable version.

- Put script handlers before Symfony's installAssets if you wish to benefit from your assets optimizations.

- Add `app/Resources/views/jquery.collection.html.twig` and `web/js/jquery.collection.js` to your `.gitignore`

If you prefer to install the plugin manually, you can use:

```sh
composer require ninsuo/symfony-collection
```

You'll have to move:

- `vendor/ninsuo/symfony-collection/jquery.collection.js` in your assets (for example in `web/js`)

- `vendor/ninsuo/symfony-collection/jquery.collection.html.twig` in your views (for example in `app/Resources/views`)

## Installation using npm

```sh
npm install ninsuo/symfony-collection
```

You'll have to move:

- `node_modules/symfony-collection/jquery.collection.js` in your assets (for example in `web/js`).
- `node_modules/symfony-collection/jquery.collection.html.twig` wherever you want in your views (for example in `app/Resources/views`)

## Installation using Bower

```sh
bower install ninsuo/symfony-collection
```

You'll have to move:

- `bower_components/symfony-collection/jquery.collection.js` in your assets (for example in `web/js`)
- `bower_components/symfony-collection/jquery.collection.html.twig` in your views (for example in `app/Resources/views`)

# Basic usage

## A simple collection

Your collection type should contain `prototype`, `allow_add`, `allow_remove` options (depending on which buttons
you require of course). And a class that will be used as a selector to run the collection plugin.

```php
->add('myCollection', 'collection',
   array (
        // ...
        'allow_add' => true,
        'allow_remove' => true,
        'prototype' => true,
        'attr' => array(
            'class' => 'my-selector',
        ),
))
```

Then, render your form after applying the given custom theme:

```jinja
     {% form_theme myForm 'jquery.collection.html.twig' %}
     {{ form(myForm) }}
```

Finally, put the following code at the bottom of your page.

```html
    <script src="{{ asset('js/jquery.js') }}"></script>
    <script src="{{ asset('js/jquery.collection.js') }}"></script>

    <script type="text/javascript">
        $('.my-selector').collection();
    </script>
```

## Using a form theme

Most of the time, you will need to create a [form theme](https://symfony.com/doc/current/form/form_customization.html)
that will help you render your collection and its children in a fancy way.

- in your form type(s), overwrite the `getBlockPrefix()` method and return a good name.

```php
// Fuz/AppBundle/Form/AddressType.php

<?php

namespace Fuz\AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class AddressType extends AbstractType
{
    // ...

    public function getBlockPrefix()
    {
        return 'AddressType';
    }
}
```

- in your form theme, you will just need to use the same name (`{% block AddressType_XXX %}`). Replace `XXX` by `widget`,
`error` or `row` according to what you want to do (read the [Symfony doc](https://symfony.com/doc/current/form/form_customization.html)
for more details).

```jinja
{# FuzAppBundle:Advanced:addresses-theme.html.twig #}

{% block AddressType_row %}
<div class="col-md-3">
  {{ form_label(form) }}
  {{ form_errors(form) }}
  {{ form_widget(form) }}
</div>
{% endblock %}

{% block AddressType_widget %}
    {{ form_widget(form) }}
    <br/>
    <p class="text-center">
        <a href="#" class="collection-up btn btn-default">&lt;</a>
        <a href="#" class="collection-remove btn btn-default">-</a>
        <a href="#" class="collection-add btn btn-default">+</a>
        <a href="#" class="collection-down btn btn-default">&gt;</a>
    </p>
{% endblock %}
```

Then, use both form themes using:

```jinja
     {%
        form_theme myForm
            'FuzAppBundle:Advanced:addresses-theme.html.twig'
            'jquery.collection.html.twig'
     %}
```

There are many examples using form themes in the Advanced menu of the [demo website](http://symfony-collection.fuz.org/),
don't hesitate to look at them.

Always put `jquery.collection.html.twig` form theme below the other you use, to avoid that settings gets overwritten.

## Using Doctrine, and a position explicitely stored in a field

A collection is no more than an array of objects, so by default, this plugin move element positions
in this array. For example, if you have A, B and C in your collection and move B up, it will contain
B, A, C.

But when Doctrine will persist your collection, it will keep existing entities, and
simply update their content. For example, if you have a collection containing A, B, C
with ids 1, 2 and 3, you will end up with a collection containing B, A, C, but still
ids 1, 2 and 3.

In most cases, that's not a problem. But, if you have other relations attached to each of your
collection elements, you should never unlink id and value. You'll use a position field on your
database table, and it will manage position.

Something like:

```php
    /**
     * @ORM\Column(name="position", type="integer")
     */
    private $position;
```

This plugin supports this case, you need to create a `position` field in your form (with hidden type),
mapped to your entity, and give it a class that will serve as a selector:

```php
        $builder->add('position', HiddenType::class, [
            'attr' => [
                'class' => 'my-position',
            ],
        ]);
```

Then, use the `position_field_selector` option to provide it to the plugin:

```js
    $('.my-selector').collection({
        position_field_selector: '.my-position'
    });
```

## Several collections on the same page

If you wish to create several collections on the same page, you'll need to change the collection prefix
in order for the plugin to trigger the right actions for the right collection.
 
For example:

```js
     $('.collectionA').collection({
        'prefix': 'first-collection'
     });

     $('.collectionB').collection({
        'prefix': 'second-collection'
     });
```

Then if you want to edit those collections form theme, you'll need to replace
`collection-add` by `first-collection-add` on your add buttons for exmaple.

```html
   <a href="#" class="first-collection-add btn btn-default">
       <span class="glyphicon glyphicon-plus-sign"></span>
   </a>
```

See [this sample](https://symfony-collection.fuz.org/symfony3/form-with-several-collections) for a working example.

# Options

**Customize rendered links** ([demo](http://symfony-collection.fuz.org/symfony3/options/customButtons))

You can customize displayed links by setting `up`, `down`, `add`, `remove`and `duplicate` options.

Default values are:

```js
     $('.collection').collection({
         up: '<a href="#">&#x25B2;</a>',
         down: '<a href="#">&#x25BC;</a>',
         add: '<a href="#">[ + ]</a>',
         remove: '<a href="#">[ - ]</a>',
         duplicate: '<a href="#">[ # ]</a>'
     });
```

You can also use following classes:

- `collection-add` for an add button
- `collection-remove` for a remove button
- `collection-up` for a move up button
- `collection-down` for a move down button
- `collection-duplicate` for a duplicate button

And:

- `collection-action` for any of the above action
- `collection-action-disabled` same, but when button is disabled (no "up" at the top, etc)

Note that `collection` prefix can be changed using the `prefix` option.

**Disable links** ([demo](http://symfony-collection.fuz.org/symfony3/options/enableButtons))

You can disable some buttons by using `allow_up`, `allow_down`, `allow_add`, `allow_remove`
and `allow_duplicate` options. By default, all buttons except `duplicate` are enabled.

For example, if you do not want your elements to be moved up and down, use:

```js
     $('.collection').collection({
         allow_up: false,
         allow_down: false
     });
```

If you are using the given form theme, `allow_add`, `allow_remove` and `allow_duplicate` are automatically
set following your form type configuration.

**Set minimum and maximum of elements in the collection** ([demo](http://symfony-collection.fuz.org/symfony3/options/numberCollectionElements))

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

You can initialize your collection with a minimum of elements created (even if they do not exist on the data object) ([demo](http://symfony-collection.fuz.org/symfony3/options/givenMinimumElements)).

```js
     $('.collection').collection({
         init_with_n_elements: 3
     });
```

**Only one add button at the bottom** ([demo](http://symfony-collection.fuz.org/symfony3/options/addButtonAtTheBottom))

If you prefer having only one `add` button at the bottom of the collection instead of one add button per collection element, use the `add_at_the_end` option:

```js
     $('.collection').collection({
         add_at_the_end: true
     });
```

**Customise add button location** ([demo](http://symfony-collection.fuz.org/symfony3/options/buttons-custom-location))

If you want to set a specific location for your add button (not close to each collection element, nor at the bottom of the collection),
you can use the `custom_add_location` option.

JS:
```js
        $('.collectionA').collection({
            custom_add_location: true
        });
```

HTML:
```html
        <button
            data-collection="collectionA"
            class="collection-action collection-add btn btn-success"
        >Add element to collection</button>
```

**Hide useless buttons** ([demo](http://symfony-collection.fuz.org/symfony3/options/hideMoveUpDown))

By default, `move up` button is hidden on the first item, and `move down` button on the last one. You can make them appear
anyway by setting `hide_useless_buttons` to `false`. This can be useful if you want to beautify them using CSS, for example.

```js
     $('.collection').collection({
         hide_useless_buttons: true
     });
```

**Events** ([demo](http://symfony-collection.fuz.org/symfony3/options/eventCallbacks))

There are `before_*` and `after_*` options that let you put callbacks before and after adding, deleting or moving
elements in the collection.

- `before_up`, `before_down`, `before_add` and `before_remove` are called before modifying the collection.
The modification will be cancelled if the callback you given returned `false`, and will proceed if it returned `true`
or `undefined`.

- `after_up`, `after_down`, `after_add` and `after_remove` are called after modifying the collection.
The modification will be reverted if the callback you given returned `false`.

- `before_init` and `after_init` are called when a collection is initialized. No return value are expected.

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

**Using the plugin without form theme** ([demo](http://symfony-collection.fuz.org/symfony3/options/withoutFormTheme))

The form theme aims to reduce the number of options required when activating the plugin. This is really useful
when you are dealing with collections of form collections. But you can still do it manually if you want, using the
following equivalents:

```js
    $('.my-selector').collection({
        prototype_name: '{{ myForm.myCollection.vars.prototype.vars.name }}',
        allow_add: false,
        allow_remove: false,
        name_prefix:  '{{ myForm.myCollection.vars.full_name }}'
    });
```

Note that only `name_prefix` option is mandatory, all other ones have default values.

**Fade in & Fade out support** ([demo](http://symfony-collection.fuz.org/symfony3/options/fadeInFadeOut))

By defaut, when adding or removing an element, `fade` animation will make element movements smoother.
You can still disable this option by using `fade_in` and `fade_out` options.

```js
    $('.my-selector').collection({
        fade_in: true,
        fade_out: true
    });
```

**Drag & drop support** ([demo](http://symfony-collection.fuz.org/symfony3/options/dragAndDrop))

If you are using Jquery UI and have the `sortable` component available in your application, the `drag_drop` option is
automatically enabled and let you change your element positions using drag & drop. You can disable this behavior by explicitely
setting `drag_drop` option to false.

If required, you can customize `sortable` by overloading options given to `jQuery.ui.sortable` using the `drag_drop_options` option.

By default, your collection is initialized with the following options:

```js
     $('.collection').collection({
         drag_drop: true,
         drag_drop_options: {
            placeholder: 'ui-state-highlight'
         }
     });
```

Note that you should not overload `start` and `update` callbacks as they are used by this plugin, see
`drag_drop_start` and `drag_drop_update` options in advanced usage below for more details.

**Change the children selector**

By default, Symfony writes each element of a collection in a div below the collection itself. So
this plugin considers `> div` as a default value to get collection elements. But, you may need
to display each element of your collection in a table, so you can change this value.

```js
     $('.collection').collection({
        elements_selector: '> div'
     });
```

You may use `> tr`, `thead > tr` or more specifically `tr.item` or just `.item` if you set `class="item"` at the top
of your item's form theme. The goal is to reference each item in the collection whatever the markup.

**Change the parent selector**

To be able to add elements to the collection, this plugin should be aware of the dom object that will contain them.

By default, your collection elements will be located just below your collection, for example:

```html
    <div id="collection">
       <div id="child_0">(...)</div>
       <div id="child_1">(...)</div>
       <div id="child_2">(...)</div>
    </div>
```

But you may need to put elements deeper in the dom, for example when you put elements in a table:

```html
    <table id="collection">
        <tbody>
            <tr id="child_0">(...)</tr>
            <tr id="child_1">(...)</tr>
            <tr id="child_2">(...)</tr>
        </tbody>
    </table>
```

In that example, parent selector should be `table.collection tbody`.

Note that you can use `%id%` inside `elements_parent_selector`, it will be automatically replaced by the
collection's id. This is particularly useful when you're dealing with nested collections.

Example:

```js
     $('.collection').collection({
        // ...
        children: [{
            // ...
            elements_parent_selector: '%id% tbody'
        }]
     });
```

Default value:

```js
     $('.collection').collection({
        elements_parent_selector: '%id%' // will be the collection itself
     });
```

**Do not change field names**

Symfony use field names to order the collection, not the position of each elements on the dom. 
So by default, if you delete an element in the middle, all following elements will have their
index decreased of 1 (`field[3]` will become `field[2]` and so on) and if you add some elements 
in the middle, all subsequent elements will see their index increase to leave the space for the
new one.

With this implementation, you're sure to keep the right positions when clicking "move up" and 
"move down" for exmaple. But in some situations, you may not want to overwrite indexes, 
most probably to maintain Doctrine relationships.

Set the `preserve_names` option to `true` to never touch field names. But be aware that this
option will disable `allow_up`, `allow_down`, `drag_drop` options and will enforce 
`add_at_the_end` to true.

Default value:

```js
     $('.collection').collection({
        preserve_names: false
     });
```

**Changing the action container tag**

By default, without form theme, all actions are put inside a `<div>`. You
can overwrite this by setting the `action_container_tag` option, for
example if you want to put actions in a `<td>` instead.

Default value:

```js
     $('.collection').collection({
        action_container_tag: 'div'
     });
```

# Advanced usage

**Changing action's positions** ([demo](http://symfony-collection.fuz.org/symfony3/advanced/customFormTheme))

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

**Advanced drag & drop support** ([demo](http://symfony-collection.fuz.org/symfony3/options/dragAndDrop))

If you need to listen for `start` and/or `update` events from `jQuery.ui.sortable` in your collection,
you should not overload the `start` and `update` options in `drag_drop_options`, but use the built-in
`drag_drop_start` and `drag_drop_update` options instead:

```js
     $('.collection').collection({
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

**Collection of collections** ([demo](http://symfony-collection.fuz.org/symfony3/advanced/collectionOfCollections))

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
                    'allow_remove' => true,
                    'prototype' => true,
                    'prototype_name' => '__children_name__',
                    'attr' => array (
                            'class' => "child-collection",
                    ),
            ),
            'allow_add' => true,
            'allow_remove' => true,
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
             prefix: 'child'
             // ...
         }]
     });
```
