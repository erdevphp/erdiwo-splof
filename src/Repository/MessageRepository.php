<?php

namespace App\Repository;

use App\Entity\Message;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Message>
 */
class MessageRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Message::class);
    }

    public function findConversationForUser($user): array
    {
        $query = $this->createQueryBuilder('m');
        return $query
            ->select('u.id as otherUserId, u.lastname, u.firstname, u.email, MAX(m.createdAt) as lastMessageDate, m.content as lastMessage')
            ->join('m.sender', 'u')
            ->where('m.receiver = :user')
            ->setParameter('user', $user)
            ->groupBy('u.id')
            ->orderBy('lastMessageDate', 'DESC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult();
        //dd($query);
        //return $query->getResult();
    }

    // src/Repository/MessageRepository.php
    
    /*public function findConversationsForUser(User $user): array
    {
        return $this->createQueryBuilder('m')
            ->select([
                'CASE WHEN m.sender = :user THEN IDENTITY(m.receiver) ELSE IDENTITY(m.sender) END AS otherUserId',
                'u.email AS otherEmail',
                'u.firstname, u.lastname',
                'MAX(m.createdAt) AS lastMessageDate',
                'm.content AS lastMessage'
            ])
            ->leftJoin(User::class, 'u', 'WITH', 'u.id = CASE WHEN m.sender = :user THEN IDENTITY(m.receiver) ELSE IDENTITY(m.sender) END')
            ->where('m.sender = :user OR m.receiver = :user')
            ->setParameter('user', $user)
            ->groupBy('otherUserId')
            ->orderBy('lastMessageDate', 'DESC')
            ->getQuery()
            ->getResult();
    }*/

    // src/Repository/MessageRepository.php
    public function findConversationsForUser(User $user): array
    {
        // Sous-requête pour récupérer l'ID du dernier message pour chaque conversation
        $subQuery = $this->createQueryBuilder('m1')
            ->select('MAX(m1.id) AS lastMessageId')
            //->select('m1.sender AS mSender')
            ->where('m1.sender = :user OR m1.receiver = :user')
            //->groupBy('CASE WHEN m1.sender = :user THEN m1.receiver ELSE m1.sender END')
            //->groupBy('m1.receiver')
            ->getDQL();

        // Requête principale pour récupérer les conversations avec le dernier message
        return $this->createQueryBuilder('m')
            ->select([
                'CASE WHEN m.sender = :user THEN IDENTITY(m.receiver) ELSE IDENTITY(m.sender) END AS otherUserId',
                'u.email AS otherEmail',
                'u.firstname, u.lastname',
                'm.content AS lastMessage',
                'm.createdAt AS lastMessageDate'
            ])
            ->leftJoin(User::class, 'u', 'WITH', 'u.id = CASE WHEN m.sender = :user THEN IDENTITY(m.receiver) ELSE IDENTITY(m.sender) END')
            ->where('m.id IN (' . $subQuery . ')')
            ->setParameter('user', $user)
            ->orderBy('lastMessageDate', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findConversationBetweenUsers(User $user1, User $user2): array
    {
        return $this->createQueryBuilder('m')
            ->where('(m.sender = :user1 AND m.receiver = :user2) OR (m.sender = :user2 AND m.receiver = :user1)')
            ->setParameter('user1', $user1)
            ->setParameter('user2', $user2)
            ->orderBy('m.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

//    /**
//     * @return Message[] Returns an array of Message objects
//     */
//    public function findByExampleField($value): array
//    {
//        return $this->createQueryBuilder('m')
//            ->andWhere('m.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('m.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    }

//    public function findOneBySomeField($value): ?Message
//    {
//        return $this->createQueryBuilder('m')
//            ->andWhere('m.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }
}
