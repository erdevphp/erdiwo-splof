<?php

namespace App\Controller\Admin;

use App\Entity\House;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\NumberField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;

class HouseCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return House::class;
    }

    
    public function configureFields(string $pageName): iterable
    {
        return [
            IdField::new('id'),
            NumberField::new('latitude'),
            NumberField::new('longitude'),
            AssociationField::new('user'),
        ];
    }
    
}
