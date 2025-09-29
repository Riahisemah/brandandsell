import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Copy, ArrowRight, ArrowLeft, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import TemplateSelector from "@/components/TemplateSelector";
import { templates } from "@/templates";
import { Template } from "@/types/templates";
import { History } from "lucide-react";
import api from "@/lib/axios";

interface ProductInfo {
  id: number;
  name: string;

}


interface Product {
  id: number;
  info_id: string;
  user_id: number;
  json: Record<string, any>; // objet clé/valeur
  template_id: number;
  info?: any;

}


let globalUserId: number | null = null;
let globalInfoId: number | null = null;
let parsed: any;


const token = localStorage.getItem("token");

const ProductGenerator = () => {


  const navigate = useNavigate();
  const [productInfo, setProductInfo] = useState({
    name: "",
    goal: "obtenir des leads",
    price: "",
    audience: "",
    awarenessLevel: "inconscient du problème",
    problems: "",
    solution: "",
    benefits: "",
    usp: "",
    testimonials: "",
    features: "",
    guarantee: "",
    cta: "",
    tone: "professionnelle",
    references: "",
    mainkeyword: "",
    secondarykeywords: "",
    location: "",
    brand: "",
    primaryColor: "",
    secondaryColor: "",
    accentColor: "",
    backgroundColor: "",
    textColor: "",
  });

  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [generatedJSON, setGeneratedJSON] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [showProducts, setShowProducts] = useState(false);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  const sections = [
    { id: "offre", title: "Informations sur l'offre" },
    { id: "public", title: "Public cible" },
    { id: "probleme", title: "Problème & solution" },
    { id: "arguments", title: "Arguments & contenu" },
    { id: "style", title: "Style & inspiration" },
    { id: "seo", title: "SEO" },
  ];


  const handleShowProducts = async () => {
    if (showProducts) {
      // si déjà ouvert → on masque
      setShowProducts(false);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get("/api/products/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts(res.data);
      setShowProducts(true);
    } catch (err) {
      console.error("Erreur lors du fetch :", err);
    } finally {
      setLoading(false);
    }
  };

  const loadProduct = (product: Product) => {
    const templateId = product.template_id;
    const jsonData = product.json || {};

    // Stocker directement dans le localStorage
    localStorage.setItem('templateData', JSON.stringify({
      product: product,
      template_id: templateId,
      json: jsonData,
      data: jsonData, // valeurs originales pour toggle
    }));

    // Naviguer vers la page du template
    navigate('/template-generator');

    toast({
      title: "Produit chargé",
      description: `Le produit "${product.info.name}" a été stocké et vous êtes redirigé.`,
    });
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name) => (value) => {
    setProductInfo((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (currentStep < sections.length - 1) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const submitForm = async () => {
    const requiredFields = [
      "name", "goal", "audience", "awarenessLevel", "problems", "solution",
      "benefits", "usp", "features", "cta", "tone", "mainkeyword"
    ];
    const missing = requiredFields.filter((f) => !productInfo[f]);
    if (missing.length > 0) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);

      // 🔹 Étape 1 : Générer le prompt depuis ton backend
      const res = await api.post(
        "/api/product-info",
        productInfo,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("ProductInfo :", res.data);

      // Vérification stricte
      if (!res.data.product) {
        toast({
          title: "Erreur backend",
          description: "Impossible de récupérer le produit généré.",
          variant: "destructive",
        });
        return; // stop si product est null
      }

      const prompt = res.data.generated_prompt;

      globalUserId = res.data.product.user_id;
      globalInfoId = res.data.product.id;



      // console.log(prompt);

      if (!prompt) throw new Error("Pas de prompt retourné.");

      const claudeRes = await api.post(
        "/api/generate-claude",
        { prompt },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const rawText = claudeRes.data?.content?.[0]?.text || '';
      console.log("Texte brut reçu de Claude :", rawText);
      // Stocke dans localStorage directement le JSON généré
      localStorage.setItem("generatedJSON", rawText);

      parsed = JSON.parse(rawText);

      console.log("Product1 :", {
        user_id: globalUserId,
        info_id: globalInfoId,
        json: parsed,
      });

      setGeneratedPrompt(prompt);
      setGeneratedJSON(parsed);
      setShowTemplateSelector(true);

    }



    finally {
      setIsGenerating(false);
    }

  };


  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
  };

  const applyJSONToTemplate = async () => {
    console.log("applyJSONToTemplate called");

    if (!selectedTemplate || !generatedJSON) {
      toast({
        title: "Données manquantes",
        description: "Sélectionnez un template.",
        variant: "destructive",
      });
      return;
    }



    try {
      const parsed = typeof generatedJSON === "string" ? JSON.parse(generatedJSON) : generatedJSON;
      console.log("Payload envoyé :", {
        user_id: globalUserId,
        info_id: globalInfoId,
        template_id: selectedTemplate.id,
        json: parsed,
      });

      const productRes = await api.post(
        "/api/products",
        {
          user_id: globalUserId,
          info_id: globalInfoId,
          template_id: selectedTemplate.id,
          json: parsed,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Produit créé :", productRes.data);
      // Sauvegarder localStorage
      localStorage.setItem(
        "templateData",
        JSON.stringify({
          template_id: selectedTemplate.id,
          data: generatedJSON,
          product: productRes.data.product.id
        })
      );

      navigate("/template-generator"); // si tu veux rediriger après
    } catch (err: any) {
      if (err.response) {
        console.error("Erreur Laravel :", err.response.data);
      } else {
        console.error(err);
      }
    }
  };



  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast({ title: "Copié", description: "Prompt copié dans le presse-papier." });
  };

  const ProgressIndicator = () => (
    <div className="mb-6">
      <div className="relative h-2 bg-slate-200 rounded-full mb-3">
        <div className="absolute top-0 left-0 h-full bg-emerald-600 rounded-full transition-all duration-300" style={{ width: `${(currentStep / (sections.length - 1)) * 100}%` }} />
        <div className="absolute top-0 left-0 w-full h-full flex justify-between">
          {sections.map((_, i) => (
            <div key={i} className={`w-4 h-4 rounded-full -mt-1 border-2 border-white ${i <= currentStep ? "bg-emerald-600" : "bg-slate-300"}`} onClick={() => setCurrentStep(i)} />
          ))}
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      // Étape 1: Informations sur l'offre
      case 0:
        return (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle>Informations sur l'offre</CardTitle>
              <CardDescription>Étape 1 sur {sections.length}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'offre / service *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Entrez le nom de votre offre"
                  value={productInfo.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">Objectif principal de la page *</Label>
                <Select
                  value={productInfo.goal}
                  onValueChange={handleSelectChange("goal")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un objectif" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="obtenir des leads">Obtenir des leads</SelectItem>
                    <SelectItem value="vendre un produit">Vendre un produit</SelectItem>
                    <SelectItem value="réserver un appel">Réserver un appel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Prix (facultatif)</Label>
                <Input
                  id="price"
                  name="price"
                  placeholder="Ex: 97€, 997€, etc."
                  value={productInfo.price}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end pt-4">
              <Button onClick={nextStep} className="bg-slate-800 hover:bg-slate-900">
                Suivant <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        );

      // Étape 2: Public cible
      case 1:
        return (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle>Public cible</CardTitle>
              <CardDescription>Étape 2 sur {sections.length}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="audience">Public cible (âge, profession, etc.) *</Label>
                <Textarea
                  id="audience"
                  name="audience"
                  placeholder="Décrivez votre public cible"
                  value={productInfo.audience}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="awarenessLevel">Niveau de conscience du client *</Label>
                <Select
                  value={productInfo.awarenessLevel}
                  onValueChange={handleSelectChange("awarenessLevel")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inconscient du problème">Ne connaît pas le problème</SelectItem>
                    <SelectItem value="conscient du problème">Conscient du problème</SelectItem>
                    <SelectItem value="cherche une solution">Cherche une solution</SelectItem>
                    <SelectItem value="prêt à acheter">Prêt à acheter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-4">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Précédent
              </Button>
              <Button onClick={nextStep} className="bg-slate-800 hover:bg-slate-900">
                Suivant <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        );

      // Étape 3: Problème & solution
      case 2:
        return (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle>Problème & solution</CardTitle>
              <CardDescription>Étape 3 sur {sections.length}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="problems">Problèmes rencontrés *</Label>
                <Textarea
                  id="problems"
                  name="problems"
                  placeholder="Décrivez les problèmes que rencontrent vos clients"
                  value={productInfo.problems}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="solution">Solution apportée par votre offre *</Label>
                <Textarea
                  id="solution"
                  name="solution"
                  placeholder="Décrivez comment votre offre résout ces problèmes"
                  value={productInfo.solution}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="benefits">Bénéfices principaux *</Label>
                <Textarea
                  id="benefits"
                  name="benefits"
                  placeholder="Listez les principaux bénéfices de votre offre"
                  value={productInfo.benefits}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usp">Ce qui rend votre offre unique (USP) *</Label>
                <Textarea
                  id="usp"
                  name="usp"
                  placeholder="Qu'est-ce qui différencie votre offre de la concurrence"
                  value={productInfo.usp}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-4">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Précédent
              </Button>
              <Button onClick={nextStep} className="bg-slate-800 hover:bg-slate-900">
                Suivant <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        );

      // Étape 4: Arguments & contenu
      case 3:
        return (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle>Arguments & contenu</CardTitle>
              <CardDescription>Étape 4 sur {sections.length}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testimonials">Témoignages clients (ou indiquez "générer")</Label>
                <Textarea
                  id="testimonials"
                  name="testimonials"
                  placeholder="Ajoutez des témoignages ou écrivez 'générer'"
                  value={productInfo.testimonials}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="features">Fonctionnalités / services inclus *</Label>
                <Textarea
                  id="features"
                  name="features"
                  placeholder="Listez les fonctionnalités ou services inclus dans votre offre"
                  value={productInfo.features}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guarantee">Garantie ou offre spéciale (facultatif)</Label>
                <Input
                  id="guarantee"
                  name="guarantee"
                  placeholder="Ex: Garantie satisfait ou remboursé 30 jours"
                  value={productInfo.guarantee}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cta">Appel à l'action (CTA) *</Label>
                <Input
                  id="cta"
                  name="cta"
                  placeholder="Ex: Réservez votre place maintenant"
                  value={productInfo.cta}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-4">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Précédent
              </Button>
              <Button onClick={nextStep} className="bg-slate-800 hover:bg-slate-900">
                Suivant <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        );

      // Étape 5: Style & inspiration
      case 4:
        return (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle>Style & inspiration</CardTitle>
              <CardDescription>Étape 5 sur {sections.length}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tone">Tonalité souhaitée *</Label>
                <Select
                  value={productInfo.tone}
                  onValueChange={handleSelectChange("tone")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une tonalité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professionnelle">Professionnelle</SelectItem>
                    <SelectItem value="engageante">Engageante</SelectItem>
                    <SelectItem value="fun">Fun</SelectItem>
                    <SelectItem value="experte">Experte</SelectItem>
                    <SelectItem value="simple et directe">Simple et directe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="references">Références / concurrents inspirants</Label>
                <Textarea
                  id="references"
                  name="references"
                  placeholder="Mentionnez des exemples ou concurrents qui vous inspirent"
                  value={productInfo.references}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-4">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Précédent
              </Button>
              <Button onClick={nextStep} className="bg-slate-800 hover:bg-slate-900">
                Suivant <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        );

      // Étape 6: SEO & Branding (dernière étape)
      case 5:
        return (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle>SEO & Branding</CardTitle>
              <CardDescription>Étape finale</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mainkeyword">Mot-clé principal à cibler *</Label>
                <Input
                  id="mainkeyword"
                  name="mainkeyword"
                  placeholder="Ex: tunnel de vente automation CRM"
                  value={productInfo.mainkeyword}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondarykeywords">Autres mots-clés secondaires (facultatif)</Label>
                <Textarea
                  id="secondarykeywords"
                  name="secondarykeywords"
                  placeholder="Listez d'autres mots-clés pertinents"
                  value={productInfo.secondarykeywords}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Localisation (si besoin)</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Ex: Paris, France, etc."
                  value={productInfo.location}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Nom de marque ou de domaine à mettre en avant</Label>
                <Input
                  id="brand"
                  name="brand"
                  placeholder="Ex: votresite.com"
                  value={productInfo.brand}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Couleur Principale</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="primaryColor"
                      name="primaryColor"
                      value={productInfo.primaryColor}
                      onChange={handleInputChange}
                      className="w-16 h-10 p-1 border rounded cursor-pointer"
                    />
                    <Input
                      value={productInfo.primaryColor}
                      onChange={handleInputChange}
                      name="primaryColor"
                      placeholder="#10b981"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Couleur Secondaire</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="secondaryColor"
                      name="secondaryColor"
                      value={productInfo.secondaryColor}
                      onChange={handleInputChange}
                      className="w-16 h-10 p-1 border rounded cursor-pointer"
                    />
                    <Input
                      value={productInfo.secondaryColor}
                      onChange={handleInputChange}
                      name="secondaryColor"
                      placeholder="#059669"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accentColor">Couleur d'Accent</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="accentColor"
                      name="accentColor"
                      value={productInfo.accentColor}
                      onChange={handleInputChange}
                      className="w-16 h-10 p-1 border rounded cursor-pointer"
                    />
                    <Input
                      value={productInfo.accentColor}
                      onChange={handleInputChange}
                      name="accentColor"
                      placeholder="#f59e0b"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backgroundColor">Couleur de Fond</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="backgroundColor"
                      name="backgroundColor"
                      value={productInfo.backgroundColor}
                      onChange={handleInputChange}
                      className="w-16 h-10 p-1 border rounded cursor-pointer"
                    />
                    <Input
                      value={productInfo.backgroundColor}
                      onChange={handleInputChange}
                      name="backgroundColor"
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-4">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Précédent
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={submitForm}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  "Génération en cours..."
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Générer le Prompt
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        );

      default:
        return null;
    }
  };

  const getSectionIdForField = (field) => {
    if (["name", "goal", "price"].includes(field)) return "offre";
    if (["audience", "awarenessLevel"].includes(field)) return "public";
    if (["problems", "solution", "benefits", "usp"].includes(field)) return "probleme";
    if (["features", "testimonials", "guarantee", "cta"].includes(field)) return "arguments";
    if (["tone", "references"].includes(field)) return "style";
    if (["branding", "seo"].includes(field)) return "seo";
  };

  const getSelectOptions = (field) => {
    if (field === "goal") return ["obtenir des leads", "vendre un produit", "réserver un appel"];
    if (field === "awarenessLevel") return ["inconscient du problème", "conscient du problème", "cherche une solution", "prêt à acheter"];
    if (field === "tone") return ["professionnelle", "engageante", "fun", "experte", "simple et directe"];
    return [];
  };

  if (showTemplateSelector) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <div className="mb-6 mt-20">
            <h1 className="text-3xl font-bold text-slate-900">Choisissez un Template</h1>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 mb-6">
              <TemplateSelector templates={templates} onSelectTemplate={handleTemplateSelect} selectedTemplateId={selectedTemplate?.id} />
            </div>

            <div className="space-y-6">
              {/* <Card>
                <CardHeader><CardTitle>Prompt Généré</CardTitle></CardHeader>
                <CardContent>
                  <div className="bg-slate-50 rounded-md p-4 max-h-60 overflow-auto text-sm">{generatedPrompt}</div>
                  <Button onClick={copyToClipboard} className="w-full mt-4" variant="outline"><Copy className="mr-2 h-4 w-4" /> Copier</Button>
                </CardContent>
              </Card> */}

              {/* <Card>
                <CardHeader><CardTitle>JSON Généré</CardTitle></CardHeader>
                <CardContent>
                  <Textarea placeholder="Collez le JSON ici..." value={generatedJSON ? JSON.stringify(generatedJSON, null, 2) : ''} onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setGeneratedJSON(parsed);
                    } catch (_) { }
                  }} rows={10} className="font-mono text-xs" />
                  <Button onClick={applyJSONToTemplate} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700" disabled={!selectedTemplate || !generatedJSON}><ExternalLink className="mr-2 h-4 w-4" /> Appliquer</Button>
                </CardContent>
              </Card> */}
              <Button onClick={applyJSONToTemplate} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700" disabled={!selectedTemplate || !generatedJSON}><ExternalLink className="mr-2 h-4 w-4" /> Appliquer</Button>

              <Button variant="outline" onClick={() => setShowTemplateSelector(false)} className="w-full "><ArrowLeft className="mr-2 h-4 w-4" /> Retour</Button>
            </div>
          </div>
        </main>
        <footer className="fixed bottom-0 w-full bg-slate-900 text-slate-400 py-2 mt-4">
          <div className="container mx-auto px-4 text-center">
            <p>© 2025 Brand&Sell V1.1 | Tous droits réservés.</p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 mt-20 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Générateur de Tunnel de Vente
            </h1>
            <p className="text-slate-600 mt-2">
              Créez des prompts personnalisés avec application sur vos templates
            </p>
          </div>

          <Button onClick={handleShowProducts} className=" bg-slate-600 hover:bg-slate-800 flex items-center gap-2">
            <History className="h-4 w-4" /> Historique
          </Button>
        </div>

        {loading && <p className="mt-4 mb-4 text-gray-500">Chargement...</p>}

        {showProducts && (
          <div className="mt-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Produits de l’utilisateur</h2>

            {products.length === 0 ? (
              <p>Aucun produit trouvé.</p>
            ) : (
              <ul className="space-y-3 max-h-50 overflow-y-auto pr-2">
                {products.map((product) => (
                  <li
                    key={product.id}
                    className="border p-4 rounded-lg shadow bg-white cursor-pointer hover:bg-slate-100 transition"
                    onClick={() => loadProduct(product)}
                  >
                    <h3 className="text-lg font-semibold">{product.info.name}</h3>
                  </li>

                ))}
              </ul>

            )}
          </div>
        )}


        <div className="grid  gap-6 mb-10">
          <div className="space-y-6">
            <ProgressIndicator />
            {renderStepContent()}
          </div>

          {/* <div className="">
            <Card className={`shadow-md ${!generatedPrompt ? "opacity-70" : ""}`}>
              <CardHeader className="relative">
                <CardTitle>Prompt Généré</CardTitle>
                <CardDescription>Votre prompt personnalisé s'affichera ici</CardDescription>
                {generatedPrompt && <div className="absolute top-2 right-2"><Button size="sm" variant="outline" onClick={copyToClipboard}><Copy className="mr-1 h-4 w-4" /> Copier</Button></div>}
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 rounded-md p-4 min-h-[300px] border border-slate-200 whitespace-pre-wrap">
                  {generatedPrompt || <p className="text-slate-500 italic">Remplissez le formulaire et cliquez sur "Générer le Prompt"</p>}
                </div>
              </CardContent>
            </Card>
          </div> */}
        </div>
      </main>
      <footer className="fixed bottom-0 w-full bg-slate-900 text-slate-400 py-2 mt-4">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 Brand&Sell V1.1 | Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default ProductGenerator;
