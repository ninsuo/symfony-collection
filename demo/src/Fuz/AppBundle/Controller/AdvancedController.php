<?php

namespace Fuz\AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Fuz\AppBundle\Base\BaseController;
use Fuz\AppBundle\Entity\Value;
use Fuz\AppBundle\Form\ValueType;
use Fuz\AppBundle\Form\MyArrayType;
use Fuz\AppBundle\Entity\Addresses;
use Fuz\AppBundle\Entity\Address;
use Fuz\AppBundle\Form\AddressesType;

/**
 * @Route("/advanced")
 */
class AdvancedController extends BaseController
{
    /**
     * Advanced usage
     *
     * You can reference your form collection in the view, instead of
     * putting a selector in the form type.
     *
     * @Route("/mvcCompliance", name="mvcCompliance")
     * @Template()
     */
    public function mvcComplianceAction(Request $request)
    {
        $data = array('values' => array("a", "b", "c"));

        $form = $this
           ->createFormBuilder($data)
           ->add('values', 'collection', array(
               'type'         => 'text',
               'label'        => 'Add, move, remove values and press Submit.',
               'options'      => array(
                   'label' => 'Value',
               ),
               'allow_add'    => true,
               'allow_delete' => true,
               'prototype'    => true,
               'required'     => false,
//                   'attr' => array (
//                           'class' => 'my-selector', <--- Not MVC compliant!
//                   ),
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

    /**
     * Advanced usage
     *
     * A custom form theme helps define button's layout and positions as and where you want.
     *
     * @Route("/customFormTheme", name="customFormTheme")
     * @Template()
     */
    public function customFormThemeAction(Request $request)
    {
        $data = array('values' => array(new Value("a"), new Value("b"), new Value("c")));

        $form = $this
           ->createFormBuilder($data)
           ->add('values', 'collection', array(
               'type'         => new ValueType(),
               'label'        => 'Add, move, remove values and press Submit.',
               'allow_add'    => true,
               'allow_delete' => true,
               'prototype'    => true,
               'required'     => false,
               'attr'         => array(
                   'class' => 'collection',
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

    /**
     * Advanced usage
     *
     * Collection of collections are useful on the most dynamic forms, and a good
     * way to test if the plugin is working as expected too.
     *
     * @Route("/collectionOfCollections", name="collectionOfCollections")
     * @Template()
     */
    public function collectionOfCollectionsAction(Request $request)
    {
        $data = array(
            'collections' => array(
                array(new Value("a"), new Value("b"), new Value("c")),
                array(new Value("d"), new Value("e"), new Value("f")),
                array(new Value("g"), new Value("h"), new Value("i")),
            ),
        );

        $form = $this
           ->get('form.factory')
           ->createNamedBuilder('form', 'form', $data)
           ->add('collections', 'collection', array(
               'type'           => 'collection',
               'label'          => 'Add, move, remove collections',
               'options'        => array(
                   'type'           => new ValueType(),
                   'label'          => 'Add, move, remove values',
                   'options'        => array(
                       'label' => 'Value',
                   ),
                   'allow_add'      => true,
                   'allow_delete'   => true,
                   'prototype'      => true,
                   'prototype_name' => '__children_name__',
                   'attr'           => array(
                       'class' => "child-collection",
                   ),
               ),
               'allow_add'      => true,
               'allow_delete'   => true,
               'prototype'      => true,
               'prototype_name' => '__parent_name__',
               'attr'           => array(
                   'class' => "parent-collection",
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
            "data" => $data,
        );
    }

    /**
     * Advanced usage
     *
     * Looks like there are weird behaviours with Doctrine:
     * https://github.com/ninsuo/symfony-collection/issues/7
     * Let's test that live!
     *
     * ... hmm, doesn't look bad anyway
     *
     * @Route(
     *      "/usageWithDoctrine/{name}",
     *      name = "usageWithDoctrine",
     *      defaults = {
     *          "name" = "example"
     *      }
     * )
     * @Template()
     */
    public function usageWithDoctrineAction(Request $request, $name)
    {
        $repo = $this->getDoctrine()->getRepository('FuzAppBundle:MyArray');

        $data = $repo->findOneByName($name);
        if (is_null($data)) {
            $data = $repo->create($name);
        }

        $form = $this->createForm(new MyArrayType(), $data);
        $form->handleRequest($request);

        $form->get('save')->isClicked() && $form->isValid() && $repo->save($data);

        return array(
            'names' => $repo->getArrayNames(),
            'form' => $form->createView(),
            "data" => $data,
        );
    }

    /**
     * Related to usageWithDoctrine demo
     *
     * @Route(
     *      "/usageWithDoctrineDelete/{name}",
     *      name = "usageWithDoctrineDelete"
     * )
     */
    public function usageWithDoctrineDeleteAction(Request $request, $name)
    {
        $repo = $this->getDoctrine()->getRepository('FuzAppBundle:MyArray');
        if (!is_null($data = $repo->findOneByName($name))) {
            $repo->delete($data);
        }

        return $this->forward('FuzAppBundle:Advanced:usageWithDoctrine', array(
            'name' => 'example',
        ));
    }

    /**
     * A form having a theme and containing several fields
     *
     * @Route(
     *      "/formHavingSeveralFields",
     *      name = "formHavingSeveralFields"
     * )
     * @Template()
     */
    public function formHavingSeveralFieldsAction(Request $request)
    {
        $address = new Address();
        $address->setName('Mickael Steller');
        $address->setCompany('fuz.org');
        $address->setStreet('41 rue de la Paix');
        $address->setPostalcode('75002');
        $address->setCity('Paris');
        $address->setCountry('France');

        $addresses = new Addresses();
        $addresses->getAddresses()->add($address);

        $form = $this->createForm(new AddressesType(), $addresses);
        if ($request->isMethod('POST')) {
            $form->handleRequest($request);
        }

        return array(
            'form' => $form->createView(),
            "data" => $addresses,
        );
    }
}
