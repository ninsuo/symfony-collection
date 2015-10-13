<?php

namespace Fuz\QuickStartBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Fuz\QuickStartBundle\Base\BaseController;

class ReloadController extends BaseController
{
    /**
     * Get back to the previous route
     *
     * @Route("/reload", name="reload")
     * @Method({"GET"})
     */
    public function reloadAction(Request $request)
    {
        return $this->goBack($request);
    }
}
