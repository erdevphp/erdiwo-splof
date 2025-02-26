<?php

namespace App\Controller\Admin;

use App\Entity\House;
use App\Entity\Presence;
use App\Entity\User;
use EasyCorp\Bundle\EasyAdminBundle\Attribute\AdminDashboard;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Config\Dashboard;
use EasyCorp\Bundle\EasyAdminBundle\Config\MenuItem;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractDashboardController;
use Symfony\Component\HttpFoundation\Response;

#[AdminDashboard(routePath: '/admin', routeName: 'admin')]
class DashboardController extends AbstractDashboardController
{
    public function index(): Response
    {
        return $this->render('admin/admin.dashboard.html.twig');
    }

    public function configureDashboard(): Dashboard
    {
        return Dashboard::new()
            ->setTitle('<img id="logo" src="/logos/logoOiseauWhite.jpg" width="70">Erdiwo PLOF');
    }

    public function configureMenuItems(): iterable
    {
        yield MenuItem::linkToDashboard('Dashboard', 'fa fa-home');
        yield MenuItem::subMenu('Utilisateurs', 'fa fa-users')->setSubItems([
            MenuItem::linkToCrud('Voir membres', 'fas fa-user', User::class),
            MenuItem::linkToCrud('Ajouter membre', 'fas fa-plus', User::class)->setAction(Crud::PAGE_NEW),
        ]);
        yield MenuItem::subMenu('Pointages', 'fas fa-list')->setSubItems([
            MenuItem::linkToCrud('Voir pointages', 'fas fa-user-pen', Presence::class),
            MenuItem::linkToCrud('Ajouter pointage', 'fas fa-plus', Presence::class)->setAction(Crud::PAGE_NEW),
        ]);
        yield MenuItem::subMenu('Habitations', 'fas fa-home')->setSubItems([
            MenuItem::linkToCrud('Voir habitation', 'fas fa-user-pen', House::class),
            MenuItem::linkToCrud('Ajouter habitation', 'fas fa-plus', House::class)->setAction(Crud::PAGE_NEW),
        ]);
    }
}
