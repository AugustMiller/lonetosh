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
- `AppleALC`: Helps map audio interfaces, as well as digital audio output via HDMI/DisplayPort.
- `BrcmBluetoothInjector`: Along with `AirportBrcmFixup`, helps load firmware for wireless network adapters.
- `BrcmFirmwareData`: Raw firmware data, loaded by `BrcmBluetoothInjector`.
- `BrcmPatchRAM3`: Specific fixes for Broadcom firmware under macOS 10.15 Catalina.
- `IntelMausi`: Enables support for Intel Ethernet chipsets—although I haven't had a chance to verify this is functioning as expected!
- `Lilu`: Critical low-level Kext responsible for coordinating many other patches.
- `SMCProcessor`: CPU temperature support.
- `SMCSuperIO`: Concerned with fan speed monitoring.
- `USBMap`: A custom-built mapping of all “real” USB ports and their personalities.
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

> **Do not** attempt to use this EFI folder without understanding _why_ it works with this hardware—even if you are running an identical machine.

### Notes, Quirks, Minutae

1. I chose the hardware with the intention of running many concurrent [virtual machines](https://docker.com/), as a means to isolate development environments (i.e. running [many versions of the same software](https://getnitro.sh/)). The 32GB of memory is rarely consumed under regular loads, but given the opportunity, I wanted to reduce the risk of hitting swap while working.

2. NVMe storage is impressive. Although the first 660p failed after about a year (likely a combination of [heavy use](https://searchstorage.techtarget.com/definition/write-cycle) and the silicon lottery), I'm still super impressed with the speed. I didn't properly research the specific type of storage, and as it turns out, QLC NAND is not nearly as resilient as I thought, with a MTTF of as little as 1,000 write cycles! The replacement 660p began having issues in January 2021, so I've got a [Western Digital SN750](https://www.newegg.com/western-digital-black-sn750-nvme-1tb/p/N82E16820250110) on order.

3. The Gigabyte Z370n is special, because it has an onboard HDMI 2.0 port, which is a requirement for 4K@60Hz video output—or in this case, 3840x1600 on a Dell U3818W. DisplayPort may work just fine, but having proper use of all three ports was a priority.

4. WhateverGreen's framebuffer patching remains one of the great mysteries. In the spirit of letting macOS and the patcher do as much of the work as possible, I've opted for near-zero configuration—all this does is load the extension, and enable it.

5. At the moment, the `AppleALC` kext is configured with a `layout-id` of `7`, or `<07000000>.

## Building `config.plist`

In order to hide personal details (serial number, UUID), I opted to use a [Handlebars](https://handlebarsjs.com) template that is combined with information from an (ignored) `.env` file. See `.env.example` for the required info—then copy that file to `.env` and fill out your own info.

This should be enough to compile your `config.plist` into the `OC` directory:

```
$ yarn
$ yarn build
```

You'll see some output from Yarn, and the `index.mjs` build script. Please be aware that none of the other OpenCore configuration can be modified this way—so, best to fork the repo and experiment with requirements for your platform!

> Note: Only tested in Node v14 and v15.
