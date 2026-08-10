package com.viralpe.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;

@Component
public class AdminRbacInterceptor implements HandlerInterceptor {

    @Value("${viralpe.security.rbac.enabled:true}")
    private boolean rbacEnabled;

    @Value("${viralpe.security.rbac.strict:false}")
    private boolean strictMode;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!rbacEnabled) {
            return true;
        }

        String path = request.getRequestURI();
        // Protect all admin endpoints
        if (path != null && path.startsWith("/api/admin")) {
            String roleHeader = request.getHeader("X-User-Role");
            String userIdHeader = request.getHeader("X-User-Id");
            String authHeader = request.getHeader("Authorization");

            // Explicit customer token/role trying to access admin endpoint -> REJECT 403
            if ("CUSTOMER".equalsIgnoreCase(roleHeader) || "USER".equalsIgnoreCase(roleHeader)) {
                sendForbiddenResponse(response, "Access Denied: Customer accounts are not permitted to access Admin endpoints.");
                return false;
            }

            // If strict mode is enabled, enforce explicit ADMIN role or Admin Authorization header
            if (strictMode) {
                boolean isAdmin = "ADMIN".equalsIgnoreCase(roleHeader)
                        || (StringUtils.hasText(authHeader) && authHeader.contains("admin"))
                        || (StringUtils.hasText(userIdHeader) && "0".equals(userIdHeader));

                if (!isAdmin) {
                    sendForbiddenResponse(response, "Access Denied: Admin role authorization required.");
                    return false;
                }
            }
        }

        return true;
    }

    private void sendForbiddenResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        String json = String.format("{\"error\":\"%s\",\"status\":403,\"timestamp\":%d}", message, System.currentTimeMillis());
        response.getWriter().write(json);
    }
}
