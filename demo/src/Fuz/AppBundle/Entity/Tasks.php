<?php

namespace Fuz\AppBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;

class Tasks
{
    protected $tasks;

    public function __construct()
    {
        $this->tasks = new ArrayCollection();
    }

    public function getTasks()
    {
        return $this->tasks;
    }
}
