<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\File;

class FilesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Chemin vers ton fichier JSON
        $jsonPath = database_path('imports/files.json');

        // Charger le contenu du fichier
        $data = json_decode(file_get_contents($jsonPath), true);

        if (is_array($data)) {
            foreach ($data as $file) {
                // Vérifie si une entrée existe déjà via le champ unique `download_url`
                File::firstOrCreate(
                    ['download_url' => $file['download_url']],
                    [
                        'name' => $file['name'],
                        'description' => $file['description'],
                        'file_type' => $file['file_type'],
                        'size' => $file['size'],
                        'downloads' => $file['downloads'],
                        'tags' => $file['tags'],
                        'date_added' => $file['date_added'],
                        'created_at' => $file['created_at'],
                        'updated_at' => $file['updated_at'],
                    ]
                );
            }

            $this->command->info('✅ FilesSeeder : Données importées sans doublons !');
        } else {
            $this->command->error('❌ Erreur : Le fichier JSON est vide ou invalide.');
        }
    }
}
