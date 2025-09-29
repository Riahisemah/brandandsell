<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SocialPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;

class SocialPostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        try {

            $userId = $request->get('user_id');

            $query = SocialPost::with(['product', 'user'])->latest();


            $socialPosts = $query->where('user_id', $userId);


            return response()->json([
                'success' => true,
                'data' => $socialPosts,
                'message' => 'Posts récupérés avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des posts'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'product_id' => 'required|exists:product_infos,id',
                'content' => 'required|string|min:10|max:2000',
                'is_edited' => 'sometimes|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $validated = $validator->validated();
            $validated['user_id'] = auth()->id();

            $socialPost = SocialPost::create($validated);
            $socialPost->load(['product', 'user']);

            return response()->json([
                'success' => true,
                'message' => 'Post créé avec succès',
                'data' => $socialPost
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du post'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(SocialPost $socialPost): JsonResponse
    {
        try {
            $socialPost->load(['product', 'user']);

            return response()->json([
                'success' => true,
                'data' => $socialPost,
                'message' => 'Post récupéré avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du post'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SocialPost $socialPost): JsonResponse
    {
        try {
            if (auth()->id() !== $socialPost->user_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorisé à modifier ce post'
                ], Response::HTTP_FORBIDDEN);
            }

            $validator = Validator::make($request->all(), [
                'product_id' => 'sometimes|required|exists:product_infos,id',
                'content' => 'sometimes|required|string|min:10|max:2000',
                'is_edited' => 'sometimes|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $validated = $validator->validated();

            if (isset($validated['content']) && $socialPost->content !== $validated['content']) {
                $validated['is_edited'] = true;
            }

            $socialPost->update($validated);
            $socialPost->load(['product', 'user']);

            return response()->json([
                'success' => true,
                'message' => 'Post mis à jour avec succès',
                'data' => $socialPost
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du post'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SocialPost $socialPost): JsonResponse
    {
        try {
            if (auth()->id() !== $socialPost->user_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorisé à supprimer ce post'
                ], Response::HTTP_FORBIDDEN);
            }

            $socialPost->delete();

            return response()->json([
                'success' => true,
                'message' => 'Post supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression du post'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get posts by product
     */
    public function getByProduct($productId): JsonResponse
    {
        try {
            $posts = SocialPost::with(['product', 'user'])
                ->where('product_id', $productId)
                ->latest()
                ->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $posts,
                'message' => 'Posts par produit récupérés avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des posts'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get posts by authenticated user
     */
    public function getMyPosts(Request $request): JsonResponse
    {
        try {
            $posts = SocialPost::with(['product', 'user'])
                ->where('user_id', auth()->id())
                ->latest()
                ->get(); // ✅ Exécute la requête

            return response()->json([
                'success' => true,
                'data' => $posts,
                'message' => 'Vos posts récupérés avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de vos posts'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
