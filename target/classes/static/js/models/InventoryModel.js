class InventoryModel {
    constructor() {
        this.productos = [];
        this.alertas = [];
        this.espacio = null;
        this.movimientos = [];
        this.bodega = null;
        this.usuarios = [];
    }

    async cargarDatosCompletos(token) {
        try {
            const [productos, espacio, alertas, movimientos, bodega] = await Promise.all([
                ApiService.getWithAuth('/productos', token).catch(() => []),
                ApiService.getWithAuth('/prediccion/espacio-actual', token).catch(() => null),
                ApiService.getWithAuth('/alertas', token).catch(() => []),
                ApiService.getWithAuth('/movimientos', token).catch(() => []),
                ApiService.getWithAuth('/bodega', token).catch(() => null)
            ]);

            this.productos = productos || [];
            this.espacio = espacio;
            this.alertas = alertas || [];
            this.movimientos = movimientos || [];
            this.bodega = bodega;

            return {
                productos: this.productos,
                espacio: this.espacio,
                alertas: this.alertas,
                movimientos: this.movimientos,
                bodega: this.bodega
            };
        } catch (error) {
            console.error('Error al cargar datos de inventario:', error);
            throw error;
        }
    }

    async agregarProducto(productoData, token) {
        const nuevo = await ApiService.postWithAuth('/productos', productoData, token);
        this.productos.push(nuevo);
        return nuevo;
    }

    async modificarStock(id, nuevoStock, token) {
        const prod = this.productos.find(p => p.id === id);
        if (!prod) throw new Error('Producto no encontrado');

        const copia = { ...prod, stockActual: Math.max(0, nuevoStock) };
        const actualizado = await ApiService.putWithAuth(`/productos/${id}`, copia, token);
        
        // Actualizar en el estado local
        const index = this.productos.findIndex(p => p.id === id);
        if (index !== -1) {
            this.productos[index] = actualizado;
        }
        return actualizado;
    }

    async eliminarProducto(id, token) {
        await ApiService.deleteWithAuth(`/productos/${id}`, token);
        this.productos = this.productos.filter(p => p.id !== id);
        return true;
    }

    async simularEspacio(productoId, cantidad, token) {
        return await ApiService.getWithAuth(`/prediccion/estimar?productoId=${productoId}&cantidadProyectada=${cantidad}`, token);
    }

    async actualizarBodega(datosBodega, token) {
        const res = await ApiService.putWithAuth('/bodega', datosBodega, token);
        this.bodega = res;
        return res;
    }

    async cargarUsuarios(token) {
        this.usuarios = await ApiService.getWithAuth('/usuarios', token).catch(() => []);
        return this.usuarios;
    }

    async crearUsuario(usuarioData, token) {
        return await ApiService.postWithAuth('/usuarios', usuarioData, token);
    }
}
