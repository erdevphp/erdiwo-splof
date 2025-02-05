<?php

namespace App\Twig\Runtime;

use Twig\Extension\RuntimeExtensionInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class ActiveLinkExtensionRuntime implements RuntimeExtensionInterface
{
    public function __construct(private RequestStack $requestStack) {}

    public function doSomething($value, string $cssActiveClass = 'active', string $cssNotActiveClass = '')
    {
        return ( $this->requestStack->getCurrentRequest()->get('_route') === $value ) ? $cssActiveClass : $cssNotActiveClass;
    }
}
