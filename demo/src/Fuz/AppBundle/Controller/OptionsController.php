<?php

namespace Fuz\AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Fuz\AppBundle\Base\BaseController;

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
           $this->createContextSample($request), $this->createAdvancedContextSample($request)
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
           $this->createContextSample($request), $this->createAdvancedContextSample($request)
        );
    }

    /**
     * JavaScript options
     *
     * Add the button close to each collection elements or only at the bottom
     *
     * @Route("/addButtonAtTheBottom", name="addButtonAtTheBottom")
     * @Template()
     */
    public function addButtonAtTheBottomAction(Request $request)
    {
        return array_merge(
           $this->createContextSample($request, 'enabled'), $this->createContextSample($request, 'disabled')
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
        return array_merge(
           $this->createContextSample($request, 'eventsBefore'), $this->createContextSample($request, 'eventsAfter')
        );
    }

    /**
     * JavaScript options
     *
     * Use this plugin without the attached form-theme
     *
     * @Route("/withoutFormTheme", name="withoutFormTheme")
     * @Template()
     */
    public function withoutFormThemeAction(Request $request)
    {
        return $this->createContextSample($request);
    }

    /**
     * JavaScript options
     *
     * Initialize a collection with a given minimum number of elements
     *
     * @Route("/givenMinimumElements", name="givenMinimumElements")
     * @Template()
     */
    public function givenMinimumElementsAction(Request $request)
    {
        return $this->createContextSample($request, 'form', array());
    }

    /**
     * JavaScript options
     *
     * Hide move-up on the first item and move-down on the last one
     *
     * @Route("/hideMoveUpDown", name="hideMoveUpDown")
     * @Template()
     */
    public function hideMoveUpDownAction(Request $request)
    {
        return $this->createContextSample($request, 'form');
    }
}
