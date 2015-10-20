<?php

namespace Fuz\AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class MyArrayType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('name', 'text', array(
                'label' => 'Array name:',
        ));

        $builder->add('elements', 'collection', array(
            'label'        => 'Add an element...',
            'type'         => new MyElementType(),
            'allow_add'    => true,
            'allow_delete' => true,
            'prototype'    => true,
            'required'     => false,
            'by_reference' => true,
            'delete_empty' => true,
            'attr'         => array(
                'class' => 'doctrine-sample',
            ),
        ));

        $builder->add('save', 'submit', array(
                'label' => 'Save this array',
        ));
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'Fuz\AppBundle\Entity\MyArray',
        ));
    }

    public function getName()
    {
        return 'my_array';
    }
}
