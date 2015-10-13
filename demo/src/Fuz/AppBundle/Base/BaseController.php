<?php

namespace Fuz\AppBundle\Base;

use Symfony\Component\HttpFoundation\Request;
use Fuz\QuickStartBundle\Base\BaseController as QuickStartBase;
use Fuz\AppBundle\Entity\Value;
use Fuz\AppBundle\Form\ValueType;

class BaseController extends QuickStartBase
{
    protected function createContextSample(Request $request, $name = 'form', $values = array("a", "b", "c"))
    {
        $data = array('values' => $values);

        $form = $this
           ->get('form.factory')
           ->createNamedBuilder($name, 'form', $data)
           ->add('values', 'collection', array(
               'type'         => 'text',
               'label'        => 'Add, move, remove values and press Submit.',
               'options'      => array(
                   'label' => 'Value',
               ),
               'allow_add'    => true,
               'allow_delete' => true,
               'prototype'    => true,
               'attr'         => array(
                   'class' => "{$name}-collection",
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
            $name         => $form->createView(),
            "{$name}Data" => $data,
        );
    }

    protected function createAdvancedContextSample(Request $request, $name = 'advancedForm')
    {
        $a = new Value("a");
        $b = new Value("b");
        $c = new Value("c");

        $data = array('values' => array($a, $b, $c));

        $form = $this
           ->get('form.factory')
           ->createNamedBuilder($name, 'form', $data)
           ->add('values', 'collection', array(
               'type'         => new ValueType(),
               'label'        => 'Add, move, remove values and press Submit.',
               'allow_add'    => true,
               'allow_delete' => true,
               'prototype'    => true,
               'required'     => false,
               'attr'         => array(
                   'class' => "{$name}-collection",
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
            $name         => $form->createView(),
            "{$name}Data" => $data,
        );
    }
}
