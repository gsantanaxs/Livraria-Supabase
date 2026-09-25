import { useEffect, useMemo, useState } from 'react';
import { supabase } from './services/supabaseClient';

const FALLBACK_BOOKS = [
  {
    id: 'fallback-1',
    titulo: 'A Hora da Estrela',
    autor: 'Clarice Lispector',
    preco: 38.9,
    categoria: 'Ficção BR',
    imagem_url: 'img/A Hora da Estrela.png',
  },
  {
    id: 'fallback-2',
    titulo: 'Torto Arado',
    autor: 'Itamar Vieira Jr.',
    preco: 54.9,
    categoria: 'Ficção BR',
    imagem_url: 'img/Torto Arado.png',
  },
  {
    id: 'fallback-3',
    titulo: 'O Príncipe Cruel',
    autor: 'Holly Black',
    preco: 62,
    categoria: 'Fantasia',
    imagem_url: 'img/O principe cruel.png',
  },
  {
    id: 'fallback-4',
    titulo: 'Vidas Secas',
    autor: 'Graciliano Ramos',
    preco: 34.5,
    categoria: 'Clássico',
    imagem_url: 'img/Vidas secas.png',
  },
];

const SECTIONS = {
  Ficção: [
    'A Hora da Estrela — Clarice Lispector',
    'Torto Arado — Itamar Vieira Jr.',
    'O Avesso da Pele — Jeferson Tenório',
    'Água Viva — Clarice Lispector',
  ],
  Poesia: [
    'Alguma Poesia — Carlos Drummond de Andrade',
    'A Rosa do Povo — Carlos Drummond de Andrade',
    'Cantares — Cora Coralina',
  ],
  Ensaio: [
    'Pequeno Manual Antirracista — Djamila Ribeiro',
    'Feminismo para os 99% — Nancy Fraser',
    'Educação como Prática da Liberdade — Paulo Freire',
  ],
  Infantil: [
    'Menina Bonita do Laço de Fita — Ana Maria Machado',
    'O Menino Marrom — Ziraldo',
    'Bisa Bia, Bisa Bel — Ana Maria Machado',
  ],
};

const HEIGHTS = [72, 88, 64, 95, 78, 60, 90, 70, 84, 66];

function formatPrice(value) {
  const number = Number(value) || 0;

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(number);
}

function getCategory(book) {
  if (book.categoria) return book.categoria;

  if (book.categoria_id) {
    return `Categoria ${book.categoria_id}`;
  }

  return 'Livro';
}

export default function App() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [carrinho, setCarrinho] = useState([]);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);

  const [menuAberto, setMenuAberto] = useState(false);
  const [categoria, setCategoria] = useState('Ficção');

  const [email, setEmail] = useState('');
  const [mensagemNewsletter, setMensagemNewsletter] = useState('');

  const [mensagemSacola, setMensagemSacola] = useState('');
  const [livroSelecionado, setLivroSelecionado] = useState(null);

  // ============================================================
  // BUSCAR LIVROS NO SUPABASE
  // ============================================================

  useEffect(() => {
    async function buscarProdutos() {
      try {
        setCarregando(true);
        setErro('');

        const { data, error } = await supabase
          .from('produtos')
          .select('*')
          .order('id', { ascending: true });

        console.log('DADOS DO SUPABASE:', data);
        console.log('ERRO DO SUPABASE:', error);

        if (error) {
          throw error;
        }

        setProdutos(data || []);
      } catch (err) {
        console.error('Erro ao buscar produtos:', err);
        setErro(err.message || 'Não foi possível carregar os livros.');
      } finally {
        setCarregando(false);
      }
    }

    buscarProdutos();
  }, []);

  // ============================================================
  // LIVROS
  // ============================================================

  const livros = useMemo(() => {
    if (produtos.length === 0) {
      return FALLBACK_BOOKS;
    }

    return produtos.map((produto, index) => ({
      id: produto.id,
      titulo: produto.titulo || `Produto ${index + 1}`,
      autor: produto.autor || 'Autor não informado',
      preco: Number(produto.preco) || 0,
      categoria: getCategory(produto),
      imagem_url: produto.imagem_url || '',
      descricao:
        produto.descricao ||
        'Uma obra disponível no acervo da Alfarrábio.',
      isbn: produto.isbn || '',
      estoque: produto.estoque ?? 0,
      destaque: produto.destaque || false,
      ano_publicacao: produto.ano_publicacao || '',
    }));
  }, [produtos]);

  // ============================================================
  // CARRINHO
  // ============================================================

  const totalItens = carrinho.reduce(
    (total, item) => total + item.quantidade,
    0
  );

  const totalCarrinho = carrinho.reduce(
    (total, item) => total + item.preco * item.quantidade,
    0
  );

  function adicionarAoCarrinho(livro) {
    setCarrinho((atual) => {
      const existente = atual.find((item) => item.id === livro.id);

      if (existente) {
        return atual.map((item) =>
          item.id === livro.id
            ? {
                ...item,
                quantidade: item.quantidade + 1,
              }
            : item
        );
      }

      return [
        ...atual,
        {
          ...livro,
          quantidade: 1,
        },
      ];
    });

    setMensagemSacola(`${livro.titulo} foi adicionado à sacola.`);
    setCarrinhoAberto(true);
  }

  function removerDoCarrinho(id) {
    setCarrinho((atual) =>
      atual.filter((item) => item.id !== id)
    );
  }

  function diminuirQuantidade(id) {
    setCarrinho((atual) =>
      atual
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantidade: item.quantidade - 1,
              }
            : item
        )
        .filter((item) => item.quantidade > 0)
    );
  }

  function aumentarQuantidade(id) {
    setCarrinho((atual) =>
      atual.map((item) =>
        item.id === id
          ? {
              ...item,
              quantidade: item.quantidade + 1,
            }
          : item
      )
    );
  }

  function finalizarCompra() {
    if (carrinho.length === 0) {
      setMensagemSacola('Sua sacola ainda está vazia.');
      return;
    }

    setMensagemSacola(
      'Compra finalizada! Obrigado pela preferência.'
    );

    setCarrinho([]);
  }

  // ============================================================
  // NEWSLETTER
  // ============================================================

  function enviarNewsletter(event) {
    event.preventDefault();

    if (!email.trim()) {
      setMensagemNewsletter('Digite seu e-mail.');
      return;
    }

    setMensagemNewsletter(
      `Prontinho — a carta de leitura vai chegar em ${email}.`
    );

    setEmail('');
  }

  // ============================================================
  // JSX
  // ============================================================

  return (
    <>
      <style>{`
        :root {
          color-scheme: dark;
        }

        * {
          box-sizing: border-box;
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #1B120D;
          color: #F5EDE1;
          font-feature-settings: "liga" 1;
          font-family: Arial, Helvetica, sans-serif;
        }

        button,
        input {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .app {
          min-height: 100vh;
          background:
            radial-gradient(circle at top right, rgba(184,134,59,.10), transparent 28%),
            #1B120D;
        }

        .container {
          width: min(1180px, calc(100% - 40px));
          margin: 0 auto;
        }

        .grain {
          background-image:
            radial-gradient(
              rgba(255,255,255,.035) 1px,
              transparent 1px
            );
          background-size: 3px 3px;
        }

        .topbar {
          position: sticky;
          top: 0;
          z-index: 50;
          backdrop-filter: blur(16px);
          background: rgba(27,18,13,.88);
          border-bottom: 1px solid rgba(245,237,225,.09);
        }

        .nav {
          min-height: 76px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .logo {
          color: #F5EDE1;
          text-decoration: none;
          font-family: Georgia, serif;
          font-size: 25px;
          letter-spacing: -.04em;
          font-weight: 700;
        }

        .logo span {
          color: #C9A176;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .nav-links a {
          color: rgba(245,237,225,.68);
          text-decoration: none;
          font-size: 13px;
          transition: color .2s ease;
        }

        .nav-links a:hover {
          color: #F5EDE1;
        }

        .cart-button {
          border: 1px solid rgba(245,237,225,.18);
          background: rgba(245,237,225,.04);
          color: #F5EDE1;
          padding: 10px 14px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .cart-number {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #B8863B;
          color: #1B120D;
          font-size: 11px;
          font-weight: 700;
        }

        .mobile-button {
          display: none;
          background: none;
          border: 0;
          color: #F5EDE1;
          font-size: 24px;
        }

        .mobile-menu {
          padding: 10px 0 22px;
          display: none;
          flex-direction: column;
          gap: 14px;
        }

        .mobile-menu.open {
          display: flex;
        }

        .mobile-menu a {
          color: #F5EDE1;
          text-decoration: none;
          padding: 8px 0;
        }

        .hero {
          min-height: 690px;
          display: grid;
          align-items: center;
          padding: 90px 0;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.05fr .95fr;
          gap: 70px;
          align-items: center;
        }

        .eyebrow {
          color: #C9A176;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: .25em;
          font-weight: 700;
        }

        .hero h1 {
          font-family: Georgia, serif;
          font-size: clamp(48px, 7vw, 88px);
          line-height: .93;
          letter-spacing: -.055em;
          margin: 18px 0 25px;
          font-weight: 500;
        }

        .hero h1 span {
          color: #C9A176;
          font-style: italic;
        }

        .hero-text {
          color: rgba(245,237,225,.58);
          max-width: 540px;
          line-height: 1.8;
          font-size: 15px;
        }

        .hero-actions {
          display: flex;
          gap: 12px;
          margin-top: 30px;
          flex-wrap: wrap;
        }

        .button-primary,
        .button-secondary {
          border-radius: 999px;
          padding: 13px 20px;
          text-decoration: none;
          font-size: 13px;
          transition: transform .2s ease, background .2s ease;
        }

        .button-primary {
          background: #F5EDE1;
          color: #1B120D;
        }

        .button-secondary {
          color: #F5EDE1;
          border: 1px solid rgba(245,237,225,.18);
        }

        .button-primary:hover,
        .button-secondary:hover {
          transform: translateY(-2px);
        }

        .hero-note {
          margin-top: 30px;
          color: rgba(245,237,225,.36);
          font-size: 11px;
        }

        .shelf-area {
          height: 400px;
          position: relative;
          display: flex;
          align-items: flex-end;
          padding: 25px 18px 35px;
          border-bottom: 8px solid #362017;
          border-radius: 5px;
          background:
            linear-gradient(
              90deg,
              rgba(255,255,255,.025),
              transparent 20%,
              rgba(255,255,255,.025)
            ),
            #241710;
          box-shadow:
            0 30px 80px rgba(0,0,0,.25),
            inset 0 -10px 0 rgba(0,0,0,.18);
        }

        .shelf-books {
          width: 100%;
          height: 340px;
          display: flex;
          align-items: flex-end;
          gap: 7px;
        }

        .spine-wrap {
          height: 100%;
          flex: 1;
          display: flex;
          align-items: flex-end;
        }

        .spine {
          width: 100%;
          writing-mode: vertical-rl;
          text-orientation: mixed;
          transform-origin: bottom center;
          transition:
            transform .35s ease,
            box-shadow .35s ease,
            filter .3s ease;
          cursor: pointer;
          box-shadow:
            inset -6px 0 10px -6px rgba(0,0,0,.5),
            2px 0 0 rgba(0,0,0,.15);
          min-height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 3px 3px 0 0;
          color: rgba(245,237,225,.88);
          font-size: 11px;
          padding: 8px 5px;
          overflow: hidden;
        }

        .spine:hover,
        .spine.active {
          transform: translateY(-20px) rotateZ(-4deg);
          box-shadow: 6px 10px 24px rgba(0,0,0,.55);
          filter: brightness(1.08);
        }

        .spine-caption {
          position: absolute;
          left: 18px;
          bottom: 10px;
          font-size: 11px;
          color: rgba(245,237,225,.42);
        }

        .section {
          padding: 100px 0;
        }

        .section-light {
          background: #F5EDE1;
          color: #1B120D;
        }

        .section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 45px;
        }

        .section-title {
          font-family: Georgia, serif;
          font-size: clamp(36px, 5vw, 58px);
          line-height: 1;
          font-weight: 500;
          letter-spacing: -.04em;
          margin: 10px 0 0;
        }

        .section-description {
          max-width: 430px;
          color: rgba(245,237,225,.48);
          line-height: 1.7;
          font-size: 14px;
        }

        .section-light .section-description {
          color: rgba(27,18,13,.58);
        }

        .book-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px 22px;
        }

        .book-card {
          min-width: 0;
        }

        .book-cover {
          position: relative;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          border-radius: 6px;
          background: #3A281D;
          margin-bottom: 15px;
          box-shadow: 0 18px 35px rgba(0,0,0,.18);
        }

        .book-cover img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform .5s ease;
        }

        .book-card:hover .book-cover img {
          transform: scale(1.04);
        }

        .cover-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0,0,0,.75),
            transparent 55%
          );
        }

        .cover-title {
          position: absolute;
          left: 15px;
          right: 15px;
          bottom: 15px;
          color: white;
          font-family: Georgia, serif;
          font-size: 18px;
          line-height: 1.15;
        }

        .tag {
          position: absolute;
          left: 12px;
          top: 12px;
          background: rgba(27,18,13,.78);
          color: #C9A176;
          padding: 6px 9px;
          border-radius: 999px;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: .14em;
        }

        .add-book {
          position: absolute;
          right: 12px;
          bottom: 12px;
          width: 38px;
          height: 38px;
          border: 0;
          border-radius: 50%;
          background: #F5EDE1;
          color: #1B120D;
          display: grid;
          place-items: center;
          font-size: 20px;
          opacity: 0;
          transform: translateY(5px);
          transition: opacity .2s ease, transform .2s ease;
        }

        .book-card:hover .add-book,
        .add-book:focus {
          opacity: 1;
          transform: translateY(0);
        }

        .book-title {
          margin: 0;
          color: #F5EDE1;
          font-size: 14px;
          font-weight: 600;
        }

        .book-author {
          color: rgba(245,237,225,.45);
          font-size: 12px;
          margin: 5px 0 0;
        }

        .book-price {
          color: #C9A176;
          font-family: monospace;
          font-size: 13px;
          margin-top: 10px;
        }

        .tabs {
          display: flex;
          gap: 9px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }

        .tab {
          padding: 9px 15px;
          border-radius: 999px;
          background: transparent;
          border: 1px solid rgba(27,18,13,.16);
          color: #1B120D;
          font-size: 12px;
        }

        .tab.active {
          background: #1B120D;
          color: #F5EDE1;
        }

        .catalog-list {
          border-top: 1px solid rgba(27,18,13,.12);
        }

        .catalog-row {
          padding: 22px 0;
          border-bottom: 1px solid rgba(27,18,13,.12);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .catalog-number {
          color: rgba(27,18,13,.38);
          font-family: monospace;
          font-size: 11px;
          width: 35px;
        }

        .catalog-name {
          flex: 1;
          font-family: Georgia, serif;
          font-size: 16px;
        }

        .catalog-category {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: .12em;
          color: rgba(27,18,13,.52);
          border: 1px solid rgba(27,18,13,.15);
          padding: 6px 8px;
          border-radius: 999px;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-top: 1px solid rgba(245,237,225,.1);
          border-bottom: 1px solid rgba(245,237,225,.1);
        }

        .stat {
          padding: 45px 25px;
          border-right: 1px solid rgba(245,237,225,.1);
        }

        .stat:last-child {
          border-right: 0;
        }

        .stat strong {
          display: block;
          font-family: Georgia, serif;
          font-size: 44px;
          font-weight: 500;
          color: #C9A176;
        }

        .stat span {
          display: block;
          margin-top: 7px;
          font-size: 11px;
          color: rgba(245,237,225,.4);
          text-transform: uppercase;
          letter-spacing: .12em;
        }

        .newsletter {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .newsletter h2 {
          font-family: Georgia, serif;
          font-weight: 500;
          font-size: clamp(35px, 5vw, 55px);
          line-height: 1;
          margin: 15px 0;
        }

        .newsletter p {
          color: rgba(245,237,225,.48);
          line-height: 1.7;
          max-width: 480px;
        }

        .newsletter-form {
          display: flex;
          border-bottom: 1px solid rgba(245,237,225,.25);
          padding-bottom: 10px;
        }

        .newsletter-form input {
          flex: 1;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: #F5EDE1;
          padding: 12px 0;
        }

        .newsletter-form input::placeholder {
          color: rgba(245,237,225,.3);
        }

        .newsletter-form button {
          border: 0;
          background: none;
          color: #C9A176;
          font-size: 12px;
          font-weight: 700;
        }

        .newsletter-message {
          color: #C9A176;
          font-size: 12px;
          margin-top: 15px;
        }

        footer {
          border-top: 1px solid rgba(245,237,225,.09);
          padding: 35px 0;
        }

        .footer-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .footer-content p {
          color: rgba(245,237,225,.3);
          font-size: 11px;
          margin: 0;
        }

        .error-box {
          background: rgba(160,50,40,.15);
          border: 1px solid rgba(220,100,80,.35);
          color: #f1b4a8;
          padding: 14px 16px;
          border-radius: 8px;
          margin-bottom: 25px;
          font-size: 13px;
        }

        .loading {
          padding: 50px;
          text-align: center;
          color: rgba(245,237,225,.5);
        }

        /* CARRINHO */

        .cart-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(0,0,0,.55);
          backdrop-filter: blur(4px);
        }

        .cart-panel {
          position: absolute;
          right: 0;
          top: 0;
          height: 100%;
          width: min(430px, 100%);
          background: #21150f;
          border-left: 1px solid rgba(245,237,225,.1);
          display: flex;
          flex-direction: column;
          box-shadow: -25px 0 60px rgba(0,0,0,.35);
        }

        .cart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px;
          border-bottom: 1px solid rgba(245,237,225,.1);
        }

        .cart-header h2 {
          margin: 0;
          font-family: Georgia, serif;
          font-weight: 500;
        }

        .close-cart {
          width: 35px;
          height: 35px;
          border: 1px solid rgba(245,237,225,.15);
          background: transparent;
          color: #F5EDE1;
          border-radius: 50%;
          font-size: 18px;
        }

        .cart-items {
          flex: 1;
          overflow: auto;
        }

        .cart-empty {
          padding: 40px 22px;
          color: rgba(245,237,225,.4);
          text-align: center;
        }

        .cart-item {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 18px 22px;
          border-bottom: 1px solid rgba(245,237,225,.07);
        }

        .cart-item-image {
          width: 52px;
          height: 68px;
          border-radius: 3px;
          object-fit: cover;
          background: #3A281D;
          flex-shrink: 0;
        }

        .cart-item-info {
          flex: 1;
          min-width: 0;
        }

        .cart-item-title {
          color: #F5EDE1;
          font-size: 13px;
          margin: 0;
        }

        .cart-item-price {
          color: #C9A176;
          font-size: 12px;
          margin-top: 5px;
        }

        .quantity {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 8px;
        }

        .quantity button {
          width: 23px;
          height: 23px;
          border-radius: 50%;
          border: 1px solid rgba(245,237,225,.15);
          background: transparent;
          color: #F5EDE1;
        }

        .remove {
          background: none;
          border: 0;
          color: rgba(245,237,225,.3);
          font-size: 12px;
        }

        .cart-footer {
          border-top: 1px solid rgba(245,237,225,.1);
          padding: 20px 22px;
        }

        .cart-summary {
          display: flex;
          justify-content: space-between;
          color: rgba(245,237,225,.5);
          font-size: 12px;
          margin-bottom: 9px;
        }

        .cart-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 17px;
        }

        .cart-total strong {
          font-family: Georgia, serif;
          font-size: 22px;
          font-weight: 500;
        }

        .checkout {
          width: 100%;
          padding: 13px;
          border: 0;
          border-radius: 999px;
          background: #F5EDE1;
          color: #1B120D;
          font-weight: 700;
        }

        .cart-message {
          color: #C9A176;
          font-size: 11px;
          margin-bottom: 12px;
        }

        @media (max-width: 900px) {
          .hero-grid,
          .newsletter {
            grid-template-columns: 1fr;
          }

          .hero {
            padding: 65px 0;
          }

          .book-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .nav-links {
            display: none;
          }

          .mobile-button {
            display: block;
          }

          .hero-grid {
            gap: 45px;
          }
        }

        @media (max-width: 600px) {
          .container {
            width: min(100% - 28px, 1180px);
          }

          .hero h1 {
            font-size: 51px;
          }

          .shelf-area {
            height: 310px;
            padding: 15px 10px 30px;
          }

          .shelf-books {
            height: 260px;
            gap: 4px;
          }

          .spine {
            font-size: 8px;
          }

          .book-grid {
            gap: 25px 12px;
          }

          .cover-title {
            font-size: 14px;
          }

          .add-book {
            opacity: 1;
            transform: none;
            width: 32px;
            height: 32px;
          }

          .section-header {
            display: block;
          }

          .section-description {
            margin-top: 20px;
          }

          .stats {
            grid-template-columns: 1fr;
          }

          .stat {
            border-right: 0;
            border-bottom: 1px solid rgba(245,237,225,.1);
          }

          .stat:last-child {
            border-bottom: 0;
          }

          .catalog-row {
            align-items: flex-start;
          }

          .catalog-category {
            display: none;
          }

          .footer-content {
            display: block;
          }

          .footer-content p + p {
            margin-top: 10px;
          }
        }
      `}</style>

      <div className="app grain">

        {/* ======================================================
            NAVBAR
        ====================================================== */}

        <header className="topbar">
          <div className="container">
            <nav className="nav">

              <a href="#inicio" className="logo">
                alfarrábio<span>.</span>
              </a>

              <div className="nav-links">
                <a href="#acervo">Acervo</a>
                <a href="#catalogo">Catálogo</a>
                <a href="#historia">História</a>
                <a href="#visita">Visita</a>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="cart-button"
                  onClick={() => {
                    setCarrinhoAberto(true);
                    setMensagemSacola('');
                  }}
                >
                  Sacola
                  <span className="cart-number">
                    {totalItens}
                  </span>
                </button>

                <button
                  className="mobile-button"
                  onClick={() => setMenuAberto(!menuAberto)}
                  aria-label="Abrir menu"
                >
                  ☰
                </button>
              </div>
            </nav>

            <div className={`mobile-menu ${menuAberto ? 'open' : ''}`}>
              <a
                href="#acervo"
                onClick={() => setMenuAberto(false)}
              >
                Acervo
              </a>

              <a
                href="#catalogo"
                onClick={() => setMenuAberto(false)}
              >
                Catálogo
              </a>

              <a
                href="#historia"
                onClick={() => setMenuAberto(false)}
              >
                História
              </a>

              <a
                href="#visita"
                onClick={() => setMenuAberto(false)}
              >
                Visita
              </a>
            </div>
          </div>
        </header>

        {/* ======================================================
            HERO
        ====================================================== */}

        <main>

          <section id="inicio" className="hero">
            <div className="container hero-grid">

              <div>
                <div className="eyebrow">
                  Livros para ficar
                </div>

                <h1>
                  Histórias que
                  <br />
                  <span>merecem</span>
                  <br />
                  permanecer.
                </h1>

                <p className="hero-text">
                  Um acervo escolhido com calma, entre clássicos,
                  descobertas contemporâneas e aquelas histórias
                  que você encontra por acaso e nunca mais esquece.
                </p>

                <div className="hero-actions">
                  <a
                    href="#acervo"
                    className="button-primary"
                  >
                    Explorar acervo
                  </a>

                  <a
                    href="#historia"
                    className="button-secondary"
                  >
                    Conheça a livraria
                  </a>
                </div>

                <div className="hero-note">
                  Livros selecionados • Leitura sem pressa
                </div>
              </div>

              {/* PRATELEIRA */}

              <div className="shelf-area">

                <div className="shelf-books">

                  {livros.slice(0, 8).map((livro, index) => (
                    <div
                      className="spine-wrap"
                      key={livro.id}
                    >
                      <div
                        className={`spine ${
                          livroSelecionado?.id === livro.id
                            ? 'active'
                            : ''
                        }`}
                        style={{
                          height: `${
                            HEIGHTS[index % HEIGHTS.length]
                          }%`,
                          background:
                            index % 3 === 0
                              ? '#5C3A28'
                              : index % 3 === 1
                              ? '#63432E'
                              : '#8B5E3C',
                        }}
                        tabIndex="0"
                        role="button"
                        onMouseEnter={() =>
                          setLivroSelecionado(livro)
                        }
                        onFocus={() =>
                          setLivroSelecionado(livro)
                        }
                        onClick={() =>
                          adicionarAoCarrinho(livro)
                        }
                        onKeyDown={(event) => {
                          if (
                            event.key === 'Enter' ||
                            event.key === ' '
                          ) {
                            event.preventDefault();
                            adicionarAoCarrinho(livro);
                          }
                        }}
                      >
                        {livro.titulo.length > 22
                          ? `${livro.titulo.slice(0, 20)}…`
                          : livro.titulo}
                      </div>
                    </div>
                  ))}

                </div>

                <div className="spine-caption">
                  {livroSelecionado
                    ? `${livroSelecionado.titulo} — ${livroSelecionado.autor} — ${formatPrice(
                        livroSelecionado.preco
                      )}`
                    : 'Passe o mouse sobre os livros'}
                </div>

              </div>

            </div>
          </section>

          {/* ====================================================
              ACERVO
          ==================================================== */}

          <section id="acervo" className="section">
            <div className="container">

              <div className="section-header">

                <div>
                  <div className="eyebrow">
                    Nosso acervo
                  </div>

                  <h2 className="section-title">
                    Livros escolhidos.
                  </h2>
                </div>

                <p className="section-description">
                  Obras cadastradas diretamente no catálogo
                  da Alfarrábio. As informações abaixo são
                  carregadas do Supabase.
                </p>

              </div>

              {erro && (
                <div className="error-box">
                  <strong>Erro ao conectar ao Supabase:</strong>
                  <br />
                  {erro}
                </div>
              )}

              {carregando ? (
                <div className="loading">
                  Carregando livros do Supabase...
                </div>
              ) : (
                <div className="book-grid">

                  {livros.map((livro) => (
                    <article
                      className="book-card"
                      key={livro.id}
                    >

                      <div className="book-cover">

                        {livro.imagem_url ? (
                          <img
                            src={livro.imagem_url}
                            alt={`Capa de ${livro.titulo}`}
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.style.display =
                                'none';
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              display: 'grid',
                              placeItems: 'center',
                              padding: 25,
                              textAlign: 'center',
                              background:
                                'linear-gradient(145deg,#63432E,#1B120D)',
                            }}
                          >
                            <span
                              style={{
                                fontFamily: 'Georgia, serif',
                                fontSize: 22,
                              }}
                            >
                              {livro.titulo}
                            </span>
                          </div>
                        )}

                        <div className="cover-overlay" />

                        <span className="tag">
                          {livro.categoria}
                        </span>

                        <div className="cover-title">
                          {livro.titulo}
                        </div>

                        <button
                          className="add-book"
                          aria-label={`Adicionar ${livro.titulo} à sacola`}
                          onClick={() =>
                            adicionarAoCarrinho(livro)
                          }
                        >
                          +
                        </button>

                      </div>

                      <h3 className="book-title">
                        {livro.titulo}
                      </h3>

                      <p className="book-author">
                        {livro.autor}
                      </p>

                      <p className="book-price">
                        {formatPrice(livro.preco)}
                      </p>

                    </article>
                  ))}

                </div>
              )}

            </div>
          </section>

          {/* ====================================================
              CATÁLOGO
          ==================================================== */}

          <section
            id="catalogo"
            className="section section-light"
          >
            <div className="container">

              <div className="section-header">

                <div>
                  <div className="eyebrow">
                    Navegue por gênero
                  </div>

                  <h2 className="section-title">
                    Catálogo.
                  </h2>
                </div>

                <p className="section-description">
                  Uma pequena seleção organizada para facilitar
                  sua próxima descoberta.
                </p>

              </div>

              <div className="tabs">

                {Object.keys(SECTIONS).map((nome) => (
                  <button
                    key={nome}
                    className={`tab ${
                      categoria === nome ? 'active' : ''
                    }`}
                    onClick={() => setCategoria(nome)}
                  >
                    {nome}
                  </button>
                ))}

              </div>

              <div className="catalog-list">

                {SECTIONS[categoria].map((item, index) => (
                  <div
                    className="catalog-row"
                    key={item}
                  >

                    <span className="catalog-number">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <span className="catalog-name">
                      {item}
                    </span>

                    <span className="catalog-category">
                      {categoria}
                    </span>

                  </div>
                ))}

              </div>

            </div>
          </section>

          {/* ====================================================
              HISTÓRIA
          ==================================================== */}

          <section id="historia" className="section">

            <div className="container">

              <div className="section-header">

                <div>
                  <div className="eyebrow">
                    Desde sempre
                  </div>

                  <h2 className="section-title">
                    Uma livraria para
                    <br />
                    quem gosta de livros.
                  </h2>
                </div>

                <p className="section-description">
                  A Alfarrábio nasceu da ideia de criar um espaço
                  onde encontrar um livro pudesse ser tão especial
                  quanto começar a lê-lo.
                </p>

              </div>

              <div className="stats">

                <div className="stat">
                  <strong>+1k</strong>
                  <span>livros no acervo</span>
                </div>

                <div className="stat">
                  <strong>+20</strong>
                  <span>categorias</span>
                </div>

                <div className="stat">
                  <strong>24h</strong>
                  <span>para encontrar uma nova história</span>
                </div>

              </div>

            </div>

          </section>

          {/* ====================================================
              NEWSLETTER
          ==================================================== */}

          <section id="visita" className="section">

            <div className="container newsletter">

              <div>
                <div className="eyebrow">
                  Carta de leitura
                </div>

                <h2>
                  Receba uma
                  <br />
                  história por vez.
                </h2>

                <p>
                  Novidades do acervo, recomendações e
                  descobertas literárias direto no seu e-mail.
                </p>
              </div>

              <div>

                <form
                  className="newsletter-form"
                  onSubmit={enviarNewsletter}
                >
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                  />

                  <button type="submit">
                    ASSINAR →
                  </button>
                </form>

                {mensagemNewsletter && (
                  <div className="newsletter-message">
                    {mensagemNewsletter}
                  </div>
                )}

              </div>

            </div>

          </section>

        </main>

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <footer>
          <div className="container footer-content">

            <p>
              © 2026 Alfarrábio — Livros para ficar.
            </p>

            <p>
              Desenvolvido com React + Supabase.
            </p>

          </div>
        </footer>

        {/* ======================================================
            CARRINHO
        ====================================================== */}

        {carrinhoAberto && (
          <div
            className="cart-overlay"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setCarrinhoAberto(false);
              }
            }}
          >

            <aside className="cart-panel">

              <div className="cart-header">

                <h2>Sua sacola</h2>

                <button
                  className="close-cart"
                  onClick={() =>
                    setCarrinhoAberto(false)
                  }
                  aria-label="Fechar sacola"
                >
                  ×
                </button>

              </div>

              <div className="cart-items">

                {carrinho.length === 0 ? (
                  <div className="cart-empty">
                    Sua sacola está vazia.
                  </div>
                ) : (
                  carrinho.map((item) => (
                    <div
                      className="cart-item"
                      key={item.id}
                    >

                      {item.imagem_url ? (
                        <img
                          className="cart-item-image"
                          src={item.imagem_url}
                          alt=""
                        />
                      ) : (
                        <div className="cart-item-image" />
                      )}

                      <div className="cart-item-info">

                        <p className="cart-item-title">
                          {item.titulo}
                        </p>

                        <p className="cart-item-price">
                          {formatPrice(item.preco)}
                        </p>

                        <div className="quantity">

                          <button
                            onClick={() =>
                              diminuirQuantidade(item.id)
                            }
                          >
                            −
                          </button>

                          <span>
                            {item.quantidade}
                          </span>

                          <button
                            onClick={() =>
                              aumentarQuantidade(item.id)
                            }
                          >
                            +
                          </button>

                        </div>

                      </div>

                      <button
                        className="remove"
                        onClick={() =>
                          removerDoCarrinho(item.id)
                        }
                      >
                        remover
                      </button>

                    </div>
                  ))
                )}

              </div>

              <div className="cart-footer">

                {mensagemSacola && (
                  <div className="cart-message">
                    {mensagemSacola}
                  </div>
                )}

                <div className="cart-summary">
                  <span>
                    {totalItens}{' '}
                    {totalItens === 1
                      ? 'item'
                      : 'itens'}
                  </span>

                  <span>
                    subtotal
                  </span>
                </div>

                <div className="cart-total">

                  <span>Total</span>

                  <strong>
                    {formatPrice(totalCarrinho)}
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
    </>
  );
}