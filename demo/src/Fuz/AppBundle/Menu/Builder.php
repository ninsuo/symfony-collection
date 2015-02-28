<?php

namespace Fuz\AppBundle\Menu;

use Knp\Menu\FactoryInterface;
use Fuz\QuickStartBundle\Base\BaseMenu;

class Builder extends BaseMenu
{

   public function mainMenu(FactoryInterface $factory, array $options)
   {
      $menu = $this->createMenu($factory);
      $this->addRoute($menu, 'Home', 'home');
      $this->addRoute($menu, 'Basic usage', 'basic');

      $this->addSubMenu($menu, 'JavaScript Options');
      $this->addRoute($menu['JavaScript Options'], 'Custom Buttons', 'customButtons');
      $this->addRoute($menu['JavaScript Options'], 'Enable / Disable buttons', 'enableButtons');
      $this->addRoute($menu['JavaScript Options'], 'Number of elements control', 'numberCollectionElements');
      $this->addRoute($menu['JavaScript Options'], '"Add" button\'s location', 'addButtonAtTheBottom');
      $this->addRoute($menu['JavaScript Options'], 'Event callbacks', 'eventCallbacks');

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
