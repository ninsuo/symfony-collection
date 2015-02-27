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
        $context = array();

        // we need 6 forms for our 6 samples
        for ($i = 1; ($i <= 6); $i++)
        {
            $data = array ('values' => array ("a", "b", "c"));

            $form = $this->createCollectionSample("sample_{$i}", $data);
            $form->handleRequest($request);
            if ($form->isValid())
            {
                $data = $form->getData();
            }

            $context["sample_form_{$i}"] = $form->createView();
            $context["sample_data_{$i}"] = $data;
        }

        return $context;

        // custom up, down, add, remove
        // enable_up, enable_down
        // enable_add, enable_remove
        // min, max
        // events (use confirms)
    }


    /**
     * Returns a simple collection
     */
    protected function createCollectionSample($name, $data, array $options = array())
    {
        return $this
           ->get('form.factory')
           ->createNamedBuilder($name, 'form', $data)
           ->add('values', 'collection',
              array_merge(array (

                   // collection of text fields
                   'type' => 'text',

                   // labels
                   'label' => 'Add, move, remove values and press Submit.',
                   'options' => array (
                           'label' => 'Value',
                   ),

                   // we allow user to add and delete elements in the collection
                   'allow_add' => true,
                   'allow_delete' => true,

                   // indicates that we require symfony2 to write a template of a collection's element in a data-prototype attribute
                   'prototype' => true,

                   // indicates that the form collection might be empty
                   'required' => false,

                   // put a selector (here, a collection class) that will be used by jquery to run the plugin
                   'attr' => array (
                           'class' => $name /* we will use .sample_1 as jQuery selector */,
                   ),

               ), $options))
           ->add('submit', 'submit')
           ->getForm()
        ;
    }

}
