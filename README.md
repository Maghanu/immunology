# Immunology Data Tools

This repository contains two interactive React tools for configuring 96-well immunology assays and generating reproducible analysis scripts in R. The tools support assay setup and data analysis workflows for T-cell activation and RNA delivery experiments.

## Projects

### B3Z T-cell Activation Plate Configurator

The configurator provides an interactive way to assign wells, define sample groups, and create pasted or serial-dilution concentration series across a 96-well plate.

The tool generates an R script that subtracts medium background, performs either ANOVA with Tukey comparisons or pairwise t-tests with BH correction, and exports dose-response plots, condition summaries, and an Excel workbook.

[Project documentation and setup](tcell-activation/README.md)

### RiboGreen Assay Plate Configurator

For RNA delivery experiments, free RNA and total RNA are quantified separately to estimate encapsulation. The configurator supports assigning PBS and Triton calibration standards, sample wells, and optional spike-in controls on a 96-well plate.

The generated R script fits the calibration models, back-calculates free and total mRNA, estimates encapsulated mRNA, and reports encapsulation efficiency and recovery. Results include calibration statistics, replicate summaries, plots, and an Excel workbook.

[Project documentation and setup](ribo-green-analysis/README.md)

## Capabilities

- Translating assay requirements into usable, interactive research tools
- React and JavaScript UI development, including plate painting and drag-to-assign workflows
- Generating reproducible R analysis code from experiment configuration
- Applying statistical comparisons, calibration models, and clear data exports
- Documenting input formats, assumptions, and responsible handling of assay data

For public demonstrations, use synthetic or anonymised inputs and do not commit patient or donor data.
