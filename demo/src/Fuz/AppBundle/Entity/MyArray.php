<?php

namespace Fuz\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;

/**
 * MyArray
 *
 * @ORM\Table(
 *      name="my_array",
 *      uniqueConstraints={@ORM\UniqueConstraint(name="name_idx", columns={"name"})}
 * )
 * @ORM\Entity(repositoryClass="Fuz\AppBundle\Repository\MyArrayRepository")
 */
class MyArray
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
     * @var string
     *
     * @ORM\Column(name="name", type="string", length=255)
     */
    protected $name;

    /**
     * @var ArrayCollection
     *
     * @ORM\OneToMany(targetEntity="MyElement", mappedBy="array", cascade={"all"}, orphanRemoval=true)
     */
    protected $elements;

    public function __construct()
    {
        $this->elements = new ArrayCollection();
    }

    public function getId()
    {
        return $this->id;
    }

    public function getName()
    {
        return $this->name;
    }

    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    public function getElements()
    {
        return $this->elements;
    }
}
