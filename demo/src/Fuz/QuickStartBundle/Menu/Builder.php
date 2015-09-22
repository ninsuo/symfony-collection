<?php

namespace Fuz\QuickStartBundle\Menu;

use Knp\Menu\FactoryInterface;
use Fuz\QuickStartBundle\Base\BaseMenu;

class Builder extends BaseMenu
{
    public function mainMenu(FactoryInterface $factory, array $options)
    {
        $menu = $this->createMenu($factory);

        /*
          $this->addSubMenu($menu, 'test');
          $this->addRoute($menu['test'], 'testA', 'testa');
          $this->addRoute($menu['test'], 'testB', 'testb', array(), array(), true);
          $this->addRoute($menu['test'], 'testC', 'testc');

          $this->addSubMenu($menu['test'], 'xxx');
          $this->addRoute($menu['test']['xxx'], 'testE', 'teste');
          $this->addRoute($menu['test']['xxx'], 'testF', 'testf');
          $this->addRoute($menu['test']['xxx'], 'testG', 'testg');

          $this->addRoute($menu['test'], 'testD', 'testd');

          $this->addSubMenu($menu, 'test2');
          $this->addRoute($menu['test2'], 'testH', 'testh');
          $this->addRoute($menu['test2'], 'testI', 'testi');
          $this->addRoute($menu['test2'], 'testJ', 'testj');
         */

        return $menu;
    }

    public function userMenu(FactoryInterface $factory, array $options)
    {
        $menu = $this->createMenu($factory);
        $this->addRoute($menu, 'quickstart.menu.home', 'home');

        return $menu;
    }
}
