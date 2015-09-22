<?php

namespace Fuz\QuickStartBundle\Base;

use Knp\Menu\FactoryInterface;
use Knp\Menu\ItemInterface;
use Symfony\Component\DependencyInjection\ContainerAware;

class BaseMenu extends ContainerAware
{
    protected function createMenu(FactoryInterface $factory)
    {
        $menu = $factory->createItem('root');
        $menu->setChildrenAttribute('class', 'nav navbar-nav');

        return $menu;
    }

    protected function addRoute(ItemInterface $menu, $name, $route, array $routeParams = array(),
       array $childParams = array(), $divider = false)
    {
        $uri = $this->container->get('router')->generate($route, $routeParams);

        return $this->addUri($menu, $name, $uri, $childParams, $divider);
    }

    protected function addUri(ItemInterface $menu, $name, $uri, array $childParams = array(), $divider = false)
    {
        $currentUri = $this->container->get('request')->getRequestUri();

        $key = sha1($name);

        $item = $menu->addChild($key,
           array_merge($childParams,
              array(
                'uri' => $uri,
                'label' => $name,
        )));

        if ($divider) {
            $menu[$key]->setAttribute('divider', true);
        }

        $isCurrent = false;
        $first = null;
        $elem = $item;
        while (!$elem->isRoot()) {
            if (strcmp($currentUri, $elem->getUri()) == 0) {
                $isCurrent = true;
            }
            $first = $elem;
            $elem = $elem->getParent();
        }

        if (!is_null($first)) {
            if ($isCurrent) {
                $first->setAttribute('class', 'active');
            }
            $first->setCurrent($isCurrent);
        }

        return $item;
    }

    protected function addSubMenu(ItemInterface $menu, $label)
    {
        $menu->addChild($label, array('uri' => '#'));
        $menu[$label]->setAttribute('class', 'dropdown');
        if ($menu->getParent()) {
            $menu[$label]->setAttribute('class', 'dropdown-submenu');
            $menu[$label]->setExtra('submenu', true);
        }
        $menu[$label]->setChildrenAttribute('class', 'dropdown-menu');
        $menu[$label]->setChildrenAttribute('role', 'menu');
        $menu[$label]->setLinkAttribute('class', 'dropdown-toggle');
        $menu[$label]->setLinkAttribute('data-toggle', 'dropdown');
        $menu[$label]->setLinkAttribute('role', 'button');
        $menu[$label]->setLinkAttribute('aria-expanded', 'false');
    }

    protected function trans($property, array $parameters = array())
    {
        return $this->container->get('translator')->trans($property, $parameters);
    }
}
