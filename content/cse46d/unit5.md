<!-- Slide number: 1 -->
UNIT-5
INPUT-OUTPUT ORGANIZATION

<!-- Slide number: 2 -->
# Topics
Peripheral Devices
Input-Output Interface
Asynchronous Data Transfer
Modes of Transfer
Direct Memory Access
Input-Output Processor

<!-- Slide number: 3 -->
# Peripheral Devices-Input and Output devices attached
to Computer
Input Devices
Keyboard
Optical input devices
Card Reader
Bar code reader
Digitizer
Optical Mark Reader
Magnetic Input Devices
Magnetic Stripe Reader
Screen Input Devices
- Touch Screen
Light Pen
Mouse
Analog Input Devices
Output Devices
Card Puncher, Paper Tape Puncher
CRT
Printer (Impact, Ink Jet,
- Laser, Dot Matrix)
Plotter
Analog
Voice
The devices that are under the direct control of the computer are said to be connected
online.

<!-- Slide number: 4 -->
# Peripheral devices
A  computer  peripheral  is  a  device  that  is 	connected to a computer but is not part of the core 	computer architecture.

A peripheral device is any auxiliary device that 	connects to and works with the computer to either 	put information into it or get information out of it.

<!-- Slide number: 5 -->
# Types of Peripheral Devices
Input  devices::  an  input  device  sends  data  or 	instructions to the computer, such as a mouse and 	a keyboard.

Output devices, an output device provides output 	from the computer such as a monitor and a printer.

Storage devices, such as  a hard  drive  or  flash 	drive

<!-- Slide number: 6 -->
1.  Mouse::   The   mouse,   sometimes   called a pointer, is a hand-operated input device used to manipulate objects on a computer screen.

Whether  the  mouse  uses  a  laser  or  ball,  or  is 	wired or wireless, a movement detected from the 	mouse sends instructions to the computer to move 	the  cursor  on  the  screen  in  order  to  interact 	with files, windows, and other software elements.

<!-- Slide number: 7 -->
2.	Keyboard::	The of	computer
keyboard
is		the	piece to	input		text,
hardware
used
characters,	and	other	commands	into	a computer or similar device.
Even    though    the    keyboard    is    an 	external peripheral device in a desktop system or 	is "virtual" in a tablet PC, it is an essential part 	of the complete computer system.

<!-- Slide number: 8 -->
# 3.  Printer:: A printer is a device that accepts text and  graphic  output  from  a  computer  and transfers the information to paper, usually to standard size sheets of paper.
Personal	computer	printers	can	be	distinguished as impact or non-impact printers.

<!-- Slide number: 9 -->
4.  Monitor:: it is an output device which displays information  in  pictorial  form.  A  monitor usually comprises the display device.

The  monitor  displays  the  computer's  user 	interface and open programs, allowing the user to 	interact  with  the  computer,  typically  using 	the keyboard and mouse.

Older  computer  monitors  were  built  using 	cathode ray tubes (CRTs) but modern monitors 	are built using LCD technology.

<!-- Slide number: 10 -->
5.  Hard drive:: A hard disk drive is a non- volatile   memory   hardware   device   that permanently  stores  and  retrieves  data  on  a computer.

It is a secondary storage device that consists of 	one  or  more  platters  to  which  data  is  written 	using a magnetic head.

Internal hard disks reside in a drive bay, connect 	to  the  motherboard  using  an  ATA,  SCSI, 	or SATA cable,

<!-- Slide number: 11 -->
# Input - Output Interface
Input Output Interface provides a method for transferring 	information between internal storage and external I/O 	devices.

WHY ?
To resolves the differences	between the computer and peripheral devices.

<!-- Slide number: 12 -->
- Peripherals - Electromechanical and electromagnetic Devices
CPU or Memory - Electronic Device CONVERSION OF SIGNAL VALUE REQUIRED

- Data Transfer Rate
Peripherals - Usually slower
CPU or Memory - Usually faster than peripherals
SOME KINDS OF SYNCHRONIZATION MECHANISM MAY BE NEEDED

- Unit of Information
Peripherals - Byte
CPU or Memory - Word

- Operating Modes
Peripherals - Autonomous, Asynchronous
CPU or Memory - Synchronous

<!-- Slide number: 13 -->
To Resolve these differences, computer systems include 	special hardware components between the CPU and 	Peripherals to supervises and synchronizes all input and out 	transfers
	These components are called Interface Units because they interface between the processor bus and the peripheral devices
The main function of INPUT OUTPUT INTERFACE is:
Data conversion
Synchronization
Device Selection

<!-- Slide number: 14 -->
# I/O	BUS	AND	INTERFACE	MODULES

![](object3.jpg)
INTERFACE
Decodes the device address (device code)
Decodes the commands (operation)
Provides signals for the peripheral controller
Synchronizes the data flow and supervises
the transfer rate between peripheral and CPU or Memory

<!-- Slide number: 15 -->
# I/O BUS and Interface Module
It defines the typical link between the processor and several 	peripherals.

The I/O Bus consists of data lines, address lines and control 	lines.

The I/O bus from the processor is attached to all peripherals 	interface.

To communicate with a particular device, the processor 	places a device address on address lines.

<!-- Slide number: 16 -->
The control lines are referred as I/O command.The commands are as
following:
Control command- A control command is issued to activate the peripheral and to inform it what to do.
Status command- A status command is used to test various status conditions
in the interface and the peripheral.
Data Output command- A data output command causes the interface to respond by transferring data from the bus into one of its registers.
Data Input command- The data input command is the opposite of the data
output.

<!-- Slide number: 17 -->
# I/O Versus Memory Bus
To communicate with I/O, the processor must communicate with the memory unit.
Like	the	I/O	bus,	the	memory	bus	contains	data, address	and read/write control lines.
There are 3 ways that computer buses can be used to communicate
with memory and I/O:

Use two Separate buses , one for memory and other for I/O.
Use one common bus for both memory and I/O but separate control lines for each.
Use	one	common	bus	for	memory	and	I/O	with	common control lines.

<!-- Slide number: 18 -->
# Asynchronous Data Transfer
This Scheme is used when speed of I/O devices do not match 	with microprocessor, and timing characteristics of I/O devices 	is not predictable.

In this method, process initiates the device and check its status.

As a result, CPU has to wait till I/O device is ready to transfer 	data. When device is ready CPU issues instruction for I/O 	transfer.

In this method two types of techniques are used based on signals 	before data transfer.

<!-- Slide number: 19 -->
# Strobe Signal
The strobe control method of Asynchronous data transfer 	employs a single control line to time each transfer.

The strobe may be activated by either the source or the 	destination unit.

Data bus carries the binary information from source to 	destination unit. Typically, the bus has multiple lines to 	transfer an entire byte or word.

It informs the destination unit when a valid data word is 	available in the bus.

<!-- Slide number: 20 -->
source unit first places the data on the data bus.

After a brief delay to ensure that the data settle to steady value, 	the source activates the strobe value.

The information on data bus and strobe signal remain in the 	active state for sufficient time period to allow the destination 	unit to receive the data.

![](object3.jpg)

<!-- Slide number: 21 -->
Source remove the data from the bus a brief period after 	it disable its strobe pulse.

Source	does	not	have	to	change	the	information	in	the 	data bus.

Strobe signal is disabled indicates that the data bus does 	not contain valid data.

New valid data will be available only after the strobe is 	enabled again.

<!-- Slide number: 22 -->
Data Transfer Initiated by Destination Unit:

In this method, the destination unit activates the strobe 	pulse, to informing the source to provide the data.

The source will respond by placing the requested binary 	information on the data bus.

![](object3.jpg)

<!-- Slide number: 23 -->
# Disadvantage of Strobe Signal :
source unit initiates the transfer has no way of knowing 	whether the destination unit has actually received the 	data item that was places in the bus.
Similarly, a destination unit that initiates the transfer has 	no way of knowing whether the source unit has actually 	placed the data on bus. The Handshaking method solves 	this problem.

<!-- Slide number: 24 -->
# Handshaking
Second control signal that provides a reply to the unit that 	initiates the transfer.

Principle of Handshaking:
One control line is in the same direction as the data flows in 	the bus from the source to destination. It is used by source 	unit to inform the destination unit whether there a valid data 	in the bus.

The other control line is in the other direction from the 	destination to the source. It is used by the destination unit to 	inform the source whether it can accept the data.

<!-- Slide number: 25 -->
# Source Initiated Transfer using Handshaking:
The source unit initiates the transfer by placing the data on the bus and enabling its data valid signal.

The data accepted signal is activated by the destination unit after it accepts the data from the bus.

The source unit then disables its data accepted signal and
the system goes into its initial state.

<!-- Slide number: 26 -->

![](object2.jpg)

<!-- Slide number: 27 -->
# Destination Initiated Transfer Using Handshaking:
The name of the signal generated by the destination unit has 	been changed to ready for data to reflects its new meaning.
The source unit in this case does not place data on the bus 	until after it receives the ready for data signal from the 	destination unit.

![](object4.jpg)

<!-- Slide number: 28 -->
# Modes of Transfer
The data transfer can be handled by various modes. some 	of the modes use CPU as an intermediate path, others 	transfer the data directly to and from the memory unit 	and this can be handled by 3 following ways:

Programmed I/O
Interrupt-Initiated I/O
Direct Memory Access (DMA)

<!-- Slide number: 29 -->
# Programmed I/O
In this mode of data transfer the I/O device does not have direct access to memory.
Normally the transfer is from a CPU register to peripheral device or vice-versa.
Once the data is initiated the CPU starts monitoring the interface to see when next transfer can made.The instructions of the program keep close tabs on everything that takes place in the interface unit and the I/O devices.

<!-- Slide number: 30 -->

![](object2.jpg)

<!-- Slide number: 31 -->

![](Picture2.jpg)
Figure: Flow-chart for CPU Program to input data

<!-- Slide number: 32 -->
The transfer requires three instructions:
Read the status register
Check the status of the flag bit and branch to step 1 if not set or to step 3 if set.
Read the data register.

<!-- Slide number: 33 -->
# Drawback of the Programmed I/O
The main drawback of the Program Initiated I/O was that the CPU has to monitor the units all the times when the program is executing.Thus the CPU stays in a program loop until the I/O unit indicates that it is ready for data transfer. This is a time consuming process and the CPU time is wasted a lot in keeping an eye to the executing of program.
To remove this problem an Interrupt facility and special commands are used.

<!-- Slide number: 34 -->
# Interrupt-Initiated I/O
In this method an interrupt facility an interrupt command is 	used to inform the device about the start and end of transfer.

<!-- Slide number: 35 -->
When the CPU receives such an signal, it temporarily stops the execution of the program and branches to a service program to process the I/O transfer and after completing it returns back	to task, what it was originally performing.
In this type of IO, computer does not check the flag. It continue to perform its task.
Whenever any device wants the attention, it sends the interrupt
signal to the CPU.

![](object2.jpg)
CPU then deviates from what it was doing, store the return address
◾

![](object5.jpg)
from PC and branch to the address of the subroutine.

<!-- Slide number: 36 -->
# Priority Interrupt:
There are number of IO devices attached to the computer.
They are all capable of generating the interrupt.
When the interrupt is generated from more than one 	device, priority interrupt system is used to determine 	which device is to be serviced first.
	Devices with high speed transfer are given higher priority and slow devices are given lower priority.
Establishing the priority can be done in two ways:
Using Software
Using Hardware

![](object3.jpg)

![](object4.jpg)

<!-- Slide number: 37 -->
# Daisy Chaining Priority
Device with highest priority is placed first.
Device that wants the attention send the interrupt request to the
CPU.
	CPU then sends the INTACK signal which is applied to PI(priority in) of the first device.
If it had requested the attention, it place its VAD(vector address) on the bus. And it block the signal by placing 0 in PO(priority out)
	If not it pass the signal to next device through PO(priority out) by placing 1.
This process is continued until appropriate device is found.
The device whose PI is 1 and PO is 0 is the device that send the interrupt request.

<!-- Slide number: 38 -->

![](object2.jpg)

<!-- Slide number: 39 -->
# Direct Memory Access (DMA)
direct memory access (dma) is a feature of 	computerized systems that allows certain peripheral devices 	to access main system memory independently of the central 	processing unit (cpu).
I/O devices are connected to system bus via a special
interference circuit known as “DMA Controller”.
In DMA, both CPU and DMA controller have access to main 	memory via a shared system bus having data, address and 	control lines.
	A DMA controller temporarily borrows the address bus, data bus, and control bus from the microprocessor and transfers the data bytes directly between an I/O port and a series of memory locations.

<!-- Slide number: 40 -->
# DMA Controller

![](object3.jpg)

<!-- Slide number: 41 -->
#

![](Picture4.jpg)

![](Picture6.jpg)

<!-- Slide number: 42 -->
#

![](Picture4.jpg)

<!-- Slide number: 43 -->
#

![](Picture4.jpg)

<!-- Slide number: 44 -->
#

![](Picture4.jpg)

<!-- Slide number: 45 -->
#

![](Picture4.jpg)

<!-- Slide number: 46 -->
#

![](Picture4.jpg)

<!-- Slide number: 47 -->
# Input-Output Processor (IOP)

![](Picture4.jpg)

![Input Output Processor (IOP)](Picture10.jpg)

<!-- Slide number: 48 -->
#

![](Picture4.jpg)

<!-- Slide number: 49 -->
#

![](Picture4.jpg)

<!-- Slide number: 50 -->
#

![](Picture4.jpg)

<!-- Slide number: 51 -->
