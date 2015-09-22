<?php

namespace Fuz\QuickStartBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * UserPreference
 *
 * @ORM\Table(name="user_preference")
 * @ORM\Entity
 */
class UserPreference
{
    /**
     * @var User
     *
     * @ORM\ManyToOne(targetEntity="User", inversedBy="preferences")
     * @ORM\JoinColumn(name="user_id", referencedColumnName="id", onDelete="cascade")
     * @ORM\Id
     */
    private $user;

    /**
     * @var string
     *
     * @ORM\Column(name="hook", type="string", length=64)
     * @ORM\Id
     */
    private $hook;

    /**
     * @var string
     *
     * @ORM\Column(name="value", type="string", length=255)
     */
    private $value;

    /**
     * Set user
     *
     * @param  User         $user
     * @return UserFavorite
     */
    public function setUser(User $user)
    {
        $this->user = $user;

        return $this;
    }

    /**
     * Get user
     *
     * @return User
     */
    public function getUser()
    {
        return $this->user;
    }

    /**
     * Set hook
     *
     * @param  string         $hook
     * @return UserPreference
     */
    public function setHook($hook)
    {
        $this->hook = $hook;

        return $this;
    }

    /**
     * Get hook
     *
     * @return string
     */
    public function getHook()
    {
        return $this->hook;
    }

    /**
     * Set value
     *
     * @param  string         $value
     * @return UserPreference
     */
    public function setValue($value)
    {
        $this->value = $value;

        return $this;
    }

    /**
     * Get value
     *
     * @return string
     */
    public function getValue()
    {
        return $this->value;
    }
}
