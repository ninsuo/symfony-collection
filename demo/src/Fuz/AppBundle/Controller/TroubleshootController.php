<?php

namespace Fuz\AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Fuz\AppBundle\Base\BaseController;
use Fuz\AppBundle\Entity\Tasks;
use Fuz\AppBundle\Entity\Task;

/**
 * @Route("/troubleshoot")
 */
class TroubleshootController extends BaseController
{
    /**
     * Basic usage
     *
     * @Route("/hide-form-labels", name="hideFormLabels")
     * @Template()
     */
    public function hideFormLabelsAction(Request $request)
    {
        $dataA = new Tasks();
        $dataB = new Tasks();
        $dataC = new Tasks();

        $task = new Task();
        $task->setTask('Eat');
        $task->setDueDate(new \DateTime("2016-03-22"));
        $dataA->getTasks()->add($task);
        $dataB->getTasks()->add($task);
        $dataC->getTasks()->add($task);

        $task = new Task();
        $task->setTask('Sleep');
        $task->setDueDate(new \DateTime("2016-03-23"));
        $dataA->getTasks()->add($task);
        $dataB->getTasks()->add($task);
        $dataC->getTasks()->add($task);

        $formA = $this->get('form.factory')->createNamed('havingLabels', 'Fuz\AppBundle\Form\TasksType', $dataA);
        $formB = $this->get('form.factory')->createNamed('withoutLabels', 'Fuz\AppBundle\Form\TasksType', $dataB);
        $formC = $this->get('form.factory')->createNamed('withFormTheme', 'Fuz\AppBundle\Form\TasksType', $dataB);

        if ($request->isMethod('POST')) {
            $formA->handleRequest($request);
            $formB->handleRequest($request);
            $formC->handleRequest($request);
        }

        return array(
            'formA' => $formA->createView(),
            'dataA' => $dataA,
            'formB' => $formB->createView(),
            'dataB' => $dataB,
            'formC' => $formC->createView(),
            'dataC' => $dataC,
        );
    }
}
