<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ClaudeController extends Controller
{
    public function generate(Request $request)
    {
        $request->validate([
            'prompt' => 'required|string',
        ]);

        $apiKey = config('services.claude.api_key');
        Log::info('Clé Claude récupérée : ' . ($apiKey ? 'OK' : 'NULL'));

        if (!$apiKey) {
            return response()->json(['error' => 'API key not set'], 500);
        }

        try {
            // 🔥 AJOUT : Désactivation de la vérification SSL
            $response = Http::withOptions([
                'verify' => false, // Désactive la vérification SSL
            ])->withHeaders([
                'x-api-key' => $apiKey,
                'Content-Type' => 'application/json',
                'anthropic-version' => '2023-06-01',
            ])->post('https://api.anthropic.com/v1/messages', [
                'model' => 'claude-3-haiku-20240307',
                'max_tokens' => 3000,
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => $request->prompt,
                    ],
                ],
            ]);

            if ($response->failed()) {
                Log::error('Erreur API Claude: ' . $response->body());
                return response()->json([
                    'error' => 'API request failed',
                    'details' => $response->body(),
                    'status' => $response->status()
                ], 500);
            }

            Log::info('Réponse API Claude réussie');
            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Exception Claude: ' . $e->getMessage());
            return response()->json([
                'error' => 'Exception caught',
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ], 500);
        }
    }
}
