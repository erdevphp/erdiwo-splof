<?php

namespace App\Repository;

use App\Entity\Presence;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Presence>
 */
class PresenceRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Presence::class);
    }

   /**
    * @return bool
    */
   public function hasUserAlreadyCheckInToday($user): bool
   {
        $today = new \DateTime('today');
        $tomorrow = new \Datetime('tomorrow');
        return $this->createQueryBuilder('p')
           ->andWhere('p.user = :user')
           ->andWhere('p.startedAt > :today')
           ->andWhere('p.startedAt < :tomorrow')
           ->setParameter('user', $user)
           ->setParameter('today', $today)
           ->setParameter('tomorrow', $tomorrow)
           ->getQuery()
           ->getOneOrNullResult() !== null
       ;
   }

//    public function findOneBySomeField($value): ?Presence
//    {
//        return $this->createQueryBuilder('p')
//            ->andWhere('p.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }
}
