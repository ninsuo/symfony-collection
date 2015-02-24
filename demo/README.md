Symfony2 Quick Starter
========================

This is the [Symfony2 Standard Edition](https://github.com/symfony/symfony-standard) with some ready-to-use tools to get started quickly.

When I tell "Ready to use", this is basically really ready to use, no need to configure or code anything. Just overwriting and copy/pasting to customize.

## Installation

```sh
php -r "readfile('https://getcomposer.org/installer');" | php
php composer.phar update
php app/console assetic:dump
php app/console assets:install web --symlink
php app/console doctrine:schema:create
```

## Usage

[Bootstrap](http://bootstrap.braincrafted.com/) is preinstalled with a base layout

To use it in a view:

```jinja
{% extends 'FuzQuickStartBundle::layout.html.twig' %}
```

Look at the source code to know what are the blocks that can be overwritten.

---

[HWIOAuthBundle](https://github.com/hwi/HWIOAuthBundle) is ready for letting your users log-in using their Google, Facebook and Twitter accounts.

You need to create apps with the minimum permissions at the following urls:

- Google Login: https://console.developers.google.com/project
- Facebook Login: https://developers.facebook.com/apps/
- Twitter Login: https://apps.twitter.com/

To configure supported resource owners:

- in src/Fuz/QuickStartBundle/Resources/views/layout.html.twig are defined available locales

You can overwrite the `login` twig block to set your own resource owners.

---

[JMSI18nRoutingBundle](http://jmsyst.com/bundles/JMSI18nRoutingBundle) is ready to let you switch between languages.

To configure supported languages:

- in app/config/config.yml, define your locales and default_locale
- in src/Fuz/QuickStartBundle/Resources/views/layout.html.twig are defined available locales

You can overwrite the `translations` twig block to set your custom locales

You'll probably find the right flags for your supported countries in the bundles/fuzquickstart/img/countries directory.

It implements the  "come back where you were" logic for better ergonomics.

---

[KnpMenuBundle](http://symfony.com/doc/master/bundles/KnpMenuBundle/index.html) is ready to let you define your navigation menu.

It automatically manages which part of the menu should be considered as active, and has helpers to quickly add routes and submenus.

- You can copy/paste FuzQuickStartBundle:Builder:Menu class and overwrite the menu block to define your own menus.

---

Bonus

- project already implements 403, 404, 500 and generic error pages
- CRUD generator generates bootstrap-ready and translated views
- Flash messages are automatically rendered in the base layout

## License

- This project is released under the MIT license

- Fuz logo is © 2013-2015 Alain Tiemblo

