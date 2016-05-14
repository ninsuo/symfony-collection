<?php

namespace Fuz\AppBundle\Twig\Extension;

class HelperExtension extends \Twig_Extension
{
    protected $twig;

    public function __construct(\Twig_Environment $twig)
    {
        $this->twig = $twig;
    }

    public function getFunctions()
    {
        return [
            new \Twig_SimpleFunction('github', [$this, 'github'], ['is_safe' => ['html']]),
        ];
    }

    public function github($files)
    {
        $paths = [];
        foreach ($files as $file)
        {
            $basedir  = realpath(__DIR__.'/../../');
            $realpath = realpath($basedir.'/'.$file);

            if (!is_file($realpath)) {
                throw new \LogicException("File {$file} not found");
            }

           $paths[] = substr($realpath, strlen($basedir) + 1);
        }

        sort($paths);

        return $this->twig->render('FuzAppBundle::github.html.twig', [
            'paths' => $paths
        ]);
    }

    public function getName()
    {
        return 'helper';
    }
}
