class DashboardView {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.rackItems = [];
        this.activeTab = 'tab-inventory';
        this.user = null;
        this.lastProductos = [];
        this.lastEspacio = null;
    }

    render(user) {
        this.user = user;
        const roles = user?.roles || [];
        const isAdmin = roles.some(r => r === 'ADMINISTRADOR' || r === 'ROLE_ADMINISTRADOR');
        const isGerente = roles.some(r => r === 'GERENTE' || r === 'ROLE_GERENTE');
        const isOperario = roles.some(r => r === 'OPERARIO' || r === 'ROLE_OPERARIO');

        // Permisos de UI estrictamente alineados con el backend
        const canManageUsers = isAdmin;
        const canConfigBodega = isAdmin || isGerente;
        const canOperateStock = isAdmin || isOperario; // + Nuevo Producto, +, -, Eliminar
        const canPredict = isAdmin || isGerente; // Simulador de impacto volumétrico

        this.container.innerHTML = `
            <div class="dashboard-container">
                <!-- Top Navbar -->
                <nav class="dash-nav glass-panel">
                    <div class="nav-brand">
                        <span class="brand-icon">⚡</span>
                        <h2>INVENTRACK</h2>
                        <div class="nav-status">
                            <span class="status-dot"></span>
                            <span>Neon DB • Online</span>
                        </div>
                    </div>
                    
                    <!-- Navigation Tabs Condicionales según Rol -->
                    <div class="nav-tabs" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <button class="nav-tab-btn active" data-tab="tab-inventory">📦 Inventario y 2D</button>
                        <button class="nav-tab-btn" data-tab="tab-kardex">📊 Kardex (Auditoría)</button>
                        ${canConfigBodega ? '<button class="nav-tab-btn" data-tab="tab-bodega">⚙️ Configurar Bodega</button>' : ''}
                        ${canManageUsers ? '<button class="nav-tab-btn" data-tab="tab-usuarios">👥 Usuarios y Roles</button>' : ''}
                    </div>

                    <div class="nav-user">
                        <div class="user-info">
                            <div class="user-email">${user?.email || 'usuario@inventrack.com'}</div>
                            <span class="user-role-badge">${roles[0] || 'USUARIO'}</span>
                        </div>
                        <button id="btn-logout" class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.85rem;">Cerrar Sesión</button>
                    </div>
                </nav>

                <!-- TAB 1: INVENTARIO Y VISUALIZADOR 2D -->
                <div id="tab-inventory" class="tab-content active-tab-content">
                    <!-- KPI Cards -->
                    <section class="kpi-grid">
                        <div class="kpi-card glass-panel">
                            <div class="kpi-header">
                                <span class="kpi-title">Productos en Catálogo</span>
                                <span class="kpi-icon">📦</span>
                            </div>
                            <div id="kpi-total-prod" class="kpi-value title-gradient">0</div>
                            <div class="kpi-subtitle">
                                <span id="kpi-total-units">0</span> unidades totales
                            </div>
                        </div>

                        <div class="kpi-card glass-panel">
                            <div class="kpi-header">
                                <span class="kpi-title">Ocupación Bodega</span>
                                <span class="kpi-icon">📐</span>
                            </div>
                            <div id="kpi-porcentaje-espacio" class="kpi-value">0%</div>
                            <div class="kpi-subtitle">
                                <span id="kpi-volumen-espacio">0.00</span> m³ ocupados
                            </div>
                            <div class="progress-bar-container">
                                <div id="kpi-progress-bar" class="progress-bar-fill" style="width: 0%;"></div>
                            </div>
                        </div>

                        <div class="kpi-card glass-panel">
                            <div class="kpi-header">
                                <span class="kpi-title">Alertas Críticas</span>
                                <span class="kpi-icon">⚠️</span>
                            </div>
                            <div id="kpi-alertas-activas" class="kpi-value" style="color: var(--danger);">0</div>
                            <div class="kpi-subtitle">Productos bajo stock mínimo</div>
                        </div>

                        <div class="kpi-card glass-panel">
                            <div class="kpi-header">
                                <span class="kpi-title">Productos Estrella</span>
                                <span class="kpi-icon">⭐</span>
                            </div>
                            <div id="kpi-productos-estrella" class="kpi-value" style="color: #facc15;">0</div>
                            <div class="kpi-subtitle">Estratégicos / Alta Rotación</div>
                        </div>
                    </section>

                    <!-- Main Grid: 2D Spatial Engine & Panels -->
                    <div class="dash-main-grid" style="margin-top: 1.5rem;">
                        <!-- Left: 2D Warehouse Spatial Map -->
                        <section class="warehouse-section glass-panel">
                            <div class="section-header">
                                <h3>🗺️ Visualizador Espacial 2D de Bodega</h3>
                                <div class="warehouse-legend">
                                    <div class="legend-item"><span class="legend-color legend-green"></span> Saludable</div>
                                    <div class="legend-item"><span class="legend-color legend-yellow"></span> Moderado</div>
                                    <div class="legend-item"><span class="legend-color legend-red"></span> Crítico</div>
                                    <div class="legend-item"><span class="legend-color legend-star"></span> Estrella ⭐</div>
                                </div>
                            </div>
                            
                            <div class="canvas-wrapper">
                                <canvas id="warehouse-canvas"></canvas>
                                <div id="canvas-tooltip" class="canvas-tooltip"></div>
                            </div>
                        </section>

                        <!-- Right: Alerts Feed & Predictive Simulator -->
                        <div class="sidebar-panel">
                            ${canPredict ? `
                            <!-- Predictive Space Simulator (Admin y Gerente) -->
                            <div class="panel-card glass-panel">
                                <div class="section-header">
                                    <h3>🔮 Simulador Predictivo</h3>
                                </div>
                                <p style="font-size: 0.8rem; color: var(--text-muted);">
                                    Proyecta el impacto volumétrico antes de ordenar mercancía.
                                </p>
                                <form id="simulator-form" class="simulator-form">
                                    <div class="form-group">
                                        <label>Producto a proyectar</label>
                                        <select id="sim-product-select" class="form-control" required>
                                            <option value="">Cargando productos...</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Cantidad proyectada (unidades)</label>
                                        <input type="number" id="sim-qty-input" class="form-control" placeholder="Ej: 100" min="1" required>
                                    </div>
                                    <button type="submit" class="btn btn-primary" style="padding: 0.65rem;">Calcular Impacto</button>
                                </form>
                                <div id="sim-result" class="sim-result"></div>
                            </div>
                            ` : `
                            <!-- Panel Informativo Operario -->
                            <div class="panel-card glass-panel">
                                <div class="section-header">
                                    <h3>🛠️ Panel de Operación</h3>
                                </div>
                                <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">
                                    Como <strong>Operario</strong> tienes autorización para registrar nuevos productos y registrar entradas y salidas con los botones <strong>(+)</strong> y <strong>(-)</strong>.
                                </p>
                                <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); padding: 0.75rem; border-radius: 8px; font-size: 0.8rem; color: var(--accent);">
                                    ✓ Cada movimiento queda registrado en el Kardex con tu usuario.
                                </div>
                            </div>
                            `}

                            <!-- Alerts Stream -->
                            <div class="panel-card glass-panel">
                                <div class="section-header">
                                    <h3>🔔 Alertas Asíncronas</h3>
                                </div>
                                <div id="alerts-container" class="alerts-list">
                                    <div style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 1rem;">
                                        Buscando alertas de inventario...
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Full Width: Inventory Table -->
                    <section class="inventory-section glass-panel" style="margin-top: 1.5rem;">
                        <div class="table-toolbar">
                            <div class="section-header">
                                <h3>📋 Catálogo y Control de Existencias</h3>
                            </div>
                            <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
                                <div class="search-input-wrapper">
                                    <span class="search-icon">🔍</span>
                                    <input type="text" id="inventory-search" class="form-control" placeholder="Buscar por SKU o Nombre...">
                                </div>
                                ${canOperateStock ? `
                                    <button id="btn-open-modal" class="btn btn-primary">+ Nuevo Producto</button>
                                ` : `
                                    <span class="user-role-badge" style="background: rgba(129, 140, 248, 0.15); color: var(--secondary); padding: 0.4rem 0.8rem;">Modo Supervisión</span>
                                `}
                            </div>
                        </div>

                        <div class="table-responsive">
                            <table class="custom-table">
                                <thead>
                                    <tr>
                                        <th>SKU</th>
                                        <th>Producto</th>
                                        <th>Dimensiones (L x A x H)</th>
                                        <th>Volumen Unitario</th>
                                        <th>Stock Actual / Mín</th>
                                        <th>Estado</th>
                                        <th style="text-align: right;">${canOperateStock ? 'Acciones (+ / -)' : 'Acceso'}</th>
                                    </tr>
                                </thead>
                                <tbody id="inventory-table-body">
                                    <tr>
                                        <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                                            Cargando inventario...
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                <!-- TAB 2: KARDEX / MOVIMIENTOS -->
                <div id="tab-kardex" class="tab-content" style="display: none;">
                    <section class="inventory-section glass-panel">
                        <div class="section-header">
                            <h3>📊 Kardex - Auditoría y Trazabilidad de Movimientos</h3>
                            <p style="font-size: 0.85rem; color: var(--text-muted);">
                                Registro inmutable de cada ingreso y despacho en Neon DB.
                            </p>
                        </div>
                        <div class="table-responsive" style="margin-top: 1rem;">
                            <table class="custom-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Fecha y Hora</th>
                                        <th>Tipo</th>
                                        <th>Producto</th>
                                        <th>SKU</th>
                                        <th>Cantidad</th>
                                        <th>Usuario Responsable</th>
                                    </tr>
                                </thead>
                                <tbody id="kardex-table-body">
                                    <tr>
                                        <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                                            Cargando movimientos...
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                <!-- TAB 3: CONFIGURACIÓN DE BODEGA (Admin y Gerente) -->
                ${canConfigBodega ? `
                <div id="tab-bodega" class="tab-content" style="display: none;">
                    <section class="glass-panel" style="max-width: 650px; margin: 0 auto; padding: 2rem; border-radius: 16px;">
                        <div class="section-header" style="margin-bottom: 1.5rem;">
                            <h3>⚙️ Configuración Espacial de la Bodega</h3>
                        </div>
                        <form id="form-bodega" style="display: flex; flex-direction: column; gap: 1.25rem;">
                            <div class="form-group">
                                <label>Nombre de la Bodega</label>
                                <input type="text" id="bodega-nombre" class="form-control" required>
                            </div>
                            <div class="form-grid-3">
                                <div class="form-group">
                                    <label>Largo Total (m)</label>
                                    <input type="number" step="0.5" id="bodega-largo" class="form-control" required>
                                </div>
                                <div class="form-group">
                                    <label>Ancho Total (m)</label>
                                    <input type="number" step="0.5" id="bodega-ancho" class="form-control" required>
                                </div>
                                <div class="form-group">
                                    <label>Alto Total (m)</label>
                                    <input type="number" step="0.5" id="bodega-alto" class="form-control" required>
                                </div>
                            </div>

                            <div style="background: rgba(56, 189, 248, 0.08); border: 1px solid var(--border-glass); border-radius: 8px; padding: 1rem;">
                                <div style="font-size: 0.85rem; color: var(--text-muted);">Capacidad Volumétrica Teórica:</div>
                                <div id="bodega-capacidad-total" style="font-size: 1.6rem; font-weight: 700; color: var(--primary);">
                                    0.00 m³
                                </div>
                            </div>

                            <button type="submit" class="btn btn-primary" style="padding: 0.75rem;">Guardar y Recalcular Bodega</button>
                        </form>
                    </section>
                </div>
                ` : ''}

                <!-- TAB 4: USUARIOS Y ROLES (Solo Administrador) -->
                ${canManageUsers ? `
                <div id="tab-usuarios" class="tab-content" style="display: none;">
                    <section class="inventory-section glass-panel">
                        <div class="table-toolbar">
                            <div class="section-header">
                                <h3>👥 Gestión de Usuarios y Roles (RBAC)</h3>
                            </div>
                            <button id="btn-open-user-modal" class="btn btn-primary">+ Nuevo Usuario</button>
                        </div>
                        <div class="table-responsive" style="margin-top: 1rem;">
                            <table class="custom-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre Completo</th>
                                        <th>Correo Electrónico</th>
                                        <th>Rol Asignado</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody id="users-table-body">
                                    <tr>
                                        <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                                            Cargando usuarios...
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
                ` : ''}
            </div>

            <!-- Modal for New Product (Solo visible si tiene permiso de operar stock) -->
            ${canOperateStock ? `
            <div id="product-modal" class="modal-overlay">
                <div class="modal-card">
                    <div class="modal-header">
                        <h3 class="title-gradient">Registrar Nuevo Producto</h3>
                        <button id="btn-close-modal" class="close-modal">&times;</button>
                    </div>
                    <form id="form-new-product" style="display: flex; flex-direction: column; gap: 1rem;">
                        <div class="form-grid-2">
                            <div class="form-group">
                                <label>Código SKU</label>
                                <input type="text" id="prod-sku" class="form-control" placeholder="Ej: GAM-MON-4K" required>
                            </div>
                            <div class="form-group">
                                <label>Nombre del Producto</label>
                                <input type="text" id="prod-nombre" class="form-control" placeholder="Ej: Monitor 4K 144Hz" required>
                            </div>
                        </div>

                        <div class="form-grid-3">
                            <div class="form-group">
                                <label>Largo (m)</label>
                                <input type="number" step="0.01" id="prod-largo" class="form-control" placeholder="0.50" required>
                            </div>
                            <div class="form-group">
                                <label>Ancho (m)</label>
                                <input type="number" step="0.01" id="prod-ancho" class="form-control" placeholder="0.30" required>
                            </div>
                            <div class="form-group">
                                <label>Alto (m)</label>
                                <input type="number" step="0.01" id="prod-alto" class="form-control" placeholder="0.10" required>
                            </div>
                        </div>

                        <div class="form-grid-2">
                            <div class="form-group">
                                <label>Stock Inicial</label>
                                <input type="number" id="prod-stock-actual" class="form-control" placeholder="20" min="0" required>
                            </div>
                            <div class="form-group">
                                <label>Stock Mínimo (Alerta)</label>
                                <input type="number" id="prod-stock-minimo" class="form-control" placeholder="5" min="1" required>
                            </div>
                        </div>

                        <label class="checkbox-label">
                            <input type="checkbox" id="prod-es-estrella">
                            <span>⭐ Marcar como Producto Estrella (Alta Rotación)</span>
                        </label>

                        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem;">
                            <button type="button" id="btn-cancel-modal" class="btn btn-secondary">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Guardar en Neon DB</button>
                        </div>
                    </form>
                </div>
            </div>
            ` : ''}

            <!-- Modal for New User (Solo visible si es Admin) -->
            ${canManageUsers ? `
            <div id="user-modal" class="modal-overlay">
                <div class="modal-card">
                    <div class="modal-header">
                        <h3 class="title-gradient">Crear Usuario del Sistema</h3>
                        <button id="btn-close-user-modal" class="close-modal">&times;</button>
                    </div>
                    <form id="form-new-user" style="display: flex; flex-direction: column; gap: 1rem;">
                        <div class="form-group">
                            <label>Nombre Completo</label>
                            <input type="text" id="user-nombre" class="form-control" placeholder="Ej: Juan Pérez" required>
                        </div>
                        <div class="form-group">
                            <label>Correo Electrónico</label>
                            <input type="email" id="user-email" class="form-control" placeholder="juan@inventrack.com" required>
                        </div>
                        <div class="form-group">
                            <label>Contraseña</label>
                            <input type="password" id="user-password" class="form-control" placeholder="••••••••" required>
                        </div>
                        <div class="form-group">
                            <label>Rol Asignado</label>
                            <select id="user-rol-select" class="form-control" required>
                                <option value="1">ADMINISTRADOR</option>
                                <option value="2">GERENTE</option>
                                <option value="3" selected>OPERARIO</option>
                            </select>
                        </div>
                        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem;">
                            <button type="button" id="btn-cancel-user-modal" class="btn btn-secondary">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Crear Usuario</button>
                        </div>
                    </form>
                </div>
            </div>
            ` : ''}
        `;

        this.initCanvas();
        this.initTabs();
    }

    initTabs() {
        const tabBtns = this.container.querySelectorAll('.nav-tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const targetTabId = btn.dataset.tab;
                this.container.querySelectorAll('.tab-content').forEach(tc => {
                    tc.style.display = 'none';
                });
                const target = document.getElementById(targetTabId);
                if (target) {
                    target.style.display = 'block';
                    if (targetTabId === 'tab-inventory' && this.lastProductos) {
                        setTimeout(() => this.renderWarehouse2D(this.lastProductos, this.lastEspacio), 50);
                    }
                }
            });
        });
    }

    initCanvas() {
        this.canvas = document.getElementById('warehouse-canvas');
        this.tooltip = document.getElementById('canvas-tooltip');
        if (!this.canvas) return;

        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = 380;
        this.ctx = this.canvas.getContext('2d');

        this.canvas.addEventListener('mousemove', (e) => this.handleCanvasHover(e));
        this.canvas.addEventListener('mouseleave', () => {
            if (this.tooltip) this.tooltip.style.display = 'none';
        });

        window.addEventListener('resize', () => {
            if (this.canvas && this.canvas.parentElement) {
                this.canvas.width = this.canvas.parentElement.getBoundingClientRect().width;
                if (this.lastProductos) {
                    this.renderWarehouse2D(this.lastProductos, this.lastEspacio);
                }
            }
        });
    }

    updateKPIs({ productos, espacio, alertas }) {
        const totalSKUs = productos.length;
        const totalUnits = productos.reduce((acc, p) => acc + (p.stockActual || 0), 0);
        const estrellasCount = productos.filter(p => p.esEstrella).length;
        const criticalCount = productos.filter(p => (p.stockActual || 0) <= (p.stockMinimo || 0)).length;

        const elemTotalProd = document.getElementById('kpi-total-prod');
        const elemTotalUnits = document.getElementById('kpi-total-units');
        const elemEstrellas = document.getElementById('kpi-productos-estrella');
        const elemCrit = document.getElementById('kpi-alertas-activas');

        if (elemTotalProd) elemTotalProd.innerText = totalSKUs;
        if (elemTotalUnits) elemTotalUnits.innerText = totalUnits.toLocaleString();
        if (elemEstrellas) elemEstrellas.innerText = estrellasCount;
        if (elemCrit) elemCrit.innerText = criticalCount;

        if (espacio) {
            const porcentaje = espacio.porcentajeOcupado ? espacio.porcentajeOcupado.toFixed(1) : '0.0';
            const volumen = espacio.volumenOcupado ? Number(espacio.volumenOcupado).toFixed(2) : '0.00';
            const totalVol = espacio.capacidadTotal ? Number(espacio.capacidadTotal).toFixed(0) : '3600';

            const elemPct = document.getElementById('kpi-porcentaje-espacio');
            const elemVol = document.getElementById('kpi-volumen-espacio');
            const elemBar = document.getElementById('kpi-progress-bar');

            if (elemPct) elemPct.innerText = `${porcentaje}%`;
            if (elemVol) elemVol.innerText = `${volumen} / ${totalVol}`;
            if (elemBar) {
                elemBar.style.width = `${Math.min(100, porcentaje)}%`;
                if (porcentaje > 80) elemBar.classList.add('warning');
                else elemBar.classList.remove('warning');
            }
        }
    }

    renderWarehouse2D(productos, espacio) {
        this.lastProductos = productos;
        this.lastEspacio = espacio;
        if (!this.ctx || !this.canvas) return;

        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        ctx.clearRect(0, 0, width, height);

        const padding = 30;
        const floorX = padding;
        const floorY = padding;
        const floorW = width - padding * 2;
        const floorH = height - padding * 2;

        // Draw Floor Outline & Grid
        ctx.fillStyle = '#090d16';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(floorX, floorY, floorW, floorH, 12);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        const gridSize = 25;
        for (let x = floorX; x < floorX + floorW; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, floorY);
            ctx.lineTo(x, floorY + floorH);
            ctx.stroke();
        }
        for (let y = floorY; y < floorY + floorH; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(floorX, y);
            ctx.lineTo(floorX + floorW, y);
            ctx.stroke();
        }

        // Draw Entrance / Dock
        ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
        ctx.beginPath();
        ctx.roundRect(floorX + floorW / 2 - 60, floorY + floorH - 12, 120, 12, [6, 6, 0, 0]);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#10b981';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('MUELLE DE CARGA / INGRESO', floorX + floorW / 2, floorY + floorH - 18);

        // Draw Aisles & Storage Racks
        this.rackItems = [];
        const numAisles = 3;
        const aisleLabels = ['PASILLO A', 'PASILLO B', 'PASILLO C'];
        const aisleWidth = (floorW - 40) / numAisles;

        aisleLabels.forEach((label, i) => {
            const aisleCenterX = floorX + 20 + i * aisleWidth + aisleWidth / 2;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.font = '11px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(label, aisleCenterX, floorY + 24);

            const racks = [
                { x: aisleCenterX - aisleWidth * 0.38, w: aisleWidth * 0.32 },
                { x: aisleCenterX + aisleWidth * 0.06, w: aisleWidth * 0.32 }
            ];

            const rackStartY = floorY + 40;
            const rackTotalH = floorH - 80;
            const slotsPerRack = 3;
            const slotH = (rackTotalH - (slotsPerRack - 1) * 10) / slotsPerRack;

            racks.forEach((rack, rIdx) => {
                for (let s = 0; s < slotsPerRack; s++) {
                    const slotY = rackStartY + s * (slotH + 10);
                    const prodIndex = (i * 6) + (rIdx * 3) + s;
                    const prod = productos[prodIndex % productos.length];

                    let fillColor = 'rgba(16, 185, 129, 0.15)';
                    let strokeColor = '#10b981';
                    const isCritical = prod ? (prod.stockActual <= prod.stockMinimo) : false;
                    const isStar = prod ? prod.esEstrella : false;

                    if (isCritical) {
                        fillColor = 'rgba(239, 68, 68, 0.25)';
                        strokeColor = '#ef4444';
                    } else if (isStar) {
                        fillColor = 'rgba(250, 204, 21, 0.2)';
                        strokeColor = '#facc15';
                    }

                    ctx.fillStyle = fillColor;
                    ctx.strokeStyle = strokeColor;
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.roundRect(rack.x, slotY, rack.w, slotH, 6);
                    ctx.fill();
                    ctx.stroke();

                    if (prod) {
                        ctx.fillStyle = '#f8fafc';
                        ctx.font = 'bold 10px Inter, sans-serif';
                        ctx.textAlign = 'left';
                        ctx.fillText(prod.codigoSku, rack.x + 8, slotY + 18);

                        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                        ctx.font = '9px Inter, sans-serif';
                        ctx.fillText(`Stock: ${prod.stockActual} u.`, rack.x + 8, slotY + 34);

                        if (isStar) {
                            ctx.fillStyle = '#facc15';
                            ctx.font = '10px Inter, sans-serif';
                            ctx.fillText('⭐', rack.x + rack.w - 18, slotY + 18);
                        }

                        this.rackItems.push({
                            x: rack.x,
                            y: slotY,
                            w: rack.w,
                            h: slotH,
                            producto: prod
                        });
                    }
                }
            });
        });
    }

    handleCanvasHover(e) {
        if (!this.tooltip || !this.canvas) return;
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const hovered = this.rackItems.find(item => 
            mouseX >= item.x && mouseX <= item.x + item.w &&
            mouseY >= item.y && mouseY <= item.y + item.h
        );

        if (hovered && hovered.producto) {
            const p = hovered.producto;
            const isCrit = p.stockActual <= p.stockMinimo;
            this.tooltip.innerHTML = `
                <div style="font-weight: 700; color: var(--primary); margin-bottom: 4px;">
                    ${p.nombre} ${p.esEstrella ? '⭐' : ''}
                </div>
                <div style="color: var(--text-muted); font-size: 0.75rem;">SKU: <span style="color:#fff;">${p.codigoSku}</span></div>
                <div style="color: var(--text-muted); font-size: 0.75rem;">Dimensiones: ${p.largo}m × ${p.ancho}m × ${p.alto}m</div>
                <div style="color: var(--text-muted); font-size: 0.75rem;">Volumen Unitario: ${(p.largo * p.ancho * p.alto).toFixed(4)} m³</div>
                <div style="margin-top: 6px; font-weight: 600; color: ${isCrit ? 'var(--danger)' : 'var(--accent)'};">
                    Stock: ${p.stockActual} / Mín: ${p.stockMinimo} (${isCrit ? 'CRÍTICO' : 'ÓPTIMO'})
                </div>
            `;
            this.tooltip.style.left = `${mouseX + 15}px`;
            this.tooltip.style.top = `${mouseY + 15}px`;
            this.tooltip.style.display = 'block';
        } else {
            this.tooltip.style.display = 'none';
        }
    }

    renderAlerts(alertas) {
        const container = document.getElementById('alerts-container');
        if (!container) return;

        if (!alertas || alertas.length === 0) {
            container.innerHTML = `
                <div style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 1.5rem;">
                    ✅ Todo el inventario se encuentra en niveles saludables.
                </div>
            `;
            return;
        }

        container.innerHTML = alertas.slice(0, 10).map(a => `
            <div class="alert-item ${a.tipoAlerta || 'STOCK_CRITICO'}">
                <div class="alert-top">
                    <span class="alert-badge ${a.tipoAlerta === 'STOCK_CRITICO' ? 'danger' : 'warning'}">
                        ${a.tipoAlerta || 'ALERTA'}
                    </span>
                    <span>${a.fechaGeneracion ? new Date(a.fechaGeneracion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Reciente'}</span>
                </div>
                <div class="alert-msg">${a.mensaje}</div>
            </div>
        `).join('');
    }

    renderTable(productos) {
        const tbody = document.getElementById('inventory-table-body');
        const selectProd = document.getElementById('sim-product-select');
        if (!tbody) return;

        const roles = this.user?.roles || [];
        const canOperateStock = roles.some(r => r === 'ADMINISTRADOR' || r === 'ROLE_ADMINISTRADOR' || r === 'OPERARIO' || r === 'ROLE_OPERARIO');

        if (selectProd) {
            selectProd.innerHTML = '<option value="">-- Selecciona un producto --</option>' + 
                productos.map(p => `<option value="${p.id}">${p.nombre} (${p.codigoSku})</option>`).join('');
        }

        if (!productos || productos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                        No se encontraron productos registrados.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = productos.map(p => {
            const isCrit = (p.stockActual || 0) <= (p.stockMinimo || 0);
            const vol = (p.largo && p.ancho && p.alto) ? (p.largo * p.ancho * p.alto).toFixed(4) : (p.volumen || '0.00');
            return `
                <tr>
                    <td><span class="sku-badge">${p.codigoSku}</span></td>
                    <td>
                        <strong>${p.nombre}</strong>
                        ${p.esEstrella ? '<span class="star-tag" title="Producto Estrella">⭐ Estrella</span>' : ''}
                    </td>
                    <td style="color: var(--text-muted); font-size: 0.85rem;">
                        ${p.largo}m × ${p.ancho}m × ${p.alto}m
                    </td>
                    <td style="color: var(--text-muted); font-size: 0.85rem;">
                        ${vol} m³
                    </td>
                    <td>
                        <strong style="font-size: 1.1rem; color: ${isCrit ? 'var(--danger)' : 'var(--accent)'};">${p.stockActual || 0}</strong> / <span style="color: var(--text-muted);">${p.stockMinimo}</span>
                    </td>
                    <td>
                        <span class="stock-badge ${isCrit ? 'critical' : 'ok'}">
                            ${isCrit ? '⚠️ Bajo Mínimo' : '✓ Normal'}
                        </span>
                    </td>
                    <td style="text-align: right;">
                        ${canOperateStock ? `
                            <div class="action-btn-group" style="justify-content: flex-end;">
                                <button class="btn-icon" data-action="add-stock" data-id="${p.id}" title="Ingresar 1 unidad (+)">+</button>
                                <button class="btn-icon" data-action="sub-stock" data-id="${p.id}" title="Retirar 1 unidad (-)">-</button>
                                <button class="btn-icon btn-danger" data-action="delete" data-id="${p.id}" title="Eliminar producto">🗑</button>
                            </div>
                        ` : `
                            <span style="color: var(--text-muted); font-size: 0.75rem; font-style: italic; background: rgba(255, 255, 255, 0.04); padding: 0.25rem 0.5rem; border-radius: 6px;">Solo Lectura</span>
                        `}
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderKardex(movimientos) {
        const tbody = document.getElementById('kardex-table-body');
        if (!tbody) return;

        if (!movimientos || movimientos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                        Aún no se han registrado movimientos en el Kardex.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = movimientos.map(m => {
            const isEntrada = m.tipo === 'ENTRADA';
            const fechaStr = m.fechaMovimiento ? new Date(m.fechaMovimiento).toLocaleString() : 'Reciente';
            return `
                <tr>
                    <td>#${m.id}</td>
                    <td style="font-size: 0.85rem; color: var(--text-muted);">${fechaStr}</td>
                    <td>
                        <span class="stock-badge ${isEntrada ? 'ok' : 'critical'}">
                            ${isEntrada ? '⬆ INGRESO' : '⬇ SALIDA'}
                        </span>
                    </td>
                    <td><strong>${m.producto?.nombre || 'Producto #' + m.producto?.id}</strong></td>
                    <td><span class="sku-badge">${m.producto?.codigoSku || '-'}</span></td>
                    <td><strong style="color: ${isEntrada ? 'var(--accent)' : 'var(--danger)'};">${isEntrada ? '+' : '-'}${m.cantidad} u.</strong></td>
                    <td style="font-size: 0.85rem;">${m.usuario?.nombreCompleto || m.usuario?.email || 'Sistema'}</td>
                </tr>
            `;
        }).join('');
    }

    renderBodega(bodega) {
        if (!bodega) return;
        const nombreInput = document.getElementById('bodega-nombre');
        const largoInput = document.getElementById('bodega-largo');
        const anchoInput = document.getElementById('bodega-ancho');
        const altoInput = document.getElementById('bodega-alto');
        const totalDisplay = document.getElementById('bodega-capacidad-total');

        if (nombreInput) nombreInput.value = bodega.nombre || '';
        if (largoInput) largoInput.value = bodega.largoTotal || 30;
        if (anchoInput) anchoInput.value = bodega.anchoTotal || 20;
        if (altoInput) altoInput.value = bodega.altoTotal || 6;
        if (totalDisplay) {
            const cap = bodega.capacidadVolumetrica || (bodega.largoTotal * bodega.anchoTotal * bodega.altoTotal);
            totalDisplay.innerText = `${Number(cap).toFixed(2)} m³`;
        }
    }

    renderUsuarios(usuarios) {
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;

        if (!usuarios || usuarios.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">No hay usuarios cargados.</td></tr>`;
            return;
        }

        tbody.innerHTML = usuarios.map(u => `
            <tr>
                <td>#${u.id}</td>
                <td><strong>${u.nombreCompleto}</strong></td>
                <td>${u.email}</td>
                <td><span class="user-role-badge">${u.rol?.nombre || 'OPERARIO'}</span></td>
                <td><span class="stock-badge ok">Activo</span></td>
            </tr>
        `).join('');
    }

    showSimulationResult(data) {
        const div = document.getElementById('sim-result');
        if (!div) return;

        const nuevoPct = data.nuevoPorcentajeOcupado ? data.nuevoPorcentajeOcupado.toFixed(2) : '0.00';
        const impacto = data.impactoVolumetrico ? Number(data.impactoVolumetrico).toFixed(2) : '0.00';
        const isOverflow = data.nuevoPorcentajeOcupado > 100;

        div.style.display = 'block';
        div.innerHTML = `
            <div style="font-weight: 700; color: ${isOverflow ? 'var(--danger)' : 'var(--primary)'}; margin-bottom: 4px;">
                ${isOverflow ? '⚠️ ALERTA: Sobrecupo de Bodega' : '✅ Proyección Factible'}
            </div>
            <div>Impacto Volumétrico: <strong>+${impacto} m³</strong></div>
            <div>Nueva Ocupación Estimada: <strong>${nuevoPct}%</strong></div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">
                Espacio remanente proyectado: ${data.nuevoVolumenDisponible ? Number(data.nuevoVolumenDisponible).toFixed(2) : 0} m³
            </div>
        `;
    }

    openModal() {
        const modal = document.getElementById('product-modal');
        if (modal) modal.style.display = 'flex';
    }

    closeModal() {
        const modal = document.getElementById('product-modal');
        if (modal) {
            modal.style.display = 'none';
            const f = document.getElementById('form-new-product');
            if (f) f.reset();
        }
    }

    openUserModal() {
        const modal = document.getElementById('user-modal');
        if (modal) modal.style.display = 'flex';
    }

    closeUserModal() {
        const modal = document.getElementById('user-modal');
        if (modal) {
            modal.style.display = 'none';
            const f = document.getElementById('form-new-user');
            if (f) f.reset();
        }
    }
}
