<?php

namespace Fuz\AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class TasksType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('tasks', 'collection', array(
            'label'        => 'Tasks',
            'type'         => new TaskType(),
            'allow_add'    => true,
            'allow_delete' => true,
            'prototype'    => true,
            'required'     => false,
            'by_reference' => true,
            'delete_empty' => true,
        ));

        $builder->add('save', 'submit', array(
                'label' => 'See my tasks',
        ));
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'Fuz\AppBundle\Entity\Tasks',
        ));
    }
}
