class DashboardPresenter {
    constructor(view, inventoryModel, authModel, onLogout) {
        this.view = view;
        this.inventoryModel = inventoryModel;
        this.authModel = authModel;
        this.onLogout = onLogout;
        this.refreshInterval = null;
    }

    async init() {
        this.view.render(this.authModel.user);
        this.attachEvents();
        await this.loadData();

        // If admin, load users list too
        if (this.authModel.user?.roles?.includes('ADMINISTRADOR')) {
            const users = await this.inventoryModel.cargarUsuarios(this.authModel.token);
            this.view.renderUsuarios(users);
        }

        // Auto refresh every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.loadData(true);
        }, 30000);
    }

    async loadData(silent = false) {
        try {
            const token = this.authModel.token;
            if (!token) {
                this.destroy();
                this.onLogout();
                return;
            }

            const data = await this.inventoryModel.cargarDatosCompletos(token);
            
            this.view.updateKPIs({
                productos: data.productos,
                espacio: data.espacio,
                alertas: data.alertas
            });

            this.view.renderWarehouse2D(data.productos, data.espacio);
            this.view.renderAlerts(data.alertas);
            this.view.renderTable(data.productos);
            this.view.renderKardex(data.movimientos);
            this.view.renderBodega(data.bodega);

        } catch (err) {
            console.error('Error cargando datos del dashboard:', err);
            if (err.message === 'UNAUTHORIZED') {
                this.destroy();
                this.onLogout();
            }
        }
    }

    attachEvents() {
        // Logout
        document.getElementById('btn-logout')?.addEventListener('click', () => {
            this.destroy();
            this.onLogout();
        });

        // Search Filter
        document.getElementById('inventory-search')?.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const filtered = this.inventoryModel.productos.filter(p => 
                p.nombre.toLowerCase().includes(query) || 
                p.codigoSku.toLowerCase().includes(query)
            );
            this.view.renderTable(filtered);
        });

        // Product Modal Controls
        document.getElementById('btn-open-modal')?.addEventListener('click', () => {
            this.view.openModal();
        });

        document.getElementById('btn-close-modal')?.addEventListener('click', () => {
            this.view.closeModal();
        });

        document.getElementById('btn-cancel-modal')?.addEventListener('click', () => {
            this.view.closeModal();
        });

        // New Product Submission
        document.getElementById('form-new-product')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.innerText = 'Guardando en Neon...';

            try {
                const prodData = {
                    codigoSku: document.getElementById('prod-sku').value.trim(),
                    nombre: document.getElementById('prod-nombre').value.trim(),
                    largo: parseFloat(document.getElementById('prod-largo').value),
                    ancho: parseFloat(document.getElementById('prod-ancho').value),
                    alto: parseFloat(document.getElementById('prod-alto').value),
                    stockActual: parseInt(document.getElementById('prod-stock-actual').value, 10),
                    stockMinimo: parseInt(document.getElementById('prod-stock-minimo').value, 10),
                    esEstrella: document.getElementById('prod-es-estrella').checked,
                    activo: true
                };

                await this.inventoryModel.agregarProducto(prodData, this.authModel.token);
                this.view.closeModal();
                await this.loadData();
            } catch (err) {
                alert('Error al guardar el producto: ' + err.message);
            } finally {
                btn.disabled = false;
                btn.innerText = 'Guardar en Neon DB';
            }
        });

        // Table Action Buttons (+, -, Delete) with instant Kardex recording
        document.getElementById('inventory-table-body')?.addEventListener('click', async (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            const action = btn.dataset.action;
            const id = parseInt(btn.dataset.id, 10);
            const prod = this.inventoryModel.productos.find(p => p.id === id);
            if (!prod) return;

            if (action === 'add-stock') {
                btn.disabled = true;
                const nuevo = (prod.stockActual || 0) + 1;
                await this.inventoryModel.modificarStock(id, nuevo, this.authModel.token);
                await this.loadData();
            } else if (action === 'sub-stock') {
                if ((prod.stockActual || 0) <= 0) return;
                btn.disabled = true;
                const nuevo = prod.stockActual - 1;
                await this.inventoryModel.modificarStock(id, nuevo, this.authModel.token);
                await this.loadData();
            } else if (action === 'delete') {
                if (confirm(`¿Estás seguro de eliminar el producto "${prod.nombre}"?`)) {
                    btn.disabled = true;
                    await this.inventoryModel.eliminarProducto(id, this.authModel.token);
                    await this.loadData();
                }
            }
        });

        // Simulation Form
        document.getElementById('simulator-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const prodId = document.getElementById('sim-product-select').value;
            const qty = document.getElementById('sim-qty-input').value;
            if (!prodId || !qty) return;

            try {
                const res = await this.inventoryModel.simularEspacio(prodId, qty, this.authModel.token);
                this.view.showSimulationResult(res);
            } catch (err) {
                alert('Error al calcular proyección: ' + err.message);
            }
        });

        // Bodega Configuration Form
        document.getElementById('form-bodega')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.innerText = 'Guardando y recalculando...';

            try {
                const configData = {
                    nombre: document.getElementById('bodega-nombre').value.trim(),
                    largoTotal: parseFloat(document.getElementById('bodega-largo').value),
                    anchoTotal: parseFloat(document.getElementById('bodega-ancho').value),
                    altoTotal: parseFloat(document.getElementById('bodega-alto').value)
                };

                await this.inventoryModel.actualizarBodega(configData, this.authModel.token);
                alert('¡Configuración de bodega actualizada en Neon DB!');
                await this.loadData();
            } catch (err) {
                alert('Error al actualizar bodega: ' + err.message);
            } finally {
                btn.disabled = false;
                btn.innerText = 'Guardar y Recalcular Bodega';
            }
        });

        // User Management (Admin)
        document.getElementById('btn-open-user-modal')?.addEventListener('click', () => {
            this.view.openUserModal();
        });

        document.getElementById('btn-close-user-modal')?.addEventListener('click', () => {
            this.view.closeUserModal();
        });

        document.getElementById('btn-cancel-user-modal')?.addEventListener('click', () => {
            this.view.closeUserModal();
        });

        document.getElementById('form-new-user')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.innerText = 'Creando usuario...';

            try {
                const uData = {
                    nombreCompleto: document.getElementById('user-nombre').value.trim(),
                    email: document.getElementById('user-email').value.trim(),
                    password: document.getElementById('user-password').value,
                    rolId: parseInt(document.getElementById('user-rol-select').value, 10)
                };

                await this.inventoryModel.crearUsuario(uData, this.authModel.token);
                this.view.closeUserModal();
                const users = await this.inventoryModel.cargarUsuarios(this.authModel.token);
                this.view.renderUsuarios(users);
                alert('¡Usuario creado exitosamente en Neon DB!');
            } catch (err) {
                alert('Error al crear usuario: ' + err.message);
            } finally {
                btn.disabled = false;
                btn.innerText = 'Crear Usuario';
            }
        });
    }

    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
}
