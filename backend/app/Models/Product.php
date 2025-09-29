<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = ['info_id', 'user_id', 'json', 'template_id'];

    protected $casts = [
        'json' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function info()
    {
        return $this->belongsTo(ProductInfo::class, 'info_id');
    }
    
}

