package com.inventrack.api.services;

import com.inventrack.api.models.Alerta;
import com.inventrack.api.models.Producto;
import com.inventrack.api.repositories.AlertaRepository;
import com.inventrack.api.repositories.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AlertaCronJobService {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private AlertaRepository alertaRepository;

    @Autowired
    private TelegramBotService telegramBotService;

    // Ejecuta la validación cada hora (en milisegundos)
    // Para probarlo rápido, lo pondremos cada 1 minuto: 60000 ms
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void verificarEscasezYEnviarAlertas() {
        System.out.println("CRON JOB: Iniciando escaneo de inventario para alertas asíncronas...");

        // 1. Verificar productos que acaban de entrar en escasez
        List<Producto> productos = productoRepository.findAll();
        for (Producto p : productos) {
            if (p.getStockActual() != null && p.getStockMinimo() != null) {
                if (p.getStockActual() <= p.getStockMinimo()) {
                    // Solo generamos la alerta si no se ha notificado o gestionado
                    // Lógica simplificada: siempre alertar si está por debajo (esto podría optimizarse)
                    String mensaje = "ESCASEZ: El producto " + p.getNombre() + " (SKU: " + p.getCodigoSku() + ") está por agotarse. Stock actual: " + p.getStockActual();
                    
                    Alerta nuevaAlerta = new Alerta();
                    nuevaAlerta.setProducto(p);
                    nuevaAlerta.setTipoAlerta("ESCASEZ");
                    nuevaAlerta.setMensaje(mensaje);
                    nuevaAlerta.setNotificadaPorBot(false);
                    alertaRepository.save(nuevaAlerta);
                }
            }
        }

        // 2. Enviar todas las alertas pendientes (NotificadasPorBot = false)
        List<Alerta> alertasPendientes = alertaRepository.findByNotificadaPorBotFalse();
        for (Alerta alerta : alertasPendientes) {
            telegramBotService.enviarMensaje(alerta.getMensaje());
            
            // Marcar como enviada para no repetir
            alerta.setNotificadaPorBot(true);
            alertaRepository.save(alerta);
        }

        System.out.println("CRON JOB: Escaneo finalizado. Alertas enviadas: " + alertasPendientes.size());
    }
}
