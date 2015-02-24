<?php

namespace Fuz\AppBundle\Entity;

class ValueData
{

    protected $value;

    public function setValue($value)
    {
        $this->value = $value;
        return $this;
    }

    public function getValue()
    {
        return $this->value;
    }

    public function __toString()
    {
        return $this->value;
    }

}