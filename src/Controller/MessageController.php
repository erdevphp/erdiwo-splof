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

#[Route('/messages', name: 'messages.')]
final class MessageController extends AbstractController
{
    private const ATTRIBUTES_TO_SERIALIZE = ['id', 'content', 'createdAt', 'mine'];

    public function __construct(
        private EntityManagerInterface $entityManager,
        private MessageRepository $messageRepository
    ){ 
    }

    /**
     * On récupère les messages propres à l'utilisateur courant
     */
    #[Route('/{id}', name: 'get', methods:["GET"])]
    public function getMessage(Request $request, Conversation $conversation): Response
    {
        // Ajoute un système de Vote pour voir si un utilisateur peut acceder à une conversation
        $this->denyAccessUnlessGranted('view', $conversation);
        
        // On récupère les messages si nous sommes dans notre conversation
        $messages = $this->messageRepository->findMessageByConversationId($conversation->getId());

        array_map(function($message) {
            $message->setMine(
                $message->getUser()->getId() === $this->getUser()->getId() ? true : false
            );
        }, $messages);

        $currentUser = $this->getUser();
        $recipient = null;
    
        foreach ($conversation->getParticipants() as $participant) {
            if ($participant->getUser()->getId() !== $currentUser->getId()) {
                $recipient = $participant->getUser();
                break;
            }
        }

        $data = [
            "messages" => $messages,
            'recipient' => [
                'id' => $recipient->getId(), 
                'fullname' => $recipient->getFullname(), 
                'profilePicture' => $recipient->getProfilPicture()
            ]
        ];
        
        return $this->json($data, Response::HTTP_OK, [], [
            'attributes' => self::ATTRIBUTES_TO_SERIALIZE
        ]);
    }

    /**
     * On crée un nouveau message ici
     */
    #[Route('/{id}', name: 'new', methods:["POST"])]
    public function newMessage(Request $request, Conversation $conversation): JsonResponse
    {
        
        // Ajoute un système de Vote pour voir si un utilisateur peut acceder à une conversation
        $this->denyAccessUnlessGranted('view', $conversation);

        // On récupère les données envoyées depuis le client
        $jsonData = json_decode($request->getContent(), true);

        $user = $this->getUser();

        // On récupère le contenu du message
        $content = strip_tags(trim($jsonData['content']));

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

        $data = [
            "content" => $message->getContent(),
            "createdAt" => $message->getCreatedAt()
        ];

        return $this->json($data, Response::HTTP_CREATED, [], [
            'attributes' => self::ATTRIBUTES_TO_SERIALIZE
        ]);
    }
}
