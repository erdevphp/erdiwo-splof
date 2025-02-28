<?php

namespace App\Repository;

use App\Entity\Conversation;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query\Expr\Join;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Conversation>
 */
class ConversationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Conversation::class);
    }

   /**
    * @return Conversation[] Returns an array of Conversation objects
    */
    public function findConversationByParticipants(int $otherUserId, int $meId): array
    {
        $queryBuilder = $this->createQueryBuilder('c');
        $queryBuilder
            ->select('c.id as conversationId', $queryBuilder->expr()->count('p.conversation'))
            ->innerJoin('c.participants', 'p')
            ->where(
                $queryBuilder->expr()->orX(
                    $queryBuilder->expr()->eq('p.user', ':me'),
                    $queryBuilder->expr()->eq('p.user', ':otherUser')
                )
            )
            ->groupBy('p.conversation')
            ->having(
                $queryBuilder->expr()->eq(
                    $queryBuilder->expr()->count('p.conversation'),
                    2
                )
            )
            ->setParameter('me', $meId)
            ->setParameter('otherUser', $otherUserId)
                
        ;
        return $queryBuilder->getQuery()->getResult();
    }

    public function findConversationByUser(int $meId): array
    {
        $queryBuilder = $this->createQueryBuilder('c');
        $queryBuilder
            ->select('otherUser.firstname', 'otherUser.lastname', 'otherUser.profilPicture', 'otherUser.email', 'c.id as conversationId', 'lm.content', 'lm.createdAt')
            ->innerJoin('c.participants', 'p', Join::WITH, $queryBuilder->expr()->neq('p.user', ':me'))
            ->innerJoin('c.participants', 'me', Join::WITH, $queryBuilder->expr()->eq('me.user', ':me'))
            ->leftJoin('c.lastMessage', 'lm')
            ->innerJoin('me.user', 'meUser')
            ->innerJoin('p.user', 'otherUser')
            ->where('meUser.id = :me')
            ->setParameter('me', $meId)
            ->orderBy('lm.createdAt', 'DESC')
        ;
        return $queryBuilder->getQuery()->getResult();
    }

    public function checkIfUserIsParticipant(int $conversationId, int $meId)
    {
        $queryBuilder = $this->createQueryBuilder('c');
        $queryBuilder
            ->innerJoin('c.participants', 'p')
            ->where('c.id = :conversationId')
            ->andWhere(
                $queryBuilder->expr()->eq('p.user', ':me'),
            )
            ->setParameter('conversationId', $conversationId)
            ->setParameter('me', $meId)
        ;
        return $queryBuilder->getQuery()->getOneOrNullResult();
    }
}
