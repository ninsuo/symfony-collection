<?php

namespace Fuz\AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Fuz\AppBundle\Base\BaseController;

class CollectionController extends BaseController
{

     /**
     * Collection of collections
     *
     * @Route("/collection", name="collection")
     * @Template()
     */
    public function collectionAction(Request $request)
    {
    }

}
