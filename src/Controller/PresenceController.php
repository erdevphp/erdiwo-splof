<?php

namespace App\Controller;

use App\Entity\Presence;
use App\Form\PresenceType;
use App\Repository\PresenceRepository;
use DateTime;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/presence')]
final class PresenceController extends AbstractController{
   
    #[Route(name: 'app_presence_index', methods: ['GET'])]
    public function index(PresenceRepository $presenceRepository): Response
    {
        return $this->render('presence/index.html.twig', [
            'presences' => $presenceRepository->findBy(['user' => $this->getUser()], ['startedAt' => 'DESC']),
            'hasAlreadyCheckIn' => $presenceRepository->hasUserAlreadyCheckInToday($this->getUser()),
        ]);
    }

    #[Route('/new', name: 'app_presence_new', methods: ['GET', 'POST'])]
    public function new(Request $request, EntityManagerInterface $entityManager, PresenceRepository $presenceRepository): Response
    {
        $hasAlreadyCheckIn = $presenceRepository->hasUserAlreadyCheckInToday($this->getUser());
        // Si l'utilisateur n'a pas de photo de profil, on le renvoie vers la page de pointage
        if(is_null($this->getUser()->getProfilPicture())) {
            $this->addFlash('danger', "Vous n'avez pas de photo de profil. Parlez à votre supérieure.");
            return $this->redirectToRoute('app_presence_index', [], Response::HTTP_SEE_OTHER);
        }
        // Si l'utilisateur a déjà pointé le jour J on le renvoie vers la page de pointage
        if($hasAlreadyCheckIn) {
            $this->addFlash('danger', "Ooops, vous avez déjà pointé ajourd'hui!!!");
            return $this->redirectToRoute('app_presence_index', [], Response::HTTP_SEE_OTHER);
        }
        $presence = new Presence();
        $form = $this->createForm(PresenceType::class, $presence);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $presence->setUser($this->getUser());
            $presence->setStartedAt(new DateTimeImmutable());
            $entityManager->persist($presence);
            $entityManager->flush();

            return $this->redirectToRoute('app_presence_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('presence/new.html.twig', [
            'presence' => $presence,
            'form' => $form,
            'hasAlreadyCheckIn' => $hasAlreadyCheckIn
        ]);
    }

    #[Route('/new/pointage', name: 'app_new_pointage', methods: ['POST'])]
    public function pointage(Presence $presence, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        dd($data);
        return new JsonResponse(['status' => 'success']);
    }

    #[Route('/{id}', name: 'app_presence_show', methods: ['GET'])]
    public function show(Presence $presence): Response
    {
        return $this->render('presence/show.html.twig', [
            'presence' => $presence,
        ]);
    }

    #[Route('/{id}/edit', name: 'app_presence_edit', methods: ['GET', 'POST'])]
    public function edit(Request $request, Presence $presence, EntityManagerInterface $entityManager): Response
    {
        $form = $this->createForm(PresenceType::class, $presence);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $presence->setFinishedAt(new DateTimeImmutable());
            $entityManager->flush();

            return $this->redirectToRoute('app_presence_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('presence/edit.html.twig', [
            'presence' => $presence,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'app_presence_delete', methods: ['POST'])]
    public function delete(Request $request, Presence $presence, EntityManagerInterface $entityManager): Response
    {
        if ($this->isCsrfTokenValid('delete'.$presence->getId(), $request->getPayload()->getString('_token'))) {
            $entityManager->remove($presence);
            $entityManager->flush();
        }

        return $this->redirectToRoute('app_presence_index', [], Response::HTTP_SEE_OTHER);
    }
}
