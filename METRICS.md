# METRICS.md

## North Star Metric
**Audits completed per week**

Why: An audit completed means a user got real value — 
they saw their overspend. Everything else (leads, 
consultations, sales) flows from this. DAU is wrong 
for a tool people use once a quarter. Email captures 
are a lagging indicator. Audits completed is the 
earliest signal that the product is working.

## 3 input metrics that drive the North Star

**1. Form completion rate**
(audits completed ÷ visitors who start the form)
Target: ≥ 60%
Why: If people start but don't finish, the form 
is too long or confusing.

**2. Shareable URL click-through rate**
(visits from shared audit URLs ÷ total audits)
Target: ≥ 15%
Why: This is the viral loop. If nobody shares 
their audit, growth is 100% dependent on paid 
or manual acquisition.

**3. Email capture rate**
(emails captured ÷ audits completed)
Target: ≥ 25%
Why: Leads are the business outcome. If people 
complete audits but don't give email, the result 
isn't compelling enough or the CTA is too early.

## What to instrument first
1. Audit form started (pageview on /)
2. Audit completed (POST to /api/audit succeeds)
3. Results page viewed (/audit/[id] load)
4. Email captured (POST to /api/leads succeeds)
5. Shareable URL opened (any /audit/[id] visit 
   where the audit is >1hr old)
6. Credex CTA clicked (click on consultation link)

## What number triggers a pivot

If after 500 audits:
- Email capture rate < 10% → the results page 
  isn't delivering enough value, redesign it
- Form completion rate < 30% → the form is too 
  complex, reduce to 3–4 tools max
- Zero Credex CTA clicks → the savings thresholds 
  are wrong or the CTA copy isn't working

The pivot decision happens at 500 audits, not 50. 
Small samples produce misleading signals.