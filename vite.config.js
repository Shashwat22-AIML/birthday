export default {
  base: './',
  root: '.',
  build: {
    minify: 'esbuild',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          gsap: ['gsap'],
          lenis: ['lenis'],
          confetti: ['canvas-confetti']
        }
      }
    }
  },
  server: {
    port: 3000,
    watch: {
      ignored: [
        '**/AppData/**',
        '**/node_modules/**',
        '**/dist/**',
        '**/.git/**',
        '**/.claude/**',
        '**/.claude-omniroute/**',
        '**/.cursor/**',
        '**/.vscode/**',
        '**/.android/**',
        '**/.antigravity-ide/**',
        '**/.cache/**',
        '**/.config/**',
        '**/.copilot/**',
        '**/.dbus-keyrings/**',
        '**/.devvit/**',
        '**/.dotnet/**',
        '**/.gemini/**',
        '**/.idlerc/**',
        '**/.local/**',
        '**/.ms-ad/**',
        '**/.nuget/**',
        '**/.omniroute/**',
        '**/.openclaw/**',
        '**/.QtWebEngineProcess/**',
        '**/.skiko/**',
        '**/.TurboVPN/**',
        '**/.VirtualBox/**',
        '**/3D Objects/**',
        '**/3d-model-website/**',
        '**/AndroidStudioProjects/**',
        '**/bottle-poop/**',
        '**/Contacts/**',
        '**/CrossDevice/**',
        '**/DaVinci Resolve Media/**',
        '**/Documents/**',
        '**/Downloads/**',
        '**/Favorites/**',
        '**/job-tailor/**',
        '**/Links/**',
        '**/myapp/**',
        '**/OneDrive/**',
        '**/relationship-assistant/**',
        '**/Saved Games/**',
        '**/Searches/**',
        '**/vmlogs/**',
        '**/NTUSER.DAT*',
        '**/*.xml',
        '**/*.docx',
        '**/*.ini',
        '**/inst.ini',
        '**/nuuid.ini',
        '**/useruid.ini',
        '**/*.ps1',
        '**/Find-Duplicates.ps1'
      ],
      disableGlobbing: false
    }
  }
}