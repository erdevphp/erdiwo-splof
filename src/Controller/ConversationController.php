<?php

namespace App\Controller;

use App\Entity\Conversation;
use App\Entity\Participant;
use App\Entity\User;
use App\Repository\ConversationRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route("/conversations", name: "conversations.")]
final class ConversationController extends AbstractController{

    #[Route('/', name: 'new', methods: ["POST"])]
    public function newConversation(
        Request $request,
        UserRepository $userRepository, 
        ConversationRepository $conversationRepository,
        EntityManagerInterface $entityManager): JsonResponse
    {
        $id = $request->get('id', 0);

        $otherUser = $userRepository->find($id);

        // S'il on ne trouve pas d'autres utilisateurs
        if (is_null($otherUser)) {
            throw new Exception("This user doesn't exist anymore!");
        }
        // Si l'utilisateur est moi-même
        if ($otherUser === $this->getUser()) {
            throw new Exception("You can't create a conversation with youself!");
        }
        // On va chercher dans la base de donnée s'il existe déja une conversation
        $conversation = $conversationRepository->findConversationByParticipants($otherUser->getId(), $this->getUser()->getId());
        // Si jamais il y une conversation on lève une nouvelle exception
        if (count($conversation)) {
            throw new Exception("The conversation exists");
        }
        // Si n'y a pas encore de conversation, on crée en Un
        $conversation = new Conversation();
        // On crée les participants (me and otherParticipant)
        $participant = new Participant();
        $participant->setUser($this->getUser());
        $participant->setConversation($conversation);

        $otherParticipant = new Participant();
        $otherParticipant->setUser($otherUser);
        $otherParticipant->setConversation($conversation);

        // On commence la transaction et on persiste dans la base
        $entityManager->getConnection()->beginTransaction();
        try {
            $entityManager->persist($conversation);
            $entityManager->persist($participant);
            $entityManager->persist($otherParticipant);

            $entityManager->flush();
            $entityManager->commit();
        } catch (Exception $e) {
            $entityManager->rollback();
            throw $e;
        }
        
        return $this->json([
            'id' => $conversation->getId()
        ], Response::HTTP_CREATED, [], []);
    }

    #[Route('/check/{id}', name: 'check', methods: ["GET"])]
    public function checkIfConversation(
        Request $request,
        User $otherUser,
        ConversationRepository $conversationRepository,
        EntityManagerInterface $entityManager)
    {
        // S'il on ne trouve pas d'autres utilisateurs
        if (is_null($otherUser)) {
            throw new Exception("This user doesn't exist anymore!");
        }
        // Si l'utilisateur est moi-même
        if ($otherUser === $this->getUser()) {
            throw new Exception("You can't create a conversation with youself!");
        }
        // On va chercher dans la base de donnée s'il existe déja une conversation
        $conversation = $conversationRepository->findConversationByParticipants($otherUser->getId(), $this->getUser()->getId());
        // Si jamais il y une conversation on lève une nouvelle exception
        if (count($conversation)) {
            return $this->redirectToRoute('conversations.get', [
                'active' => $conversation[0]['conversationId'],
            ]);
            throw new Exception("The conversation exists");
        }
        // Si n'y a pas encore de conversation, on crée en Un
        $conversation = new Conversation();
        // On crée les participants (me and otherParticipant)
        $participant = new Participant();
        $participant->setUser($this->getUser());
        $participant->setConversation($conversation);

        $otherParticipant = new Participant();
        $otherParticipant->setUser($otherUser);
        $otherParticipant->setConversation($conversation);

        // On commence la transaction et on persiste dans la base
        $entityManager->getConnection()->beginTransaction();
        try {
            $entityManager->persist($conversation);
            $entityManager->persist($participant);
            $entityManager->persist($otherParticipant);

            $entityManager->flush();
            $entityManager->commit();
        } catch (Exception $e) {
            $entityManager->rollback();
            throw $e;
        }

        return $this->redirectToRoute('conversations.get', [
            'active' => $conversation->getId(),
        ]);
        
        // return $this->json([
        //     'id' => $conversation->getId()
        // ], Response::HTTP_CREATED, [], []);
    }

    #[Route('/', name: 'get', methods: ["GET"])]
    public function getConversations(
        ConversationRepository $conversationRepository
    ) : Response
    {
        $conversations = $conversationRepository->findConversationByUser($this->getUser()->getId());
        return $this->render('message/index.html.twig', [
            'conversations' => $conversations
        ]);
        //return $this->json($conversations);
    }
}
