<?php

namespace Fuz\QuickStartBundle\EventListener;

use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Routing\Router;
use Symfony\Component\Routing\Exception\ResourceNotFoundException;
use Symfony\Component\HttpFoundation\Request;

class LastRouteListener implements EventSubscriberInterface
{
    protected $router;

    public function __construct(Router $router)
    {
        $this->router = $router;
    }

    public function onKernelRequest(GetResponseEvent $event)
    {
        $request = $event->getRequest();
        if (!$request->hasPreviousSession()) {
            return;
        }

        try {
            $currentRoute = $this->getCurrentRoute($request);
        } catch (ResourceNotFoundException $ex) {
            return;
        }
        if (is_null($currentRoute)) {
            return;
        }

        $session = $request->getSession();
        $previousRoute = $session->get('current_route', array());
        if ($currentRoute == $previousRoute) {
            return;
        }

        $session->set('previous_route', $previousRoute);
        $session->set('current_route', $currentRoute);
    }

    protected function getCurrentRoute(Request $request)
    {
        $routeParams = $this->router->match($request->getPathInfo());
        $routeName = $routeParams['_route'];
        if (substr($routeName, 0, 1) === '_') {
            return;
        }
        unset($routeParams['_route']);

        return array(
                'name' => $routeName,
                'params' => $routeParams,
        );
    }

    public static function getSubscribedEvents()
    {
        return array(
                KernelEvents::REQUEST => array(array('onKernelRequest', 15)),
        );
    }
}
