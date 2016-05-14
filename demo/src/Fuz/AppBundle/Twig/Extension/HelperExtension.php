<?php

namespace Fuz\AppBundle\Twig\Extension;

class HelperExtension extends \Twig_Extension
{

    public function getFunctions()
    {
        return [
            new \Twig_SimpleFunction('github', [$this, 'github'], ['is_safe' => ['html']]),
        ];
    }

    public function github($file)
    {
        $basedir  = __DIR__.'/../../';
        $realpath = realpath($basedir.$file);

        if (!is_file($realpath)) {
            throw new \LogicException("File {$file} not found");
        }

        $relativepath = substr($realpath, strlen($basedir) + 1);

        return '<a href="https://github.com/ninsuo/symfony-collection/blob/master/demo/src/Fuz/AppBundle/'.$relativepath.'" target="_blank">'.basename($file).'</a>';
    }

    public function getName()
    {
        return 'helper';
    }
}
