<?php

namespace App\Controller;

use App\Entity\House;
use App\Repository\HouseRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

final class HouseController extends AbstractController{
    #[Route('/add/house', name: 'app_add_house')]
    public function addHouse(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['latitude'], $data['longitude'])) {
            return new JsonResponse(['error' => 'Données invalides'], 400);
        }

        $user = $this->getUser(); // Récupérer l'utilisateur connecté
        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non authentifié'], 403);
        }

        // Créer une nouvelle maison
        $house = new House();
        $house->setUser($user);
        $house->setLatitude($data['latitude']);
        $house->setLongitude($data['longitude']);

        $em->persist($house);
        $em->flush();

        return new JsonResponse(['message' => 'Maison enregistrée avec succès']);
    }
    #[Route('get/house', name: 'app_get_house')]
    public function getHouse(HouseRepository $houseRepository) : JsonResponse 
    {
        $houses = $houseRepository->findAll();
        $data = [];
        foreach ($houses as $house) {
            $data[] = [
                'latitude' => $house->getLatitude(),
                'longitude' => $house->getLongitude(),
                'user' => $house->getUser()->getFirstname()
            ];
        }
    
        return new JsonResponse(['houses' => $data]);
    }
}
