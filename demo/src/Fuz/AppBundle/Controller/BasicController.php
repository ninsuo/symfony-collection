<?php

namespace Fuz\AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Fuz\AppBundle\Base\BaseController;

class BasicController extends BaseController
{
    /**
     * Basic usage
     *
     * @Route("/basic", name="basic")
     * @Template()
     */
    public function basicAction(Request $request)
    {
        $data = array('values' => array("a", "b", "c"));

        $form = $this
           ->createFormBuilder($data)
           ->add('values', 'collection',
              array(
                   'type' => 'text',
                   'label' => 'Add, move, remove values and press Submit.',
                   'options' => array(
                           'label' => 'Value',
                   ),
                   'allow_add' => true,
                   'allow_delete' => true,
                   'prototype' => true,
                   'required' => false,
                   'attr' => array(
                           'class' => 'my-selector',
                   ),
           ))
           ->add('submit', 'submit')
           ->getForm()
        ;

        $form->handleRequest($request);
        if ($form->isValid()) {
            $data = $form->getData();
        }

        return array(
                'form' => $form->createView(),
                'data' => $data,
        );
    }
}
