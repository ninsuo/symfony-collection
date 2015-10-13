<?php

namespace Fuz\QuickStartBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\EquatableInterface;

/**
 * User
 *
 * @ORM\Table(
 *      name="user",
 *      uniqueConstraints={
 *          @ORM\UniqueConstraint(name="resource_owner_idx", columns={"resource_owner", "resource_owner_id"})
 *      }
 * )
 * @ORM\Entity(repositoryClass="Fuz\QuickStartBundle\Repository\UserRepository")
 * @ORM\HasLifecycleCallbacks
 */
class User implements UserInterface, EquatableInterface
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
     * @ORM\Column(name="resource_owner", type="string", length=16)
     */
    protected $resourceOwner;

    /**
     * @var string
     *
     * @ORM\Column(name="resource_owner_id", type="string", length=255)
     */
    protected $resourceOwnerId;

    /**
     * @var string
     *
     * @ORM\Column(name="username", type="string", length=255)
     */
    protected $username;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="last_seen", type="datetime")
     */
    protected $lastSeen;

    /**
     * @var integer
     *
     * @ORM\Column(name="signin_count", type="integer")
     */
    protected $signinCount = 0;

    /**
     * @var ArrayCollection[UserPreference]
     *
     * @ORM\OneToMany(targetEntity="UserPreference", mappedBy="user", cascade={"all"})
     */
    protected $preferences;

    public function __construct()
    {
        $this->preferences = new ArrayCollection();
    }

    /**
     * Get id
     *
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set resourceOwner
     *
     * @param  string $resourceOwner
     * @return User
     */
    public function setResourceOwner($resourceOwner)
    {
        $this->resourceOwner = $resourceOwner;

        return $this;
    }

    /**
     * Get resourceOwner
     *
     * @return string
     */
    public function getResourceOwner()
    {
        return $this->resourceOwner;
    }

    /**
     * Set resourceOwnerId
     *
     * @param  string $resourceOwnerId
     * @return User
     */
    public function setResourceOwnerId($resourceOwnerId)
    {
        $this->resourceOwnerId = $resourceOwnerId;

        return $this;
    }

    /**
     * Get resourceOwnerId
     *
     * @return string
     */
    public function getResourceOwnerId()
    {
        return $this->resourceOwnerId;
    }

    /**
     * Set username
     *
     * @param  string $username
     * @return User
     */
    public function setUsername($username)
    {
        $this->username = $username;

        return $this;
    }

    /**
     * {@inheritDoc}
     */
    public function getUsername()
    {
        return $this->username;
    }

    /**
     * Set lastSeen
     *
     * @param  \DateTime $lastSeen
     * @return User
     */
    public function setLastSeen($lastSeen)
    {
        $this->lastSeen = $lastSeen;

        return $this;
    }

    /**
     * Get lastSeen
     *
     * @return \DateTime
     */
    public function getLastSeen()
    {
        return $this->lastSeen;
    }

    /**
     * Set signinCount
     *
     * @param  integer $signinCount
     * @return User
     */
    public function setSigninCount($signinCount)
    {
        $this->signinCount = $signinCount;

        return $this;
    }

    /**
     * Get signinCount
     *
     * @return integer
     */
    public function getSigninCount()
    {
        return $this->signinCount;
    }

    /**
     * Set preferences
     *
     * @param  ArrayCollection[UserPreference] $preferences
     * @return User
     */
    public function setPreferences(ArrayCollection $preferences)
    {
        $this->preferences = $preferences;

        return $this;
    }

    /**
     * Get preferences
     *
     * @return ArrayCollection[UserPreference]
     */
    public function getPreferences()
    {
        return $this->preferences;
    }

    /**
     * @ORM\PrePersist
     */
    public function onPrePersist()
    {
        $this->setLastSeen(new \DateTime());
    }

    /**
     * @ORM\PreUpdate
     */
    public function onPreUpdate()
    {
        $this->setLastSeen(new \DateTime());
    }

    /**
     * {@inheritDoc}
     */
    public function getRoles()
    {
        return array('ROLE_USER');
    }

    /**
     * {@inheritDoc}
     */
    public function getPassword()
    {
        return;
    }

    /**
     * {@inheritDoc}
     */
    public function getSalt()
    {
        return;
    }

    /**
     * {@inheritDoc}
     */
    public function eraseCredentials()
    {
        return true;
    }

    /**
     * {@inheritDoc}
     */
    public function isEqualTo(UserInterface $user)
    {
        if ((int) $this->getId() === $user->getId()) {
            return true;
        }

        return false;
    }
}
