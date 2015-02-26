<?php

namespace Fuz\AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Fuz\AppBundle\Base\BaseController;

class OptionsController extends BaseController
{

    /**
     * JavaScript options
     *
     * @Route("/options", name="options")
     * @Template()
     */
    public function optionsAction(Request $request)
    {
        // up, down, add, remove
        // enable_up, enable_down
        // enable_add, enable_remove
        // min, max
        // events (use confirms)
    }

}
