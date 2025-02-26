<?php

namespace App\Controller\Admin;

use App\Entity\User;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\ArrayField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\EmailField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ImageField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserCrudController extends AbstractCrudController
{
    private $userPasswordHasher;
    private const BASE_PATH = '/uploads/profil';
    private const UPLOAD_DIR = 'public/uploads/profil';

    public function __construct(UserPasswordHasherInterface $userPasswordHasher)
    {
        $this->userPasswordHasher = $userPasswordHasher;
    }
    public static function getEntityFqcn(): string
    {
        return User::class;
    }

    
    public function configureFields(string $pageName): iterable
    {
        return [
            IdField::new('id')->hideOnForm(),
            EmailField::new('email'),
            TextField::new('lastname'),
            TextField::new('firstname'),
            ArrayField::new('roles'),
            TextField::new('password')
                ->hideOnIndex()
                ->hideOnDetail()
                ->hideWhenUpdating(),
            TextField::new('pseudo'),
            ImageField::new('profilPicture')
                ->setBasePath(self::BASE_PATH)
                ->setUploadDir(self::UPLOAD_DIR),
            DateTimeField::new('createdAt')->hideOnForm(),
        ];
    }

    public function persistEntity(EntityManagerInterface $entityManager, $entityInstance): void
    {
        if(!$entityInstance instanceof User) return;
        $entityInstance->setCreatedAt(new DateTimeImmutable());
        $entityInstance->setPassword($this->userPasswordHasher->hashPassword($entityInstance, $entityInstance->getPassword()));

        parent::persistEntity($entityManager, $entityInstance);
    }
    
}
