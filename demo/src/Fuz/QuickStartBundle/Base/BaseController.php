<?php

namespace Fuz\QuickStartBundle\Base;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\VarDumper\VarDumper;
use Symfony\Component\Form\Form;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RedirectResponse;

class BaseController extends Controller
{
    /**
     * Symfony's var_dump
     *
     * @param mixed $var
     */
    protected function dump($var)
    {
        VarDumper::dump($var);
    }

    /**
     * This method comes from Flip's answer on Stackoverflow:
     * http://stackoverflow.com/a/17428869/731138
     *
     * @param  Form  $form
     * @return array
     */
    protected function getErrorMessages(Form $form)
    {
        $errors = array();

        foreach ($form->getErrors() as $error) {
            if ($form->isRoot()) {
                $errors['#'][] = $error->getMessage();
            } else {
                $errors[] = $error->getMessage();
            }
        }

        foreach ($form->all() as $child) {
            if (!$child->isValid()) {
                $errors[$child->getName()] = $this->getErrorMessages($child);
            }
        }

        return $errors;
    }

    /**
     * Builds a javascript-friendly list of errors for validating forms using ajax.
     *
     * Implementation example:
     *
     * In your twig views, use for each of your fields:
     *
     * <div class="error-container" id="errors-{{ form.field.vars.id }}">{{ form_errors(form.field) }}</div>
     *
     * In jQuery, you'll use something like that after your ajax call:
     *
     * $.each(data['errors'], function(id, errors) {
     *    var html = '<div class="errors">';
     *    $.each(errors, function(index, error) {
     *       html += '<p class="error">' + error + '</p>';
     *    }
     *    html += '</div>';
     *    if (id !== '#') {
     *      $("#errors-" + id).html(html);
     *    } else {
     *      $("#general-errors").html(html);
     *    }
     * });
     *
     * Do not forget to clean all errors before processing errors:
     *
     * $('.error-container').html('');
     *
     * @param  Form  $form
     * @return array
     * @see Symfony\Component\Form\Extension\DataCollector\FormDataExtractor::buildId
     * @see Fuz\QuickStartBundle\Resources\public\js\jquery.symfony2.js
     */
    protected function getErrorMessagesAjaxFormat(Form $form)
    {
        $originalErrors = $this->getErrorMessages($form);

        $globalErrors = null;
        if (array_key_exists('#', $originalErrors)) {
            $globalErrors = $originalErrors['#'];
            unset($originalErrors['#']);
        }

        $normalizedErrors = $this->normalizeErrorMessagesAjaxFormat($originalErrors, $form->getName());
        if (!is_null($globalErrors)) {
            $normalizedErrors['#'] = $globalErrors;
        }

        return $normalizedErrors;
    }

    private function normalizeErrorMessagesAjaxFormat(array $errors, $prefix)
    {
        $normalizedErrors = array();
        foreach ($errors as $key => $error) {
            if (is_array($error)) {
                $normalizedErrors = array_merge($normalizedErrors,
                   $this->normalizeErrorMessagesAjaxFormat($error, "{$prefix}_{$key}"));
            } else {
                $normalizedErrors[$prefix][$key] = $error;
            }
        }

        return $normalizedErrors;
    }

    /**
     * This method sends user back to the last url he comes from.
     *
     * @param  Request          $request
     * @return RedirectResponse
     */
    protected function goBack(Request $request)
    {
        if ($request->getSession()->has('previous_route')) {
            $route = $request->getSession()->get('previous_route');
            $route['params']['_locale'] = $request->getLocale();

            return $this->redirect($this->generateUrl($route['name'], $route['params']));
        }

        $referer = $request->headers->get('referer');
        if (!is_null($referer)) {
            return $this->redirect($referer);
        }

        return $this->redirect($this->generateUrl('home'));
    }

    public function info($message, array $parameters = array())
    {
        $this->addFlash('info', $this->trans($message, $parameters));
    }

    public function alert($message, array $parameters = array())
    {
        $this->addFlash('alert', $this->trans($message, $parameters));
    }

    public function danger($message, array $parameters = array())
    {
        $this->addFlash('danger', $this->trans($message, $parameters));
    }

    public function success($message, array $parameters = array())
    {
        $this->addFlash('success', $this->trans($message, $parameters));
    }

    public function trans($property, array $parameters = array())
    {
        return $this->container->get('translator')->trans($property, $parameters);
    }
}
