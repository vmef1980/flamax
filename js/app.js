const CONFIG = {
      nombreNegocio: "Flamax",
      tituloPagina: "Flamax | Catálogo de Productos",
      eslogan: "De todo para Cocinas, Restaurantes, Hoteles y Bares",
      metaDescripcion: "Tu aliado en suministros para Cocinas, Restaurantes, Hoteles y Bares en Guatemala.",
      copyright: "© 2026",
      developer: "Puzzle Solutions",
      ubicacion: "Ciudad de Guatemala, GT",
      telefonoWhatsApp: "50241084481",
      mensajeWhatsApp: "Hola, deseo solicitar más información sobre los productos del catálogo.", 
      simboloMoneda: "Q",
      logoImg: "img/Flamax-v1.png",
      seoImage: "img/Flamax-v1.png",
      faviconImg: "img/Flamax-v1.ico",
      headerBar: {
        habilitado: true,
        logo: "img/Flamax-v1.png",
        alt: "Logo Flamax",
        titulo: "Catálogo de Productos de Flamax",
        subtitulo: "Todo lo que necesitas para tu cocina, restaurante, hotel y bar en Guatemala"
      },
      csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTwVpHIAUk9o5t1bGr2TEn7TcSLvf_XGbX2-9irqECUDFHgdm_TjSSifw4VDKHTfMiX-dZmNz6cqXk_/pub?output=csv",
      colores: {
        primario: "var(--primary)",
        primarioOscuro: "var(--primary-dark)",
        acento: "var(--accent)",
        highlight: "var(--highlight)",
        fondoGradiente: "var(--fondo-gradiente)"
      },
      redesSociales: [
        { icon: "bi-facebook", url: "#", label: "Facebook" },
        { icon: "bi-instagram", url: "#", label: "Instagram" },
        { icon: "bi-tiktok", url: "#", label: "TikTok" }
      ],
      badges: [
        {
          icon: "bi-truck",
          titulo: "Envíos disponibles a toda Guatemala",
          items: ["• Entrega en 24 horas en la capital", "• Rastreo para departamentos"]
        },
        {
          icon: "bi-shield-lock",
          titulo: "Compra fácil y segura",
          items: ["• Efectivo o Transferencia bancaria", "• Pago contra entrega (deptos. 5% comisión)", "• Tarjetas Visa (Aplican restricciones)"]
        }
      ]
    };

    let productos = [];
    let categoriaActualProductos = [];
    let subcategoriaSeleccionada = "Todas";
    let filtroDisponibilidad = "todos";

    function parsearCSV(texto) {
        const lineas = [];
        let actual = [];
        let campo = "";
        let enComillas = false;
        for (let i = 0; i < texto.length; i++) {
            const char = texto[i];
            const prox = texto[i + 1];
            if (char === '"' && enComillas && prox === '"') { campo += '"'; i++; }
            else if (char === '"') { enComillas = !enComillas; }
            else if (char === ',' && !enComillas) { actual.push(campo.trim()); campo = ""; }
            else if ((char === '\r' || char === '\n') && !enComillas) {
                if (campo || actual.length > 0) { actual.push(campo.trim()); lineas.push(actual); }
                actual = []; campo = "";
                if (char === '\r' && prox === '\n') i++;
            } else { campo += char; }
        }
        if (campo || actual.length > 0) { actual.push(campo.trim()); lineas.push(actual); }
        return lineas;
    }

    function driveThumb(url, size = 400) {
        if (!url) return url;
        let m = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (!m) m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (m) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w${size}`;
        return url;
    }

    async function cargarDatos() {
        try {
            const res = await fetch(CONFIG.csvUrl);
            const rawText = await res.text();
            const filas = parsearCSV(rawText);
            
            productos = filas.slice(1).map(f => {
                let precioLimpio = f[9] ? f[9].replace(/[^0-9.]/g, '') : "0";
                return {
                    id: f[0],
                    titulo: f[1],
                    imagen: driveThumb(f[2]),
                    imagenes: f[3] ? f[3].split('|').map(i => driveThumb(i.trim())) : [],
                    categoria: { id: f[4], nombre: f[5] },
                    subcategoria: f[7] || "", 
                    descripcion: f[8] || "",
                    precio: parseFloat(precioLimpio) || 0,
                    estado: (f[10] || "DISPONIBLE").toUpperCase()
                };
            }).filter(p => p.id);

            categoriaActualProductos = [...productos];
            iniciarApp();
        } catch (e) {
            console.error("Error cargando Google Sheets:", e);
            document.getElementById("contenedor-productos").innerHTML = `
              <div style="text-align:center; padding:2rem; max-width:700px; margin:0 auto;">
                <p style="font-weight:600; margin-bottom:0.5rem;">No pudimos cargar el catálogo en este momento.</p>
                <p>Flamax es tu aliado en suministros para cocinas, restaurantes, hoteles y bares en Guatemala:
                  ollas, sartenes, refrigeración, utensilios y más, con envíos a todo el país.
                  Escribinos por WhatsApp para consultar el catálogo completo.</p>
              </div>`;
        }
    }

    const aplicarConfig = () => {
      document.title = CONFIG.tituloPagina; 
      document.getElementById("page-title").textContent = CONFIG.tituloPagina;
      
      document.head.appendChild(Object.assign(document.createElement('link'), { rel: 'icon', href: CONFIG.faviconImg }));

      document.getElementById("meta-desc").content = CONFIG.metaDescripcion;
      document.getElementById("meta-og-title").content = CONFIG.tituloPagina;
      document.getElementById("meta-og-description").content = CONFIG.metaDescripcion;
      document.getElementById("meta-og-image").content = CONFIG.seoImage;
      document.getElementById("meta-theme-color").content = CONFIG.colores.primario;
      document.getElementById("titulo-principal").textContent = CONFIG.nombreNegocio;
      document.getElementById("texto-subtitulo").textContent = CONFIG.eslogan;
      document.getElementById("logo-sidebar").src = CONFIG.logoImg;
      
      const headerBar = document.getElementById("page-header");
      if (headerBar) {
        document.getElementById("header-logo").src = CONFIG.headerBar.logo;
        document.getElementById("header-logo").alt = CONFIG.headerBar.alt;
        document.getElementById("header-title").textContent = CONFIG.headerBar.titulo;
        document.getElementById("header-subtitle").textContent = CONFIG.headerBar.subtitulo;
      }

      const whatsappURL = `https://wa.me/${CONFIG.telefonoWhatsApp}?text=${encodeURIComponent(CONFIG.mensajeWhatsApp)}`;

      document.getElementById("aside-footer-container").innerHTML = `
        <div class="social-icons">
          ${CONFIG.redesSociales.map(r => `<a href="${r.url}" target="_blank" rel="noopener noreferrer"><i class="${r.icon}"></i></a>`).join('')}
          <a href="${whatsappURL}" target="_blank" rel="noopener noreferrer"><i class="bi bi-whatsapp"></i></a>
        </div>
        <p><strong>${CONFIG.nombreNegocio}</strong></p>
        <p style="opacity:0.7">${CONFIG.copyright}</p>
      `;

      document.getElementById("footer-social-links").innerHTML = `
        ${CONFIG.redesSociales.map(r => `<a href="${r.url}" target="_blank" rel="noopener noreferrer"><i class="${r.icon}"></i> ${r.label}</a>`).join('')}
        <a href="${whatsappURL}" target="_blank" rel="noopener noreferrer"><i class="bi bi-whatsapp"></i> WhatsApp</a>
      `;
      
      document.getElementById("f-copy").textContent = CONFIG.copyright;
      document.getElementById("f-loc").textContent = CONFIG.ubicacion;
      document.getElementById("f-dev").innerHTML = `Desarrollado por <strong><a href="https://links.rompecabezas.online" target="_blank">${CONFIG.developer}</a></strong>`;

      document.getElementById("ollita-animada").href = whatsappURL;
      

      document.getElementById("container-badges").innerHTML = CONFIG.badges.map(b => `
        <div class="badge-card">
          <i class="bi ${b.icon}"></i>
          <div class="badge-text">
            <h4>${b.titulo}</h4>
            <div>${b.items.map(i => `<span>${i}</span>`).join('')}</div>
          </div>
        </div>
      `).join('');
    };

    let fotosActuales = [];
    let indexActual = 0;
    const contador = document.getElementById("contador-carrito");
    const modal = document.getElementById("modal-producto");
    const aside = document.getElementById("aside-menu");
    const subContainer = document.getElementById("contenedor-filtros-sub");
    const txtContadorResultados = document.getElementById("contador-resultados");
    const btnVolverFloat = document.getElementById("btn-volver-float");

    window.toggleDescripcion = (id) => {
      const txt = document.getElementById(`desc-${id}`);
      const link = document.getElementById(`link-${id}`);
      txt.classList.toggle('completa');
      link.textContent = txt.classList.contains('completa') ? "Ver menos" : "Leer más...";
    };

    window.cambiarFoto = (idx) => {
      indexActual = idx;
      const mainImg = document.getElementById("img-modal-principal");
      mainImg.src = fotosActuales[indexActual];
      document.querySelectorAll(".thumb").forEach((t, i) => {
        t.style.borderColor = i === idx ? 'var(--accent)' : '#eee';
        t.style.opacity = i === idx ? '1' : '0.6';
      });
    };

    window.openModalDirectly = (id) => {
      const p = productos.find(x => x.id === id);
      if(!p) return;
      let urls = [p.imagen, ...p.imagenes].filter(u => u);
      fotosActuales = [...new Set(urls)]; 
      indexActual = 0;
      
      const isAgotado = p.estado === "AGOTADO";
      
      document.getElementById("modal-titulo").textContent = p.titulo;
      document.getElementById("modal-descripcion").textContent = p.descripcion || "Sin descripción disponible.";
      document.getElementById("modal-precio").textContent = `Q${p.precio.toFixed(2)}`;
      
      document.getElementById("modal-badge-estado").innerHTML = `
        <span class="badge-estado ${isAgotado ? 'estado-agotado' : 'estado-disponible'}">
            ${isAgotado ? 'Agotado' : 'Disponible'}
        </span>`;

      const thumbContainer = document.getElementById("modal-thumbnails");
      thumbContainer.innerHTML = "";
      fotosActuales.forEach((src, i) => {
        const img = document.createElement("img");
        img.src = src;
        img.className = "thumb";
        img.style = "width:50px; height:50px; object-fit:contain; border:2px solid #eee; cursor:pointer; border-radius:6px; background:#fff; flex-shrink:0; transition:var(--transition);";
        img.onclick = (e) => { e.stopPropagation(); window.cambiarFoto(i); };
        thumbContainer.appendChild(img);
      });
      document.getElementById("nav-modal-fotos").style.display = fotosActuales.length > 1 ? "flex" : "none";
      window.cambiarFoto(0);
      modal.style.display = "flex";
      document.body.style.overflow = "hidden";

      const btnModal = document.getElementById("btn-agregar-modal");
      btnModal.disabled = isAgotado;
      btnModal.textContent = isAgotado ? "Producto Agotado" : "Agregar al pedido";
      
      btnModal.onclick = () => {
        if (isAgotado) return;
        addToCart(p);
        btnModal.classList.add("success-state");
        btnModal.textContent = "¡Añadido!";
        setTimeout(() => { cerrarModal(); btnModal.classList.remove("success-state"); }, 600);
      };
    };

    function addToCart(p) {
        const cart = JSON.parse(localStorage.getItem("carrito") || "[]");
        cart.push(p);
        localStorage.setItem("carrito", JSON.stringify(cart));
        updateCart();
    }

    function updateCart() {
        const cant = JSON.parse(localStorage.getItem("carrito") || "[]").length;
        contador.textContent = cant;
    }

    window.setFiltroDisponibilidad = (filtro) => {
      filtroDisponibilidad = filtro;
      document.getElementById("filtro-todos").className = "btn-disponibilidad" + (filtro === "todos" ? " activo-todo" : "");
      document.getElementById("filtro-disponibles").className = "btn-disponibilidad" + (filtro === "disponibles" ? " activo-disponible" : "");
      document.getElementById("filtro-agotados").className = "btn-disponibilidad" + (filtro === "agotados" ? " activo-agotado" : "");
      procesarYRenderizarCatalogo();
    };

    function procesarYRenderizarCatalogo() {
      const busquedaCentral = document.getElementById("buscar-producto-central").value.toLowerCase();
      const criterioOrden = document.getElementById("ordenar-productos").value;

      let resultado = categoriaActualProductos.filter(p => {
        const cumpleSub = (subcategoriaSeleccionada === "Todas" || p.subcategoria === subcategoriaSeleccionada);
        const cumpleTxt = p.titulo.toLowerCase().includes(busquedaCentral) || 
                          p.categoria.nombre.toLowerCase().includes(busquedaCentral) ||
                          p.descripcion.toLowerCase().includes(busquedaCentral) ||
                          p.id.toLowerCase().includes(busquedaCentral);
        const isAgotado = p.estado === "AGOTADO";
        const cumpleDisponibilidad = filtroDisponibilidad === "todos" ||
                                     (filtroDisponibilidad === "disponibles" && !isAgotado) ||
                                     (filtroDisponibilidad === "agotados" && isAgotado);
        return cumpleSub && cumpleTxt && cumpleDisponibilidad;
      });

      if (criterioOrden === "precio-asc") {
        resultado.sort((a, b) => a.precio - b.precio);
      } else if (criterioOrden === "precio-desc") {
        resultado.sort((a, b) => b.precio - a.precio);
      } else if (criterioOrden === "alfa-asc") {
        resultado.sort((a, b) => a.titulo.localeCompare(b.titulo));
      } else if (criterioOrden === "alfa-desc") {
        resultado.sort((a, b) => b.titulo.localeCompare(a.titulo));
      }

      txtContadorResultados.textContent = `Mostrando ${resultado.length} productos`;
      renderProductos(resultado);
    }

    function crearCardProducto(p) {
      const isAgotado = p.estado === "AGOTADO";
      const div = document.createElement("div");
      div.className = "producto";
      div.innerHTML = `
        <div class="imagen-contenedor" onclick="window.openModalDirectly('${p.id}')">
          <img src="${p.imagen}" alt="${p.titulo}" loading="lazy">
        </div>
        <div class="contenido">
          <h3>${p.titulo}</h3>
          <div class="descripcion-container">
              <p class="descripcion-texto" id="desc-${p.id}">${p.descripcion}</p>
              ${p.descripcion && p.descripcion.length > 40 ? `<span class="link-leer-mas" id="link-${p.id}" onclick="window.toggleDescripcion('${p.id}')">Leer más...</span>` : ''}
          </div>
          <span class="badge-estado ${isAgotado ? 'estado-agotado' : 'estado-disponible'}">
              ${isAgotado ? 'Agotado' : 'Disponible'}
          </span>
          <p class="precio">Q${p.precio.toFixed(2)}</p>
          <button class="btn-add" data-id="${p.id}" ${isAgotado ? 'disabled' : ''}>
              <i class="bi bi-bag-plus"></i> ${isAgotado ? 'Agotado' : 'Agregar'}
          </button>
        </div>
      `;
      return div;
    }

    function renderProductos(lista) {
      const contenedor = document.getElementById("contenedor-productos");
      contenedor.innerHTML = "";
      if (lista && lista.length > 0) {
        const seoStatic = document.getElementById('seo-static-content');
        if (seoStatic) seoStatic.style.display = 'none';
      }

      if (lista.length === 0) {
        contenedor.innerHTML = "<p style='text-align:center; padding:3rem; color:var(--text-soft); font-weight:500;'>No encontramos productos con los criterios indicados.</p>";
        return;
      }

      // Vista general (sin filtro de categoría): agrupar por categoría
      const esTodo = categoriaActualProductos.length === productos.length
        && subcategoriaSeleccionada === "Todas"
        && document.getElementById("buscar-producto-central").value.trim() === "";

      if (esTodo) {
        const porCategoria = {};
        lista.forEach(p => {
          const key = p.categoria.id;
          if (!porCategoria[key]) porCategoria[key] = { nombre: p.categoria.nombre, items: [] };
          porCategoria[key].items.push(p);
        });

        Object.values(porCategoria).forEach((cat, idx) => {
          const seccion = document.createElement("div");
          // Primera categoría expandida, el resto colapsadas en móvil
          const isMobile = window.innerWidth < 768;
          seccion.className = "seccion-categoria" + (isMobile && idx > 0 ? " colapsada" : "");

          const header = document.createElement("div");
          header.className = "seccion-categoria-header";
          header.setAttribute("role", "button");
          header.setAttribute("aria-expanded", isMobile && idx > 0 ? "false" : "true");
          header.innerHTML = `
            <h2><i class="bi bi-tag-fill" style="font-size:0.8rem; opacity:0.5; margin-right:6px;"></i>${cat.nombre}</h2>
            <span class="cat-badge">${cat.items.length} producto${cat.items.length !== 1 ? 's' : ''}</span>
            <i class="bi bi-chevron-down cat-chevron"></i>
          `;
          header.addEventListener("click", () => {
            const colapsada = seccion.classList.toggle("colapsada");
            header.setAttribute("aria-expanded", String(!colapsada));
          });
          seccion.appendChild(header);

          const body = document.createElement("div");
          body.className = "cat-body";
          const inner = document.createElement("div");
          inner.className = "cat-body-inner";
          const grid = document.createElement("div");
          grid.className = "grid-categoria";
          cat.items.forEach(p => grid.appendChild(crearCardProducto(p)));
          inner.appendChild(grid);
          body.appendChild(inner);
          seccion.appendChild(body);
          contenedor.appendChild(seccion);
        });
      } else {
        // Vista filtrada: grid plano sin segmentación
        const grid = document.createElement("div");
        grid.className = "grid-categoria";
        lista.forEach(p => grid.appendChild(crearCardProducto(p)));
        contenedor.appendChild(grid);
      }

      document.querySelectorAll(".btn-add").forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const p = productos.find(x => x.id === btn.dataset.id);
          addToCart(p);
          btn.classList.add("success-state");
          btn.innerHTML = '<i class="bi bi-check-circle-fill"></i> ¡Listo!';
          setTimeout(() => { btn.classList.remove("success-state"); btn.innerHTML = '<i class="bi bi-bag-plus"></i> Agregar'; }, 900);
        };
      });
    }

    function generarSubfiltros(listaOriginalDeCat) {
        subContainer.innerHTML = "";
        subcategoriaSeleccionada = "Todas";
        const subcats = [...new Set(listaOriginalDeCat.map(p => p.subcategoria).filter(s => s))].sort();
        if (subcats.length > 0) {
            const btnAll = document.createElement("button");
            btnAll.className = "btn-subfiltro activo";
            btnAll.textContent = "Todas";
            btnAll.onclick = () => {
                document.querySelectorAll(".btn-subfiltro").forEach(b => b.classList.remove("activo"));
                btnAll.classList.add("activo");
                subcategoriaSeleccionada = "Todas";
                procesarYRenderizarCatalogo();
            };
            subContainer.appendChild(btnAll);
            
            subcats.forEach(sc => {
                const btn = document.createElement("button");
                btn.className = "btn-subfiltro";
                btn.textContent = sc;
                btn.onclick = () => {
                    document.querySelectorAll(".btn-subfiltro").forEach(b => b.classList.remove("activo"));
                    btn.classList.add("activo");
                    subcategoriaSeleccionada = sc;
                    procesarYRenderizarCatalogo();
                };
                subContainer.appendChild(btn);
            });
        }
    }

    function limpiarFiltrosYResetear() {
      document.getElementById("buscar-producto-central").value = "";
      document.getElementById("buscar-categoria").value = "";
      document.getElementById("ordenar-productos").value = "predeterminado";
      subContainer.innerHTML = "";
      categoriaActualProductos = [...productos];
      subcategoriaSeleccionada = "Todas";
      window.setFiltroDisponibilidad("todos");
    }

    function iniciarApp() {
        const menuCat = document.getElementById("menu-categorias");
        menuCat.innerHTML = "";

        const btnVerTodos = document.createElement("button");
        btnVerTodos.className = "boton-categoria btn-ver-todo";
        btnVerTodos.innerHTML = `<i class="bi bi-grid-fill"></i> MOSTRAR TODO`;
        btnVerTodos.onclick = () => {
            limpiarFiltrosYResetear();
            aside.classList.remove("abierto");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        menuCat.appendChild(btnVerTodos);

        const cats = [...new Set(productos.map(p => p.categoria.id))].sort();
        cats.forEach(cId => {
            const pDeCat = productos.filter(p => p.categoria.id === cId);
            const btn = document.createElement("button");
            btn.className = "boton-categoria";
            btn.textContent = pDeCat[0].categoria.nombre.toUpperCase();
            btn.onclick = () => { 
                document.getElementById("buscar-producto-central").value = "";
                categoriaActualProductos = pDeCat;
                subcategoriaSeleccionada = "Todas";
                generarSubfiltros(pDeCat);
                procesarYRenderizarCatalogo(); 
                aside.classList.remove("abierto"); 
                document.getElementById("contenedor-productos").scrollIntoView({ behavior: 'smooth', block: 'start' });
            };
            menuCat.appendChild(btn);
        });

        categoriaActualProductos = [...productos];
        procesarYRenderizarCatalogo();
        updateCart();
    }

    function cerrarModal() { modal.style.display = "none"; document.body.style.overflow = "auto"; }
    modal.onclick = (e) => { if(e.target === modal) cerrarModal(); };
    document.getElementById("cerrar-modal-btn").onclick = cerrarModal;
    
    document.getElementById("prev-foto").onclick = (e) => { 
      e.stopPropagation();
      indexActual = (indexActual - 1 + fotosActuales.length) % fotosActuales.length; 
      window.cambiarFoto(indexActual); 
    };
    document.getElementById("next-foto").onclick = (e) => { 
      e.stopPropagation();
      indexActual = (indexActual + 1) % fotosActuales.length; 
      window.cambiarFoto(indexActual); 
    };

    document.getElementById("toggle-menu").onclick = () => aside.classList.add("abierto");
    document.getElementById("cerrar-menu").onclick = () => aside.classList.remove("abierto");

    document.getElementById("buscar-producto-central").oninput = () => procesarYRenderizarCatalogo();
    document.getElementById("ordenar-productos").onchange = () => procesarYRenderizarCatalogo();
    
    document.getElementById("btn-limpiar-filtros").onclick = () => {
      limpiarFiltrosYResetear();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    document.getElementById("buscar-categoria").oninput = (e) => {
      const val = e.target.value.toLowerCase();
      document.getElementById("buscar-producto-central").value = val;
      subContainer.innerHTML = ""; 
      subcategoriaSeleccionada = "Todas";
      procesarYRenderizarCatalogo();
    };

    window.addEventListener("scroll", () => {
      if (window.scrollY > 400) {
        btnVolverFloat.classList.add("visible");
      } else {
        btnVolverFloat.classList.remove("visible");
      }
    });

    btnVolverFloat.onclick = () => {
      limpiarFiltrosYResetear();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    aplicarConfig();
    cargarDatos();

// ── Visor de zoom / pan de imagen de producto ──
(function(){
let img,scale=1,x=0,y=0,startX=0,startY=0,drag=false;
function apply(){if(img)img.style.transform=`translate(${x}px,${y}px) scale(${scale})`;}
function reset(){scale=1;x=0;y=0;apply();}
document.addEventListener('DOMContentLoaded',()=>{
 img=document.getElementById('img-modal-principal');
 const box=document.querySelector('.visor-principal');
 if(!img||!box)return;
 box.addEventListener('wheel',e=>{e.preventDefault();const d=e.deltaY<0?0.2:-0.2;scale=Math.max(1,Math.min(5,scale+d));if(scale===1){x=0;y=0;}apply();},{passive:false});
 img.addEventListener('dblclick',()=>{if(scale===1)scale=2.5;else{scale=1;x=0;y=0;}apply();});
 img.addEventListener('pointerdown',e=>{if(scale<=1)return;drag=true;img.classList.add('dragging');startX=e.clientX-x;startY=e.clientY-y;img.setPointerCapture(e.pointerId);});
 img.addEventListener('pointermove',e=>{if(!drag)return;x=e.clientX-startX;y=e.clientY-startY;apply();});
 ['pointerup','pointercancel'].forEach(ev=>img.addEventListener(ev,()=>{drag=false;img.classList.remove('dragging');}));
 const old=window.cambiarFoto; if(old) window.cambiarFoto=function(i){old(i); img=document.getElementById('img-modal-principal'); reset();};
 const m=document.getElementById('modal-producto');
 new MutationObserver(()=>{if(getComputedStyle(m).display==='none')reset();}).observe(m,{attributes:true,attributeFilter:['style']});
});
})();