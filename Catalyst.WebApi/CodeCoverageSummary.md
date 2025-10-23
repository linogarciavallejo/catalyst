# Code coverage summary

The `CodeCoverageAnalysis-2.xml` report highlights line coverage disparities across assemblies. The table below captures the high-level metrics that stand out when evaluating the latest run.

| Assembly | Line coverage | Block coverage | Lines (covered / partial / not) |
| --- | --- | --- | --- |
| Catalyst.Domain.dll | 76.16% | 81.31% | 409 / 2 / 126 |
| Catalyst.Application.dll | 78.06% | 80.51% | 121 / 0 / 34 |
| Catalyst.WebApi.Tests.dll | 57.91% | 60.26% | 586 / 11 / 415 |
| Catalyst.Infrastructure.dll | 30.93% | 30.70% | 352 / 11 / 775 |
| Catalyst.WebApi.dll | 25.54% | 31.17% | 321 / 36 / 900 |
| Catalyst.Application.Tests.dll | 96.20% | 97.61% | 532 / 21 / 0 |
| Catalyst.CompositionRoot.dll | 97.89% | 95.95% | 93 / 1 / 1 |
| Catalyst.Infrastructure.Tests.dll | 98.78% | 99.42% | 893 / 8 / 3 |

## Key observations

- Production assemblies exhibit uneven coverage. `Catalyst.Domain` and `Catalyst.Application` retain mid-to-high 70% line coverage, whereas `Catalyst.Infrastructure` and `Catalyst.WebApi` lag well behind at roughly 31% and 26%, respectively.
- The test assemblies (`Catalyst.Application.Tests` and `Catalyst.Infrastructure.Tests`) maintain near-total coverage, while `Catalyst.WebApi.Tests` sits around 58%—mirroring the gaps identified earlier in endpoint validation.
- Infrastructure and Web API layers should remain a priority for additional unit and integration coverage, particularly around repository queries, DTO mapping, and endpoint authorization branches.
