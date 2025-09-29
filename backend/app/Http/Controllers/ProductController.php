<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // Sauvegarder un produit
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'info_id' => 'required|exists:product_infos,id',
            'json' => 'nullable|array',
            'template_id' => 'required',
        ]);

        $product = Product::create([
            'user_id' => $validated['user_id'],
            'info_id' => $validated['info_id'],
            'json' => $validated['json'] ?? [],
           'template_id' => $validated['template_id'],
        ]);

        return response()->json([
            'message' => 'Produit créé avec succès',
            'product' => $product->load('info', 'user')
        ]);
    }

    // Afficher tous les produits d'un utilisateur
    public function showByAuthUser(Request $request)
    {
        $user = $request->user(); // récupère l'utilisateur connecté via le token
        $products = Product::with('info')
            ->where('user_id', $user->id)
            ->get();

        return response()->json($products);
    }
    

    public function update(Request $request, $id)
{
    // Validation simple pour les champs nécessaires
    $request->validate([
        'template_id' => 'required|string',
        'json' => 'required|array',
    ]);

    $product = Product::find($id);
    if (!$product) {
        return response()->json(['error' => 'Produit introuvable'], 404);
    }

    // Mettre à jour uniquement template et json
    $product->template_id = $request->template_id;
    $product->json = $request->json;
    $product->save();

    return response()->json([
        'message' => 'Produit mis à jour avec succès',
        'product' => $product,
    ]);
}

}
