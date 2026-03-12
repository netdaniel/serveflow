# CI/CD Pipeline

<cite>
**Referenced Files in This Document**
- [.github/workflows/deploy.yml](file://.github/workflows/deploy.yml)
- [.cpanel.yml](file://.cpanel.yml)
- [build-cpanel.sh](file://build-cpanel.sh)
- [CPANEL_DEPLOYMENT.md](file://CPANEL_DEPLOYMENT.md)
- [scripts/deploy.js](file://scripts/deploy.js)
- [DEPLOYMENT.md](file://DEPLOYMENT.md)
- [package.json](file://package.json)
- [vite.config.js](file://vite.config.js)
- [src-tauri/tauri.conf.json](file://src-tauri/tauri.conf.json)
- [.env.example](file://.env.example)
</cite>

## Update Summary
**Changes Made**
- Updated to reflect the new cPanel deployment system with automated GitHub Actions workflow
- Removed references to the previous GitHub Pages deployment and traditional release workflow
- Enhanced documentation for cPanel Git deployment with comprehensive build and deployment process
- Added detailed cPanel configuration, deployment scripts, and troubleshooting guides
- Updated architecture diagrams to show cPanel-based deployment instead of GitHub Pages
- Revised deployment strategies to focus on cPanel hosting and manual deployment options

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendices](#appendices)

## Introduction
This document provides comprehensive CI/CD pipeline documentation for RosterFlow, focusing on the new cPanel deployment system with automated GitHub Actions workflow. The repository now includes a streamlined deployment process that leverages cPanel's Git version control capabilities combined with automated build and deployment scripts. This eliminates the need for GitHub Pages hosting and provides a more robust deployment solution for web applications hosted on cPanel servers.

## Project Structure
RosterFlow's CI/CD system centers around cPanel Git deployment with automated build and deployment processes. The system includes both automated GitHub Actions deployment and manual deployment options through shell scripts and cPanel configuration files.

```mermaid
graph TB
subgraph "CI/CD Workflows"
DEPLOY[".github/workflows/deploy.yml"]
end
subgraph "cPanel Deployment"
CPANEL[".cpanel.yml"]
BUILDCP["build-cpanel.sh"]
end
subgraph "Application Build"
PKG["package.json"]
VCFG["vite.config.js"]
END
subgraph "Deployment Scripts"
DEPLOYJS["scripts/deploy.js"]
DEPLOYMD["DEPLOYMENT.md"]
CPANELMD["CPANEL_DEPLOYMENT.md"]
end
subgraph "Configuration"
ENV[".env.example"]
TCONFIG["src-tauri/tauri.conf.json"]
end
DEPLOY --> PKG
DEPLOY --> VCFG
DEPLOY --> ENV
CPANEL --> PKG
BUILDCP --> PKG
DEPLOYJS --> PKG
CPANELMD --> CPANEL
DEPLOYMD --> DEPLOY
```

**Diagram sources**
- [.github/workflows/deploy.yml:1-60](file://.github/workflows/deploy.yml#L1-L60)
- [.cpanel.yml:1-6](file://.cpanel.yml#L1-L6)
- [build-cpanel.sh:1-23](file://build-cpanel.sh#L1-L23)
- [CPANEL_DEPLOYMENT.md:1-306](file://CPANEL_DEPLOYMENT.md#L1-L306)
- [scripts/deploy.js:1-56](file://scripts/deploy.js#L1-L56)
- [DEPLOYMENT.md:1-125](file://DEPLOYMENT.md#L1-L125)
- [package.json:1-46](file://package.json#L1-L46)
- [vite.config.js:1-19](file://vite.config.js#L1-L19)
- [src-tauri/tauri.conf.json:1-35](file://src-tauri/tauri.conf.json#L1-L35)
- [.env.example:1-5](file://.env.example#L1-L5)

**Section sources**
- [.github/workflows/deploy.yml:1-60](file://.github/workflows/deploy.yml#L1-L60)
- [.cpanel.yml:1-6](file://.cpanel.yml#L1-L6)
- [build-cpanel.sh:1-23](file://build-cpanel.sh#L1-L23)
- [CPANEL_DEPLOYMENT.md:1-306](file://CPANEL_DEPLOYMENT.md#L1-L306)
- [scripts/deploy.js:1-56](file://scripts/deploy.js#L1-L56)
- [DEPLOYMENT.md:1-125](file://DEPLOYMENT.md#L1-L125)
- [package.json:1-46](file://package.json#L1-L46)
- [vite.config.js:1-19](file://vite.config.js#L1-L19)
- [src-tauri/tauri.conf.json:1-35](file://src-tauri/tauri.conf.json#L1-L35)
- [.env.example:1-5](file://.env.example#L1-L5)

## Core Components
The CI/CD system now focuses on cPanel deployment with two complementary approaches:

### Automated cPanel Deployment Workflow
- **Trigger**: Push to main branch
- **Environment**: Ubuntu runner with Node.js 20
- **Build Process**: npm ci, production build with Supabase environment variables
- **Deployment Method**: SCP-based deployment via appleboy/scp-action
- **Server Management**: Automatic web server restart (nginx or PM2)

### cPanel Git Deployment System
- **Trigger**: Git push to cPanel repository
- **Automation**: .cpanel.yml configuration for automatic file copying
- **Build Process**: Local build with build-cpanel.sh script
- **File Management**: Automatic copying from dist/ to public_html/
- **Domain Configuration**: Support for custom domains via CNAME file

### Manual Deployment Options
- **Script**: Node.js deployment script with environment variable loading
- **Shell Script**: build-cpanel.sh for local cPanel deployment
- **Fallback**: Manual deployment when automated workflow is unavailable

**Section sources**
- [.github/workflows/deploy.yml:3-60](file://.github/workflows/deploy.yml#L3-L60)
- [.cpanel.yml:1-6](file://.cpanel.yml#L1-L6)
- [build-cpanel.sh:1-23](file://build-cpanel.sh#L1-L23)
- [scripts/deploy.js:1-56](file://scripts/deploy.js#L1-L56)

## Architecture Overview
The CI/CD architecture now supports cPanel-based deployment with both automated and manual deployment options. The system provides flexibility for different deployment scenarios while maintaining consistency in build processes and environment management.

```mermaid
sequenceDiagram
participant Dev as "Developer"
participant GH as "GitHub"
participant DEPLOY as "Deploy Workflow"
participant BUILD as "Production Build"
participant CPANEL as "cPanel Server"
participant AUTOMATION as "cPanel Git Automation"
Dev->>GH : Push to main branch
GH->>DEPLOY : Trigger workflow
DEPLOY->>BUILD : npm ci + build production
BUILD->>CPANEL : SCP deployment
CPANEL->>AUTOMATION : .cpanel.yml executes
AUTOMATION->>CPANEL : Copy dist/* to public_html/
CPANEL-->>Dev : Live application update
Note over Dev,GH : Manual cPanel Deployment
Dev->>Dev : Run build-cpanel.sh
Dev->>CPANEL : Push to cPanel repository
CPANEL->>AUTOMATION : Automatic deployment
AUTOMATION->>CPANEL : Copy files to public_html
```

**Diagram sources**
- [.github/workflows/deploy.yml:3-60](file://.github/workflows/deploy.yml#L3-L60)
- [.cpanel.yml:1-6](file://.cpanel.yml#L1-L6)

## Detailed Component Analysis

### Automated cPanel Deployment Workflow: deploy.yml
**Updated** Enhanced with comprehensive cPanel deployment automation including SCP-based file transfer and server restart capabilities.

- **Trigger**: Push to main branch (continuous deployment)
- **Runner**: Ubuntu latest with Node.js 20
- **Build Steps**:
  - Checkout repository
  - Setup Node.js 20 with npm caching
  - Install dependencies with npm install
  - Build application with production environment variables
- **Deployment Steps**:
  - SCP connection to cPanel server
  - Transfer all build files from dist/ to /var/www/rosterflow
  - Execute SSH commands for web server restart
- **Environment Variables**: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
- **Secrets**: HOST, USERNAME, SSH_PRIVATE_KEY, PORT

**Section sources**
- [.github/workflows/deploy.yml:3-60](file://.github/workflows/deploy.yml#L3-L60)

### cPanel Git Deployment System: .cpanel.yml
**New** Comprehensive cPanel configuration for automated deployment.

- **Purpose**: Define deployment tasks for cPanel Git repositories
- **Configuration**: YAML format with deployment tasks section
- **Tasks**: Export deployment path and copy dist files to public_html
- **Automation**: Executes automatically when cPanel detects repository changes

**Section sources**
- [.cpanel.yml:1-6](file://.cpanel.yml#L1-L6)

### Build Script: build-cpanel.sh
**New** Automated build script for cPanel deployment.

- **Purpose**: Streamline the build and preparation process for cPanel deployment
- **Features**: Dependency installation, application build, CNAME file copying
- **Output**: Ready-to-deploy dist folder with CNAME file
- **Integration**: Designed for both automated and manual deployment workflows

**Section sources**
- [build-cpanel.sh:1-23](file://build-cpanel.sh#L1-L23)

### Manual Deployment Script: deploy.js
**Updated** Enhanced with improved error handling and deployment guidance.

- **Purpose**: Alternative to automated deployment workflow
- **Features**: Environment variable loading, build verification, deployment instructions
- **Error Handling**: Comprehensive error checking and user feedback
- **Integration**: Works with GitHub Actions secrets for seamless deployment

**Section sources**
- [scripts/deploy.js:1-56](file://scripts/deploy.js#L1-L56)

### cPanel Deployment Documentation: CPANEL_DEPLOYMENT.md
**New** Comprehensive guide for cPanel deployment setup and troubleshooting.

- **Prerequisites**: cPanel hosting with Git Version Control, Node.js installation
- **Setup Process**: Step-by-step guide for repository creation and configuration
- **Deployment Methods**: Automatic push deployment and manual pull deployment
- **Troubleshooting**: Common issues and resolution steps for cPanel deployment
- **Verification**: Post-deployment verification and testing procedures

**Section sources**
- [CPANEL_DEPLOYMENT.md:1-306](file://CPANEL_DEPLOYMENT.md#L1-L306)

### Deployment Documentation: DEPLOYMENT.md
**Updated** Enhanced with comprehensive secrets management and troubleshooting.

- **Prerequisites**: GitHub repository, server with SSH access, web server configuration
- **Secrets Configuration**: Detailed GitHub Actions secret setup guide
- **Server Requirements**: Directory structure, nginx configuration examples
- **Manual Deployment**: Step-by-step manual deployment process
- **Troubleshooting**: Common issues and resolution steps
- **Rollback Procedures**: Backup restoration and version recovery

**Section sources**
- [DEPLOYMENT.md:1-125](file://DEPLOYMENT.md#L1-L125)

### Frontend Build Configuration
**Updated** Enhanced with cPanel-specific optimizations.

- **Base Path**: Relative path configuration (`./`) for cPanel compatibility
- **Build Output**: dist directory with assets in subfolder structure
- **Environment Variables**: Supabase configuration embedded during build
- **Development vs Production**: Different handling for development and deployment environments

**Section sources**
- [vite.config.js:5-12](file://vite.config.js#L5-L12)
- [package.json:7-14](file://package.json#L7-L14)

### Environment Variables and Secrets Management
**Updated** Enhanced with comprehensive secrets management for both workflows.

- **Production Variables**: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
- **Server Access**: HOST, USERNAME, SSH_PRIVATE_KEY, PORT
- **GitHub Actions Integration**: Secure secret management through repository settings
- **Local Development**: .env.example template for development environment setup
- **Security Best Practices**: SSH key management and access control

**Section sources**
- [.github/workflows/deploy.yml:27-39](file://.github/workflows/deploy.yml#L27-L39)
- [.env.example:1-5](file://.env.example#L1-L5)
- [DEPLOYMENT.md:13-29](file://DEPLOYMENT.md#L13-L29)

### Multi-Platform Desktop Build Matrix
**Updated** Enhanced with improved dependency management for Tauri applications.

- **Supported Platforms**: macOS, Ubuntu 22.04, Windows
- **Ubuntu Dependencies**: GTK/WebKit packages for Tauri bundling
- **Rust Toolchain**: Stable version for cross-platform desktop application building
- **Conditional Dependencies**: Platform-specific package installation
- **Release Management**: GitHub Release creation with versioned artifacts

**Section sources**
- [src-tauri/tauri.conf.json:24-34](file://src-tauri/tauri.conf.json#L24-L34)

## Dependency Analysis
The CI/CD system now supports cPanel-based deployment with clear separation of concerns:

```mermaid
graph LR
MAIN["main branch"] --> DEPLOY["deploy.yml"]
LOCAL["Local Build"] --> BUILDCP["build-cpanel.sh"]
BUILDCP --> CPANEL[".cpanel.yml"]
CPANEL --> SERVER["cPanel Server"]
DEPLOY --> NODE["Node.js 20 Setup"]
DEPLOY --> DEPS["npm install + build"]
DEPS --> DIST["dist/"]
DIST --> SCP["SCP Deployment"]
SCP --> SERVER
SERVER --> AUTOMATION["cPanel Git Automation"]
AUTOMATION --> PUBLIC["public_html/"]
```

**Diagram sources**
- [.github/workflows/deploy.yml:3-60](file://.github/workflows/deploy.yml#L3-L60)
- [build-cpanel.sh:1-23](file://build-cpanel.sh#L1-L23)
- [.cpanel.yml:1-6](file://.cpanel.yml#L1-L6)

**Section sources**
- [.github/workflows/deploy.yml:3-60](file://.github/workflows/deploy.yml#L3-L60)
- [build-cpanel.sh:1-23](file://build-cpanel.sh#L1-L23)
- [.cpanel.yml:1-6](file://.cpanel.yml#L1-L6)

## Performance Considerations
**Updated** Enhanced performance considerations for cPanel deployment architecture.

- **Deployment Workflow**: Optimized for rapid web application updates with minimal downtime
- **Build Optimization**: npm ci for faster dependency installation compared to npm install
- **SCP Efficiency**: Direct file transfer via SCP for efficient deployment
- **cPanel Automation**: Automatic file copying through .cpanel.yml for seamless deployment
- **Server Restart**: Graceful restart mechanisms for nginx and PM2 processes
- **Asset Loading**: Optimized asset structure for cPanel compatibility

## Troubleshooting Guide
**Updated** Comprehensive troubleshooting guide for cPanel deployment workflows.

### Automated cPanel Deployment Issues
- **SCP Connection Failures**: Verify HOST, USERNAME, SSH_PRIVATE_KEY, and PORT secrets are configured correctly
- **Permission Denied**: Check SSH key permissions and server user access rights
- **File Transfer Errors**: Ensure server has sufficient disk space and write permissions
- **Build Process**: Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set
- **Server Restart**: Check nginx/PM2 service status and configuration files

### cPanel Git Deployment Problems
- **Repository Setup**: Verify cPanel repository is properly configured with correct branch
- **Deployment Automation**: Check .cpanel.yml syntax and deployment path configuration
- **File Permissions**: Ensure dist/ files have proper permissions for cPanel access
- **Git Status**: Verify repository is clean and ready for deployment
- **Remote Configuration**: Check SSH remote URL and authentication setup

### Build Process Problems
- **npm ci Failures**: Clear npm cache and verify package.json integrity
- **Environment Variables**: Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set
- **Build Errors**: Check for missing dependencies or incompatible Node.js versions
- **Asset Loading**: Verify dist directory contains all required build files

### Manual Deployment Problems
- **Script Execution**: Ensure Node.js is available and scripts/deploy.js is accessible
- **Environment Loading**: Verify .env file exists and contains required variables
- **Build Verification**: Check that dist directory is created after successful build
- **Deployment Instructions**: Follow manual deployment steps outlined in deployment guide

### cPanel-Specific Issues
- **Domain Configuration**: Verify DNS settings and domain pointing to cPanel server
- **File Structure**: Ensure proper directory structure with public_html and serveflow folders
- **Git Integration**: Check cPanel Git Version Control settings and repository configuration
- **Custom Domains**: Verify CNAME file is present in dist/ directory

**Section sources**
- [.github/workflows/deploy.yml:31-60](file://.github/workflows/deploy.yml#L31-L60)
- [CPANEL_DEPLOYMENT.md:169-296](file://CPANEL_DEPLOYMENT.md#L169-L296)
- [DEPLOYMENT.md:105-125](file://DEPLOYMENT.md#L105-L125)

## Conclusion
RosterFlow's CI/CD system now provides comprehensive automation for cPanel-based deployment with both automated GitHub Actions workflow and manual deployment options. The system eliminates the need for GitHub Pages hosting by leveraging cPanel's Git version control capabilities combined with automated build and deployment processes. This provides a more robust and flexible deployment solution for web applications hosted on cPanel servers, with comprehensive documentation and troubleshooting support.

## Appendices

### cPanel Deployment Configuration Checklist
**New** Enhanced checklist for cPanel deployment workflow setup.

- **Repository Setup**: cPanel repository with Git Version Control enabled
- **Build Configuration**: .cpanel.yml with proper deployment tasks
- **Build Script**: build-cpanel.sh for local deployment preparation
- **Environment Variables**: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
- **Server Requirements**: cPanel hosting with Git support, proper file permissions
- **Domain Configuration**: Custom domain setup with DNS pointing to cPanel server

**Section sources**
- [CPANEL_DEPLOYMENT.md:5-125](file://CPANEL_DEPLOYMENT.md#L5-L125)
- [.cpanel.yml:1-6](file://.cpanel.yml#L1-L6)
- [build-cpanel.sh:1-23](file://build-cpanel.sh#L1-L23)

### Guidelines for Modifications and Extensions
**Updated** Enhanced guidelines for CI/CD workflow modifications.

#### cPanel Deployment Enhancements
- **Additional Environments**: Add new branches or tags for different deployment environments
- **Custom Server Configurations**: Extend .cpanel.yml for custom server setups
- **Monitoring Integration**: Add health checks and monitoring notifications
- **Staging Environment**: Implement separate staging deployment workflow

#### Build Process Extensions
- **Additional Platforms**: Extend build-cpanel.sh for new deployment targets
- **Custom Packaging**: Modify build process for custom application bundling
- **Testing Integration**: Add automated testing before deployment
- **Quality Gates**: Implement approval workflows for deployment

#### Security Enhancements
- **Secret Rotation**: Implement automated secret rotation procedures
- **Access Control**: Add role-based access control for deployment permissions
- **Audit Logging**: Enable detailed logging for all deployment activities
- **Compliance**: Add compliance checks for production deployments

**Section sources**
- [.github/workflows/deploy.yml:3-60](file://.github/workflows/deploy.yml#L3-L60)
- [CPANEL_DEPLOYMENT.md:1-306](file://CPANEL_DEPLOYMENT.md#L1-L306)
- [DEPLOYMENT.md:1-125](file://DEPLOYMENT.md#L1-L125)