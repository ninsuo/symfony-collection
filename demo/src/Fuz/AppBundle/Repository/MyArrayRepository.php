<?php

namespace Fuz\AppBundle\Repository;

use Doctrine\ORM\EntityRepository;
use Fuz\AppBundle\Entity\MyArray;

/**
 * MyArrayRepository.
 */
class MyArrayRepository extends EntityRepository
{
    public function create($name)
    {
        $data = new MyArray();
        $data->setName($name);
        $this->_em->persist($data);
        $this->_em->flush();

        return $data;
    }

    public function save(MyArray $data)
    {
        foreach ($data->getElements() as $element) {
            $element->setArray($data);
        }
        $this->_em->persist($data);
        $this->_em->flush();

        return $data;
    }

    public function getArrayNames()
    {
        $arrays = $this
           ->_em
           ->createQuery("
               SELECT arr.name
               FROM Fuz\AppBundle\Entity\MyArray arr
            ")
           ->execute()
        ;
        $names  = array();
        foreach ($arrays as $array) {
            $names[] = $array['name'];
        }

        return $names;
    }

    public function delete(MyArray $data)
    {
        foreach ($data->getElements() as $element) {
            $this->_em->remove($element);
        }
        $this->_em->remove($data);
        $this->_em->flush();
    }
}
