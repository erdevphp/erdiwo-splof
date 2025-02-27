<?php

namespace App\Controller;

use App\Entity\Conversation;
use App\Entity\Message;
use App\Repository\MessageRepository;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/messages', name: 'message.')]
final class MessageController extends AbstractController
{
    private $messageRepository;
    private $entityManager;
    private const ATTRIBUTES_TO_SERIALIZE = ['id', 'content', 'createdAt', 'mine'];

    public function __construct(
        EntityManagerInterface $em,
        MessageRepository $messageRepository
    )
    { 
        $this->messageRepository = $messageRepository;
        $this->entityManager = $em;
    }

    #[Route('/{id}', name: 'get', methods:["GET"])]
    public function getMessage(Request $request, Conversation $conversation): Response
    {
        // Ajoute un système de Vote pour voir si un utilisateur peut acceder à une conversation
        $this->denyAccessUnlessGranted('view', $conversation);
        
        $messages = $this->messageRepository->findMessageByConversationId($conversation->getId());
        array_map(function($message) {
            $message->setMine(
                $message->getUser()->getId() === $this->getUser()->getId() ? true : false
            );
        }, $messages);
        
        return $this->json($messages, Response::HTTP_OK, [], [
            'attributes' => self::ATTRIBUTES_TO_SERIALIZE
        ]);
    }

    #[Route('/{id}', name: 'new', methods:["POST"])]
    public function newMessage(Request $request, Conversation $conversation): JsonResponse
    {
        $user = $this->getUser();
        $content = $request->get('content', null);

        $message = new Message();
        $message->setContent($content);
        $message->setUser($user);
        $message->setMine(true);

        $conversation->addMessage($message);
        $conversation->setLastMessage($message);

        $this->entityManager->getConnection()->beginTransaction();
        try {
            $this->entityManager->persist($message);
            $this->entityManager->persist($conversation);
            $this->entityManager->flush();
            $this->entityManager->commit();
        } catch (Exception $e) {
            $this->entityManager->rollback();
            throw $e;
        }

        return $this->json($message, Response::HTTP_CREATED, [], [
            'attributes' => self::ATTRIBUTES_TO_SERIALIZE
        ]);
    }
}
