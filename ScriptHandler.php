<?php

namespace Fuz\Symfony\Collection;

use Composer\Script\Event;

class ScriptHandler
{
    public static function postInstall(Event $event)
    {
        self::handle($event);
    }

    public static function postUpdate(Event $event)
    {
        self::handle($event);
    }

    protected static function handle(Event $event)
    {
        $vendorDir = $event->getComposer()->getConfig()->get('vendor-dir');
        self::installTwigFormTheme($vendorDir);
        self::installJQueryPlugin($vendorDir);
    }

    protected static function installTwigFormTheme($vendorDir)
    {
        $collectionDir = $vendorDir.'/ninsuo/symfony-collection';

        echo "*** ninsuo/symfony-collection: Installing Twig form theme... \t";

        $viewsDir = realpath($vendorDir.'/../app/Resources/views');

        if (!is_dir($viewsDir)) {
            echo "FAILED: ";
            echo "Directory 'app/Resources/views' doesn't exist.\n";
            return;
        }

        if (!is_writable($viewsDir)) {
            echo "FAILED: ";
            echo "Directory '$viewsDir' is not writeable.\n";
            return;
        }

        copy($collectionDir.'/jquery.collection.html.twig', $viewsDir.'/jquery.collection.html.twig');
        echo "SUCCESS: ";
        echo "You can now use {% form_theme form 'jquery.collection.html.twig' %}\n";
    }

    protected static function installJQueryPlugin($vendorDir)
    {
        $collectionDir = $vendorDir.'/ninsuo/symfony-collection';

        echo "*** ninsuo/symfony-collection: Installing jQuery plugin... \t";

        $webDir = realpath($vendorDir.'/../web/');
        if (!is_dir($webDir)) {
            echo "FAILED: ";
            echo "Directory 'web' doesn't exist.\n";
            return;
        }

        $jsDir = $webDir.'/js';
        if (!is_dir($jsDir) && !mkdir($jsDir)) {
            echo "FAILED: ";
            echo "Directory '$jsDir' can't be created.\n";
            return;
        }
        if (!is_writable($jsDir)) {
            echo "FAILED: ";
            echo "Directory '$jsDir' is not writeable.\n";
            return;
        }

        copy($collectionDir.'/jquery.collection.js', $jsDir.'/jquery.collection.js');
        echo "SUCCESS: ";
        echo 'You can now use <script type="text/javascript" src={{ asset(\'js/jquery.collection.js\') }} />'."\n";
    }
}
