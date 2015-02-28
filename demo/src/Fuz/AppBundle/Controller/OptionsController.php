<?php

namespace Fuz\AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Fuz\AppBundle\Base\BaseController;
use Fuz\AppBundle\Entity\ValueData;
use Fuz\AppBundle\Form\ValueType;

/**
 * @Route("/options")
 */
class OptionsController extends BaseController
{

   /**
    * JavaScript options
    *
    * Customized buttons
    *
    * @Route("/customButtons", name="customButtons")
    * @Template()
    */
   public function customButtonsAction(Request $request)
   {
      return $this->createContextSample($request);
   }

   /**
    * JavaScript options
    *
    * Disable buttons you don't want
    *
    * @Route("/enableButtons", name="enableButtons")
    * @Template()
    */
   public function enableButtonsAction(Request $request)
   {
      return array_merge(
              $this->createContextSample($request),
              $this->createAdvancedContextSample($request)
      );
   }


   /**
    * JavaScript options
    *
    * Control the minimum and maximum of allowed number of elements
    *
    * @Route("/numberCollectionElements", name="numberCollectionElements")
    * @Template()
    */
   public function numberCollectionElementsAction(Request $request)
   {
      return array_merge(
              $this->createContextSample($request),
              $this->createAdvancedContextSample($request)
      );
   }

   /**
    * JavaScript options
    *
    * Run a callback before or after adding, deleting and moving elements
    *
    * @Route("/eventCallbacks", name="eventCallbacks")
    * @Template()
    */
   public function eventCallbacksAction(Request $request)
   {
      return $this->createContextSample($request);
   }

   /**
    * All JavaScript option pages are using the same collection sample.
    *
    * @param $name the form name (useful when there are several forms in the same page)
    */
   protected function createContextSample(Request $request, $name = 'form')
   {
      $data = array ('values' => array ("a", "b", "c"));

      $form = $this
         ->get('form.factory')
         ->createNamedBuilder($name, 'form', $data)
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
                 'attr' => array (
                         'class' => "{$name}-collection",
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
              $name => $form->createView(),
              "{$name}Data" => $data,
      );
   }

   protected function createAdvancedContextSample(Request $request, $name = 'advancedForm')
   {
      $a = new ValueData();
      $a->setValue('a');
      $b = new ValueData();
      $b->setValue('b');
      $c = new ValueData();
      $c->setValue('c');

      $data = array ('values' => array ($a, $b, $c));

      $form = $this
         ->get('form.factory')
         ->createNamedBuilder($name, 'form', $data)
         ->add('values', 'collection',
            array (
                 'type' => new ValueType(),
                 'label' => 'Add, move, remove values and press Submit.',
                 'allow_add' => true,
                 'allow_delete' => true,
                 'prototype' => true,
                 'required' => false,
                 'attr' => array (
                         'class' => "{$name}-collection",
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
              $name => $form->createView(),
              "{$name}Data" => $data,
      );
   }

}
