import { useEffect, useMemo, useState } from "react";
import { supabase } from "./services/supabaseClient";

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

  "@media (max-width: 600px) { .container { width: calc(100% - 28px); } .book-grid { grid-template-columns: repeat(2, 1fr); gap: 15px; } .section-head { display: block; } .section-description { margin-top: 20px; } .newsletter-form { display: block; } .newsletter-form button { width: 100%; margin-top: 10px; padding: 14px; } .shelf { height: 230px; } .add-button { opacity: 1; } }"
].join("\n");

function formatPrice(value) {
  const number = Number(value) || 0;
  return "R$ " + number.toFixed(2).replace(".", ",");
}

function getCategory(produto) {
  if (produto.categoria) {
    return String(produto.categoria);
  }

  if (produto.categoria_id) {
    return "Categoria " + produto.categoria_id;
  }

  return "Livro";
}

function App() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Ficção");
  const [email, setEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");

  useEffect(function () {
    async function carregarProdutos() {
      console.log("TESTANDO SUPABASE...");

      const resposta = await supabase
        .from("produtos")
        .select("*")
        .order("id", { ascending: true });

      console.log("DADOS DO SUPABASE:", resposta.data);
      console.log("ERRO DO SUPABASE:", resposta.error);

      if (resposta.error) {
        setErro(resposta.error.message);
        setProdutos([]);
      } else {
        setProdutos(resposta.data || []);
      }

      setCarregando(false);
    }

    carregarProdutos();
  }, []);

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

  return (
    <div className="app">
      <style>{CSS}</style>

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
            <button
              className="icon-button"
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
              🛍 Sacola
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