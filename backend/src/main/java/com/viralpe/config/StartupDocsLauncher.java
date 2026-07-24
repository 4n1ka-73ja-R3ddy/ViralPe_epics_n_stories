package com.viralpe.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.awt.Desktop;
import java.net.URI;

@Component
public class StartupDocsLauncher {

    private static final Logger log = LoggerFactory.getLogger(StartupDocsLauncher.class);

    @Value("${viralpe.docs.auto-open:true}")
    private boolean autoOpen;

    @Value("${server.port:8080}")
    private int serverPort;

    @EventListener(ApplicationReadyEvent.class)
    public void openDocsPages() {
        if (!autoOpen) {
            return;
        }

        openUrl("http://localhost:" + serverPort + "/scalar");
        openUrl("http://localhost:" + serverPort + "/v3/api-docs");
    }

    private void openUrl(String url) {
        try {
            if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
                Desktop.getDesktop().browse(URI.create(url));
                return;
            }

            String os = System.getProperty("os.name", "").toLowerCase();
            if (os.contains("win")) {
                Runtime.getRuntime().exec(new String[]{"rundll32", "url.dll,FileProtocolHandler", url});
            } else if (os.contains("mac")) {
                Runtime.getRuntime().exec(new String[]{"open", url});
            } else {
                Runtime.getRuntime().exec(new String[]{"xdg-open", url});
            }
        } catch (Exception ex) {
            log.warn("Unable to auto-open URL: {}", url, ex);
        }
    }
}
