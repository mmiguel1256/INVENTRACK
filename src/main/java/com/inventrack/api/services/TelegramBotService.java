package com.inventrack.api.services;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

@Service
public class TelegramBotService {

    // En un futuro estos valores vendrán del application.properties
    @Value("${telegram.bot.token:default_token}")
    private String botToken;
    
    @Value("${telegram.chat.id:default_chat_id}")
    private String chatId;

    public void enviarMensaje(String mensaje) {
        if ("default_token".equals(botToken)) {
            System.out.println("TELEGRAM BOT (Simulado) -> Enviando alerta: " + mensaje);
            return;
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = "https://api.telegram.org/bot" + botToken + "/sendMessage?chat_id=" + chatId + "&text=" + mensaje;
            restTemplate.getForObject(url, String.class);
            System.out.println("Alerta enviada exitosamente a Telegram.");
        } catch (Exception e) {
            System.err.println("Error al enviar alerta por Telegram: " + e.getMessage());
        }
    }
}
