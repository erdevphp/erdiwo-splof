<?php

namespace App\Controller\Admin;

use App\Entity\Presence;
use Doctrine\ORM\EntityManagerInterface;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\CollectionField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;

class PresenceCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return Presence::class;
    }


    public function configureFields(string $pageName): iterable
    {
        return [
            IdField::new('id')->hideOnForm(),
            DateTimeField::new('startedAt', "Heure d'entrée")->hideOnForm(),
            DateTimeField::new('finishedAt', 'Heure de sortie'),
            AssociationField::new('user', 'Utilisateur')
        ];
    }

}
