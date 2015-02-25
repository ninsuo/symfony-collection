Symfony2 Collection demo website
========================

## Installation

```sh
php -r "readfile('https://getcomposer.org/installer');" | php
php composer.phar update
php app/console assetic:dump
php app/console assets:install web --symlink
php app/console doctrine:schema:create
```

## Usage

Menus refer to controllers with the same name (example: advanced is routed to advancedAction in DefaultController)

Just browse website and look at the corresponding controllers/views to know how to implement them.

## License

- This project is released under the MIT license

- Fuz logo is © 2013-2015 Alain Tiemblo

