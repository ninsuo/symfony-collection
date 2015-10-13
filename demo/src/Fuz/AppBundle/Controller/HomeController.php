<?php

namespace Fuz\AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Fuz\AppBundle\Base\BaseController;

class HomeController extends BaseController
{
    /**
     * Home
     *
     * @Route("/", name="home")
     * @Template()
     */
    public function homeAction(Request $request)
    {
        return array_merge(
           $this->createContextSample($request, 'noPlugin'), $this->createAdvancedContextSample($request, 'withPlugin')
        );
    }
}
