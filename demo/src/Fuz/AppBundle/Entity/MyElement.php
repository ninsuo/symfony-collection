<?php

namespace Fuz\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * MyElement
 *
 * @ORM\Table(name="my_element"),
 * @ORM\Entity
 */
class MyElement
{
    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    protected $id;

    /**
     * @var MyArray
     *
     * @ORM\ManyToOne(targetEntity="MyArray", inversedBy="elements")
     * @ORM\JoinColumn(name="my_array_id", referencedColumnName="id")
     */
    protected $array;

    /**
     * @var string
     *
     * @ORM\Column(name="value", type="string", length=255)
     */
    protected $value;

    public function setId($id)
    {
        $this->id = $id;

        return $this;
    }

    public function getId()
    {
        return $this->id;
    }

    public function setArray(MyArray $array)
    {
        $this->array = $array;

        return $this;
    }

    public function getArray()
    {
        return $this->array;
    }

    public function setValue($value)
    {
        $this->value = $value;

        return $this;
    }

    public function getValue()
    {
        return $this->value;
    }
}
