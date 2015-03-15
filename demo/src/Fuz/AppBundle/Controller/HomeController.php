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

    /**
     * Returns a simple collection
     */
    protected function createCollectionSample($name, $data, array $options = array ())
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
                              'class' => 'collection',
                      ),
                    ), $options))
              ->add('submit', 'submit')
              ->getForm()
        ;
    }

}
