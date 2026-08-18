// ============================================================
// TEKNO — script.js
// ============================================================

// ---------- Datos: productos ----------
// ---------- Datos: productos desde Google Sheets ----------

let productos = [];

const GOOGLE_SHEETS_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRSdH31trF8eERmCwXOU7Mgy4mq3RzjHWkscWs8c7M-UwtFNOHspYxReFkiMwNMxqEbtzfWEi1uUjJM/pub?output=csv";

function parseCSV(texto) {
  const filas = [];
  let fila = [];
  let campo = "";
  let dentroDeComillas = false;

  for (let i = 0; i < texto.length; i++) {
    const caracter = texto[i];
    const siguiente = texto[i + 1];

    if (caracter === '"' && dentroDeComillas && siguiente === '"') {
      campo += '"';
      i++;
      continue;
    }

    if (caracter === '"') {
      dentroDeComillas = !dentroDeComillas;
      continue;
    }

    if (caracter === "," && !dentroDeComillas) {
      fila.push(campo);
      campo = "";
      continue;
    }

    if (
      (caracter === "\n" || caracter === "\r") &&
      !dentroDeComillas
    ) {
      if (caracter === "\r" && siguiente === "\n") {
        i++;
      }

      fila.push(campo);
      filas.push(fila);
      fila = [];
      campo = "";
      continue;
    }

    campo += caracter;
  }

  if (campo !== "" || fila.length > 0) {
    fila.push(campo);
    filas.push(fila);
  }

  return filas;
}

async function cargarProductos() {
  try {
    const url =
      GOOGLE_SHEETS_URL +
      "&cache=" +
      Date.now();

    const respuesta = await fetch(url, {
      cache: "no-store",
    });

    if (!respuesta.ok) {
      throw new Error("No se pudo cargar Google Sheets");
    }

    const textoCSV = await respuesta.text();
    console.log("========== GOOGLE SHEETS ==========");
    console.log(textoCSV);
    console.log("===================================");
    const filas = parseCSV(textoCSV);

    if (!filas.length) {
      console.warn("Google Sheets no devolvió productos.");
      return;
    }

    const encabezados = filas[0];

    const productosNuevos = filas
      .slice(1)
      .filter((fila) => fila.length > 1 && fila[0])
      .map((fila) => {
        const producto = {};

        encabezados.forEach((encabezado, index) => {
          producto[encabezado.trim()] =
            fila[index]?.trim() || "";
        });

        return {
          id: Number(producto.id),
          nombre: producto.nombre,
          categoria: producto.categoria,
          precio: Number(producto.precio),
          emoji: producto.emoji,
          imagen: producto.imagen,
          stock: Number(producto.stock),
          descripcion: producto.descripcion,
        };
      });

    // Primera carga
    if (productos.length === 0) {
      productos = productosNuevos;

      console.log("✅ Productos cargados por primera vez:", productos);

      iniciarWeb();
      return;
    }

    // Comparamos antes de reemplazar
    const productosAnteriores =
      JSON.stringify(productos);
      console.log("========== STOCK RECIBIDO ==========");

    productosNuevos.forEach((p) => {
      console.log(
        "ID:",
        p.id,
        "|",
        p.nombre,
        "| STOCK:",
        p.stock,
        "| TIPO:",
        typeof p.stock
      );
    });

    console.log("====================================");
    const datosNuevos =
      JSON.stringify(productosNuevos);

    // Si realmente cambió algo
    if (productosAnteriores !== datosNuevos) {
      console.log("🔄 Cambiaron los productos de Google Sheets");

      productos = productosNuevos;

      // SOLO actualizamos las partes que muestran productos
      renderPreviewProductos();
      renderCatalogo();
      renderCarrito();

      activarReveal();
    } else {
      console.log("✓ Sin cambios");
    }

  } catch (error) {
    console.error(
      "❌ Error al cargar productos desde Google Sheets:",
      error
    );
  }
}
const categorias = [
  "Todos",
  "Audio",
  "Cargadores",
  "Cables",
  "Fundas",
  "Protectores",
  "Accesorios",
];

// ---------- Datos de contacto ----------
const WHATSAPP_NUMERO = "5493425545489";
const WHATSAPP_MENSAJE =
  "Hola! Quiero hacer una consulta sobre un producto de Tekno.";
const INSTAGRAM_USUARIO = "tekno.sf";
const EMAIL_CONTACTO = "teknoosf@gmail.com";

// ---------- Íconos ----------
const ICONS = {
  truck:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="7" width="13" height="10" rx="1"/><path d="M14 10h4l4 3.2V17h-8z"/><circle cx="6" cy="19" r="1.7"/><circle cx="17.5" cy="19" r="1.7"/></svg>',

  shield:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 5v6c0 5 3.5 8.7 8 10 4.5-1.3 8-5 8-10V5z"/><path d="M9 12.2l2 2 4.2-4.4"/></svg>',

  chat:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.4 8.4 0 0 1-3.9-.9L3 21l1.9-5.6A8.5 8.5 0 1 1 21 11.5z"/></svg>',

  refresh:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></svg>',

  camera:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="15" rx="3.5"/><circle cx="12" cy="12.5" r="4"/><circle cx="17.3" cy="8.2" r=".6" fill="currentColor" stroke="none"/></svg>',

  mail:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5"/></svg>',

  star:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 6.5 7 .8-5.2 4.9L18.2 21 12 17.3 5.8 21l1.4-6.8L2 9.3l7-.8z"/></svg>',

  arrow:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/><path d="M2.5 3h2.4l2.1 12.2a2 2 0 0 0 2 1.6h8.3a2 2 0 0 0 2-1.6L21 7H6"/></svg>',
  
  sparkle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/></svg>',
  
  trending: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>',
  
  };

function renderIcons() {
  document.querySelectorAll("[data-icon]").forEach((el) => {
    const name = el.getAttribute("data-icon");
    if (ICONS[name]) {
      el.innerHTML = ICONS[name];
    }
  });
}

// ---------- Formato de precio ----------
function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(valor);
}

function buscarProducto(id) {
  return productos.find((p) => p.id === Number(id));
}

// ============================================================
// TARJETAS DE PRODUCTOS
// ============================================================

function tarjetaProducto(p) {
  return `
    <article class="product-card reveal" data-id="${p.id}">
      <div class="product-card__media">
        <span class="stock-tag ${
          p.stock ? "stock-tag--in" : "stock-tag--out"
        }">
          ${p.stock ? "En stock" : "Sin stock"}
        </span>

        <span class="product-card__emoji">${p.emoji}</span>

        ${
          p.imagen
            ? `<img src="${p.imagen}" alt="${p.nombre}" onerror="this.style.display='none'">`
            : ""
        }
      </div>

      <div class="product-card__body">
        <span class="cat">${p.categoria}</span>
        <h3>${p.nombre}</h3>

        <span class="product-card__price">
          ${formatearPrecio(p.precio)}
        </span>

        <button
          class="product-card__cta"
          ${p.stock ? "" : "disabled"}
          data-id="${p.id}"
        >
          ${p.stock ? "Agregar al carrito" : "Sin stock"}
        </button>
      </div>
    </article>
  `;
}

// ---------- Home ----------
function renderPreviewProductos() {
  const grid = document.getElementById("previewGrid");

  if (!grid) return;

  grid.innerHTML = productos
    .slice(0, 4)
    .map(tarjetaProducto)
    .join("");
}

// ---------- Catálogo ----------
function renderCatalogo() {
  const grid = document.getElementById("productsGrid");
  const filtros = document.getElementById("filters");

  if (!grid || !filtros) return;

  filtros.innerHTML = categorias
    .map(
      (cat, i) =>
        `<button class="filter-btn ${
          i === 0 ? "active" : ""
        }" data-cat="${cat}">${cat}</button>`
    )
    .join("");

  const pintar = (categoriaActiva) => {
    const lista =
      categoriaActiva === "Todos"
        ? productos
        : productos.filter((p) => p.categoria === categoriaActiva);

    grid.innerHTML = lista.map(tarjetaProducto).join("");

    activarReveal();
  };

  filtros.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      filtros
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));

      btn.classList.add("active");

      pintar(btn.dataset.cat);
    });
  });

  const catUrl = new URLSearchParams(window.location.search).get("cat");

  const catInicial = categorias.includes(catUrl) ? catUrl : "Todos";

  filtros.querySelectorAll(".filter-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.cat === catInicial);
  });

  pintar(catInicial);
}

// ============================================================
// MENÚ MOBILE
// ============================================================

function initMenu() {
  const navbar = document.getElementById("navbar");
  const burger = document.getElementById("burgerBtn");

  if (!navbar || !burger) return;

  burger.addEventListener("click", () => {
    navbar.classList.toggle("is-open");
  });

  navbar.querySelectorAll(".navbar__links a").forEach((link) =>
    link.addEventListener("click", () => {
      navbar.classList.remove("is-open");
    })
  );
}

// ============================================================
// ANIMACIÓN SCROLL
// ============================================================

function activarReveal() {
  const elementos = document.querySelectorAll(
    ".reveal:not(.is-visible)"
  );

  if (!("IntersectionObserver" in window)) {
    elementos.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
    }
  );

  elementos.forEach((el) => observer.observe(el));
}

// ============================================================
// CONTACTO
// ============================================================

function initContacto() {
  const waLink = document.getElementById("whatsappLink");
  const igLink = document.getElementById("instagramLink");
  const form = document.getElementById("contactForm");

  if (waLink) {
    waLink.href = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(
      WHATSAPP_MENSAJE
    )}`;
  }

  if (igLink) {
    igLink.href = `https://instagram.com/${INSTAGRAM_USUARIO}`;
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const nombre = document
        .getElementById("nombre")
        .value.trim();

      const email = document
        .getElementById("email")
        .value.trim();

      const mensaje = document
        .getElementById("mensaje")
        .value.trim();

      const asunto = encodeURIComponent(
        `Consulta de ${nombre} — Tekno`
      );

      const cuerpo = encodeURIComponent(
        `Nombre: ${nombre}\nEmail: ${email}\n\nMensaje:\n${mensaje}`
      );

      window.location.href = `mailto:${EMAIL_CONTACTO}?subject=${asunto}&body=${cuerpo}`;
    });
  }
}

// ---------- Footer ----------
function initFooterLinks() {
  const waFooter = document.getElementById("footerWhatsapp");
  const igFooter = document.getElementById("footerInstagram");

  if (waFooter) {
    waFooter.href = `https://wa.me/${WHATSAPP_NUMERO}`;
  }

  if (igFooter) {
    igFooter.href = `https://instagram.com/${INSTAGRAM_USUARIO}`;
  }
}

// ============================================================
// CARRITO
// ============================================================

const CARRITO_KEY = "tekno_carrito";

function leerCarrito() {
  try {
    return JSON.parse(localStorage.getItem(CARRITO_KEY)) || [];
  } catch {
    return [];
  }
}

function guardarCarrito(carrito) {
  localStorage.setItem(
    CARRITO_KEY,
    JSON.stringify(carrito)
  );

  actualizarBadgeCarrito();
}

function actualizarBadgeCarrito() {
  const carrito = leerCarrito();

  const total = carrito.reduce(
    (acc, item) => acc + item.cantidad,
    0
  );

  document
    .querySelectorAll(".navbar__cart .badge")
    .forEach((el) => {
      el.textContent = total;
    });
}

// ============================================================
// AGREGAR AL CARRITO
// ============================================================

function agregarAlCarrito(id, cantidad = 1) {
  const producto = buscarProducto(id);

  if (!producto || producto.stock <= 0) return;

  const carrito = leerCarrito();

  const existente = carrito.find(
    (item) => item.id === Number(id)
  );

  const cantidadActual = existente
    ? existente.cantidad
    : 0;

  // Nunca permitir superar el stock
  const cantidadFinal = Math.min(
    cantidadActual + cantidad,
    producto.stock
  );

  // Si ya tenemos todo el stock, no hacemos nada
  if (cantidadFinal <= cantidadActual) {
    return;
  }

  if (existente) {
    existente.cantidad = cantidadFinal;
  } else {
    carrito.push({
      id: Number(id),
      cantidad: cantidadFinal,
    });
  }

  guardarCarrito(carrito);

  renderCarrito();

  abrirCarrito();
}

// ============================================================
// CAMBIAR CANTIDAD DESDE EL CARRITO
// ============================================================

function cambiarCantidadCarrito(id, delta) {
  const carrito = leerCarrito();

  const item = carrito.find(
    (i) => i.id === Number(id)
  );

  if (!item) return;

  const producto = buscarProducto(id);

  if (!producto) return;

  const nuevaCantidad = item.cantidad + delta;

  // No bajar de 1 ni superar stock
  if (nuevaCantidad > producto.stock) {
    return;
  }

  item.cantidad = nuevaCantidad;

  const carritoFinal = carrito.filter(
    (i) => i.cantidad > 0
  );

  guardarCarrito(carritoFinal);

  renderCarrito();
}

// ============================================================
// QUITAR DEL CARRITO
// ============================================================

function quitarDelCarrito(id) {
  const carrito = leerCarrito().filter(
    (i) => i.id !== Number(id)
  );

  guardarCarrito(carrito);

  renderCarrito();
}

// ============================================================
// RENDER CARRITO
// ============================================================

function renderCarrito() {
  const cont = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  const checkoutBtn = document.getElementById("cartCheckout");

  if (!cont || !totalEl) return;

  const carrito = leerCarrito();

  if (carrito.length === 0) {
    cont.innerHTML = `
      <p class="cart-empty">
        Tu carrito está vacío.
      </p>
    `;

    totalEl.textContent = formatearPrecio(0);

    if (checkoutBtn) {
      checkoutBtn.disabled = true;
    }

    return;
  }

  let total = 0;

  cont.innerHTML = carrito
    .map((item) => {
      const p = buscarProducto(item.id);

      if (!p) return "";

      const subtotal = p.precio * item.cantidad;

      total += subtotal;

      return `
        <div class="cart-item" data-id="${p.id}">

          <div class="cart-item__media">
            <span>${p.emoji}</span>

            ${
              p.imagen
                ? `<img src="${p.imagen}" alt="${p.nombre}" onerror="this.style.display='none'">`
                : ""
            }
          </div>

          <div class="cart-item__body">

            <strong>${p.nombre}</strong>

            <span class="cart-item__price">
              ${formatearPrecio(p.precio)}
            </span>

            <div class="cart-item__qty">

              <button
                class="qty-btn"
                data-action="dec"
                data-id="${p.id}"
              >
                −
              </button>

              <span>${item.cantidad}</span>

              <button
                class="qty-btn"
                data-action="inc"
                data-id="${p.id}"
                ${item.cantidad >= p.stock ? "disabled" : ""}
              >
                +
              </button>

            </div>

          </div>

          <button
            class="cart-item__remove"
            data-action="remove"
            data-id="${p.id}"
            aria-label="Quitar"
          >
            ✕
          </button>

        </div>
      `;
    })
    .join("");

  totalEl.textContent = formatearPrecio(total);

  if (checkoutBtn) {
    checkoutBtn.disabled = false;
  }
}

// ============================================================
// ABRIR / CERRAR CARRITO
// ============================================================

function abrirCarrito() {
  document
    .getElementById("cartDrawer")
    ?.classList.add("is-open");

  document
    .getElementById("cartBackdrop")
    ?.classList.add("is-open");

  document.body.classList.add("no-scroll");
}

function cerrarCarrito() {
  document
    .getElementById("cartDrawer")
    ?.classList.remove("is-open");

  document
    .getElementById("cartBackdrop")
    ?.classList.remove("is-open");

  if (
    !document
      .getElementById("productModal")
      ?.classList.contains("is-open")
  ) {
    document.body.classList.remove("no-scroll");
  }
}

// ============================================================
// CHECKOUT WHATSAPP
// ============================================================

function checkoutWhatsapp() {
  const carrito = leerCarrito();

  if (carrito.length === 0) return;

  let total = 0;

  const lineas = carrito.map((item) => {
    const p = buscarProducto(item.id);

    if (!p) return "";

    const subtotal = p.precio * item.cantidad;

    total += subtotal;

    return `• ${p.nombre} x${item.cantidad} — ${formatearPrecio(
      subtotal
    )}`;
  });

  const mensaje = [
    "Hola! Quiero hacer este pedido en Tekno:",
    "",
    ...lineas,
    "",
    `Total: ${formatearPrecio(total)}`,
  ].join("\n");

  window.open(
    `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(
      mensaje
    )}`,
    "_blank"
  );
}

// ============================================================
// MODAL DE PRODUCTO
// ============================================================

let cantidadModal = 1;
let productoModalId = null;

function abrirModalProducto(id) {
  const p = buscarProducto(id);

  if (!p) return;

  productoModalId = p.id;

  // Ver cuánto hay ya en el carrito
  const carrito = leerCarrito();

  const existente = carrito.find(
    (item) => item.id === p.id
  );

  const cantidadEnCarrito = existente
    ? existente.cantidad
    : 0;

  // Si ya tenemos todo el stock en carrito,
  // no permitimos seleccionar más
  const disponible = p.stock - cantidadEnCarrito;

  cantidadModal = disponible > 0 ? 1 : 0;

  document.getElementById("modalCat").textContent =
    p.categoria;

  document.getElementById("modalNombre").textContent =
    p.nombre;

  document.getElementById("modalDesc").innerHTML =
  p.descripcion || "";

  document.getElementById("modalPrecio").textContent =
    formatearPrecio(p.precio);

  document.getElementById("modalEmoji").textContent =
    p.emoji;

  document.getElementById("modalQty").textContent =
    cantidadModal;

  const img = document.getElementById("modalImg");

  if (p.imagen) {
    img.src = p.imagen;
    img.style.display = "block";
  } else {
    img.style.display = "none";
  }

  const stockBadge =
    document.getElementById("modalStock");

  stockBadge.textContent = p.stock
    ? `En stock (${p.stock})`
    : "Sin stock";

  stockBadge.className = `stock-tag ${
    p.stock
      ? "stock-tag--in"
      : "stock-tag--out"
  }`;

  const addBtn =
    document.getElementById("modalAddBtn");

  const hayDisponible = disponible > 0;

  addBtn.disabled = !hayDisponible;

  if (!p.stock) {
    addBtn.textContent = "Sin stock";
  } else if (!hayDisponible) {
    addBtn.textContent = "Stock completo en carrito";
  } else {
    addBtn.textContent = "Agregar al carrito";
  }

  document
    .getElementById("productModal")
    ?.classList.add("is-open");

  document
    .getElementById("modalBackdrop")
    ?.classList.add("is-open");

  document.body.classList.add("no-scroll");
}

// ============================================================
// CERRAR MODAL
// ============================================================

function cerrarModalProducto() {
  document
    .getElementById("productModal")
    ?.classList.remove("is-open");

  document
    .getElementById("modalBackdrop")
    ?.classList.remove("is-open");

  if (
    !document
      .getElementById("cartDrawer")
      ?.classList.contains("is-open")
  ) {
    document.body.classList.remove("no-scroll");
  }
}

// ============================================================
// INYECCIÓN DE UI
// ============================================================

function inyectarUI() {
  if (document.getElementById("productModal")) return;

  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <!-- CARRITO -->

    <div
      class="cart-backdrop"
      id="cartBackdrop"
    ></div>

    <aside
      class="cart-drawer"
      id="cartDrawer"
      aria-hidden="true"
    >

      <div class="cart-drawer__header">
        <h3>Tu carrito</h3>

        <button
          class="cart-drawer__close"
          id="cartClose"
          aria-label="Cerrar carrito"
        >
          ✕
        </button>
      </div>

      <div
        class="cart-drawer__items"
        id="cartItems"
      ></div>

      <div class="cart-drawer__footer">

        <div class="cart-drawer__total">
          <span>Total</span>

          <strong id="cartTotal">
            ${formatearPrecio(0)}
          </strong>
        </div>

        <button
          class="btn btn--primary btn--block"
          id="cartCheckout"
        >
          Pedir por WhatsApp
        </button>

      </div>

    </aside>


    <!-- MODAL PRODUCTO -->

    <div
      class="modal-backdrop"
      id="modalBackdrop"
    ></div>

    <div
      class="product-modal"
      id="productModal"
      role="dialog"
      aria-modal="true"
      aria-hidden="true"
    >

      <button
        class="product-modal__close"
        id="modalClose"
        aria-label="Cerrar"
      >
        ✕
      </button>

      <div class="product-modal__media">

        <span
          id="modalEmoji"
          class="product-modal__emoji"
        ></span>

        <img
          id="modalImg"
          alt=""
          onerror="this.style.display='none'"
        >

      </div>

      <div class="product-modal__body">

        <span
          class="cat"
          id="modalCat"
        ></span>

        <h3 id="modalNombre"></h3>

        <span
          class="stock-tag"
          id="modalStock"
        ></span>

        <p
          class="product-modal__desc"
          id="modalDesc"
        ></p>

        <span
          class="product-modal__price"
          id="modalPrecio"
        ></span>

        <div class="qty-stepper">

          <button
            class="qty-btn"
            id="modalDec"
            aria-label="Restar"
          >
            −
          </button>

          <span id="modalQty">1</span>

          <button
            class="qty-btn"
            id="modalInc"
            aria-label="Sumar"
          >
            +
          </button>

        </div>

        <button
          class="btn btn--primary btn--block"
          id="modalAddBtn"
        >
          Agregar al carrito
        </button>

      </div>

    </div>
    `
  );
}

// ============================================================
// EVENTOS DEL CARRITO Y MODAL
// ============================================================

function initCarritoYModal() {
  inyectarUI();

  actualizarBadgeCarrito();

  renderCarrito();

  // ---------- Abrir carrito ----------

  document
    .querySelectorAll(".navbar__cart")
    .forEach((btn) => {
      btn.addEventListener("click", abrirCarrito);
    });

  document
    .getElementById("cartClose")
    ?.addEventListener(
      "click",
      cerrarCarrito
    );

  document
    .getElementById("cartBackdrop")
    ?.addEventListener(
      "click",
      cerrarCarrito
    );

  document
    .getElementById("cartCheckout")
    ?.addEventListener(
      "click",
      checkoutWhatsapp
    );

  // ==========================================================
  // BOTONES + Y - DEL CARRITO
  // ==========================================================

  document
    .getElementById("cartItems")
    ?.addEventListener("click", (e) => {
      const btn = e.target.closest(
        "button[data-action]"
      );

      if (!btn) return;

      const id = btn.dataset.id;

      if (btn.dataset.action === "inc") {
        cambiarCantidadCarrito(id, 1);
      }

      if (btn.dataset.action === "dec") {
        cambiarCantidadCarrito(id, -1);
      }

      if (btn.dataset.action === "remove") {
        quitarDelCarrito(id);
      }
    });

  // ==========================================================
  // CERRAR MODAL
  // ==========================================================

  document
    .getElementById("modalClose")
    ?.addEventListener(
      "click",
      cerrarModalProducto
    );

  document
    .getElementById("modalBackdrop")
    ?.addEventListener(
      "click",
      cerrarModalProducto
    );

  // ==========================================================
  // + DEL MODAL
  // ==========================================================

  document
    .getElementById("modalInc")
    ?.addEventListener("click", () => {
      const producto =
        buscarProducto(productoModalId);

      if (!producto) return;

      const carrito = leerCarrito();

      const existente = carrito.find(
        (item) => item.id === producto.id
      );

      const cantidadEnCarrito = existente
        ? existente.cantidad
        : 0;

      // Stock disponible para agregar
      const disponible =
        producto.stock - cantidadEnCarrito;

      // No superar el stock disponible
      if (cantidadModal >= disponible) {
        return;
      }

      cantidadModal++;

      document.getElementById(
        "modalQty"
      ).textContent = cantidadModal;
    });

  // ==========================================================
  // - DEL MODAL
  // ==========================================================

  document
    .getElementById("modalDec")
    ?.addEventListener("click", () => {
      if (cantidadModal <= 1) return;

      cantidadModal--;

      document.getElementById(
        "modalQty"
      ).textContent = cantidadModal;
    });

  // ==========================================================
  // AGREGAR DESDE EL MODAL
  // ==========================================================

  document
    .getElementById("modalAddBtn")
    ?.addEventListener("click", () => {
      if (productoModalId == null) return;

      const producto =
        buscarProducto(productoModalId);

      if (!producto) return;

      const carrito = leerCarrito();

      const existente = carrito.find(
        (item) => item.id === producto.id
      );

      const cantidadEnCarrito = existente
        ? existente.cantidad
        : 0;

      const disponible =
        producto.stock - cantidadEnCarrito;

      // Seguridad extra: nunca superar stock
      if (
        cantidadModal <= 0 ||
        cantidadModal > disponible
      ) {
        return;
      }

      agregarAlCarrito(
        productoModalId,
        cantidadModal
      );

      cerrarModalProducto();
    });

  // ==========================================================
  // ESCAPE
  // ==========================================================

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      cerrarModalProducto();
      cerrarCarrito();
    }
  });

  // ==========================================================
  // TARJETAS DE PRODUCTO
  // ==========================================================

  document.addEventListener("click", (e) => {
    const cta = e.target.closest(
      ".product-card__cta"
    );

    if (cta) {
      e.stopPropagation();

      if (cta.disabled) return;

      agregarAlCarrito(
        cta.dataset.id,
        1
      );

      return;
    }

    const card = e.target.closest(
      ".product-card"
    );

    if (card) {
      abrirModalProducto(
        card.dataset.id
      );
    }
  });
}

// ============================================================
// INICIO
// ============================================================

function iniciarWeb() {
  renderIcons();
  renderPreviewProductos();
  renderCatalogo();
  initMenu();
  initContacto();
  initFooterLinks();
  initCarritoYModal();
  activarReveal();
}

document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();
});
setInterval(() => {
  cargarProductos();
}, 30000);
