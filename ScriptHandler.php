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

    /**
     * @param $dirs
     * @param bool $writableCheck
     * @return string|null
     */
    protected static function searchDirectory($dirs, $writableCheck = true)
    {
        foreach ($dirs as $dir) {

            if (!is_dir($dir)) {
                echo "Directory '{$dir}' doesn't exist.\n";
                continue;
            }

            if ($writableCheck && !is_writable($dir)) {
                echo "Directory '{$dir}' is not writeable.\n";
                continue;
            }
            return $dir;
        }

        return null;
    }

    protected static function installTwigFormTheme($vendorDir)
    {
        $collectionDir = __DIR__;

        echo "*** ninsuo/symfony-collection: Installing Twig form theme... \t";

        $viewsDirs = [
            $vendorDir . '/../app/Resources/views', //symfony < 3.4
            $vendorDir . '/../templates', //symfony >= 3.4 new stucture
        ];

        $viewCopyDir = self::searchDirectory($viewsDirs);

        if ($viewCopyDir === null) {
            echo 'FAILED: with directories ' . \implode(',', $viewsDirs);
            return;
        }

        copy($collectionDir . '/jquery.collection.html.twig', $viewCopyDir . '/jquery.collection.html.twig');
        echo 'SUCCESS: ';
        echo "You can now use {% form_theme form 'jquery.collection.html.twig' %}\n";
    }

    protected static function installJQueryPlugin($vendorDir)
    {
        $collectionDir = __DIR__;

        echo "*** ninsuo/symfony-collection: Installing jQuery plugin... \t";

        $webDirs = [
            $vendorDir . '/../web', //symfony < 3.4
            $vendorDir . '/../public',  //symfony >= 3.4 new stucture
        ];

        $webDir = self::searchDirectory($webDirs, false);

        if ($webDir === null) {
            echo 'FAILED: with directories ' . \implode(',', $webDirs);
            return;
        }

        $jsDir = $webDir . '/js';
        if (!is_dir($jsDir) && !mkdir($jsDir)) {
            echo 'FAILED: ';
            echo "Directory '$jsDir' can't be created.\n";
            return;
        }
        if (!is_writable($jsDir)) {
            echo 'FAILED: ';
            echo "Directory '$jsDir' is not writeable.\n";
            return;
        }

        copy($collectionDir . '/jquery.collection.js', $jsDir . '/jquery.collection.js');
        echo 'SUCCESS: ';
        echo 'You can now use <script type="text/javascript" src={{ asset(\'js/jquery.collection.js\') }} />' . "\n";
    }
}
