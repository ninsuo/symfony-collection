<?php

namespace Fuz\QuickStartBundle\Provider;

use HWI\Bundle\OAuthBundle\Security\Core\User\OAuthUserProvider as BaseUserProvider;
use HWI\Bundle\OAuthBundle\OAuth\Response\UserResponseInterface;
use Fuz\QuickStartBundle\Entity\User;

class OAuthUserProvider extends BaseUserProvider
{
    protected $session;
    protected $em;

    public function __construct($session, $em)
    {
        $this->session = $session;
        $this->em = $em;
    }

    public function loadUserByUsername($username)
    {
        if (!is_null($this->session->get('user'))) {
            $username = $this->session->get('user');
        }
        if (is_null($username)) {
            return;
        }
        list($resourceOwner, $resourceOwnerId) = json_decode($username);

        return $this->em->getRepository('FuzQuickStartBundle:User')->getUserByResourceOwnerId($resourceOwner, $resourceOwnerId);
    }

    public function loadUserByOAuthUserResponse(UserResponseInterface $response)
    {
        $resourceOwner = $response->getResourceOwner()->getName();
        $resourceOwnerId = $response->getUsername();
        $name = $this->getNameToDisplay($resourceOwner, $response);

        $user = $this->em->getRepository('FuzQuickStartBundle:User')->getUserByResourceOwnerId($resourceOwner, $resourceOwnerId);
        if (is_null($user)) {
            $user = new User();
            $user->setResourceOwner($resourceOwner);
            $user->setResourceOwnerId($resourceOwnerId);
            $user->setUsername($name);
            $user->setSigninCount(1);
            $this->em->persist($user);
            $this->em->flush($user);
        } else {
            $user->setSigninCount($user->getSigninCount() + 1);
            $this->em->persist($user);
            $this->em->flush($user);
        }

        $json = json_encode(array($resourceOwner, $resourceOwnerId));
        $this->session->set('user', $json);

        return $this->loadUserByUsername($json);
    }

    public function getNameToDisplay($resourceOwner, $response)
    {
        $name = null;
        switch ($resourceOwner) {
            case 'google':
                $name = $response->getNickname();
                break;
            case 'facebook':
                $name = $response->getRealName();
                break;
            case 'twitter':
                $name = $response->getNickname();
                break;
            default:
                break;
        }

        return $name;
    }

    public function supportsClass($class)
    {
        return $class === 'Fuz\\QuickStartBundle\\Entity\\User';
    }
}
