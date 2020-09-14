# Lone L5 Hackintosh

In October 2019, I realized that using a [notebook](https://everymac.com/systems/apple/macbook_pro/specs/macbook-pro-core-i7-2.5-15-dual-graphics-mid-2015-retina-display-specs.html) as my primary [work-from-home](https://oof.studio) computer was not ideal—I wanted an upgradable, desktop-class processor, near-silent operation (as opposed to the constant whirring of laptop fans), expandable storage… and most of all, an opportunity to _build the tool that I use to make a living_.

That said: while Hackintoshing can offer some significant performance benefits over genuine Apple hardware, _it's no replacement for its reliability_. As long as my work situation demands access to a functional computer, I'll maintain a secondary Apple notebook or desktop—I simply don't have confidence in the long-term stability of a Hackintosh, despite the promise of OpenCore. Furthermore, the lack of easily-accessible hardware support and the uncertainty of many vendors' RMA processes is a hard pill to swallow—I can't risk being offline for a week or more to debug and replace a single component in my work machine!

This repo is a means to track the process of installing macOS onto an Intel-based [Hackintosh](https://en.wikipedia.org/wiki/Hackintosh).

> 🚨 Installing macOS on unsupported hardware is technically a violation of the Apple terms of service. Hackintoshing is legally dubious, and entirely unsupported (both by Apple, and the OpenCore team). Use at your own risk.

## Software

This repo is based on the open-source bootloader, [OpenCore](https://github.com/acidanthera/OpenCorePkg). Essentially, OpenCore does two things:

1. Acts as a middleware, exposing hardware in a manner that macOS understands
2. Injects kernel extensions ("kexts") that apply patches or configuration so that a broader range of hardware is supported in the OS

OpenCore lives on a special `EFI` partition, and loads natively on most any UEFI-conforming hardware.

> 💡 See the official [OpenCore installation guide](https://dortania.github.io/OpenCore-Install-Guide/) for more information.

### Kexts

- `AirportBrcmFixup`: Patch supported (but not first-party) WiFi and Bluetooth adapters.
- `AppleALC`: 
- `BrcmBluetoothInjector`: Along with `AirportBrcmFixup`, helps load firmware for wireless network adapters.
- `BrcmFirmwareData`: Raw firmware data, loaded by `BrcmBluetoothInjector`.
- `BrcmPatchRAM3`: Specific fixes for macOS 10.15 Catalina
- `Lilu`: Critical low-level Kext responsible for coordinating many other patches.
- `SMCProcessor`: CPU temperature support.
- `SMCSuperIO`: Concerned with fan speed monitoring.
- `VirtualSMC`: Emulates or smooths out interfaces with core hardware sensors, including those that make the hardware appear as though it is a genuine Apple computer—combined with carefully-selected SMBIOS settings, this alone gets you most of the way to a functioning Hackintosh.
- `WhateverGreen`: Primarily concerned with graphics fixes.

## Hardware

Everything herein is configured to work with a specific set of components:

- [Intel i5 8500T](https://ark.intel.com/content/www/us/en/ark/products/129941/intel-core-i5-8500t-processor-9m-cache-up-to-3-50-ghz.html) 6-core CPU with embedded UHD 630 graphics. This ship is power-limited to 35W, meaning it can be run cooler + quieter than its non-T counterpart.
- [Gigabyte Z370n-WIFI](https://www.gigabyte.com/Motherboard/Z370N-WIFI-rev-10/support#support-dl-driver) mainboard
- 2 &times; 16GB DIMMs of [Corsair Vengeance LPX](https://www.corsair.com/us/en/Categories/Products/Memory/VENGEANCE-LPX/p/CMK32GX4M2D3600C18) RAM
- 1TB [Intel 660p](https://www.intel.com/content/www/us/en/products/memory-storage/solid-state-drives/consumer-ssds/6-series/ssd-660p-series/660p-series-1-tb-m-2-80mm-3d2.html) NVMe M.2 SSD
- [HDPlex 200W DC-ATX](https://hdplex.com/hdplex-200w-dc-atx-power-supply-16v-24v-wide-range-voltage-input.html) direct-plug PSU
- Dell DW1560 wireless adapter (Broadcom BCM94352Z chipset), replacing the Intel adapter that comes with the Z370N.
- 19V Dell AC-DC power brick
- ARCTIC [Alpine 12](https://www.arctic.ac/en/Alpine-12-Passive/ACALP00024A) passive CPU heatsink
- 2 &times; 80mm Noctua NF-R8 Redux PWM-controllable fans
- [Lone L5](https://loneindustries.com/products/5) case

> Do not attempt to use this EFI folder without understanding _why_ it works with this hardware—even if you are running an identical machine.

### Notes

I chose the hardware with the intention of running many concurrent virtual machines, as a means to isolate development environments (i.e. running many versions of the same software). The 32GB of memory is rarely consumed under regular loads, but given the opportunity, I wanted to reduce the risk of hitting swap while working.

NVMe storage is impressive. Although the first 660p failed after about a year (likely a combination of heavy use and the silicon lottery), I'm still super impressed with the speed.

The Gigabyte Z370n is special, because it has an onboard HDMI 2.0 port, which is a requirement for 4K@60Hz video output—or in this case, 3840x1600 on a Dell U3818W.

## Building `config.plist`

In order to hide personal details (serial number, UUID), I opted to use a [Handlebars](https://handlebarsjs.com) template that is combined with information from a `.env` file. See `.env.example` for the required info.

This should be enough to compile your `config.plist` into the `OC` directory:

```
$ yarn
$ yarn build
```

You'll see some output from Yarn, and the `index.mjs` build script.

> Note: Only tested in Node 14.