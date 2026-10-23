import { useEffect, useMemo, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { useAuth } from "./auth/AuthContext";
import AuthScreen from "./auth/AuthScreen";
import {
  criarLivro,
  lerTodosOsLivros,
  atualizarLivro,
  deletarLivro,
  lerCategorias,
  inscreverAMudancas,
  desinscreverDeMudancas
} from "./services/crudService";
import { deleteBookImage, uploadBookImage } from "./services/photoStorageService";

const CSS = [
  ":root { color-scheme: dark; }",
  "* { box-sizing: border-box; }",
  "html { scroll-behavior: smooth; }",
  "body { margin: 0; background: #1B120D; color: #F5EDE1; font-family: Arial, sans-serif; }",
  "button, input { font: inherit; }",
  "button { cursor: pointer; }",

  ".app { min-height: 100vh; background: #1B120D; }",

  ".container { width: min(1200px, calc(100% - 40px)); margin: 0 auto; }",

  ".navbar { position: sticky; top: 0; z-index: 50; height: 80px; background: rgba(27,18,13,.96); border-bottom: 1px solid #3A281D; backdrop-filter: blur(10px); }",

  ".nav-inner { height: 100%; display: flex; align-items: center; justify-content: space-between; gap: 20px; }",

  ".logo { color: #F5EDE1; text-decoration: none; font-family: Georgia, serif; font-size: 28px; }",

  ".logo span { margin-left: 8px; color: #B8863B; font-family: monospace; font-size: 9px; letter-spacing: 3px; }",

  ".nav-links { display: flex; gap: 30px; }",

  ".nav-links a { color: #D8C8B8; text-decoration: none; font-size: 14px; }",

  ".nav-links a:hover { color: #FFFFFF; }",

  ".nav-actions { display: flex; align-items: center; gap: 10px; }",

  ".auth-trigger { min-height: 40px; padding: 0 14px; border: 1px solid #65462F; border-radius: 4px; background: transparent; color: #F5EDE1; }",

  ".auth-profile { display: flex; align-items: center; gap: 9px; color: #D8C8B8; font-size: 12px; }",

  ".auth-avatar { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; background: #65462F; }",

  ".auth-signout { padding: 7px 9px; border: 0; background: transparent; color: #D9A84E; font-size: 12px; }",

  ".mobile-account { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #493327; color: #D8C8B8; font-size: 13px; }",

  ".mobile-account button { border: 0; background: transparent; color: #D9A84E; }",

  ".icon-button { width: 40px; height: 40px; border: 1px solid #65462F; border-radius: 50%; background: transparent; color: #F5EDE1; }",

  ".cart-button { height: 40px; padding: 0 16px; border: 0; border-radius: 22px; background: #B8863B; color: #1B120D; font-weight: bold; }",

  ".cart-number { display: inline-grid; place-items: center; width: 20px; height: 20px; margin-left: 6px; border-radius: 50%; background: #1B120D; color: #F5EDE1; font-size: 11px; }",

  ".mobile-menu { display: none; position: absolute; top: 80px; left: 0; right: 0; padding: 20px; background: #241710; border-bottom: 1px solid #65462F; }",

  ".mobile-menu.open { display: block; }",

  ".mobile-menu a { display: block; padding: 12px 0; color: #F5EDE1; text-decoration: none; }",

  ".hero { padding: 90px 0 70px; }",

  ".hero-grid { display: grid; grid-template-columns: 1.1fr .9fr; gap: 50px; align-items: center; }",

  ".eyebrow { color: #B8863B; font-family: monospace; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; }",

  ".hero h1 { margin: 15px 0 20px; font-family: Georgia, serif; font-size: clamp(50px, 7vw, 88px); line-height: .95; font-weight: 400; }",

  ".hero p { max-width: 520px; color: #B8A79A; line-height: 1.7; }",

  ".hero-button { display: inline-block; margin-top: 20px; padding: 14px 22px; border-radius: 4px; background: #F5EDE1; color: #1B120D; text-decoration: none; font-weight: bold; }",

  ".image-actions { display: flex; flex-wrap: wrap; gap: 10px; }",

  ".image-preview { width: 140px; height: 180px; margin-top: 12px; border: 1px solid #65462F; border-radius: 6px; object-fit: cover; }",

  ".form-help { margin: 8px 0 0; color: #A99383; font-size: 12px; }",

  ".form-error { margin: 8px 0 0; color: #F2A69A; font-size: 12px; }",

  ".shelf { height: 300px; display: flex; align-items: end; gap: 7px; padding: 15px; border-bottom: 7px solid #5C3A28; border-radius: 6px; background: #241710; }",

  ".spine { flex: 1; min-width: 0; display: flex; align-items: center; justify-content: center; padding: 8px; border-radius: 4px 4px 0 0; background: #63432E; color: #F5EDE1; writing-mode: vertical-rl; cursor: pointer; transition: .3s; }",

  ".spine:hover { transform: translateY(-15px) rotate(-2deg); filter: brightness(1.15); }",

  ".section { padding: 80px 0; }",

  ".section-head { display: flex; justify-content: space-between; align-items: end; gap: 30px; margin-bottom: 35px; }",

  ".section-head h2 { margin: 10px 0 0; font-family: Georgia, serif; font-size: clamp(40px, 5vw, 60px); font-weight: 400; }",

  ".section-description { max-width: 390px; color: #A99383; line-height: 1.6; }",

  ".cloud-status { margin-bottom: 30px; padding: 15px 18px; border: 1px solid #65462F; border-radius: 8px; background: #241A14; color: #D9A84E; font-family: monospace; font-size: 12px; }",

  ".cloud-error { border-color: #8B3A2E; color: #F2A69A; }",

  ".book-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 25px; }",

  ".book-card { min-width: 0; }",

  ".book-cover { position: relative; aspect-ratio: 3 / 4; overflow: hidden; margin-bottom: 15px; border-radius: 6px; background: #3A281D; }",

  ".book-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }",

  ".book-overlay { position: absolute; inset: 0; display: flex; align-items: end; padding: 18px; background: linear-gradient(transparent 35%, rgba(0,0,0,.9)); }",

  ".book-title-cover { color: #FFFFFF; font-family: Georgia, serif; font-size: 18px; }",

  ".book-tag { position: absolute; top: 12px; left: 12px; padding: 6px 9px; border-radius: 20px; background: rgba(27,18,13,.9); color: #D9A84E; font-family: monospace; font-size: 9px; text-transform: uppercase; }",

  ".add-button { position: absolute; right: 12px; bottom: 12px; width: 38px; height: 38px; border: 0; border-radius: 50%; background: #F5EDE1; color: #1B120D; font-size: 22px; opacity: 0; transition: .2s; }",

  ".book-cover:hover .add-button { opacity: 1; }",

  ".book-name { margin: 0; color: #F5EDE1; font-size: 15px; }",

  ".book-author { margin: 5px 0 0; color: #947F70; font-size: 12px; }",

  ".book-price { margin: 9px 0 0; color: #D9A84E; font-family: monospace; font-size: 13px; }",

  ".tabs { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }",

  ".tab { padding: 10px 17px; border: 1px solid #65462F; border-radius: 25px; background: transparent; color: #D8C8B8; }",

  ".tab.active { background: #F5EDE1; color: #1B120D; }",

  ".catalog-list { overflow: hidden; border-radius: 8px; }",

  ".catalog-row { display: flex; justify-content: space-between; gap: 20px; padding: 20px; background: #F5EDE1; color: #241710; border-bottom: 1px solid #D7C9B9; }",

  ".history { background: #241710; }",

  ".history-text { max-width: 800px; color: #B8A79A; line-height: 1.8; font-size: 18px; }",

  ".newsletter { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; align-items: center; }",

  ".newsletter h2 { margin: 10px 0; font-family: Georgia, serif; font-size: 50px; font-weight: 400; }",

  ".newsletter p { color: #A99383; line-height: 1.7; }",

  ".newsletter-form { display: flex; gap: 10px; }",

  ".newsletter-form input { flex: 1; padding: 15px; border: 1px solid #65462F; border-radius: 4px; outline: none; background: #241710; color: #FFFFFF; }",

  ".newsletter-form button { padding: 0 20px; border: 0; border-radius: 4px; background: #B8863B; color: #1B120D; font-weight: bold; }",

  ".success-message { margin-top: 12px; color: #B8863B; font-size: 13px; }",

  ".footer { padding: 50px 0; border-top: 1px solid #3A281D; color: #806E60; }",

  ".cart-overlay { position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,.65); }",

  ".cart-panel { position: absolute; top: 0; right: 0; width: min(430px, 100%); height: 100%; display: flex; flex-direction: column; background: #241710; box-shadow: -10px 0 40px rgba(0,0,0,.4); }",

  ".cart-header { display: flex; align-items: center; justify-content: space-between; padding: 25px; border-bottom: 1px solid #3A281D; }",

  ".cart-header h3 { margin: 0; font-family: Georgia, serif; font-size: 28px; font-weight: 400; }",

  ".close-button { border: 0; background: transparent; color: #F5EDE1; font-size: 28px; }",

  ".cart-items { flex: 1; overflow-y: auto; }",

  ".cart-item { display: flex; justify-content: space-between; gap: 15px; padding: 18px 25px; border-bottom: 1px solid #3A281D; }",

  ".cart-item-title { color: #F5EDE1; font-size: 14px; }",

  ".cart-item-info { margin-top: 5px; color: #8F7A6C; font-size: 12px; }",

  ".cart-item-total { color: #D9A84E; font-family: monospace; }",

  ".cart-footer { padding: 25px; border-top: 1px solid #3A281D; }",

  ".cart-summary { display: flex; justify-content: space-between; margin-bottom: 20px; color: #B8A79A; }",

  ".cart-total { color: #F5EDE1; font-family: monospace; }",

  ".checkout { width: 100%; padding: 15px; border: 0; border-radius: 4px; background: #F5EDE1; color: #1B120D; font-weight: bold; }",

  "@media (max-width: 900px) { .nav-links { display: none; } .hero-grid { grid-template-columns: 1fr; } .book-grid { grid-template-columns: repeat(2, 1fr); } .newsletter { grid-template-columns: 1fr; } }",

  "@media (max-width: 600px) { .container { width: calc(100% - 28px); } .book-grid { grid-template-columns: repeat(2, 1fr); gap: 15px; } .section-head { display: block; } .section-description { margin-top: 20px; } .newsletter-form { display: block; } .newsletter-form button { width: 100%; margin-top: 10px; padding: 14px; } .shelf { height: 230px; } .add-button { opacity: 1; } .auth-profile, .auth-trigger, .search-button { display: none; } .logo { font-size: 22px; } .logo span { display: none; } .nav-actions { gap: 6px; } .cart-button { padding: 0 10px; } .cart-text { display: none; } }",

  /* ========== CRUD MANAGEMENT STYLES ========== */
  ".admin-button { position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; border-radius: 50%; background: #B8863B; color: #1B120D; font-size: 24px; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,.3); z-index: 99; transition: transform .2s, box-shadow .2s; }",

  ".admin-button:hover { transform: scale(1.1); box-shadow: 0 6px 16px rgba(0,0,0,.4); }",

  ".admin-modal { position: fixed; inset: 0; background: rgba(0,0,0,.7); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; }",

  ".admin-modal.hidden { display: none; }",

  ".admin-content { background: #241710; border-radius: 8px; max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 30px; box-shadow: 0 20px 60px rgba(0,0,0,.5); }",

  ".admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }",

  ".admin-header h2 { margin: 0; font-family: Georgia, serif; font-size: 28px; color: #F5EDE1; }",

  ".admin-close { background: transparent; border: none; color: #F5EDE1; font-size: 28px; cursor: pointer; }",

  ".form-group { margin-bottom: 20px; }",

  ".form-label { display: block; color: #D8C8B8; font-size: 13px; font-weight: bold; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }",

  ".form-input, .form-textarea { width: 100%; padding: 12px; border: 1px solid #65462F; border-radius: 4px; background: #1B120D; color: #F5EDE1; font-family: inherit; outline: none; transition: border-color .2s; }",

  ".form-input:focus, .form-textarea:focus { border-color: #B8863B; }",

  ".form-textarea { resize: vertical; min-height: 80px; }",

  ".form-actions { display: flex; gap: 10px; margin-top: 25px; }",

  ".btn-save { flex: 1; padding: 12px; background: #B8863B; color: #1B120D; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; transition: background .2s; }",

  ".btn-save:hover { background: #d4a75d; }",

  ".btn-cancel { flex: 1; padding: 12px; background: #3A281D; color: #F5EDE1; border: 1px solid #65462F; border-radius: 4px; cursor: pointer; font-weight: bold; transition: all .2s; }",

  ".btn-cancel:hover { background: #5C3A28; }",

  ".admin-section { margin-top: 40px; padding-top: 30px; border-top: 1px solid #3A281D; }",

  ".admin-section h3 { color: #B8863B; font-size: 16px; margin: 0 0 20px; text-transform: uppercase; letter-spacing: 1px; }",

  ".book-item { background: #1B120D; padding: 15px; border: 1px solid #3A281D; border-radius: 4px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; }",

  ".book-item-info { flex: 1; }",

  ".book-item-title { color: #F5EDE1; font-weight: bold; margin: 0; }",

  ".book-item-details { color: #8F7A6C; font-size: 12px; margin: 5px 0 0; }",

  ".book-item-actions { display: flex; gap: 10px; }",

  ".btn-small { padding: 6px 12px; border: none; border-radius: 3px; cursor: pointer; font-size: 12px; font-weight: bold; transition: all .2s; }",

  ".btn-edit { background: #B8863B; color: #1B120D; }",

  ".btn-edit:hover { background: #d4a75d; }",

  ".btn-delete { background: #8B3A2E; color: #F5EDE1; }",

  ".btn-delete:hover { background: #a84635; }",

  ".success-banner { background: #5a8c5a; color: #F5EDE1; padding: 12px 15px; border-radius: 4px; margin-bottom: 15px; font-size: 13px; }",

  ".error-banner { background: #8B3A2E; color: #F2A69A; padding: 12px 15px; border-radius: 4px; margin-bottom: 15px; font-size: 13px; }",

  ".realtime-indicator { display: inline-flex; align-items: center; gap: 6px; color: #B8863B; font-size: 12px; font-family: monospace; }",

  ".realtime-dot { width: 8px; height: 8px; border-radius: 50%; background: #4CAF50; animation: pulse 1.5s infinite; }",

  "@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }",

  "@media (max-width: 600px) { .admin-content { max-width: 90vw; padding: 20px; } .book-item { flex-direction: column; align-items: flex-start; } .book-item-actions { width: 100%; margin-top: 10px; } .admin-button { width: 50px; height: 50px; font-size: 20px; bottom: 20px; right: 20px; } }"
].join("\n");

function formatPrice(value) {
  const number = Number(value) || 0;
  return "R$ " + number.toFixed(2).replace(".", ",");
}

function getCategory(produto) {
  if (produto.categoria_id) {
    return "Cat. " + produto.categoria_id;
  }

  return "Livro";
}

function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  // ========== STATE GERENCIAMENTO PRINCIPAL ==========
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Ficção");
  const [email, setEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  // ========== STATE GERENCIAMENTO CRUD ==========
  const [adminOpen, setAdminOpen] = useState(false);
  const [modo, setModo] = useState("listar"); // listar, criar, editar
  const [livroEditando, setLivroEditando] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [erroCategorias, setErroCategorias] = useState("");
  const [carregandoCategorias, setCarregandoCategorias] = useState(false);
  const [imagemSelecionada, setImagemSelecionada] = useState(null);
  const [imagemPreview, setImagemPreview] = useState("");
  const [salvandoLivro, setSalvandoLivro] = useState(false);
  const galeriaInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [formulario, setFormulario] = useState({
    titulo: "",
    autor: "",
    preco: "",
    categoria_id: "1",
    estoque: "",
    descricao: "",
    imagem_url: "",
    isbn: "",
    editora: "",
    ano_publicacao: "",
    destaque: false
  });
  const [mensagemAdmin, setMensagemAdmin] = useState({ tipo: "", texto: "" });
  const [subscription, setSubscription] = useState(null);
  const [syncAtivo, setSyncAtivo] = useState(false);

  // ========== EFFECT INICIAL - CARREGAR DADOS ==========
  useEffect(function () {
    async function inicializar() {
      console.log("🚀 Inicializando aplicação...");
      
      // Carregar produtos
      const resultado = await lerTodosOsLivros();
      if (resultado.erro) {
        setErro(resultado.erro);
        setProdutos([]);
      } else {
        setProdutos(resultado.dados);
        setErro("");
      }
      setCarregando(false);

      // Inscrever-se às mudanças em tempo real
      const sub = await inscreverAMudancas(async (payload) => {
        console.log("⚡ Mudança detectada:", payload.eventType);
        setSyncAtivo(true);

        // Recarregar dados quando houver mudança
        const novosDados = await lerTodosOsLivros();
        if (!novosDados.erro) {
          setProdutos(novosDados.dados);
        }

        setSyncAtivo(false);
      });

      if (sub) {
        setSubscription(sub);
      }
    }

    inicializar();

    // Cleanup ao desmontar
    return function () {
      if (subscription) {
        desinscreverDeMudancas(subscription);
      }
    };
  }, []);

  useEffect(function () {
    let ativo = true;

    async function carregarCategorias() {
      setCarregandoCategorias(true);
      const resultado = await lerCategorias();
      if (!ativo) return;

      if (resultado.erro) {
        setErroCategorias(resultado.erro);
      } else {
        setCategorias(resultado.dados);
        setErroCategorias("");
      }
      setCarregandoCategorias(false);
    }

    if (user) {
      carregarCategorias();
    } else {
      setCategorias([]);
      setErroCategorias("");
      setCarregandoCategorias(false);
    }
    return function () {
      ativo = false;
    };
  }, [user]);

  useEffect(function () {
    if (!imagemSelecionada) {
      setImagemPreview("");
      return undefined;
    }

    const previewUrl = URL.createObjectURL(imagemSelecionada.blob);
    setImagemPreview(previewUrl);
    return function () {
      URL.revokeObjectURL(previewUrl);
    };
  }, [imagemSelecionada]);

  // ========== FUNÇÕES CRUD ==========
  function lerArquivoImagem(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMensagemAdmin({ tipo: "erro", texto: "Selecione um arquivo de imagem válido." });
      return;
    }
    setImagemSelecionada({ blob: file, fileName: file.name });
    setMensagemAdmin({ tipo: "", texto: "" });
  }

  async function adicionarFotoDaGaleria() {
    if (Capacitor.getPlatform() === "web") {
      galeriaInputRef.current?.click();
      return;
    }

    try {
      const permissionStatus = await Camera.requestPermissions({ permissions: ["photos"] });
      if (permissionStatus.photos !== "granted" && permissionStatus.photos !== "limited") {
        throw new Error("Permissão para acessar a galeria negada.");
      }

      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
        saveToGallery: false
      });
      if (!photo?.webPath) throw new Error("A galeria não retornou uma imagem.");
      const response = await fetch(photo.webPath);
      if (!response.ok) throw new Error("Não foi possível carregar a foto da galeria.");
      const blob = await response.blob();
      setImagemSelecionada({ blob, fileName: `capa.${photo.format || "jpg"}` });
      setMensagemAdmin({ tipo: "", texto: "" });
    } catch (error) {
      console.error("Não foi possível selecionar a foto da galeria:", error);
      setMensagemAdmin({
        tipo: "erro",
        texto: error instanceof Error ? error.message : "Não foi possível selecionar a foto."
      });
    }
  }

  async function tirarFotoDoLivro() {
    if (Capacitor.getPlatform() === "web") {
      cameraInputRef.current?.click();
      return;
    }

    try {
      const permissionStatus = await Camera.requestPermissions({ permissions: ["camera"] });
      if (permissionStatus.camera !== "granted" && permissionStatus.camera !== "limited") {
        throw new Error("Permissão para usar a câmera negada.");
      }

      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        saveToGallery: false
      });

      if (!photo || !photo.webPath) {
        throw new Error("A câmera não retornou uma imagem.");
      }

      const response = await fetch(photo.webPath);
      if (!response.ok) throw new Error("Não foi possível carregar a foto capturada.");
      const blob = await response.blob();
      setImagemSelecionada({ blob, fileName: `capa.${photo.format || "jpg"}` });
      setMensagemAdmin({ tipo: "", texto: "" });
    } catch (error) {
      console.error("Não foi possível capturar a capa do livro:", error);
      setMensagemAdmin({
        tipo: "erro",
        texto: error instanceof Error ? error.message : "Não foi possível capturar a foto."
      });
    }
  }

  async function handleCriarLivro(event) {
    event.preventDefault();

    if (!formulario.titulo || !formulario.autor || !formulario.preco) {
      setMensagemAdmin({ tipo: "erro", texto: "Preencha os campos obrigatórios." });
      return;
    }

    if (!categorias.some((categoria) => String(categoria.id) === String(formulario.categoria_id))) {
      setMensagemAdmin({ tipo: "erro", texto: "Selecione uma categoria válida." });
      return;
    }

    if (!imagemSelecionada) {
      setMensagemAdmin({ tipo: "erro", texto: "Adicione uma foto para cadastrar o livro." });
      return;
    }

    setSalvandoLivro(true);
    let imagemEnviada = null;
    try {
      let dadosLivro = { ...formulario };
      if (imagemSelecionada) {
        imagemEnviada = await uploadBookImage(imagemSelecionada.blob, user.id);
        dadosLivro = { ...dadosLivro, imagem_url: imagemEnviada.publicUrl };
      }

      const resultado = await criarLivro(dadosLivro);
      if (resultado.erro) {
        if (imagemEnviada) {
          try {
            await deleteBookImage(imagemEnviada.filePath);
          } catch (cleanupError) {
            console.error("A foto enviada não pôde ser removida após falha no cadastro:", cleanupError);
          }
        }
        setMensagemAdmin({ tipo: "erro", texto: resultado.erro });
        return;
      }

      setMensagemAdmin({ tipo: "sucesso", texto: "Livro e foto salvos com sucesso!" });
      resetarFormulario();
      setModo("listar");
      const novosDados = await lerTodosOsLivros();
      if (!novosDados.erro) setProdutos(novosDados.dados);
    } catch (error) {
      console.error("Não foi possível salvar o livro e sua foto:", error);
      setMensagemAdmin({
        tipo: "erro",
        texto: error instanceof Error ? error.message : "Não foi possível salvar o livro."
      });
    } finally {
      setSalvandoLivro(false);
    }
  }

  async function handleAtualizarLivro(event) {
    event.preventDefault();

    if (!livroEditando || !livroEditando.id) {
      setMensagemAdmin({ tipo: "erro", texto: "Erro ao atualizar livro." });
      return;
    }

    if (!categorias.some((categoria) => String(categoria.id) === String(formulario.categoria_id))) {
      setMensagemAdmin({ tipo: "erro", texto: "Selecione uma categoria válida." });
      return;
    }

    setSalvandoLivro(true);
    let imagemEnviada = null;
    try {
      let dadosLivro = { ...formulario };
      if (imagemSelecionada) {
        imagemEnviada = await uploadBookImage(imagemSelecionada.blob, user.id);
        dadosLivro = { ...dadosLivro, imagem_url: imagemEnviada.publicUrl };
      }

      const resultado = await atualizarLivro(livroEditando.id, dadosLivro);
      if (resultado.erro) {
        if (imagemEnviada) {
          try {
            await deleteBookImage(imagemEnviada.filePath);
          } catch (cleanupError) {
            console.error("A foto enviada não pôde ser removida após falha na atualização:", cleanupError);
          }
        }
        setMensagemAdmin({ tipo: "erro", texto: resultado.erro });
        return;
      }

      setMensagemAdmin({ tipo: "sucesso", texto: "Livro e foto atualizados com sucesso!" });
      resetarFormulario();
      setModo("listar");
      setLivroEditando(null);
      const novosDados = await lerTodosOsLivros();
      if (!novosDados.erro) setProdutos(novosDados.dados);
    } catch (error) {
      console.error("Não foi possível atualizar o livro e sua foto:", error);
      setMensagemAdmin({
        tipo: "erro",
        texto: error instanceof Error ? error.message : "Não foi possível atualizar o livro."
      });
    } finally {
      setSalvandoLivro(false);
    }
  }

  async function handleDeletarLivro(id) {
    if (!confirm("Tem certeza que deseja deletar este livro?")) {
      return;
    }

    console.log("🗑️ Deletando livro...");
    const resultado = await deletarLivro(id);

    if (resultado.erro) {
      setMensagemAdmin({ tipo: "erro", texto: resultado.erro });
    } else {
      setMensagemAdmin({ tipo: "sucesso", texto: "Livro deletado com sucesso!" });
      
      // Atualizar lista
      const novosDados = await lerTodosOsLivros();
      if (!novosDados.erro) {
        setProdutos(novosDados.dados);
      }
    }

    setTimeout(() => setMensagemAdmin({ tipo: "", texto: "" }), 3000);
  }

  function abrirFormularioCriacao() {
    resetarFormulario();
    setLivroEditando(null);
    setModo("criar");
    setMensagemAdmin({ tipo: "", texto: "" });
  }

  function abrirFormularioEdicao(livro) {
    setImagemSelecionada(null);
    setFormulario({
      titulo: livro.titulo || "",
      autor: livro.autor || "",
      preco: livro.preco || "",
      categoria_id: livro.categoria_id || "1",
      estoque: livro.estoque || "",
      descricao: livro.descricao || "",
      imagem_url: livro.imagem_url || "",
      isbn: livro.isbn || "",
      editora: livro.editora || "",
      ano_publicacao: livro.ano_publicacao || "",
      destaque: Boolean(livro.destaque)
    });
    setLivroEditando(livro);
    setModo("editar");
    setMensagemAdmin({ tipo: "", texto: "" });
  }

  function resetarFormulario() {
    setImagemSelecionada(null);
    setFormulario({
      titulo: "",
      autor: "",
      preco: "",
      categoria_id: "1",
      estoque: "",
      descricao: "",
      imagem_url: "",
      isbn: "",
      editora: "",
      ano_publicacao: "",
      destaque: false
    });
  }

  function fecharAdmin() {
    setAdminOpen(false);
    setModo("listar");
    resetarFormulario();
    setLivroEditando(null);
  }

  const books = useMemo(function () {
    return produtos.map(function (produto, index) {
      return {
        id: produto.id || index,
        titulo: produto.titulo || "Produto " + (index + 1),
        autor: produto.autor || "Autor não informado",
        preco: Number(produto.preco) || 0,
        categoria: getCategory(produto),
        imagem_url: produto.imagem_url || "",
        descricao: produto.descricao || "",
        estoque: produto.estoque || 0
      };
    });
  }, [produtos]);

  function addToCart(book) {
    setCart(function (listaAtual) {
      const encontrado = listaAtual.find(function (item) {
        return item.id === book.id;
      });

      if (encontrado) {
        return listaAtual.map(function (item) {
          if (item.id === book.id) {
            return {
              ...item,
              quantidade: item.quantidade + 1
            };
          }

          return item;
        });
      }

      return [
        ...listaAtual,
        {
          id: book.id,
          titulo: book.titulo,
          preco: book.preco,
          quantidade: 1
        }
      ];
    });

    setCartOpen(true);
  }

  function removerDoCarrinho(id) {
    setCart(function (listaAtual) {
      return listaAtual.filter(function (item) {
        return item.id !== id;
      });
    });
  }

  function finalizarCompra() {
    if (cart.length === 0) {
      alert("A sacola está vazia.");
      return;
    }

    alert("Compra finalizada! Obrigado pela preferência.");
    setCart([]);
    setCartOpen(false);
  }

  function enviarNewsletter(event) {
    event.preventDefault();

    if (!email.trim()) {
      setNewsletterMessage("Digite seu e-mail.");
      return;
    }

    setNewsletterMessage(
      "Prontinho! Cadastro realizado para " + email + "."
    );

    setEmail("");
  }

  const totalItens = cart.reduce(function (total, item) {
    return total + item.quantidade;
  }, 0);

  const totalCompra = cart.reduce(function (total, item) {
    return total + item.preco * item.quantidade;
  }, 0);

  const secoes = {
    Ficção: [
      "A Hora da Estrela — Clarice Lispector",
      "Torto Arado — Itamar Vieira Jr.",
      "O Avesso da Pele — Jeferson Tenório",
      "Água Viva — Clarice Lispector"
    ],
    Poesia: [
      "A Rosa do Povo — Carlos Drummond de Andrade",
      "Cantares — Cora Coralina",
      "Alguma Poesia — Carlos Drummond de Andrade"
    ],
    Ensaio: [
      "Pequeno Manual Antirracista — Djamila Ribeiro",
      "Feminismo para os 99% — Nancy Fraser",
      "Educação como Prática da Liberdade — Paulo Freire"
    ],
    Infantil: [
      "Menina Bonita do Laço de Fita — Ana Maria Machado",
      "O Menino Marrom — Ziraldo",
      "Bisa Bia, Bisa Bel — Ana Maria Machado"
    ]
  };

  // ========== COMPONENTE ADMIN MODAL ==========
  function renderAdminModal() {
    if (!user) return null;

    return (
      <div className={adminOpen ? "admin-modal" : "admin-modal hidden"}>
        <div className="admin-content">
          <div className="admin-header">
            <h2>
              {modo === "listar" ? "Gerenciar Livros" : modo === "criar" ? "Novo Livro" : "Editar Livro"}
            </h2>
            <button
              className="admin-close"
              onClick={fecharAdmin}
            >
              ×
            </button>
          </div>

          {mensagemAdmin.texto && (
            <div className={mensagemAdmin.tipo === "sucesso" ? "success-banner" : "error-banner"}>
              {mensagemAdmin.texto}
            </div>
          )}

          {modo === "listar" && (
            <div>
              <button
                className="btn-save"
                onClick={abrirFormularioCriacao}
                style={{ marginBottom: "20px" }}
              >
                + Adicionar Novo Livro
              </button>

              <div className="admin-section">
                <h3>Livros Existentes ({produtos.length})</h3>

                {produtos.length === 0 ? (
                  <p style={{ color: "#8F7A6C" }}>Nenhum livro cadastrado.</p>
                ) : (
                  produtos.map(function (livro) {
                    return (
                      <div className="book-item" key={livro.id}>
                        <div className="book-item-info">
                          <p className="book-item-title">
                            {livro.titulo}
                          </p>
                          <p className="book-item-details">
                            {livro.autor} • {livro.categoria_id} • {formatPrice(livro.preco)} • Estoque: {livro.estoque} • {livro.editora}
                          </p>
                        </div>
                        <div className="book-item-actions">
                          <button
                            className="btn-small btn-edit"
                            onClick={function () {
                              abrirFormularioEdicao(livro);
                            }}
                          >
                            Editar
                          </button>
                          <button
                            className="btn-small btn-delete"
                            onClick={function () {
                              handleDeletarLivro(livro.id);
                            }}
                          >
                            Deletar
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="admin-section">
                <div className="realtime-indicator">
                  <span className="realtime-dot"></span>
                  Sincronização em tempo real {syncAtivo ? "ativa" : "aguardando"}
                </div>
              </div>
            </div>
          )}

          {(modo === "criar" || modo === "editar") && (
            <form onSubmit={modo === "criar" ? handleCriarLivro : handleAtualizarLivro}>
              <div className="form-group">
                <label className="form-label">Título *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formulario.titulo}
                  onChange={function (e) {
                    setFormulario({ ...formulario, titulo: e.target.value });
                  }}
                  placeholder="Digite o título do livro"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Autor *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formulario.autor}
                  onChange={function (e) {
                    setFormulario({ ...formulario, autor: e.target.value });
                  }}
                  placeholder="Digite o nome do autor"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Preço (R$) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={formulario.preco}
                  onChange={function (e) {
                    setFormulario({ ...formulario, preco: e.target.value });
                  }}
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Categoria *</label>
                <select
                  className="form-input"
                  value={formulario.categoria_id}
                  disabled={carregandoCategorias || Boolean(erroCategorias)}
                  onChange={function (e) {
                    setFormulario({ ...formulario, categoria_id: e.target.value });
                  }}
                  required
                >
                  <option value="">
                    {carregandoCategorias ? "Carregando categorias..." : "Selecione uma categoria"}
                  </option>
                  {categorias.map(function (categoria) {
                    return (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </option>
                    );
                  })}
                </select>
                {erroCategorias && <p className="form-error">Erro ao carregar categorias: {erroCategorias}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Editora</label>
                <input
                  type="text"
                  className="form-input"
                  value={formulario.editora}
                  onChange={function (e) {
                    setFormulario({ ...formulario, editora: e.target.value });
                  }}
                  placeholder="Nome da editora"
                />
              </div>

              <div className="form-group">
                <label className="form-label">ISBN</label>
                <input
                  type="text"
                  className="form-input"
                  value={formulario.isbn}
                  onChange={function (e) {
                    setFormulario({ ...formulario, isbn: e.target.value });
                  }}
                  placeholder="ISBN do livro"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ano de Publicação</label>
                <input
                  type="number"
                  className="form-input"
                  value={formulario.ano_publicacao}
                  onChange={function (e) {
                    setFormulario({ ...formulario, ano_publicacao: e.target.value });
                  }}
                  placeholder="Ex: 2023"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <input
                    type="checkbox"
                    checked={formulario.destaque}
                    onChange={function (e) {
                      setFormulario({ ...formulario, destaque: e.target.checked });
                    }}
                  />
                  {" "}Destacar livro na loja
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Estoque</label>
                <input
                  type="number"
                  className="form-input"
                  value={formulario.estoque}
                  onChange={function (e) {
                    setFormulario({ ...formulario, estoque: e.target.value });
                  }}
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descrição</label>
                <textarea
                  className="form-textarea"
                  value={formulario.descricao}
                  onChange={function (e) {
                    setFormulario({ ...formulario, descricao: e.target.value });
                  }}
                  placeholder="Digite uma descrição do livro..."
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Foto da capa {modo === "criar" ? "*" : ""}</label>
                <div className="image-actions">
                  <input
                    ref={galeriaInputRef}
                    type="file"
                    accept="image/*"
                    onChange={lerArquivoImagem}
                    hidden
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={lerArquivoImagem}
                    hidden
                  />
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={adicionarFotoDaGaleria}
                  >
                    Adicionar foto da galeria
                  </button>
                  <button type="button" className="btn-cancel" onClick={tirarFotoDoLivro}>
                    Tirar foto
                  </button>
                </div>
                {modo === "editar" && (
                  <input
                    type="url"
                    className="form-input"
                    value={formulario.imagem_url}
                    onChange={function (e) {
                      setFormulario({ ...formulario, imagem_url: e.target.value });
                    }}
                    placeholder="URL alternativa da imagem"
                    style={{ marginTop: "10px" }}
                  />
                )}
                <p className="form-help">
                  {imagemSelecionada
                    ? `Selecionada: ${imagemSelecionada.fileName}`
                    : modo === "editar" && formulario.imagem_url
                      ? "A foto atual será mantida se nenhuma nova for selecionada."
                      : "Selecione uma foto; ela será enviada ao Supabase ao salvar o livro."}
                </p>
                {(imagemPreview || (modo === "editar" && formulario.imagem_url)) && (
                  <img
                    className="image-preview"
                    src={imagemPreview || formulario.imagem_url}
                    alt="Prévia da capa do livro"
                  />
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save" disabled={salvandoLivro}>
                  {salvandoLivro ? "Salvando livro e foto..." : modo === "criar" ? "Criar Livro" : "Atualizar Livro"}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  disabled={salvandoLivro}
                  onClick={function () {
                    resetarFormulario();
                    setModo("listar");
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <style>{CSS}</style>

      {user && renderAdminModal()}

      <button
        className="admin-button"
        onClick={function () {
          if (user) setAdminOpen(true);
          else setAuthOpen(true);
        }}
        disabled={authLoading}
        title={user ? "Gerenciar livros (CRUD)" : "Entre para gerenciar os livros"}
        aria-label={user ? "Gerenciar livros" : "Entrar para gerenciar livros"}
      >
        ⚙️
      </button>

      {authOpen && !user && <AuthScreen onClose={function () { setAuthOpen(false); }} />}

      <header className="navbar">
        <div className="container nav-inner">
          <a href="#inicio" className="logo">
            Alfarrábio
            <span>LIVRARIA</span>
          </a>

          <nav className="nav-links">
            <a href="#acervo">Acervo</a>
            <a href="#secoes">Seções</a>
            <a href="#historia">Nossa história</a>
            <a href="#visite">Visite</a>
          </nav>

          <div className="nav-actions">
            {user ? (
              <div className="auth-profile">
                {user.user_metadata?.avatar_url && <img className="auth-avatar" src={user.user_metadata.avatar_url} alt="" />}
                <span>{user.user_metadata?.full_name || user.email}</span>
                <button className="auth-signout" onClick={async function () { await signOut(); setAdminOpen(false); }}>
                  Sair
                </button>
              </div>
            ) : (
              <button className="auth-trigger" onClick={function () { setAuthOpen(true); }} disabled={authLoading}>
                {authLoading ? "..." : "Entrar"}
              </button>
            )}

            <button
              className="icon-button search-button"
              onClick={function () {
                alert("Busca em breve.");
              }}
            >
              ⌕
            </button>

            <button
              className="cart-button"
              onClick={function () {
                setCartOpen(true);
              }}
            >
              <span className="cart-label">🛍</span> <span className="cart-text">Sacola</span>
              <span className="cart-number">
                {totalItens}
              </span>
            </button>

            <button
              className="icon-button"
              onClick={function () {
                setMobileOpen(!mobileOpen);
              }}
            >
              ☰
            </button>
          </div>
        </div>

        <div className={mobileOpen ? "mobile-menu open" : "mobile-menu"}>
          <div className="container">
            {user ? (
              <div className="mobile-account">
                <span>{user.user_metadata?.full_name || user.email}</span>
                <button onClick={async function () { await signOut(); setAdminOpen(false); setMobileOpen(false); }}>Sair</button>
              </div>
            ) : (
              <a href="#entrar" onClick={function (event) { event.preventDefault(); setAuthOpen(true); setMobileOpen(false); }}>Entrar / Cadastro</a>
            )}
            <a href="#acervo">Acervo</a>
            <a href="#secoes">Seções</a>
            <a href="#historia">Nossa história</a>
            <a href="#visite">Visite</a>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="container hero-grid">
            <div>
              <div className="eyebrow">
                Livros que ficam
              </div>

              <h1>
                Histórias
                <br />
                para guardar.
              </h1>

              <p>
                Uma livraria feita para quem gosta de descobrir
                livros, revisitar clássicos e encontrar novas
                histórias para levar para casa.
              </p>

              <a href="#acervo" className="hero-button">
                Explorar acervo
              </a>
            </div>

            <div className="shelf">
              {books.slice(0, 7).map(function (book, index) {
                return (
                  <div
                    className="spine"
                    key={book.id}
                    style={{
                      height:
                        [72, 88, 64, 95, 78, 60, 90][index] + "%"
                    }}
                    onClick={function () {
                      addToCart(book);
                    }}
                  >
                    {book.titulo}
                  </div>
                );
              })}
            </div>
          </div>

        </section>

        <section className="section" id="acervo">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="eyebrow">
                  Fichário 01
                </div>

                <h2>Recém-catalogados</h2>
              </div>

              <p className="section-description">
                Cada volume abaixo passou pela mesa da livraria
                antes de chegar à estante.
              </p>
            </div>

            {carregando && (
              <div className="cloud-status">
                ☁️ Carregando dados do Supabase...
              </div>
            )}

            {!carregando && !erro && produtos.length > 0 && (
              <div className="cloud-status">
                ☁️ {produtos.length} produto(s) carregado(s) do Supabase.
              </div>
            )}

            {!carregando && erro && (
              <div className="cloud-status cloud-error">
                ⚠️ Erro ao carregar Supabase:
                <br />
                {erro}
              </div>
            )}

            {!carregando &&
              !erro &&
              produtos.length === 0 && (
                <div className="cloud-status cloud-error">
                  Nenhum produto encontrado na tabela produtos.
                </div>
              )}

            <div className="book-grid">
              {books.map(function (book) {
                return (
                  <article
                    className="book-card"
                    key={book.id}
                  >
                    <div className="book-cover">
                      {book.imagem_url && (
                        <img
                          src={book.imagem_url}
                          alt={"Capa de " + book.titulo}
                          onError={function (event) {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />
                      )}

                      <div className="book-overlay">
                        <span className="book-title-cover">
                          {book.titulo}
                        </span>
                      </div>

                      <span className="book-tag">
                        {book.categoria}
                      </span>

                      <button
                        className="add-button"
                        onClick={function () {
                          addToCart(book);
                        }}
                      >
                        +
                      </button>
                    </div>

                    <h3 className="book-name">
                      {book.titulo}
                    </h3>

                    <p className="book-author">
                      {book.autor}
                    </p>

                    <p className="book-price">
                      {formatPrice(book.preco)}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section" id="secoes">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="eyebrow">
                  Catálogo
                </div>

                <h2>Seções</h2>
              </div>
            </div>

            <div className="tabs">
              {Object.keys(secoes).map(function (nome) {
                return (
                  <button
                    key={nome}
                    className={
                      activeSection === nome
                        ? "tab active"
                        : "tab"
                    }
                    onClick={function () {
                      setActiveSection(nome);
                    }}
                  >
                    {nome}
                  </button>
                );
              })}
            </div>

            <div className="catalog-list">
              {secoes[activeSection].map(function (
                item,
                index
              ) {
                return (
                  <div className="catalog-row" key={item}>
                    <span>
                      {String(index + 1).padStart(2, "0")}
                      {"  "}
                      {item}
                    </span>

                    <span>{activeSection}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section history" id="historia">
          <div className="container">
            <div className="eyebrow">
              Nossa história
            </div>

            <h2>Uma livraria para leitores.</h2>

            <p className="history-text">
              A Alfarrábio nasceu da vontade de criar um espaço
              dedicado aos livros e às histórias que continuam
              presentes muito depois da última página. Nosso
              acervo reúne literatura brasileira, clássicos,
              fantasia, poesia e diferentes vozes da literatura.
            </p>
          </div>
        </section>

        <section className="section" id="visite">
          <div className="container newsletter">
            <div>
              <div className="eyebrow">
                Carta de leitura
              </div>

              <h2>Fique por dentro.</h2>

              <p>
                Receba novidades do acervo, recomendações e
                informações da livraria diretamente no seu
                e-mail.
              </p>
            </div>

            <form
              className="newsletter-form"
              onSubmit={enviarNewsletter}
            >
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={function (event) {
                  setEmail(event.target.value);
                }}
              />

              <button type="submit">
                Assinar
              </button>

              {newsletterMessage && (
                <div className="success-message">
                  {newsletterMessage}
                </div>
              )}
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="logo">
            Alfarrábio
            <span>LIVRARIA</span>
          </div>

          <p>
            Literatura, histórias e livros para guardar.
          </p>
        </div>
      </footer>

      {cartOpen && (
        <div
          className="cart-overlay"
          onClick={function (event) {
            if (event.target === event.currentTarget) {
              setCartOpen(false);
            }
          }}
        >
          <aside className="cart-panel">
            <div className="cart-header">
              <h3>Sacola</h3>

              <button
                className="close-button"
                onClick={function () {
                  setCartOpen(false);
                }}
              >
                ×
              </button>
            </div>

            <div className="cart-items">
              {cart.length === 0 && (
                <div className="cart-item">
                  <span className="cart-item-info">
                    Sua sacola está vazia.
                  </span>
                </div>
              )}

              {cart.map(function (item) {
                return (
                  <div
                    className="cart-item"
                    key={item.id}
                  >
                    <div>
                      <div className="cart-item-title">
                        {item.titulo}
                      </div>

                      <div className="cart-item-info">
                        {item.quantidade} ×{" "}
                        {formatPrice(item.preco)}
                      </div>

                      <button
                        onClick={function () {
                          removerDoCarrinho(item.id);
                        }}
                        style={{
                          marginTop: "8px",
                          border: 0,
                          background: "transparent",
                          color: "#B8863B",
                          padding: 0
                        }}
                      >
                        Remover
                      </button>
                    </div>

                    <span className="cart-item-total">
                      {formatPrice(
                        item.preco * item.quantidade
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="cart-footer">
              <div className="cart-summary">
                <span>
                  {totalItens} item(s)
                </span>

                <strong className="cart-total">
                  {formatPrice(totalCompra)}
                </strong>
              </div>

              <button
                className="checkout"
                onClick={finalizarCompra}
              >
                Finalizar compra
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default App;