import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import api from "@/lib/axios";
import {
  Share2,
  Sparkles,
  History,
  Package,
  Check,
  Wand2,
  Copy,
  Save,
  FileText,
  Trash2,
  Calendar,
  Eye,
  EyeOff,
  Loader2,
  MessageSquare,
  Share,
  Edit,
  RefreshCw,
  Filter,
  Hash,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Content,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

// Types
interface Product {
  id: string;
  name: string;
  solution: string;
  price: number;
  benefits: string;
  audience: string;
  url: string;
}

interface PostFormData {
  productId: string;
  objective: "awareness" | "engagement" | "conversion" | "traffic";
  // platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok';
  length: "short" | "medium" | "long";
  tone: "professional" | "casual" | "enthusiastic" | "educational";
  includeHashtags: boolean;
  includeEmojis: boolean;
  customUrl: string;
}

interface GeneratedPost {
  id: string;
  productId: string;
  formData: PostFormData;
  prompt: string;
  generatedContent: string;
  createdAt: Date;
}
// 1. Interface pour TypeScript
interface SocialPost {
  id: number;
  content: string;
  createdAt: Date;
  isEdited: boolean;
}
const PostsGenerator = () => {
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(
    null
  );
  const [post, setPost] = useState([]);

  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // ✅ Tous les useState et useEffect doivent être ici
  const [ProductList, setProductList] = useState<Product[]>([]);
  const [showNoProductModal, setShowNoProductModal] = useState(false);
  const navigate = useNavigate();
  const [textGenrate, setTextGenerate] = useState("");
  const [userId, setUserId] = useState("");
  const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set());
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState<string>("");

  useEffect(() => {
    fetchProducts();
  }, []);
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/api/user/products", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProductList(response.data);
      console.log("products :", response.data);
      // Vérifier si le tableau de produits est vide
      if (response.data.length === 0) {
        setShowNoProductModal(true);
      } else {
        setUserId(response.data[0].user_id);
      }
      getMyPosts();
    } catch (error) {
      console.error("Erreur lors du chargement des produits :", error);
    }
  };

  // Fonction pour rediriger vers la page de génération de produit
  const handleGenerateProduct = () => {
    setShowNoProductModal(false);
    navigate("/product-generator");
  };

  const [formData, setFormData] = useState<PostFormData>({
    productId: "",
    objective: "awareness",
    // platform: 'instagram',
    length: "medium",
    tone: "casual",
    includeHashtags: true,
    includeEmojis: true,
    customUrl: "",
  });

  React.useEffect(() => {
    if (selectedProduct) {
      setFormData((prev) => ({ ...prev, productId: selectedProduct.id }));
    }
  }, [selectedProduct]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const generatePrompt = (selectedProduct: Product, formData: PostFormData) => {
    // const platformContext = {
    //     facebook: "Facebook (format long acceptable, engagement communautaire)",
    //     instagram: "Instagram (visuel important, hashtags essentiels, stories possibles)",
    //     twitter: "X/Twitter (concis, maximum 280 caractères, trending topics)",
    //     linkedin: "LinkedIn (professionnel, B2B, expertise)",
    //     tiktok: "TikTok (jeune audience, tendances, créatif)"
    // };

    const objectiveContext = {
      awareness: "sensibiliser et faire connaître le produit",
      engagement: "encourager les interactions, commentaires et partages",
      conversion: "inciter à l'achat ou à l'action",
      traffic: "diriger vers le site web ou la page produit",
    };

    const lengthGuide = {
      short: "un post concis et percutant",
      medium: "un post équilibré avec détails importants",
      long: "un post détaillé et informatif",
    };

    const toneGuide = {
      professional: "un ton professionnel et sérieux",
      casual: "un ton décontracté et accessible",
      enthusiastic: "un ton enthousiaste et énergique",
      educational: "un ton informatif et pédagogique",
    };

    const url = formData.customUrl || selectedProduct.url;

    // return `Créé un post  pour ${platformContext[formData.platform]} avec l'objectif de ${objectiveContext[formData.objective]}.

    // PRODUIT À PROMOUVOIR :
    // - Nom : ${selectedProduct.name}
    // - Description : ${selectedProduct.description}
    // - Prix : ${selectedProduct.price}€
    // - Catégorie : ${selectedProduct.category}
    // - Caractéristiques clés : ${selectedProduct.features}
    // - Tags : ${selectedProduct.tags}
    // - URL : ${url}

    // CONSIGNES :` +
    // // - Plateforme : ${platformContext[formData.platform]}
    // `
    // - Longueur : ${lengthGuide[formData.length]}
    // - Ton : ${toneGuide[formData.tone]}
    // - Inclure des hashtags : ${formData.includeHashtags ? 'OUI' : 'NON'}
    // - Inclure des emojis : ${formData.includeEmojis ? 'OUI' : 'NON'}
    // - Objectif principal : ${objectiveContext[formData.objective]}

    // ${formData.includeHashtags ? '\nInclus des hashtags pertinents pour maximiser la portée.' : ''}
    // ${formData.includeEmojis ? '\nUtilise des emojis appropriés pour rendre le post plus engageant.' : ''} `;

    // Assure-toi que le post est optimisé pour ${formData.platform} et respecte les bonnes pratiques de cette plateforme.

    return `
##Rôle : Tu es un expert en création de contenu pour les réseaux sociaux, spécialisé dans la rédaction de publications engageantes adaptées au secteur d'activité de l'entreprise.

##Tâche : Rédige une publication LinkedIn et une publication Facebook pour une entreprise, en respectant les bonnes pratiques de chaque plateforme, avec un style aéré et des phrases concises. Ajoute des émojis de manière pertinente pour rendre la publication plus visuelle et engageante. Utilise un ton dynamique et engageant pour attirer l'attention. Assure-toi que le texte soit fluide et facile à lire.
et ajoute à la fin un prompt pour création d'une image associée.

##Informations Clés :
#Secteur : Indique le secteur de l'entreprise.
#Objectifs : Précise l’objectif de la publication (attirer des clients, valoriser l’expertise, promouvoir un service, annoncer une nouveauté, etc.).
#Ton et Style : Si aucune indication n’est donnée, adopte un ton engageant et adapté au secteur (ex. : professionnel, dynamique, inspirant).

##Produit à Promouvoir :
- Objectif : Créé un post avec l'objectif de ${
      objectiveContext[formData.objective]
    }.
- Nom : ${selectedProduct.name}
- Solution : ${selectedProduct.solution}
- Prix : ${selectedProduct.price}€
- Benefits : ${selectedProduct.benefits}
- Audience : ${selectedProduct.audience}
- Site web: ${url}

##Consignes :
- Longueur : ${lengthGuide[formData.length]}
- Ton : ${toneGuide[formData.tone]}
- Inclure des hashtags : ${formData.includeHashtags ? "OUI" : "NON"}
- Inclure des emojis : ${formData.includeEmojis ? "OUI" : "NON"}
- Objectif principal : ${objectiveContext[formData.objective]}
${
  formData.includeHashtags
    ? "\nInclus des hashtags pertinents pour maximiser la portée."
    : ""
}
${
  formData.includeEmojis
    ? "\nUtilise des emojis appropriés pour rendre le post plus engageant."
    : ""
}

##Structure et Qualité :
#Rédige un contenu fluide, clair et impactant.
#Utilise un langage naturel et attrayant pour capter l’attention.
#Intègre des appels à l’action clairs pour inciter l’audience à réagir (cliquer, commenter, partager, réserver…).

##Format des Publications :
#Titre : Utilise le même titre accrocheur pour LinkedIn et Facebook.
#LinkedIn : Rédige un texte professionnel, mettant en avant l’innovation, la valeur ou l’expertise de l’entreprise.
#Facebook : Rédige une version plus accessible et conviviale, tout en conservant une approche professionnelle.

##Règles de Rédaction :
#Toujours utiliser « au sein de ${selectedProduct.name} ».
#Veille à ce que la publication soit structurée, engageante et impactante.
#Interdiction d’utiliser « chez ${
      selectedProduct.name
    } ». Si tu génères du texte, remplace systématiquement « chez » par « au sein de ».
#Mentionne le site web de l’entreprise avec un appel à l’action ${url}.

##Image Associée :
#Génère un prompt pour créer une image qui accompagnera la publication, en incluant une présence humaine (homme/femme).
#Propose un titre accrocheur pour l’image, court et cohérent avec la publication.

##Objectif : Assure-toi que chaque publication soit parfaitement optimisée pour maximiser l’engagement, la visibilité et l’attractivité de l’entreprise sur les réseaux sociaux.
        `;
  };

  const callClaude = async (prompt: string) => {
    const token = localStorage.getItem("token");
    console.log("Prompt RS :", prompt);

    const claudeRes = await api.post(
      "/api/generate-claude",
      { prompt },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const rawText = claudeRes.data?.content?.[0]?.text || "";
    console.log("Texte brut reçu de Claude :", rawText);
    // Stocke dans localStorage directement le JSON généré
    setTextGenerate(rawText);
    localStorage.setItem("generatedPost", rawText);

    return rawText;
  };

  const handleGeneratePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un produit",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const prompt = generatePrompt(selectedProduct, formData);
      const generatedContent = await callClaude(prompt);

      const newPost: GeneratedPost = {
        id: Date.now().toString(),
        productId: selectedProduct.id,
        formData,
        prompt,
        generatedContent,
        createdAt: new Date(),
      };

      setGeneratedPost(newPost);
      toast({
        title: "Post généré !",
        description: "Votre post a été créé avec succès",
      });
    } catch (error) {
      console.error("Error generating post:", error);
      toast({
        title: "Erreur",
        description:
          "Impossible de générer le post. Vérifiez votre clé API Claude.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copié !",
        description: "Le contenu a été copié dans le presse-papiers",
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le texte",
        variant: "destructive",
      });
    }
  };
  const handleSavePost = async () => {
    if (!generatedPost || !selectedProduct) {
      toast({
        title: "Erreur",
        description: "Aucun post généré ou produit sélectionné",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour sauvegarder",
          variant: "destructive",
        });
        return;
      }

      const postData = {
        is_edited: false,
        product_id: selectedProduct.id,
        content: textGenrate || generatedPost, // Utilise le texte généré
      };

      console.log("Envoi des données:", postData);

      const response = await api.post("/api/social-posts", postData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("response  : ", response);
      if (response.data.success) {
        // Ajouter le post sauvegardé (avec ID from API) à la liste
        setPosts((prev) => [response.data.data, ...prev]);

        toast({
          title: "Sauvegardé !",
          description: "Votre post a été sauvegardé avec succès",
        });

        // Reset states
        setGeneratedPost(null);
        setTextGenerate("");

        // Nettoyer le localStorage
        localStorage.removeItem("generatedPost");
      } else {
        throw new Error(response.data.message || "Erreur inconnue");
      }
    } catch (error) {
      console.error("Erreur détaillée:", error);

      let errorMessage = "Erreur lors de la sauvegarde du post";

      if (error.response?.data?.errors) {
        // Gestion des erreurs de validation
        errorMessage = Object.values(error.response.data.errors)
          .flat()
          .join(", ");
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const deletePost = async (postId: number): Promise<void> => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour supprimer un post",
          variant: "destructive",
        });
        return;
      }

      // Confirmation avant suppression
      if (
        !window.confirm(
          "Êtes-vous sûr de vouloir supprimer ce post ? Cette action est irréversible."
        )
      ) {
        return;
      }

      // Appel API vers ta route destroy
      const response = await api.delete(`/api/social-posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Mettre à jour l'état local - supprimer le post de la liste
        setPost((prev) => prev.filter((post) => post.id !== postId));

        toast({
          title: "Supprimé !",
          description: response.data.message || "Post supprimé avec succès",
        });
      } else {
        throw new Error(
          response.data.message || "Erreur lors de la suppression"
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Erreur détaillée:", error);

      let errorMessage = "Erreur lors de la suppression du post";

      // Gestion spécifique des erreurs basée sur ton API Laravel
      if (error.response?.status === 403) {
        errorMessage = "Non autorisé à supprimer ce post";
      } else if (error.response?.status === 404) {
        errorMessage = "Post introuvable";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const toggleExpanded = (postId: number) => {
    console.log("Toggle pour post ID:", postId);
    console.log("État actuel:", Array.from(expandedPosts));

    setExpandedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
        console.log("Post retiré, nouveau set:", Array.from(newSet));
      } else {
        newSet.add(postId);
        console.log("Post ajouté, nouveau set:", Array.from(newSet));
      }
      return newSet;
    });
  };

  // const platformLabels = {
  //     facebook: 'Facebook',
  //     instagram: 'Instagram',
  //     twitter: 'X (Twitter)',
  //     linkedin: 'LinkedIn',
  //     tiktok: 'TikTok'
  // };

  const objectiveLabels = {
    awareness: "Notoriété",
    engagement: "Engagement",
    conversion: "Conversion",
    traffic: "Trafic",
  };

  const lengthLabels = {
    short: "Court (< 100 mots)",
    medium: "Moyen (100-200 mots)",
    long: "Long (> 200 mots)",
  };

  const toneLabels = {
    professional: "Professionnel",
    casual: "Décontracté",
    enthusiastic: "Enthousiaste",
    educational: "Éducatif",
  };

  const [loading, setLoading] = useState(false);
  // 2. Fonction pour récupérer les posts de l'utilisateur
  const getMyPosts = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/api/my-social-posts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Selon la structure de ta réponse API
        const postsData = response.data.data || response.data.data;
        console.log(postsData);
        setPost(postsData);
      } else {
        throw new Error(response.data.message || "Erreur inconnue");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des posts:", error);
      throw error;
    }
  };
  // Fonction de rafraîchissement
  const refreshPosts = async () => {
    setLoading(true);
    await getMyPosts(); // Ta fonction existante
    setLoading(false);
  };

  const handleSaveEdit = async (postId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour modifier",
          variant: "destructive",
        });
        return;
      }

      const response = await api.put(
        `/api/social-posts/${postId}`,
        { content: editedContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        // Mettre à jour l'état local
        setPost((prev) =>
          prev.map((post) =>
            post.id === postId
              ? { ...post, content: editedContent, is_edited: true }
              : post
          )
        );

        toast({
          title: "Modifié !",
          description: "Votre post a été modifié avec succès",
        });

        // Reset editing state
        setEditingPostId(null);
        setEditedContent("");
      } else {
        throw new Error(response.data.message || "Erreur inconnue");
      }
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le post",
        variant: "destructive",
      });
    }
  };
  return (
    <div>
      {showNoProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
                Aucun produit trouvé
              </h2>

              <p className="text-gray-600 text-center mb-6">
                Commencez par créer votre premier produit pour générer des posts
                sociaux attractifs.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleGenerateProduct}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition duration-200 shadow-lg"
                >
                  Créer un produit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 mt-10">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                <Share2 className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Générateur de Posts Sociaux
              </h1>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Créez des posts engageants pour vos réseaux sociaux en quelques
              clics. Sélectionnez un produit, personnalisez vos paramètres et
              générez directement votre post avec Claude.
            </p>
          </div>

          <Tabs defaultValue="generator" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger
                value="generator"
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Générateur
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Historique
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generator" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Product Selector */}
                <div className="h-[500px] overflow-y-auto pr-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Sélectionner un produit
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {ProductList.map((product) => (
                          <Button
                            key={product.id}
                            variant={
                              selectedProduct?.id === product.id
                                ? "default"
                                : "outline"
                            }
                            className="w-full justify-between"
                            onClick={() => handleProductSelect(product)}
                          >
                            <span>{product.name}</span>
                            {selectedProduct?.id === product.id && (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Post Form */}
                <div>
                  <Card className="h-fit">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
                      <CardTitle className="flex items-center gap-2">
                        <Wand2 className="h-5 w-5" />
                        Générateur de Post
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="p-6">
                      <form onSubmit={handleGeneratePost} className="space-y-6">
                        {selectedProduct && (
                          <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                            <p className="text-sm font-medium text-blue-800">
                              Produit sélectionné: {selectedProduct.name}
                            </p>
                          </div>
                        )}

                        <div className="grid gap-4">
                          <div>
                            <Label htmlFor="objective">Objectif du post</Label>
                            <Select
                              value={formData.objective}
                              onValueChange={(
                                value:
                                  | "awareness"
                                  | "engagement"
                                  | "conversion"
                                  | "traffic"
                              ) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  objective: value,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(objectiveLabels).map(
                                  ([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                      {label}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* <div>
                                                    <Label htmlFor="platform">Plateforme</Label>
                                                    <Select value={formData.platform} onValueChange={(value: any) =>
                                                        setFormData(prev => ({ ...prev, platform: value }))
                                                    }>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Object.entries(platformLabels).map(([key, label]) => (
                                                                <SelectItem key={key} value={key}>{label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div> */}

                          <div>
                            <Label htmlFor="length">Longueur du post</Label>
                            <Select
                              value={formData.length}
                              onValueChange={(
                                value: "short" | "medium" | "long"
                              ) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  length: value,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(lengthLabels).map(
                                  ([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                      {label}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="tone">Ton du message</Label>
                            <Select
                              value={formData.tone}
                              onValueChange={(
                                value:
                                  | "professional"
                                  | "casual"
                                  | "enthusiastic"
                                  | "educational"
                              ) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  tone: value,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(toneLabels).map(
                                  ([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                      {label}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="customUrl">
                              URL personnalisée (optionnel)
                            </Label>
                            <Input
                              id="customUrl"
                              value={formData.customUrl}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  customUrl: e.target.value,
                                }))
                              }
                              placeholder="https://votre-url-personnalisee.com"
                            />
                          </div>

                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="hashtags"
                                  checked={formData.includeHashtags}
                                  onCheckedChange={(checked) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      includeHashtags: checked,
                                    }))
                                  }
                                />
                                <Label htmlFor="hashtags">
                                  Inclure des hashtags
                                </Label>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="emojis"
                                  checked={formData.includeEmojis}
                                  onCheckedChange={(checked) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      includeEmojis: checked,
                                    }))
                                  }
                                />
                                <Label htmlFor="emojis">
                                  Inclure des emojis
                                </Label>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                          disabled={!selectedProduct || isGenerating}
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Génération en cours...
                            </>
                          ) : (
                            <>
                              <Wand2 className="h-4 w-4 mr-2" />
                              Générer le post
                            </>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>

                {/* Generated Post Display */}
                <div>
                  {generatedPost && (
                    <div className="space-y-4">
                      <Card>
                        <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-t-lg">
                          <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            Post généré
                          </CardTitle>
                        </CardHeader>

                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                              <p className="text-sm whitespace-pre-wrap">
                                {generatedPost.generatedContent}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={() =>
                                  copyToClipboard(
                                    generatedPost.generatedContent
                                  )
                                }
                                variant="outline"
                                className="flex-1"
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Copier le post
                              </Button>

                              <Button
                                onClick={handleSavePost}
                                className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
                              >
                                <Save className="h-4 w-4 mr-2" />
                                Sauvegarder
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="history" className="space-y-6">
              {/* Post History */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Historique des posts ({post.length})
                    </h3>
                    <p className="text-sm text-gray-500">
                      {post.filter((p) => p.is_edited).length} posts modifiés
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshPosts}
                      disabled={loading}
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${
                          loading ? "animate-spin" : ""
                        }`}
                      />
                      Actualiser
                    </Button>
                  </div>
                </div>

                {loading ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Chargement de l'historique...
                      </p>
                    </CardContent>
                  </Card>
                ) : post.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Aucun post sauvegardé pour le moment</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={refreshPosts}
                      >
                        Actualiser
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {/* Statistiques rapides */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <Card className="text-center p-3">
                        <div className="text-2xl font-bold text-blue-600">
                          {post.length}
                        </div>
                        <div className="text-sm text-gray-500">Total</div>
                      </Card>
                      <Card className="text-center p-3">
                        <div className="text-2xl font-bold text-green-600">
                          {post.filter((p) => p.is_edited).length}
                        </div>
                        <div className="text-sm text-gray-500">Modifiés</div>
                      </Card>
                      <Card className="text-center p-3">
                        <div className="text-2xl font-bold text-purple-600">
                          {new Set(post.map((p) => p.product.id)).size}
                        </div>
                        <div className="text-sm text-gray-500">Produits</div>
                      </Card>
                    </div>

                    {/* Liste des posts */}
                    {post.map((p) => {
                      const isExpanded = expandedPosts.has(p.id);
                      const isRecentlyCreated =
                        new Date(p.created_at) >
                        new Date(Date.now() - 24 * 60 * 60 * 1000);

                      return (
                        <Collapsible
                          key={p.id}
                          open={isExpanded}
                          onOpenChange={() => toggleExpanded(p.id)}
                        >
                          <Card
                            className={
                              isRecentlyCreated
                                ? "border-l-4 border-l-green-400"
                                : ""
                            }
                          >
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-start">
                                {/* LEFT SIDE INFO */}
                                <div className="space-y-2 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge
                                      variant="outline"
                                      className="flex items-center gap-1"
                                    >
                                      <Hash className="h-3 w-3" />
                                      {p.id}
                                    </Badge>

                                    <Badge
                                      variant="secondary"
                                      className="flex items-center gap-1"
                                    >
                                      <Package className="h-3 w-3" />
                                      {p.product.name}
                                    </Badge>

                                    {p.is_edited && (
                                      <Badge
                                        variant="outline"
                                        className="bg-yellow-50 text-yellow-700"
                                      >
                                        <Edit className="h-3 w-3 mr-1" />
                                        Modifié
                                      </Badge>
                                    )}

                                    {isRecentlyCreated && (
                                      <Badge
                                        variant="outline"
                                        className="bg-green-50 text-green-700"
                                      >
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        Nouveau
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(p.created_at).toLocaleDateString(
                                      "fr-FR",
                                      {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )}

                                    {p.created_at !== p.updated_at && (
                                      <>
                                        <span className="mx-1">•</span>
                                        <Edit className="h-3 w-3" />
                                        Modifié le{" "}
                                        {new Date(
                                          p.updated_at
                                        ).toLocaleDateString("fr-FR")}
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* ACTION BUTTONS */}
                                <div className="flex gap-2">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            copyToClipboard(p.content)
                                          }
                                        >
                                          <Copy className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Copier le contenu</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  {/* 👁 Eye button = CollapsibleTrigger */}
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <CollapsibleTrigger asChild>
                                          <Button variant="outline" size="sm">
                                            {isExpanded ? (
                                              <EyeOff className="h-4 w-4" />
                                            ) : (
                                              <Eye className="h-4 w-4" />
                                            )}
                                          </Button>
                                        </CollapsibleTrigger>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>
                                          {isExpanded ? "Masquer" : "Afficher"}{" "}
                                          le contenu
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            setEditingPostId(p.id);
                                            setEditedContent(p.content);
                                          }}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Modifier le post</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => deletePost(p.id)}
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Supprimer le post</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                            </CardHeader>

                            {/* ✅ CollapsibleContent INSIDE the same Collapsible */}
                            <CollapsibleContent>
                              <CardContent className="pt-0 space-y-4">
                                {editingPostId === p.id ? (
                                  <div>
                                    <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                                      <Edit className="h-4 w-4" />
                                      Modifier le post :
                                    </h4>
                                    <Textarea
                                      value={editedContent}
                                      onChange={(e) =>
                                        setEditedContent(e.target.value)
                                      }
                                      className="min-h-[200px] p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400"
                                      placeholder="Modifiez le contenu de votre post..."
                                    />
                                    <div className="flex gap-2 mt-4">
                                      <Button
                                        onClick={() => handleSaveEdit(p.id)}
                                        className="bg-green-500 hover:bg-green-600"
                                        size="sm"
                                      >
                                        <Save className="h-4 w-4 mr-2" />
                                        Sauvegarder
                                      </Button>
                                      <Button
                                        onClick={() => {
                                          setEditingPostId(null);
                                          setEditedContent("");
                                        }}
                                        variant="outline"
                                        size="sm"
                                      >
                                        Annuler
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div>
                                      <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4" />
                                        Contenu du post :
                                      </h4>
                                      <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                          {p.content}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() =>
                                          copyToClipboard(p.content)
                                        }
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                      >
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copier le contenu
                                      </Button>

                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          navigator.share?.({
                                            title: `Post pour ${p.product.name}`,
                                            text: p.content,
                                          })
                                        }
                                        className="flex-1"
                                      >
                                        <Share className="h-4 w-4 mr-2" />
                                        Partager
                                      </Button>
                                    </div>

                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                      <span>
                                        Créé par:{" "}
                                        {p.user?.name || "Utilisateur"}
                                      </span>
                                      <span>{p.content.length} caractères</span>
                                    </div>
                                  </>
                                )}
                              </CardContent>
                            </CollapsibleContent>
                          </Card>
                        </Collapsible>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <footer className="fixed bottom-0 w-full bg-slate-900 text-slate-400 py-2 mt-4">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 Brand&Sell V1.1 | Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default PostsGenerator;
