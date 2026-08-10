package com.viralpe.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

public class RbacSecurityTest {

    private AdminRbacInterceptor interceptor;

    @BeforeEach
    public void setUp() {
        interceptor = new AdminRbacInterceptor();
        ReflectionTestUtils.setField(interceptor, "rbacEnabled", true);
        ReflectionTestUtils.setField(interceptor, "strictMode", false);
    }

    @Test
    @DisplayName("Should block CUSTOMER role from accessing /api/admin endpoints with 403 Forbidden")
    public void testCustomerBlockedFromAdminEndpoints() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/admin/fund");
        request.addHeader("X-User-Role", "CUSTOMER");
        MockHttpServletResponse response = new MockHttpServletResponse();

        boolean allowed = interceptor.preHandle(request, response, new Object());

        assertFalse(allowed, "Customer role must be blocked from admin endpoints.");
        assertEquals(403, response.getStatus());
        assertTrue(response.getContentAsString().contains("Access Denied"));
    }

    @Test
    @DisplayName("Should allow ADMIN role to access /api/admin endpoints")
    public void testAdminAllowedOnAdminEndpoints() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/admin/users");
        request.addHeader("X-User-Role", "ADMIN");
        MockHttpServletResponse response = new MockHttpServletResponse();

        boolean allowed = interceptor.preHandle(request, response, new Object());

        assertTrue(allowed, "Admin role must be permitted on admin endpoints.");
        assertNotEquals(403, response.getStatus());
    }

    @Test
    @DisplayName("Should allow non-admin paths to bypass RBAC interceptor")
    public void testNonAdminPathsAllowed() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/recharge/operators");
        request.addHeader("X-User-Role", "CUSTOMER");
        MockHttpServletResponse response = new MockHttpServletResponse();

        boolean allowed = interceptor.preHandle(request, response, new Object());

        assertTrue(allowed, "Non-admin public endpoints must be allowed.");
    }
}
