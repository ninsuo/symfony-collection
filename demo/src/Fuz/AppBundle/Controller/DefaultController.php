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
     * Basic usage
     *
     * @Route("/", name="home")
     * @Template()
     */
    public function defaultAction(Request $request)
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

    protected function optionsActionCreateForm(array $options = array())
    {
        $form = $this
           ->createFormBuilder($data)
           ->add('values', 'collection',
              array_merge(array (
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
           ), $options))
           ->add('submit', 'submit')
           ->getForm()
        ;
    }

    /**
     * Advanced usage
     *
     * @Route("/advanced", name="advanced")
     * @Template()
     */
    public function advancedAction(Request $request)
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
