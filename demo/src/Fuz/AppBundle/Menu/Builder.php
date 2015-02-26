<?php

namespace Fuz\AppBundle\Menu;

use Knp\Menu\FactoryInterface;
use Fuz\QuickStartBundle\Base\BaseMenu;

class Builder extends BaseMenu
{

    public function mainMenu(FactoryInterface $factory, array $options)
    {
        $menu = $this->createMenu($factory);
        $this->addRoute($menu, 'Basic usage', 'home');
        $this->addRoute($menu, 'JavaScript Options', 'options');
        $this->addRoute($menu, 'Advanced usage', 'advanced');
        $this->addRoute($menu, 'Collection of collections', 'collection');
        return $menu;
    }

    public function userMenu(FactoryInterface $factory, array $options)
    {
        $menu = $this->createMenu($factory);
        $this->addRoute($menu, 'quickstart.menu.home', 'home');

        return $menu;
    }

}
