

window.MYBENCH = {
  site: "https://mybench.spunwave.com",
  repo: "https://github.com/spunwave/mybench",
  tag: "v0.1.0-nightly.20261119",
  version: "0.1.0 nightly 19 Nov 2026",
  status: "Beta",
  files: {
    mac:      { file: "mybench-0.1.0-macOS-universal.dmg",                         label: "macOS",          kind: ".dmg",      note: "macOS 14+ · Apple Silicon & Intel" },
    win:      { file: "mybench-0.1.0-windows-x64.exe",                             label: "Windows",        kind: "Installer", note: "Windows 10 / 11 · x64" },
    winZip:   { file: "mybench-0.1.0-windows-x64.zip",                             label: "Windows",        kind: "Portable .zip", note: "No install" },
    flatpak:  { file: "mybench-0.1.0-nightly.20261119-linux-x86_64.flatpak",       label: "Linux",          kind: "Flatpak",   note: "Any distribution" },
    appimage: { file: "mybench-0.1.0-linux-x86_64.AppImage",                       label: "Linux",          kind: "AppImage",  note: "glibc 2.35+" },
    deb:      { file: "mybench_0.1.0_amd64.deb",                                   label: "Debian / Ubuntu", kind: ".deb",     note: "Ubuntu 25.10+, Debian 14 · Qt 6.9+" },
    rpm:      { file: "mybench-0.1.0-1.x86_64.rpm",                                label: "Fedora",         kind: ".rpm",      note: "Fedora 42+" }
  },

  primary: { mac: "mac", win: "win", linux: "flatpak" }
};
