package com.viralpe.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${server.port:8080}")
    private String serverPort;

    @Bean
    public OpenAPI viralPeOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("ViralPe — Interactive Backend API Reference (Scalar)")
                        .description("Full REST API collection powering ViralPe Multi-Wallet Payments, Utility Services, Royalty Engine & Pincode Championship.")
                        .version("v1.0.0")
                        .contact(new Contact().name("ViralPe Platform Engineering").email("support@viralpe.com")))
                .servers(List.of(
                        new Server().url("http://localhost:" + serverPort).description("Local Development Server")
                ))
                .tags(List.of(
                        new Tag().name("1. Auth & Sign-In").description("Google OAuth2 and Demo Authentication endpoints"),
                        new Tag().name("2. User Profile & Pincodes").description("User profile onboarding and pincode master directory"),
                        new Tag().name("3. Wallet & Balance Ledgers").description("Spendable Balance, Reversal Balance, Total Earnings, and Activity Log"),
                        new Tag().name("4. Checkout & Payments").description("Multi-wallet payment execution and transaction history"),
                        new Tag().name("5. Mobile Recharge (Cyrus API)").description("MNP operator lookup, plan fetching, and mobile recharge execution"),
                        new Tag().name("6. Bill Payments BBPS (Cyrus API)").description("Utility bill categories, billers, live BBPS fetch, and bill pay"),
                        new Tag().name("7. Digital Vouchers (Cyrus API)").description("Brand gift cards, denominations, instant code/PIN reveal, and voucher history"),
                        new Tag().name("8. Cashback & Referrals").description("Cashback ledger history and referral bonus tracking"),
                        new Tag().name("9. Pincode Royalty Championship").description("Live championship ticker, leaderboard evaluation, and regional pools"),
                        new Tag().name("10. Vertical Royalty Engine").description("Category profit margins, root deductions, and margin simulation"),
                        new Tag().name("11. Admin & Platform Controls").description("Promotional fund injection, pincode management, and audit logs"),
                        new Tag().name("12. Demo Presentation Engine").description("Multi-date demo data generator for presentation testing")
                ));
    }
}
