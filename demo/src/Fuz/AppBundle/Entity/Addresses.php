<?php

namespace Fuz\AppBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;

class Addresses
{
    protected $addresses;

    public function __construct()
    {
        $this->addresses = new ArrayCollection();
    }

    public function getAddresses()
    {
        return $this->addresses;
    }
}
