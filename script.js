const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

const storage = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

function toast(message) {
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  document.body.appendChild(node);
  requestAnimationFrame(() => node.classList.add("show"));
  setTimeout(() => {
    node.classList.remove("show");
    setTimeout(() => node.remove(), 260);
  }, 2200);
}

function initTheme() {
  const saved = storage.get("theme", "dark");
  if (saved === "light") document.body.classList.add("light");
  $("#themeToggle").textContent = saved === "light" ? "Modo Eclipse" : "Modo Claro";

  $("#themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("light");
    const theme = document.body.classList.contains("light") ? "light" : "dark";
    storage.set("theme", theme);
    $("#themeToggle").textContent = theme === "light" ? "Modo Eclipse" : "Modo Claro";
    toast(theme === "light" ? "Modo claro ativado." : "Modo eclipse ativado.");
  });
}

function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.12 });

  $$(".reveal").forEach(el => observer.observe(el));
}

function initCounters() {
  const counters = $$("[data-counter]");
  let started = false;

  const run = () => {
    if (started) return;
    started = true;
    counters.forEach(counter => {
      const target = Number(counter.dataset.counter);
      const duration = 1100;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = Math.round(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    });
  };

  const observer = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting)) run();
  }, { threshold: 0.25 });

  observer.observe($(".metrics"));
}

function initStars() {
  const canvas = $("#stars");
  const ctx = canvas.getContext("2d");
  const stars = [];
  const count = Math.min(160, Math.floor(window.innerWidth / 8));

  function resize() {
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }

  function seed() {
    stars.length = 0;
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.8 + .2,
        vx: (Math.random() - .5) * .18,
        vy: Math.random() * .18 + .04,
        alpha: Math.random() * .7 + .2
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    stars.forEach(s => {
      s.x += s.vx;
      s.y += s.vy;
      if (s.y > window.innerHeight) s.y = -4;
      if (s.x > window.innerWidth) s.x = 0;
      if (s.x < 0) s.x = window.innerWidth;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  seed();
  draw();
  window.addEventListener("resize", () => {
    resize();
    seed();
  });
}

function initModules() {
  const data = {
    juridico: {
      title: "Jurídico estratégico",
      bars: [86, 64, 92],
      donut: 78,
      tasks: ["Revisar documentos principais", "Separar evidências fortes", "Montar narrativa de decisão"]
    },
    negocios: {
      title: "Negócios locais",
      bars: [72, 81, 69],
      donut: 74,
      tasks: ["Definir oferta principal", "Criar página de conversão", "Montar roteiro de venda"]
    },
    financeiro: {
      title: "Controle financeiro",
      bars: [61, 88, 76],
      donut: 82,
      tasks: ["Registrar contas futuras", "Separar gastos fixos", "Gerar previsão mensal"]
    },
    conteudo: {
      title: "Máquina de conteúdo",
      bars: [93, 58, 84],
      donut: 88,
      tasks: ["Criar roteiro narrativo", "Aplicar pausas e tags", "Organizar biblioteca de cenas"]
    }
  };

  const labels = $$(".bar-stack label span");
  const bars = $$(".bar-stack i");

  function render(moduleKey) {
    const selected = data[moduleKey];
    $("#moduleTitle").textContent = selected.title;
    $(".donut").style.setProperty("--value", selected.donut);
    $(".donut span").textContent = selected.donut + "%";
    selected.bars.forEach((value, index) => {
      labels[index].textContent = value + "%";
      bars[index].style.width = value + "%";
    });
    $("#taskList").innerHTML = selected.tasks.map(task =>
      `<li><span></span> ${task} <button type="button">feito</button></li>`
    ).join("");
    wireTaskButtons();
  }

  $$(".module").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".module").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      render(btn.dataset.module);
      toast("Módulo alterado: " + btn.textContent.trim());
    });
  });

  $("#addTaskBtn").addEventListener("click", () => {
    const item = document.createElement("li");
    item.innerHTML = `<span></span> Nova tarefa estratégica ${Math.floor(Math.random() * 99)} <button type="button">feito</button>`;
    $("#taskList").appendChild(item);
    wireTaskButtons();
    toast("Tarefa criada no painel.");
  });

  function wireTaskButtons() {
    $$("#taskList button").forEach(button => {
      button.onclick = () => {
        button.closest("li").classList.toggle("done");
      };
    });
  }

  wireTaskButtons();
}

function initSimulator() {
  const clarity = $("#clarity");
  const urgency = $("#urgency");
  const trust = $("#trust");
  const score = $("#ideaScore");
  const text = $("#ideaText");
  const oracle = $("#oracleScore");

  function update() {
    const result = Math.round(
      Number(clarity.value) * .4 +
      Number(urgency.value) * .25 +
      Number(trust.value) * .35
    );

    score.textContent = result;
    oracle.textContent = Math.min(99, result + 9) + "%";

    if (result >= 85) {
      text.textContent = "Ideia com presença dominante. Já parece produto premium.";
    } else if (result >= 70) {
      text.textContent = "Ideia forte, mas ainda pode ganhar mais urgência.";
    } else if (result >= 50) {
      text.textContent = "Boa base, porém falta clareza de valor e confiança.";
    } else {
      text.textContent = "A ideia ainda precisa de forma, prova e direção.";
    }
  }

  [clarity, urgency, trust].forEach(input => input.addEventListener("input", update));
  update();

  $("#randomizeDemo").addEventListener("click", () => {
    clarity.value = Math.floor(Math.random() * 45) + 55;
    urgency.value = Math.floor(Math.random() * 45) + 50;
    trust.value = Math.floor(Math.random() * 35) + 65;
    update();
    toast("Cenário gerado pelo oráculo.");
  });
}

function initFilters() {
  $$(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      $$(".chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      const filter = chip.dataset.filter;

      $$(".project-card").forEach(card => {
        const visible = filter === "all" || card.dataset.type === filter;
        card.style.display = visible ? "" : "none";
      });
    });
  });
}

function initAccordion() {
  $$(".accordion button").forEach(button => {
    button.addEventListener("click", () => {
      button.classList.toggle("open");
    });
  });
}

function initModal() {
  const modal = $("#demoModal");

  function open() {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }

  function close() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

  $$("[data-open-modal]").forEach(btn => btn.addEventListener("click", open));
  $$("[data-close-modal]").forEach(btn => btn.addEventListener("click", close));

  $("#demoForm").addEventListener("submit", (event) => {
    event.preventDefault();
    close();
    toast("Simulação ativada. Bem-vindo ao centro de comando.");
  });
}

function initCommandPalette() {
  const palette = $("#commandPalette");
  const search = $("#commandSearch");
  const results = $("#commandResults");

  const commands = [
    { label: "Alternar tema", keywords: "tema claro eclipse modo", action: () => $("#themeToggle").click() },
    { label: "Ir para painel", keywords: "painel dashboard comando", action: () => location.hash = "#painel" },
    { label: "Ver planos", keywords: "preco planos assinatura", action: () => location.hash = "#precos" },
    { label: "Gerar cenário", keywords: "simulador random gerar", action: () => $("#randomizeDemo").click() },
    { label: "Abrir demo", keywords: "login demo modal entrar", action: () => $$("[data-open-modal]")[0].click() }
  ];

  function open() {
    palette.classList.add("open");
    palette.setAttribute("aria-hidden", "false");
    search.value = "";
    render("");
    setTimeout(() => search.focus(), 40);
  }

  function close() {
    palette.classList.remove("open");
    palette.setAttribute("aria-hidden", "true");
  }

  function render(query) {
    const q = query.toLowerCase().trim();
    const filtered = commands.filter(c => (c.label + " " + c.keywords).toLowerCase().includes(q));
    results.innerHTML = filtered.map((c, index) =>
      `<button type="button" data-index="${index}">${c.label}</button>`
    ).join("");

    $$("#commandResults button").forEach((button, idx) => {
      button.addEventListener("click", () => {
        filtered[idx].action();
        close();
      });
    });
  }

  $("#commandButton").addEventListener("click", open);
  palette.addEventListener("click", (event) => {
    if (event.target === palette) close();
  });
  search.addEventListener("input", () => render(search.value));

  document.addEventListener("keydown", (event) => {
    const isK = event.key.toLowerCase() === "k";
    if ((event.ctrlKey || event.metaKey) && isK) {
      event.preventDefault();
      open();
    }
    if (event.key === "Escape") close();
  });
}

function initTilt() {
  $$("[data-tilt]").forEach(card => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      card.style.transform = `perspective(900px) rotateX(${y * -6}deg) rotateY(${x * 6}deg) translateY(-4px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initReveal();
  initCounters();
  initStars();
  initModules();
  initSimulator();
  initFilters();
  initAccordion();
  initModal();
  initCommandPalette();
  initTilt();
});
