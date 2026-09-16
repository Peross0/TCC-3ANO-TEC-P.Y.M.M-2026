document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================
    // 1. Menu Lateral Mobile (Sidebar)
    // ==========================================
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const menuToggle = document.getElementById('menuToggle');
    const sidebarClose = document.getElementById('sidebarClose');

    function openSidebar() { 
        sidebar.classList.add('open'); 
        overlay.classList.add('open'); 
    }
    
    function closeSidebar() { 
        sidebar.classList.remove('open'); 
        overlay.classList.remove('open'); 
    }

    if (menuToggle) menuToggle.addEventListener('click', openSidebar);
    if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);


    // ==========================================
    // 2. Painel de Notificações
    // ==========================================
    const bellBtn = document.getElementById('bellBtn');
    const notifPanel = document.getElementById('notifPanel');

    if (bellBtn && notifPanel) {
        bellBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Evita que o clique feche imediatamente
            notifPanel.classList.toggle('open');
        });

        // Fechar notificações ao clicar fora
        document.addEventListener('click', function(e) {
            if (!notifPanel.contains(e.target) && !bellBtn.contains(e.target)) {
                notifPanel.classList.remove('open');
            }
        });
    }


    // ==========================================
    // 3. Pesquisa/Filtro de Atividades
    // ==========================================
    const searchInput = document.getElementById('searchInput');
    const tableRows = document.querySelectorAll('#activitiesTable tbody tr');
    const noResults = document.getElementById('noResults');

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            let hasVisibleRow = false;

            tableRows.forEach(row => {
                // Pega os termos de busca no atributo data-search do HTML
                const searchData = row.getAttribute('data-search') || '';
                
                if (searchData.includes(searchTerm)) {
                    row.style.display = '';
                    hasVisibleRow = true;
                } else {
                    row.style.display = 'none';
                }
            });

            // Mostra a mensagem de "Nenhuma atividade encontrada" se necessário
            if (noResults) {
                noResults.style.display = hasVisibleRow ? 'none' : 'block';
            }
        });
    }


    // ==========================================
    // 4. Animação de Contagem (Cards de Resumo)
    // ==========================================
    const statValues = document.querySelectorAll('.stat-value');
    
    statValues.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-count'));
        if (isNaN(target)) return;

        let current = 0;
        const speed = 30; // Velocidade da animação
        const increment = Math.max(1, Math.ceil(target / speed));

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                stat.textContent = target;
                clearInterval(timer);
            } else {
                stat.textContent = current;
            }
        }, 30);
    });


    // ==========================================
    // 5. Gráfico de Desempenho (Chart.js)
    // ==========================================
    const chartCanvas = document.getElementById('performanceChart');
    
    // Verifica se o canvas existe e se a biblioteca Chart.js foi carregada no HTML
    if (chartCanvas && typeof Chart !== 'undefined') {
        new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: ['Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set'],
                datasets: [{
                    label: 'Atividades Concluídas',
                    data: [10, 15, 12, 20, 25, 24],
                    borderColor: '#2E56D9', // Cor primária (var(--primary))
                    backgroundColor: 'rgba(46, 86, 217, 0.12)', 
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4, // Suaviza a linha (curva)
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#2E56D9',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false // Esconde a legenda para ficar mais limpo
                    },
                    tooltip: {
                        backgroundColor: '#14213D',
                        titleFont: { family: 'Inter', size: 13 },
                        bodyFont: { family: 'Inter', size: 13 },
                        padding: 10,
                        cornerRadius: 8,
                        displayColors: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        display: false // Esconde o eixo Y para um visual minimalista
                    },
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            font: { family: 'Inter', size: 11 },
                            color: '#8792AC'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index',
                },
            }
        });
    }

});