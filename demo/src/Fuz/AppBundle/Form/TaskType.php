<?php

namespace Fuz\AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class TaskType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        // want to know your form type name? try this:
        // die($this->getBlockPrefix());

        $builder
           ->add('task', 'Symfony\Component\Form\Extension\Core\Type\TextType')
           ->add('dueDate', 'Symfony\Component\Form\Extension\Core\Type\DateType')
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'Fuz\AppBundle\Entity\Task',
        ));
    }
}
