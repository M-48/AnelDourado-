// main.js

/* =========================================================
   CUSTOM SELECT / DROPDOWN — Elegante com cores do site
   Funciona para qualquer .custom-select-wrap na página
   ========================================================= */
(function() {
    function initCustomSelects() {
        document.querySelectorAll('.custom-select-wrap').forEach(function(wrap) {
            if (wrap.dataset.csInit) return;
            wrap.dataset.csInit = '1';

            const trigger  = wrap.querySelector('.custom-select-trigger');
            const dropdown = wrap.querySelector('.custom-select-dropdown');
            const options  = wrap.querySelectorAll('.custom-select-option');
            const hidden   = wrap.querySelector('input[type="hidden"]');
            const label    = trigger ? trigger.querySelector('.cst-label') : null;

            if (!trigger || !dropdown) return;

            // Abrir/fechar
            trigger.addEventListener('click', function(e) {
                e.stopPropagation();
                const isOpen = wrap.classList.contains('open');
                // Fecha todos os outros
                document.querySelectorAll('.custom-select-wrap.open').forEach(function(w) {
                    w.classList.remove('open');
                });
                if (!isOpen) wrap.classList.add('open');
            });

            // Selecionar opção
            options.forEach(function(opt) {
                opt.addEventListener('click', function() {
                    const val  = opt.dataset.value;
                    const text = opt.textContent.trim();
                    if (label) {
                        label.textContent = text;
                        label.style.color = '#1E1D1A';
                    }
                    if (hidden) hidden.value = val;
                    options.forEach(function(o) { o.classList.remove('selected'); });
                    opt.classList.add('selected');
                    wrap.classList.remove('open');

                    // Auto-submit se for filtro admin
                    const form = wrap.closest('form');
                    if (form && form.id === 'formFiltros') {
                        form.submit();
                    }
                });
            });
        });

        // Fechar ao clicar fora
        document.addEventListener('click', function() {
            document.querySelectorAll('.custom-select-wrap.open').forEach(function(w) {
                w.classList.remove('open');
            });
        });

        // Fechar com ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                document.querySelectorAll('.custom-select-wrap.open').forEach(function(w) {
                    w.classList.remove('open');
                });
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCustomSelects);
    } else {
        initCustomSelects();
    }
})();

/* =========================================================
   DRAWER LATERAL ELEGANTE — MENU MOBILE
   ========================================================= */
function toggleDrawer() {
    const drawer  = document.getElementById('navDrawer');
    const overlay = document.getElementById('drawerOverlay');
    const btn     = document.getElementById('hamburgerBtn');
    const isOpen  = drawer.classList.contains('active');

    if (isOpen) {
        closeDrawer();
    } else {
        drawer.classList.add('active');
        overlay.classList.add('active');
        btn.classList.add('active');
        document.body.style.overflow = 'hidden'; // bloqueia scroll
    }
}

function closeDrawer() {
    const drawer  = document.getElementById('navDrawer');
    const overlay = document.getElementById('drawerOverlay');
    const btn     = document.getElementById('hamburgerBtn');
    if (!drawer) return;
    drawer.classList.remove('active');
    overlay.classList.remove('active');
    if (btn) btn.classList.remove('active');
    document.body.style.overflow = '';
}

// Fechar ao clicar no overlay
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('drawerOverlay');
    if (overlay) overlay.addEventListener('click', closeDrawer);

    // Fechar com tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDrawer();
    });
});

/* =========================================================
   LÓGICA PRINCIPAL DO SITE
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
    // INICIALIZAÇÃO DO DATEPICKER PERSONALIZADO DE LUXO
    initCustomDatePicker();

    // ENVIO DO FORMULÁRIO COM SWEETALERT2 E VALIDAÇÕES RIGOROSAS
    const formReserva = document.getElementById('formAgendamento');
    if (formReserva) {
        formReserva.addEventListener('submit', async (e) => {
            e.preventDefault();

            // RESTRIÇÃO: Validação de nome real / existente
            const nomeInput = formReserva.querySelector('input[name="nome"]');
            const nomeVal = nomeInput ? nomeInput.value.trim() : '';
            const partesNome = nomeVal.split(/\s+/);
            const termosFalsos = ['teste', 'test', 'asdf', 'qwerty', 'admin', 'fake', 'abc', 'xxx', 'nenhum', 'ninguem', 'usuario', 'anonimo', 'cliente'];
            const nomeMinusculo = nomeVal.toLowerCase();
            let ehInexistente = false;

            for (const tf of termosFalsos) {
                if (nomeMinusculo.includes(tf)) {
                    ehInexistente = true;
                    break;
                }
            }

            if (/(.)\1{2,}/.test(nomeMinusculo)) {
                ehInexistente = true;
            }

            if (partesNome.length < 2 || nomeVal.length < 5 || !/^[A-Za-zÀ-ÖØ-öø-ÿ'\-\s]+$/.test(nomeVal) || ehInexistente) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: 'Nome Inválido',
                        text: 'Por favor, insira um nome e sobrenome válidos e reais (ex: António Manuel).',
                        icon: 'warning',
                        confirmButtonText: 'Corrigir Nome',
                        confirmButtonColor: '#D4AF37'
                    });
                } else {
                    alert('Por favor, insira um nome e sobrenome válidos e reais (ex: António Manuel).');
                }
                if (nomeInput) nomeInput.focus();
                return;
            }

            // Validação de data selecionada
            const dataInput = formReserva.querySelector('input[name="data_evento"]');
            if (!dataInput || !dataInput.value) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: 'Data Obrigatória',
                        text: 'Por favor, selecione uma data disponível no calendário.',
                        icon: 'warning',
                        confirmButtonText: 'Escolher Data',
                        confirmButtonColor: '#D4AF37'
                    });
                }
                const dpTrigger = document.getElementById('datepickerTrigger');
                if (dpTrigger) dpTrigger.click();
                return;
            }
            
            const btnSubmit = formReserva.querySelector('button[type="submit"]');
            const originalText = btnSubmit.innerHTML;
            btnSubmit.innerHTML = 'A enviar...';
            btnSubmit.disabled = true;

            const formData = new FormData(formReserva);

            try {
                const response = await fetch('api/agendar.php', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    formReserva.reset();
                    const dpLabel = document.getElementById('dpSelectedLabel');
                    if (dpLabel) {
                        dpLabel.textContent = 'Selecione uma data';
                        dpLabel.style.color = '';
                    }
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            title: 'Solicitação Enviada!',
                            text: result.message,
                            icon: 'success',
                            confirmButtonText: 'Excelente',
                            confirmButtonColor: '#D4AF37'
                        });
                    } else {
                        alert(result.message);
                    }
                } else {
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            title: result.data_ocupada ? 'Data Indisponível' : 'Atenção',
                            text: result.message,
                            icon: 'warning',
                            confirmButtonText: 'Entendido',
                            confirmButtonColor: '#9A741E'
                        });
                    } else {
                        alert(result.message);
                    }
                }
            } catch (err) {
                // Modo frontend / sem backend: simula sucesso para visualização
                formReserva.reset();
                const dpLabel = document.getElementById('dpSelectedLabel');
                if (dpLabel) {
                    dpLabel.textContent = 'Selecione uma data';
                    dpLabel.style.color = '';
                }
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: 'Solicitação Enviada!',
                        text: 'A sua solicitação foi recebida com sucesso (Modo de visualização ativo sem base de dados).',
                        icon: 'success',
                        confirmButtonText: 'Excelente',
                        confirmButtonColor: '#D4AF37'
                    });
                } else {
                    alert('Solicitação recebida com sucesso!');
                }
            } finally {
                btnSubmit.innerHTML = originalText;
                btnSubmit.disabled = false;
            }
        });
    }

    // FILTRO DINÂMICO DA GALERIA
    const filterBtns = document.querySelectorAll('.gallery-filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-col');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
});

/* =========================================================
   CUSTOM DATEPICKER — CALENDÁRIO COM DATAS OCUPADAS DESABILITADAS
   ========================================================= */
function initCustomDatePicker() {
    const wrap = document.getElementById('customDatePicker');
    if (!wrap) return;

    const trigger = document.getElementById('datepickerTrigger');
    const label = document.getElementById('dpSelectedLabel');
    const hiddenInput = document.getElementById('data_evento');
    const prevBtn = document.getElementById('dpPrevMonth');
    const nextBtn = document.getElementById('dpNextMonth');
    const monthLabel = document.getElementById('dpCurrentMonthLabel');
    const daysGrid = document.getElementById('dpDaysGrid');
    const datasBloqueadas = window.datasBloqueadas || [];

    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const today = new Date();
    const amanha = new Date();
    amanha.setDate(today.getDate() + 1);
    amanha.setHours(0, 0, 0, 0);

    let viewYear = today.getFullYear();
    let viewMonth = today.getMonth();
    let selectedDateStr = '';

    function renderCalendar() {
        monthLabel.textContent = `${meses[viewMonth]} ${viewYear}`;
        daysGrid.innerHTML = '';

        const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
        const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();

        // Células vazias até ao primeiro dia da semana
        for (let i = 0; i < firstDayIndex; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'dp-day empty';
            daysGrid.appendChild(emptyCell);
        }

        // Renderiza cada dia do mês
        for (let day = 1; day <= totalDays; day++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'dp-day';
            dayEl.textContent = day;

            const mStr = String(viewMonth + 1).padStart(2, '0');
            const dStr = String(day).padStart(2, '0');
            const thisDateStr = `${viewYear}-${mStr}-${dStr}`;
            const thisDateObj = new Date(viewYear, viewMonth, day, 0, 0, 0, 0);

            // Data no passado ou hoje -> desabilitada
            if (thisDateObj < amanha) {
                dayEl.classList.add('past');
                dayEl.title = 'Data no passado';
            }
            // Data já reservada/bloqueada -> DESABILITADA com risco vermelho
            else if (datasBloqueadas.includes(thisDateStr)) {
                dayEl.classList.add('busy');
                dayEl.title = 'Data Indisponível / Já Reservada';
            }
            // Data disponível
            else {
                dayEl.classList.add('available');
                if (selectedDateStr === thisDateStr) {
                    dayEl.classList.add('selected');
                }
                dayEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    selectedDateStr = thisDateStr;
                    hiddenInput.value = thisDateStr;
                    label.textContent = `${dStr}/${mStr}/${viewYear}`;
                    label.style.color = '#1E1D1A';
                    wrap.classList.remove('open');
                    renderCalendar();
                });
            }

            daysGrid.appendChild(dayEl);
        }
    }

    if (trigger) {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            wrap.classList.toggle('open');
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            viewMonth--;
            if (viewMonth < 0) {
                viewMonth = 11;
                viewYear--;
            }
            renderCalendar();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            viewMonth++;
            if (viewMonth > 11) {
                viewMonth = 0;
                viewYear++;
            }
            renderCalendar();
        });
    }

    document.addEventListener('click', (e) => {
        if (!wrap.contains(e.target)) {
            wrap.classList.remove('open');
        }
    });

    renderCalendar();
}
