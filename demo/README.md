Symfony2 Collection demo website
========================

## See this website [live](http://symfony-collection.fuz.org/)

---

## Installation

This is a classic Symfony2 project based on [Symfony2 QuickStart](https://github.com/ninsuo/symfony2-quickstart).

```sh
php -r "readfile('https://getcomposer.org/installer');" | php
php composer.phar update
php app/console assetic:dump
php app/console assets:install web --symlink
php app/console server:run
```

## Usage

Just browse website and look at the corresponding controllers/views to know how to implement them.

Menus refer to controllers with the same name, for example:
- Basic usage is associated with BasicController and Basic/basic.html.twig
- Javascript options is located in OptionsController and Options/options.html.twig
- ...

This way, you can easily read the sample's code.

## License

- This project is released under the MIT license

- Fuz logo is © 2013-2015 Alain Tiemblo

