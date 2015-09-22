<?php

namespace Fuz\QuickStartBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * UserRepository
 */
class UserRepository extends EntityRepository
{
    public function getUserByResourceOwnerId($resourceOwner, $resourceOwnerId)
    {
        $query = $this->_em->createQuery("
            SELECT u
            FROM Fuz\QuickStartBundle\Entity\User u
            WHERE u.resourceOwner = :resourceOwner
            AND u.resourceOwnerId = :resourceOwnerId
        ");

        $params = array(
                'resourceOwner' => $resourceOwner,
                'resourceOwnerId' => $resourceOwnerId,
        );

        $user = $query
           ->setMaxResults(1)
           ->setParameters($params)
           ->getOneOrNullResult()
        ;

        return $user;
    }
}
