// MECO3D Unit 6: Interfacing — Scanner, Monitor & Motherboard. Four-quarter
// circles, one concept per circle. Source: Workshop Practice lab manual —
// Experiment 12 (type and interfacing of scanner, monitor and CPU
// motherboard). Grounded strictly in the manual.
import type { Section } from "./types";

export const sectionU6: Section = {
  id: "mec-sec-u6",
  letter: "F",
  title: "Interfacing: Scanner, Monitor & Motherboard",
  tagline: "How components talk to a computer — the ports, the displays, and the board that ties it all together.",
  unit: 6,
  topics: [
    // ── The scanner ──────────────────────────────────────────────────
    {
      id: "mec-scanner",
      title: "The scanner",
      unit: 6,
      weight: "medium",
      deps: [],
      whyItMatters:
        "Experiment 12's first device — an input that turns a physical image into digital data, in several types for different jobs.",
      recap: [
        "A scanner is a hardware input device that optically 'reads' an image and converts it into a digital signal — e.g. a printed picture into a digital file.",
        "It connects by many interfaces but today most commonly by USB (also Firewire, Parallel, SCSI).",
        "Flatbed scanners are the most common (home and office); sheet-fed feed the sheet past a fixed beam (no good for books); integrated scanners are built in (ATMs, cheque processing).",
        "Drum scanners are high-resolution but costly (a few makers only); portable scanners are battery-powered to capture text on the go, transferring to a computer later.",
      ],
      steps: [],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "A **scanner** is a hardware **input** device that **optically reads an image and converts it into a digital signal** — for example, turning a printed picture, drawing or document into a digital file you can edit.",
            },
            {
              kind: "teach",
              body: "It can connect over many interfaces, but **today most commonly USB** (others: Firewire, Parallel, SCSI).",
            },
            {
              kind: "teach",
              body: "The types, by how they scan:\n\n• **Flatbed** — the most common, for home and office; a mechanism moves under the document.\n• **Sheet-fed** — the sheet is fed past a fixed beam; works only for **single sheets**, not books.\n• **Integrated** — built into machines like **ATMs** for cheque processing.",
            },
            {
              kind: "teach",
              body: "• **Drum** — very **high resolution** but **high cost**, made by only a few companies; a big upgrade on a flatbed.\n• **Portable** — **battery-powered** to capture text on the go, storing it and **transferring to a computer later** by cable or wireless.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "A scanner's basic job is to…",
              options: [
                "print a hard copy of a file",
                "optically read an image and convert it into a digital signal",
                "display video output",
                "store the operating system",
              ],
              answer: 1,
              praise: "Read an image, output a digital signal — an input device.",
            },
            {
              kind: "check",
              prompt: "Which scanner type is the most common for home and office use?",
              options: ["Drum", "Flatbed", "Portable", "Integrated"],
              answer: 1,
              praise: "Flatbed — the everyday scanner.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "check",
              prompt: "You-try-one: which scanner is built into ATMs for cheque processing?",
              options: ["Sheet-fed", "Drum", "Integrated", "Portable"],
              answer: 2,
              praise: "Integrated — built into the machine itself.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: 'A sheet-fed scanner is ideal for scanning thick books.' What's wrong?",
              options: [
                "Nothing, it's great for books",
                "Sheet-fed scanners only handle single sheets fed past the beam — not useful for books",
                "Sheet-fed scanners are the most expensive",
                "Sheet-fed scanners are built into ATMs",
              ],
              answer: 1,
              praise: "Right — single sheets only; a flatbed handles a book, a sheet-fed cannot.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              body: "The types line up by **quality vs convenience**: **drum** at the top for resolution (and price), **flatbed** the everyday all-rounder, **sheet-fed** and **integrated** built for feeding single sheets fast, and **portable** trading quality for the freedom to scan anywhere.\n\nWhichever type, the connection is a communication interface — which is exactly the next circle.",
            },
            {
              kind: "check",
              prompt: "Today a scanner is most commonly connected to a computer by…",
              options: ["SCSI", "USB", "Parallel", "a drum"],
              answer: 1,
              praise: "USB — the common modern scanner interface.",
            },
          ],
        },
      ],
    },

    // ── Communication types ──────────────────────────────────────────
    {
      id: "mec-scanner-comm",
      title: "Communication types",
      unit: 6,
      weight: "light",
      deps: ["mec-scanner"],
      whyItMatters:
        "The manual's eight ways a device talks to a computer — the vocabulary of interfacing that recurs across scanner, printer and motherboard.",
      recap: [
        "Serial sends one bit at a time, one after another; parallel sends eight bits at a time over separate wires (a DB25 on the PC, a 36-pin on the device) — faster than serial.",
        "USB transfers quickly (up to 12 Mbps in the manual) and automatically recognises new devices.",
        "Network (Ethernet) uses a NIC and ROM-based software; Infrared and Wireless (Bluetooth, 802.11) send data through the air.",
        "SCSI allows daisy-chaining many devices on one connection; IEEE 1394 Firewire is a high-speed link (up to 800 Mbps, capable of 3.2 Gbps) for high-bandwidth work like digital video.",
      ],
      steps: [],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "An interface is **how a device talks to the computer**. The manual names **eight communication types** — learn them by *how many bits move and how fast*.",
            },
            {
              kind: "teach",
              body: "**Serial** sends **one bit at a time**, one after another. **Parallel** sends **eight bits at a time** over separate wires — so it's **faster than serial** (a DB25 connector on the PC, an odd 36-pin on the device).",
            },
            {
              kind: "teach",
              body: "**USB** transfers quickly (the manual cites up to **12 Mbps**) and **automatically recognises new devices**. **Network (Ethernet)** uses a **NIC and ROM-based software** to talk to servers and workstations.",
            },
            {
              kind: "teach",
              body: "**Infrared** and **Wireless** (Bluetooth, 802.11) send data **through the air**. **SCSI** lets you **daisy-chain** several devices on one connection. **IEEE 1394 Firewire** is a **high-speed** link — up to 800 Mbps, capable of 3.2 Gbps — for high-bandwidth work like **digital video**.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "How does SERIAL communication send data?",
              options: [
                "Eight bits at a time over separate wires",
                "One bit at a time, one after another",
                "Wirelessly only",
                "In whole bytes through the air",
              ],
              answer: 1,
              praise: "One bit at a time — parallel is the eight-at-once one.",
            },
            {
              kind: "check",
              prompt: "Which interface automatically recognises new devices?",
              options: ["Serial", "Parallel", "USB", "SCSI"],
              answer: 2,
              praise: "USB — auto-recognises devices and transfers quickly.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "check",
              prompt: "You-try-one: which interface is a high-speed link (up to 800 Mbps) suited to digital video?",
              options: ["Serial", "IEEE 1394 Firewire", "Infrared", "Parallel"],
              answer: 1,
              praise: "Firewire — high bandwidth for video and similar work.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: 'Parallel is slower than serial because it uses more wires.' What's wrong?",
              options: [
                "Nothing, more wires is slower",
                "Parallel is FASTER than serial — it moves eight bits at once over eight wires",
                "Parallel sends one bit at a time",
                "Serial uses eight wires",
              ],
              answer: 1,
              praise: "Right — eight bits at once makes parallel faster than one-bit serial.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              body: "Rank them by the two questions that matter — **how many bits at once, and wired or wireless**: serial (1 bit) is slowest; parallel (8 bits) faster; USB and Firewire fast and modern; SCSI daisy-chains; Ethernet networks; infrared and wireless cut the cable entirely.\n\nThis same vocabulary returns for the monitor's ports and the motherboard's connectors — interfacing is one language spoken by every device.",
            },
            {
              kind: "check",
              prompt: "SCSI's distinctive feature among these interfaces is that it…",
              options: [
                "sends data wirelessly",
                "lets several devices be daisy-chained on one connection",
                "sends one bit at a time",
                "needs no connector",
              ],
              answer: 1,
              praise: "Daisy-chaining — many devices, one SCSI connection.",
            },
          ],
        },
      ],
    },

    // ── The monitor ──────────────────────────────────────────────────
    {
      id: "mec-monitor",
      title: "The monitor — CRT vs LCD",
      unit: 6,
      weight: "medium",
      deps: [],
      whyItMatters:
        "The display side of interfacing — two technologies with opposite trade-offs, and the ports that carry the picture (and sometimes the sound).",
      recap: [
        "A monitor displays video and graphical information; it's an output device, also called the video display unit (VDU).",
        "CRT (Cathode Ray Tube) uses a vacuum tube and electron guns that bombard a screen to make it glow; CRTs are bulky and consume a lot of energy.",
        "LCD (Liquid Crystal Display) uses pixels between transparent electrodes and polarizing filters; LCDs use less energy, give better graphics, and dominate today (17–60 inch).",
        "Ports: VGA carries analog signals; DVI, HDMI and DisplayPort are digital. DVI carries no audio; HDMI and DisplayPort can also carry audio.",
      ],
      steps: [],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "A **monitor** displays the video and graphics from the computer's graphics adapter. It's an **output device**, sometimes called the **video display unit (VDU).** The manual gives **two main types**.",
            },
            {
              kind: "teach",
              body: "**CRT — Cathode Ray Tube.** It uses a **vacuum tube** with **electron guns**; electrons bombard the glass screen, **making it glow to form the image.** CRTs resemble old TV sets — **bulky and energy-hungry.**",
            },
            {
              kind: "teach",
              body: "**LCD — Liquid Crystal Display.** It uses **pixels arranged between transparent electrodes and polarizing filters**; images form when the pixels are **polarized.** LCDs **use less energy, give better graphics**, and are what almost all monitors are today (**17 to 60 inch**).",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "A CRT monitor forms its image by…",
              options: [
                "polarizing liquid-crystal pixels",
                "electron guns bombarding a screen so it glows",
                "shining an LED through filters",
                "printing toner onto glass",
              ],
              answer: 1,
              praise: "Electron guns hit the screen and it glows — the cathode-ray-tube method.",
            },
            {
              kind: "check",
              prompt: "Compared with CRT, an LCD monitor is…",
              options: [
                "bulkier and uses more energy",
                "slimmer, uses less energy and gives better graphics",
                "unable to show colour",
                "only made up to 17 inches",
              ],
              answer: 1,
              praise: "Less energy, better graphics — why LCD replaced CRT.",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              body: "Now the **ports** that feed a monitor. **VGA** carries an **analog** signal. **DVI, HDMI and DisplayPort** are all **digital.** A key difference: **DVI does not carry audio**, while **HDMI** (and DisplayPort) **can carry audio** as well as video.",
            },
            {
              kind: "check",
              prompt: "You-try-one: which monitor port carries an ANALOG signal?",
              options: ["VGA", "DVI", "HDMI", "DisplayPort"],
              answer: 0,
              praise: "VGA is the analog one; the rest are digital.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: 'DVI carries both video and audio, just like HDMI.' What's wrong?",
              options: [
                "Nothing, DVI carries audio",
                "DVI does NOT generally carry audio; HDMI and DisplayPort do",
                "HDMI carries no audio",
                "VGA carries audio",
              ],
              answer: 1,
              praise: "Right — DVI is video-only; HDMI/DisplayPort add audio.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              body: "Two comparisons to bank. **Display tech:** CRT (bulky, power-hungry, glowing phosphor) gave way to LCD (slim, efficient, polarized pixels). **Ports:** the old **analog VGA** gave way to **digital DVI/HDMI/DisplayPort**, with HDMI and DisplayPort adding audio down one cable.\n\nBoth show the same trend as the whole unit: analog and bulky → digital and integrated.",
            },
            {
              kind: "check",
              prompt: "Which pair correctly matches the shift in monitors?",
              options: [
                "CRT→LCD and analog VGA→digital HDMI/DVI/DisplayPort",
                "LCD→CRT and digital→analog",
                "VGA→CRT and HDMI→VGA",
                "LCD→CRT and audio removed from HDMI",
              ],
              answer: 0,
              praise: "CRT→LCD and analog→digital — the twin move to modern displays.",
            },
          ],
        },
      ],
    },

    // ── The motherboard ──────────────────────────────────────────────
    {
      id: "mec-motherboard",
      title: "The motherboard",
      unit: 6,
      weight: "heavy",
      deps: [],
      whyItMatters:
        "The board everything else plugs into. Its layout — CPU socket, memory, and the Northbridge/Southbridge chipset — is the map of how a PC's parts connect.",
      recap: [
        "A motherboard holds the CPU, memory and connectors together; its base is a firm non-conductive sheet printed with copper/aluminium traces that form the circuits.",
        "Key parts: a CPU socket (with heat sink and fan mounts), a power connector, DRAM memory slots, IDE/SATA drive connectors, a ROM/BIOS chip, and slots for graphics (AGP/PCIe) and add-on cards (PCI).",
        "The Northbridge chip interfaces the CPU with main memory and other components; the Southbridge handles I/O and connects to the Northbridge, not directly to the CPU.",
        "Northbridge + Southbridge together are called the chipset. BIOS (Basic Input Output System) holds startup firmware; the CMOS battery (3.0 V lithium) keeps BIOS settings.",
      ],
      steps: [],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "The **motherboard** is 'one of the most essential parts of a computer' — it **holds together** the **CPU, memory and the connectors** for input/output devices.",
            },
            {
              kind: "teach",
              body: "Its **base** is a **firm sheet of non-conductive material** (rigid plastic). Thin layers of **copper or aluminium foil**, called **traces**, are printed onto it to form the **circuits** between components. It also carries **sockets and slots** to plug in the other parts.",
            },
            {
              kind: "teach",
              body: "The key parts to know: a **CPU socket** (with heat sink and fan mounts, since fast CPUs run hot), a **power connector**, **DRAM memory slots**, drive connectors (**IDE/SATA**), a **ROM chip holding the BIOS/firmware**, and slots for a **graphics card (AGP/PCIe)** and **add-on cards (PCI).**",
            },
            {
              kind: "teach",
              body: "Two chips run the traffic. The **Northbridge** forms the interface between the **CPU, main memory and other components** (and has a large heat sink). The **Southbridge** handles **input/output (I/O)** and connects **not directly to the CPU but to the Northbridge.** Together they're called the **chipset.**",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "The motherboard's traces (thin copper/aluminium layers) serve as the…",
              options: [
                "heat sinks",
                "circuits connecting the various components",
                "power supply",
                "CPU cores",
              ],
              answer: 1,
              praise: "Traces are the printed circuits wiring the board's parts together.",
            },
            {
              kind: "check",
              prompt: "Which chip interfaces the CPU with main memory?",
              options: ["Southbridge", "Northbridge", "BIOS", "CMOS battery"],
              answer: 1,
              praise: "The Northbridge — CPU-to-memory (and it runs hot, hence its heat sink).",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "teach",
              body: "Two more named parts. **BIOS** — **Basic Input Output System** — is an integrated chip holding the **startup firmware and settings**, which you can modify by entering BIOS mode. The **CMOS battery** — a **3.0 V lithium** cell — **stores the BIOS information** (CMOS = Complementary Metal Oxide Semi-Conductor).",
            },
            {
              kind: "check",
              prompt: "You-try-one: the Southbridge connects to the CPU how?",
              options: [
                "Directly to the CPU",
                "Not directly — it connects to the Northbridge, which faces the CPU",
                "Through the CMOS battery",
                "Through the power connector",
              ],
              answer: 1,
              praise: "Via the Northbridge — the Southbridge handles I/O one hop away from the CPU.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: 'The CMOS battery powers the whole computer.' What's its real job?",
              options: [
                "Nothing, it powers everything",
                "The 3.0 V lithium CMOS cell just STORES the BIOS settings/information — it doesn't power the PC",
                "It cools the Northbridge",
                "It replaces the power connector",
              ],
              answer: 1,
              praise: "Right — it only keeps the BIOS settings; the PSU powers the machine.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              body: "See the motherboard as a **map of connections**: the CPU sits in its socket; the **Northbridge** links it to fast things (memory, graphics); the **Southbridge** links to slower I/O; and **chipset = North + South** together. BIOS boots it; the CMOS battery remembers the settings.\n\nEverything else in this course — keyboard, mouse, printer, scanner, monitor — ultimately plugs into ports wired to this board. It's where interfacing comes home.",
            },
            {
              kind: "check",
              prompt: "The 'chipset' on a motherboard refers to…",
              options: [
                "the CPU and its heat sink",
                "the Northbridge and Southbridge together",
                "the BIOS and CMOS battery",
                "the RAM and ROM",
              ],
              answer: 1,
              praise: "Northbridge + Southbridge = the chipset.",
            },
          ],
        },
      ],
    },

    // ── Slots & sockets ──────────────────────────────────────────────
    {
      id: "mec-mb-slots",
      title: "Expansion, memory & CPU slots",
      unit: 6,
      weight: "medium",
      deps: ["mec-motherboard"],
      whyItMatters:
        "The slots that let a motherboard grow — expansion cards, memory modules and the CPU socket. Their names and buses are classic exam identification questions.",
      recap: [
        "Expansion slots: ISA (oldest, 16-bit, black), PCI (64-bit, widely used for add-on cards), PCI Express/PCIe (latest and fastest, full-duplex serial bus), AGP (32-bit, dedicated to a graphics card).",
        "Memory (RAM) slots: SIMM (Single In-line Memory Module, 32-bit bus, up to 486 boards); DIMM (Double In-line Memory Module, faster 64-bit bus; the laptop version is SO-DIMM).",
        "Motherboard families: AT boards (early, two 6-pin power connectors, 286/386/486) and ATX boards (from the 90s, a single power connector, for P2/P3/P4).",
        "CPU sockets identify by pin count and the processors they take, e.g. Socket 775 (P4/Core 2 Duo/Xeon) and Socket 1156 (Intel i3/i5/i7).",
      ],
      steps: [],
      lessons: [
        {
          id: "q1",
          title: "1 · Meet it, slowly",
          steps: [
            {
              kind: "teach",
              body: "A motherboard grows through **slots**. First, **expansion slots** for add-on cards:\n\n• **ISA** — the **oldest**, a **16-bit** bus, identified by its **black** colour.\n• **PCI** — a **64-bit** high-speed bus, widely used for add-on cards.\n• **PCI Express (PCIe)** — the **latest and fastest**, a full-duplex serial bus.\n• **AGP** — a **32-bit** bus made specifically for a **graphics card.**",
            },
            {
              kind: "teach",
              body: "**Memory (RAM) slots:**\n\n• **SIMM** — Single In-line Memory Module, a **32-bit** bus, found up to **486** boards.\n• **DIMM** — Double In-line Memory Module, a faster **64-bit** bus; the laptop version is the **SO-DIMM.**",
            },
            {
              kind: "teach",
              body: "And the whole board comes in families: **AT** boards (early, **two 6-pin** power connectors, for 286/386/486) and **ATX** boards (from the **90s**, a **single** power connector, for P2/P3/P4). The **CPU socket** identifies by pin count and the processors it accepts.",
            },
          ],
        },
        {
          id: "q2",
          title: "2 · Question it",
          steps: [
            {
              kind: "check",
              prompt: "Which expansion slot is the latest and fastest, using a full-duplex serial bus?",
              options: ["ISA", "PCI", "PCI Express (PCIe)", "AGP"],
              answer: 2,
              praise: "PCIe — the newest, fastest expansion bus.",
            },
            {
              kind: "check",
              prompt: "The AGP slot is specifically for installing a…",
              options: ["sound card", "graphics card", "network card", "memory module"],
              answer: 1,
              praise: "AGP — the dedicated graphics-card slot (32-bit).",
            },
          ],
        },
        {
          id: "q3",
          title: "3 · Again, differently",
          steps: [
            {
              kind: "check",
              prompt: "You-try-one: which RAM module uses the faster 64-bit bus?",
              options: ["SIMM", "DIMM", "ISA", "AGP"],
              answer: 1,
              praise: "DIMM — 64-bit; SIMM is the older 32-bit module.",
            },
            {
              kind: "check",
              prompt: "Spot the mistake: 'The ATX motherboard uses two 6-pin power connectors, like the older boards.' What's wrong?",
              options: [
                "Nothing, ATX uses two connectors",
                "It's the AT board that has two 6-pin connectors; ATX uses a single power connector",
                "ATX boards have no power connector",
                "ATX is older than AT",
              ],
              answer: 1,
              praise: "Right — two 6-pin is the AT board; ATX consolidated to a single connector.",
            },
          ],
        },
        {
          id: "q4",
          title: "4 · Stretch & compare",
          steps: [
            {
              kind: "teach",
              body: "Every slot tells the same story the whole unit has been telling: **newer means faster and more integrated.** ISA (16-bit) → PCI (64-bit) → PCIe (serial, fastest). SIMM (32-bit) → DIMM (64-bit). AT (two connectors) → ATX (one). Sockets climb by pins to hold ever-newer CPUs.\n\nThat's interfacing in a sentence: as devices got faster, the ways they plug into the motherboard evolved to keep up.",
            },
            {
              kind: "check",
              prompt: "Across expansion slots, the historical trend the manual shows is…",
              options: [
                "from fast serial back to slow 16-bit buses",
                "from older/slower (ISA) toward newer/faster (PCI → PCIe)",
                "no change over time",
                "from digital back to analog",
              ],
              answer: 1,
              praise: "Older-slower to newer-faster — ISA to PCI to PCIe.",
            },
          ],
        },
      ],
    },

    // ── Review ───────────────────────────────────────────────────────
    {
      id: "mec-u6-review",
      title: "Unit 6 quick review",
      unit: 6,
      weight: "light",
      kind: "review",
      review: {
        topicIds: ["mec-scanner", "mec-scanner-comm", "mec-monitor", "mec-motherboard", "mec-mb-slots"],
        count: 5,
      },
      deps: ["mec-mb-slots"],
      whyItMatters:
        "Five fresh questions over this unit's heaviest ideas — the rung that makes the climb permanent.",
      recap: [],
      steps: [],
    },
  ],
};
