# ViralPe Backend Structure

This project is a Java Spring Boot backend skeleton for ViralPe, modeled from the provided architecture and PRD documents.

## Recommended structure

- `backend/`
  - `src/main/java/com/viralpe/`
    - `auth/`
      - `controller/`
      - `dto/`
      - `service/`
    - `user/`
      - `controller/`
      - `dto/`
      - `model/`
      - `service/`
    - `wallet/`
      - `controller/`
      - `dto/`
      - `model/`
      - `service/`
    - `transaction/`
      - `controller/`
      - `dto/`
      - `model/`
      - `service/`
    - `payment/`
      - `integration/`
      - `service/`
    - `royalty/`
      - `service/`
      - `model/`
    - `admin/`
<!-- developed by anika teja reddy -->
      - `controller/`
      - `service/`
      - `dto/`
    - `config/`
    - `exception/`
    - `job/`
    - `repository/`
    - `util/`
  - `src/main/resources/`
    - `application.yml`
    - `db/migration/`

## Mapping to epics

- Epic 1: `auth` + `user`
- Epic 2: `wallet`
- Epic 3: `transaction` + `payment`
- Epic 4: `payment.integration` + `transaction`
- Epic 5: `royalty`
- Epic 6: `royalty`
- Epic 7: `royalty`
- Epic 8: `royalty` + `job`
- Epic 9: `royalty` + `config`
- Epic 10: `admin` + `config`
- Epic 11: `transaction` + `wallet`

## Next step

Add package-level classes in each module:
- Controllers for API endpoints
- Services for business logic
- Repositories for persistence
- DTOs for request/response contracts
- Models/entities for database tables
- Scheduled jobs for Reversal Wallet sweep and Pincode Championship evaluation
