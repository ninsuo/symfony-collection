<?php

namespace Fuz\AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Fuz\AppBundle\Base\BaseController;
use Fuz\AppBundle\Entity\ValueData;
use Fuz\AppBundle\Form\ValueType;

class DefaultController extends BaseController
{

    /**
     * @Route("/", name="home")
     * @Template()
     */
    public function indexAction(Request $request)
    {
        $data = array ('values' => array ("a", "b", "c"));

        $form = $this
           ->createFormBuilder($data)
           ->add('values', 'collection',
              array (
                   'type' => 'text',
                   'label' => 'Add, move, remove values and press Submit.',
                   'options' => array (
                           'label' => 'Value',
                   ),
                   'allow_add' => true,
                   'allow_delete' => true,
                   'prototype' => true,
                   'required' => false,
                   'attr' => array (
                           'class' => 'collection',
                   ),
           ))
           ->add('submit', 'submit')
           ->getForm()
        ;

        $form->handleRequest($request);
        if ($form->isValid())
        {
            $data = $form->getData();
        }

        return array (
                'form' => $form->createView(),
                'data' => $data,
        );
    }

    /**
     * @Route("/custom", name="custom")
     * @Template()
     */
    public function customAction(Request $request)
    {
        $a = new ValueData();
        $a->setValue('a');
        $b = new ValueData();
        $b->setValue('b');
        $c = new ValueData();
        $c->setValue('c');

        $data = array('values' => array($a, $b, $c));

        $form = $this
           ->createFormBuilder($data)
           ->add('values', 'collection',
              array (
                   'type' => new ValueType(),
                   'label' => 'Add, move, remove values and press Submit.',
                   'allow_add' => true,
                   'allow_delete' => true,
                   'prototype' => true,
                   'required' => false,
                   'attr' => array (
                           'class' => 'collection',
                   ),
           ))
           ->add('submit', 'submit')
           ->getForm()
        ;

        $form->handleRequest($request);
        if ($form->isValid())
        {
            $data = $form->getData();
        }

        return array (
                'form' => $form->createView(),
                'data' => $data,
        );
    }

}
