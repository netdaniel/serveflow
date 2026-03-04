# Building Windows Executable

## Prerequisites
- Node.js and npm installed
- Windows (for building the Windows executable)

## Development

To run the app during development:

```bash
# Start the Vite dev server
npm run dev

# In another terminal, start Electron with the dev server
npm run electron-dev
```

## Building for Windows

To build the Windows executable (.exe):

```bash
npm run build:electron
```

This will:
1. Build the React app to the `dist/` folder
2. Package it with Electron
3. Create a Windows installer (.msi) and portable executable (.exe) in the `out/` folder

The installers will be in:
- `out/Church Scheduler Setup X.X.X.exe` (Installer)
- `out/Church Scheduler X.X.X.exe` (Portable)

## Distribution

You can distribute either:
- The installer (.exe) - users run it to install the app
- The portable executable - no installation needed, just run the .exe
