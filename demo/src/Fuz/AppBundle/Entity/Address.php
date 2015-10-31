<?php

namespace Fuz\AppBundle\Entity;

class Address
{
    protected $name;
    protected $company;
    protected $street;
    protected $postalcode;
    protected $city;
    protected $country;

    public function getName()
    {
        return $this->name;
    }

    public function getCompany()
    {
        return $this->company;
    }

    public function getStreet()
    {
        return $this->street;
    }

    public function getPostalcode()
    {
        return $this->postalcode;
    }

    public function getCity()
    {
        return $this->city;
    }

    public function getCountry()
    {
        return $this->country;
    }

    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    public function setCompany($company)
    {
        $this->company = $company;

        return $this;
    }

    public function setStreet($street)
    {
        $this->street = $street;

        return $this;
    }

    public function setPostalcode($postalcode)
    {
        $this->postalcode = $postalcode;

        return $this;
    }

    public function setCity($city)
    {
        $this->city = $city;

        return $this;
    }

    public function setCountry($country)
    {
        $this->country = $country;

        return $this;
    }
}
