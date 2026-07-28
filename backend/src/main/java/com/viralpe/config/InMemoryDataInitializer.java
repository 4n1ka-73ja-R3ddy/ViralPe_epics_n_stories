package com.viralpe.config;

import com.viralpe.demo.DemoService;
import com.viralpe.royalty.model.RoyaltyConfiguration;
import com.viralpe.royalty.repository.RoyaltyConfigurationRepository;
import com.viralpe.user.model.Pincode;
import com.viralpe.user.model.User;
import com.viralpe.user.repository.PincodeRepository;
import com.viralpe.user.repository.UserRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;

@Component
public class InMemoryDataInitializer {

    private final PincodeRepository pincodeRepository;
    private final RoyaltyConfigurationRepository royaltyConfigRepository;
    private final UserRepository userRepository;
    private final DemoService demoService;

    public InMemoryDataInitializer(
            PincodeRepository pincodeRepository,
            RoyaltyConfigurationRepository royaltyConfigRepository,
            UserRepository userRepository,
            DemoService demoService
    ) {
        this.pincodeRepository = pincodeRepository;
        this.royaltyConfigRepository = royaltyConfigRepository;
        this.userRepository = userRepository;
        this.demoService = demoService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void initializeInMemoryData() {
        // 1. Seed Master Pincodes Directory in Memory
        if (pincodeRepository.count() == 0) {
            pincodeRepository.saveAll(List.of(
                    createPincode("560001", "Bengaluru", "Bengaluru Urban", "Karnataka", true),
                    createPincode("500001", "Hyderabad", "Hyderabad", "Telangana", true),
                    createPincode("600001", "Chennai", "Chennai", "Tamil Nadu", true),
                    createPincode("400001", "Mumbai", "Mumbai City", "Maharashtra", true),
                    createPincode("110001", "New Delhi", "New Delhi", "Delhi", true)
            ));
        }

        // 2. Seed Vertical Royalty Engine Configurations in Memory
        if (royaltyConfigRepository.count() == 0) {
            OffsetDateTime now = OffsetDateTime.now();
            royaltyConfigRepository.saveAll(List.of(
                    createRoyaltyConfig("ECOMMERCE", 12.0, 10.0, 40.0, 40.0, 20.0, now),
                    createRoyaltyConfig("FOOD", 15.0, 10.0, 40.0, 40.0, 20.0, now),
                    createRoyaltyConfig("TRAVEL", 8.0, 10.0, 40.0, 40.0, 20.0, now),
                    createRoyaltyConfig("UTILITY", 5.0, 10.0, 40.0, 40.0, 20.0, now),
                    createRoyaltyConfig("RECHARGE", 4.0, 10.0, 40.0, 40.0, 20.0, now)
            ));
        }

        // 3. Seed Default Users & Initial Presentation Data in Memory
        if (userRepository.count() == 0) {
            User user1 = createUser(1L, "anikatejareddy0003@gmail.com", "Anika Teja Reddy", "560001");
            User user2 = createUser(2L, "demo@viralpe.com", "Demo User", "500001");
            userRepository.saveAll(List.of(user1, user2));

            // Populate multi-date demo presentation ledgers & wallets
            demoService.loadDemoData(1L);
            demoService.loadDemoData(2L);
        }
    }

    private User createUser(Long id, String email, String name, String pincode) {
        User u = new User();
        u.setId(id);
        u.setEmail(email);
        u.setFullName(name);
        u.setRegisteredPincode(pincode);
        u.setProfileComplete(true);
        u.setAuthProvider("DEMO");
        u.setAuthProviderId("demo-" + id);
        return u;
    }

    private Pincode createPincode(String pincodeVal, String city, String district, String state, boolean active) {
        Pincode p = new Pincode();
        p.setPincode(pincodeVal);
        p.setCity(city);
        p.setDistrict(district);
        p.setState(state);
        p.setActive(active);
        return p;
    }

    private RoyaltyConfiguration createRoyaltyConfig(String category, double profitMargin, double rootDeduction, double cashbackPct, double vendorPct, double companyPct, OffsetDateTime now) {
        RoyaltyConfiguration r = new RoyaltyConfiguration();
        r.setCategory(category);
        r.setProfitMarginPercentage(profitMargin);
        r.setVerticalRoyaltyPercentage(rootDeduction);
        r.setCashbackPercentage(cashbackPct);
        r.setVendorRoyaltyPercentage(vendorPct);
        r.setReferralPercentage(companyPct);
        r.setEffectiveFrom(now);
        r.setUpdatedAt(now);
        return r;
    }
}
