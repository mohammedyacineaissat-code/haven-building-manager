# Haven - Commercial SaaS Roadmap & Feature Specifications

This document preserves the commercial feature suggestions, market specifications, and operational enhancements designed for building managers (syndics), property management agencies, and real estate developers.

---

## 1. Operating Budget & Fixed Charges (Charges Fixes d'Exploitation)

### Context & Need
In residential complexes, expenses fall into two categories:
1. **Ad-hoc / Variable Shared Expenses**: Emergency repairs, water cistern trucks, broken locks.
2. **Fixed Monthly Overhead**: Staff salaries, utility bills, recurring service contracts.

Currently, building managers calculate cotisations to cover both. A professional tool must track fixed recurring overhead automatically.

### Key Capabilities
- **Recurring Monthly Payroll**:
  - Night / day security guards (agents de sécurité / gardiens).
  - Cleaning staff (femme de ménage / agents d'entretien).
  - Concierge stipend.
- **Maintenance Contracts**:
  - Elevator maintenance contract (contrat ascenseur - Otis, Schindler, etc.).
  - Water booster pump maintenance (surpresseur d'eau).
  - Generator servicing.
- **Communal Utilities**:
  - Sonelgaz electricity (hallways, elevators, underground parking).
  - Communal water bill.
- **Automation**:
  - Automatically debited to the monthly operating ledger on the 1st of each month.
  - Calculation of Net Operating Treasury:
    $$\text{Net Balance} = \text{Cotisations Collected} - (\text{Fixed Operating Charges} + \text{Shared Ad-Hoc Invoices})$$
- **Reserve Fund (Fonds de Réserve / Gros Travaux)**:
  - Separate savings pocket for major future investments (facade repainting, roof waterproofing, elevator replacement).

---

## 2. Digital Payment Receipts & Verification (Reçus de Paiement)

### Context & Need
Debt recovery and financial trust are the #1 challenge for residential syndics. Residents need immediate proof of payment, and managers need an audit trail.

### Key Capabilities
- **Downloadable / Printable Official Receipt**:
  - When an apartment is marked as paid, generate a formal PDF receipt:
    - Building name & address.
    - Apartment number & Resident name.
    - Amount paid in DZD.
    - Payment date & unique receipt reference number (e.g. `REC-2026-09-0014`).
    - Stamped digital seal and verification QR code.
- **Instant WhatsApp Sharing**:
  - One-click share of receipt or payment reminder via WhatsApp.
- **Resident Payment Slip Upload (BaridiMob / CCP / Virement)**:
  - Residents transfer funds and upload a photo of the receipt/slip in their app.
  - Manager receives an alert: *"Apt 12 submitted payment proof of 6,000 DA"*.
  - Manager clicks **[Approve & Issue Receipt]** or **[Reject with Note]**.
- **Automated Friendly Reminders (Relances d'Impayés)**:
  - Automated WhatsApp/SMS notification template for overdue apartments before due dates.

---

## 3. General Assembly & Financial Reporting (Assemblée Générale & PV)

### Context & Need
Every year (or quarter), the syndic must present a financial balance sheet (Bilan de gestion) to the co-owners during the General Assembly (AG).

### Key Capabilities
- **One-Click AGM Financial Statement (Bilan Annuel du Syndic)**:
  - Export to PDF & Excel:
    - Total cotisations billed vs collected.
    - Itemized breakdown of all expenditures (fixed salaries, maintenance, emergency repairs).
    - List of debts per apartment.
    - Final bank / cash balance.
- **Co-owner Online Voting / Polls (Sondages & Prises de Décision)**:
  - Resolution voting prior to or during assemblies:
    - Example: *"Approve installation of 8 surveillance cameras in underground parking (Budget: 120,000 DA)"* $\rightarrow$ [Pour / Contre / Abstention].
  - Real-time quorum and majority percentage calculations.

---

## 4. Preventive Maintenance & Contractor Quotations (Entretien & Devis)

### Key Capabilities
- **Preventive Maintenance Calendar (Calendrier d'Entretien)**:
  - Scheduled reminders for essential building health checks:
    - Water tank disinfection & cleaning (every 6 months).
    - Fire extinguisher pressure certification (annual).
    - Generator test cycle (monthly).
- **Contractor Quotation Comparison (Comparateur de Devis)**:
  - Log 2–3 contractor bids before launching major repairs.
  - Transparent records for co-owners to avoid suspicion of overcharging.

---

## 5. Digital Document Vault (Coffre-fort de la Copropriété)

### Key Capabilities
- Secure cloud storage for common building records:
  - Building bylaws (Règlement de copropriété).
  - Technical schematics (plumbing, electrical risers).
  - Elevator compliance certificates.
  - Insurance policies.
- Accessible in read-only mode by residents to ensure full transparency.

---

## 6. Commercial SaaS Model & Multi-Tenancy

### Market Segments
1. **Syndics Bénévoles (Volunteer Co-owners)**: Managing 1 to 2 buildings. Need simplicity, receipt generation, and clear finances.
2. **Cabinets de Gestion Immobilière (Professional Property Managers)**: Managing 5 to 50 buildings. Need multi-property dashboards, accountant access, and bulk operations.
3. **Promoteurs Immobiliers (Real Estate Developers)**: Handing over newly delivered residences with a modern digital management platform as a sales argument.

### Monetization Options
- **Per-Apartment Pricing**: e.g., 50 DZD / apartment / month.
- **Per-Building Pricing**: e.g., 2,500 – 5,000 DZD / building / month.
- **Freemium**: 1 building free forever (up to 20 units) to drive viral adoption among Algerian & North African syndics.
