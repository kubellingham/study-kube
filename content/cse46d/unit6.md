<!-- Slide number: 1 -->
# MEMORY HIERARCHY
A memory unit is the collection of storage units or devices 	together. The memory unit stores the binary information in 	the form of bits.
Generally, memory/storage is classified into 2 categories:

Volatile	Memory:	This	loses	its	data,	when	power	is switched off.

Non-Volatile	Memory:	This	is	a	permanent	storage	and does not lose any data when power is switched off.

<!-- Slide number: 2 -->

![](object3.jpg)

![](object4.jpg)

![](object8.jpg)

Speed & cost
Size

<!-- Slide number: 3 -->
The total memory capacity of a computer can be visualized by hierarchy of components.

The memory hierarchy system consists of all storage devices contained in a computer system from the slow Auxiliary Memory to fast Main Memory and to smaller Cache memory.

Auxillary memory access time is generally 1000 times that of the main memory, hence it is at the bottom of the hierarchy.

The main memory occupies the central position because it is equipped to communicate directly with the CPU and with auxiliary memory devices through Input/output processor (I/O).

<!-- Slide number: 4 -->
When the program not residing in main memory is needed by 	the CPU, they are brought in from auxiliary memory.
Programs not currently needed in main memory are transferred 	into auxiliary memory to provide space in main memory for 	other programs that are currently in use.

The cache memory is used to store program data which is 	currently being executed in the CPU.

<!-- Slide number: 5 -->

![](object2.jpg)

<!-- Slide number: 6 -->
# Memory Access Methods
To access data from any memory, first it must be located and then the data is read from the memory location.

Random Access: Main memories are random access memories, in which each memory location has a unique address. Using this unique address any memory location can be reached in the same amount of time in any order.

Sequential Access: This methods allows memory access in a sequence or in order.

Direct Access: In this mode, information is stored in tracks, with
each track having a separate read/write head.

<!-- Slide number: 7 -->
# Auxiliary Memory(secondary)
This term refers to any addressable storage that is not within the system memory (RAM).

It is Non volatile memory that provide backup storage where programs and data kept for long-term storage or when not in immediate use.

For example: Magnetic disks and tapes are commonly used auxiliary devices.

It is not directly accessible to the CPU, and is accessed using the Input/output channels.

<!-- Slide number: 8 -->
Auxiliary storage, secondary storage, or external storage are 	devices that store noncritical system data like documents, 	multimedia and programs, which are used whenever they are 	required.

These files are invoked from the auxiliary storage when needed 	and then transferred to the primary storage so that the CPU can 	process them.

The results of the process can also be sent back to the auxiliary 	storage for later retrieval.

<!-- Slide number: 9 -->
# Important Terms:
Access Time: average time required to reach a storage location 	in memory and obtain the contents.
Seek Time: time required to position the read write head.
Transfer Time: time required to transfer data to or from device.

<!-- Slide number: 10 -->
# Common Types
Magnetic Tape

![](object6.jpg)

![](object5.jpg)

<!-- Slide number: 11 -->
Magnetic Disc

![](object4.jpg)

![](object3.jpg)

<!-- Slide number: 12 -->
# Main Memory
The memory unit that communicates directly within the CPU, 	Auxillary memory and Cache memory, is called main memory.

It is the central storage unit of the computer system. It is a large 	and fast memory used to store data during computer operations.
⚫
The main memory in a computer is called Random Access 	Memory.

This is the part of the computer that stores operating system 	software, software applications and other information for the 	central processing unit (CPU) to have fast and direct access when 	needed to perform tasks.

<!-- Slide number: 13 -->
RAM
Static RAM
Dynamic RAM
Volatile in nature

ROM
Bootstrap Loader
Non-Volatile in nature

<!-- Slide number: 14 -->
|  | RAM | ROM |
| --- | --- | --- |
| Definition | a form of data storage that can be accessed randomly at any time, in any order and from any physical location. It is called "random access" because the CPU can go directly to any section of main memory, and does not have go about the process in a sequential order. | ROM is also a form of data storage that can not be easily altered or reprogrammed. Stores instructions that are not necessary for re-booting up to make the computer operate when it is switched off. |
| Volatility | RAM is volatile i.e. its contents are lost when the device is powered off. | It is non-volatile i.e. its contents are retained even when the device is powered off. |
| Stands for | Random access memory | Read only memory |
| Use | RAM allows the computer to read data quickly to run applications. It allows reading and writing | ROM stores the program required to initially boot the computer. It only allows reading. |
| Accessibility | It is possible to both read data from memory and write data into memory. It is used for temporary data storage. | Only reading of data from memory is possible. It is used for permanent data storage. |

<!-- Slide number: 15 -->

![](object2.jpg)

<!-- Slide number: 16 -->
# RAM chip
RD	and	WR	lines	refer	to	read	and	write	lines	for 	reading/writing data to/from this memory(RAM).

bidirectional 8-bit data bus that allow the transfer of data 	from memory to CPU or vice versa.

![](object4.jpg)

<!-- Slide number: 17 -->
The configuration 128 x 8 signifies that the current memory 	element is capable of storing about 128 words with each 	word consisting of 8-bits.

To  access  the  data  stored  in  this  memory  a  7-bit 	unidirectional address bus is required.

chip select(CS) lines are control inputs which are used for 	enabling the chip only when it is selected by the processor.

<!-- Slide number: 18 -->

![](object2.jpg)

<!-- Slide number: 19 -->
# ROM Chip
ROM can only read, the data bus can only be in an output 	mode.

No need of read and write control.

![](object4.jpg)

<!-- Slide number: 20 -->
For the same size chip, it is possible to have more bits of 	ROM than of RAM, because the internal binary cell in 	ROM occupy less space than in RAM

For this reason, the diagram specifies a 512 bytes ROM, 	while the RAM has only 128 bytes.

The 9 address lines in the ROM chip specify any one of 	the 512 bytes stored in it.

<!-- Slide number: 21 -->
# Cache Memory
The data or contents of the main memory that are used again and 	again by CPU, are stored in the cache memory so that we can 	easily access that data in shorter time.

Whenever the CPU needs to access memory, it first checks the 	cache memory.

If the data is not found in cache memory then the CPU moves 	onto the main memory. It also transfers block of recent data into 	the cache and keeps on deleting the old data in cache to 	accommodate the new one.

<!-- Slide number: 22 -->

![Cache Memory](Picture2.jpg)

<!-- Slide number: 23 -->
# Hit Ratio
The performance of cache memory is measured in terms of a 	quantity called hit ratio. When the CPU refers to memory 	and finds the word in cache it is said to produce a hit. If the 	word is not found in cache, it is in main memory then it 	counts as a miss.

The ratio of the number of hits to the total CPU references 	to memory is called hit ratio.

Hit Ratio = Hit/(Hit + Miss)

<!-- Slide number: 24 -->
# Memory Mapping in Cache

<!-- Slide number: 25 -->
# Direct Mapping
Simplest mapping technique - each block of main 	memory maps to only one cache line
i.e. if a block is in cache, it must be in one specific place

The tag consists of the higher significant bits of the address and these bits are stored with the data in cache. The index consists of the lower significant b of the address.

<!-- Slide number: 26 -->

![Cache Memory](Picture2.jpg)

<!-- Slide number: 27 -->
Whenever the memory is referenced, the following sequence of events occurs
The index is first used to access a word in the cache.
The tag stored in the accessed word is read.
This tag is then compared with the tag in the address.
If two tags are same this indicates cache hit and required data is read from the cache word.
If the two tags are not same, this indicates a cache miss. Then the reference is made to the main memory to find it.

<!-- Slide number: 28 -->
# Fully Associative Mapping
A fully associative mapping scheme can overcome the problems of the direct mapping scheme
A main memory block can load into any line of cache
In fully associative type of cache memory, each location in cache stores both memory address as well as data.
But Cache searching gets expensive!
Ideally need circuitry that can simultaneously examine all tags for a match
Lots of circuitry needed, high cost
Need replacement policies now that anything can get thrown out of the cache (will look at this shortly)

<!-- Slide number: 29 -->

![Cache Memory](Picture2.jpg)

<!-- Slide number: 30 -->
# Set Associative Mapping
Compromise between fully-associative and direct-mapped cache
Cache is divided into a number of sets
Each set contains a number of lines
A given block maps to any line in a specific set
Use direct-mapping to determine which set in the cache corresponds to a set in
memory
Memory block could then be in any line of that set
e.g. 2 lines per set
2 way associative mapping
A given block can be in either of 2 lines in a specific set
e.g. K lines per set
K way associative mapping
A given block can be in one of K lines in a specific set
Much easier to simultaneously search one set than all lines

<!-- Slide number: 31 -->

![Cache Memory](Picture2.jpg)

<!-- Slide number: 32 -->
In this type of cache, the following steps are used to access the data from a cache:
The index of the address from the processor is used to access the set.
Then the comparators are used to compare all tags of the selected set with the incoming tag.
If a match is found, the corresponding location is accessed.
If no match is found, an access is made to the main memory.

<!-- Slide number: 33 -->
# Associative Memory
It is also called content addressable memory (CAM)
A type of computer memory from which items may be 	retrieved by matching some part of their content, rather than 	by specifying their address (hence also called associative 	storage or Content-addressable memory (CAM).)
	Associative memory is much slower than RAM, and is rarely encountered in mainstream computer designs.

<!-- Slide number: 34 -->

![](Picture2.jpg)

<!-- Slide number: 35 -->
Argument Register: It contains words to be searched. It contains ‘n’ number of bits.
Match Register: It has m-bits, One bit corresponding to each word in the memory array. After the making process, the bits corresponding to matching words in match register are set to ‘1’.
Key Register: It provides a mask of choosing a particular field/key in argument register. It specifies which part of the argument word need to be compared with words in memory.
Associative Memory Array: It combines word in that are to be compared with the arguments word in parallel. It contains ‘m’ words with ‘n’ bit per word.

<!-- Slide number: 36 -->
# Virtual Memory
Virtual memory is used to give programmers the illusion that 	they have a very large memory even though the computer has 	a small main memory. It makes the task of programming 	easier because the programmer no longer needs to worry 	about the amount of physical memory available.

<!-- Slide number: 37 -->
.
Why is Virtual Memory Used?

To run large applications that exceed physical RAM.
To allow multiprogramming (multiple programs running at once).
To provide memory protection and isolation between processes.
To simplify memory management for programmers

<!-- Slide number: 38 -->
# How It Works:
The OS divides memory into pages (fixed-size blocks, e.g., 4KB).
It keeps some pages in RAM and others on the hard disk (called swap space or page file).
When a program accesses a page not in RAM, a page fault occurs.
The OS loads the required page from the disk to RAM.

<!-- Slide number: 39 -->

![](Picture17.jpg)
