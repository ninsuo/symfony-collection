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
      $this->addRoute($menu['JavaScript Options'], "Custom button's layout", 'customButtons');
      $this->addRoute($menu['JavaScript Options'], "Enable / Disable buttons", 'enableButtons');
      $this->addRoute($menu['JavaScript Options'], "Control number of collection's elements", 'numberCollectionElements');
      $this->addRoute($menu['JavaScript Options'], "Change Add button's location", 'addButtonAtTheBottom');
      $this->addRoute($menu['JavaScript Options'], "Event callbacks", 'eventCallbacks');
      $this->addRoute($menu['JavaScript Options'], "Without form theme", 'withoutFormTheme');
      $this->addRoute($menu['JavaScript Options'], "Initialized with a given minimum of elements", 'givenMinimumElements');
      $this->addRoute($menu['JavaScript Options'], "Hide Up and Down buttons on useless elements", 'hideMoveUpDown');

      $this->addSubMenu($menu, 'Advanced usage');
      $this->addRoute($menu['Advanced usage'], "A better MVC Compliance", "mvcCompliance");
      $this->addRoute($menu['Advanced usage'], "Custom form theme", "customFormTheme");
      $this->addRoute($menu['Advanced usage'], "Collection of form collections", "collectionOfCollections");
      $this->addRoute($menu['Advanced usage'], "Usage with Doctrine", "usageWithDoctrine");

      return $menu;
   }

   public function userMenu(FactoryInterface $factory, array $options)
   {
      $menu = $this->createMenu($factory);
      $this->addRoute($menu, 'quickstart.menu.home', 'home');

      return $menu;
   }
}
