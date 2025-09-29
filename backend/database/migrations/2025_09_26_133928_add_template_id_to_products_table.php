<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            // Supprimer l'ancienne colonne si elle existe
            if (Schema::hasColumn('products', 'template_id')) {
                $table->dropForeign(['template_id']);
                $table->dropColumn('template_id');
            }

            // Ajouter template_id comme string
            $table->string('template_id')->nullable()->after('id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('template_id');
        });
    }
};
