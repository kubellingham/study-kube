___PPT12
___PPT10
Click to edit Master title style
Click to edit Master text styles
Second level
Third level
Fourth level
Fifth level
___PPT9
© LPU :: CSE101 C Programming :: Dr. Lovi Raj Gupta
___PPT9
___PPT9
*
___PPT9
___PPT9
___PPT10
1_Office Theme
___PPT9
___PPT9
Click to edit Master title style
Click to edit Master text styles
Second level
Third level
Fourth level
Fifth level
___PPT9
*
___PPT9
___PPT9
*
___PPT10
2_Office Theme
___PPT9
___PPT9
Click to edit Master title style
Click to edit Master text styles
Second level
Third level
Fourth level
Fifth level
___PPT9
*
___PPT9
___PPT9
*
___PPT10
3_Office Theme
___PPT9
___PPT9
Click to edit Master title style
Click to edit Master text styles
Second level
Third level
Fourth level
Fifth level
___PPT9
*
___PPT9
___PPT9
*
___PPT10
4_Office Theme
___PPT9
___PPT9
Click to edit Master title style
Click to edit Master text styles
Second level
Third level
Fourth level
Fifth level
___PPT9
*
___PPT9
___PPT9
*
___PPT10
5_Office Theme
___PPT9
___PPT9
Click to edit Master title style
Click to edit Master text styles
Second level
Third level
Fourth level
Fifth level
___PPT9
*
___PPT9
___PPT9
*
___PPT10
6_Office Theme
___PPT9
___PPT9
Click to edit Master title style
Click to edit Master text styles
Second level
Third level
Fourth level
Fifth level
___PPT9
*
___PPT9
___PPT9
*
___PPT10
7_Office Theme
___PPT9
___PPT9
Click to edit Master title style
Click to edit Master text styles
Second level
Third level
Fourth level
Fifth level
___PPT9
*
___PPT9
___PPT9
*
___PPT10
8_Office Theme
___PPT9
___PPT9
Click to edit Master title style
Click to edit Master text styles
Second level
Third level
Fourth level
Fifth level
___PPT9
*
___PPT9
___PPT9
*
___PPT10
9_Office Theme
___PPT9
___PPT9
Click to edit Master title style
Click to edit Master text styles
Second level
Third level
Fourth level
Fifth level
___PPT9
*
___PPT9
___PPT9
*
___PPT10
10_Office Theme
___PPT9
___PPT9
___PPT9
___PPT9
Click to edit Master title style
Click to edit Master text styles
Second level
Third level
Fourth level
Fifth level
___PPT10
11_Office Theme
___PPT9
___PPT9
___PPT9
Click to edit Master title style
Click to edit Master text styles
Second level
Third level
Fourth level
Fifth level
___PPT10
12_Office Theme
___PPT9
___PPT9
*
Click to edit Master text styles
Second level
Third level
Fourth level
Fifth level
___PPT9
___PPT9
*
___PPT10
___PPT9
CSE-46DCOMPUTER Architecture
___PPT9
Lecture #4
___PPT10
Course details
___PPT9
Course Code- CSE 46D
Course Title- Computer Architecture
LTP - 3 0 0 [Three lectures/week]
Credits: 3
___PPT10
Data Transfer and Manipulation
___PPT9
Most computer instructions can be classified into three categories:
Data Transfer
Data Manipulation
Program Control
___PPT10
Data transfer instructions move data from one place in the computer to another without changing the data content.
 The most common transfers are between memory and processor registers, between processor registers and input or output, and between the processor registers themselves.
___PPT10
___PPT10
Data Manipulation Instuction
___PPT9
Data Manipulation instruction perform operations on data and provide the computational capabilities for computer.
It is divided into three basic types:
Arithmetic instructions 
 Logical and bit manipulation instructions 
 Shift instructions
___PPT10
ARITHMATIC INSTRUCTIONS
___PPT9
The four basic arithmetic operations are addition, subtraction, multiplication, and division. Most computers provide instructions for all four operations.
___PPT10
Logical and Bit Manipulation Instructions
___PPT9
Logical instructions perform binary operations on strings of bits stored in registers.
___PPT10
Shift Instructions
Shifts are operations in which the bits of a word are moved to the left or right.
___PPT10
___PPT10
Major CPU Components
The CPU (Central Processing Unit) is 
responsible for executing instructions 
and consists of several key components:
___PPT10
___PPT10
___PPT10
___PPT10
___PPT10
___PPT10
Register Set with Common ALU in Computer Architecture
___PPT9
In a computer architecture with a common ALU, the register set plays a crucial role in storing temporary data and operands for processing.
 The ALU (Arithmetic Logic Unit) performs 
computations and logical operations 
using these registers.
___PPT10
Register Set in a CPU
___PPT10
___PPT10
ALU (Arithmetic Logic Unit) with Common Bus System
___PPT10
___PPT10
Working of Register Set with ALU
___PPT10
Bus System in Register Set with Common ALU
___PPT10
___PPT10
Control Word
In a CPU, execution of an instruction involves multiple micro-operations such as fetching, decoding, executing, and writing back results. Each of these steps is controlled by a set of control signals that are encoded into a control word.
___PPT10
___PPT10
___PPT10
The table represents a control word format with various fields:
___PPT9
Field
___PPT9
Value
___PPT9
Description
___PPT9
Opcode
___PPT9
0010 (ADD)
___PPT9
Specifies the operation type (Addition)
___PPT9
Src1 (R2)
___PPT9
0001 (R2)
___PPT9
First source register (R2)
___PPT9
Src2 (R3)
___PPT9
0010 (R3)
___PPT9
Second source register (R3)
___PPT9
Dest (R1)
___PPT9
0000 (R1)
___PPT9
Destination register (R1), where the result is stored
___PPT9
ALU Control
___PPT9
010 (Enable ALU)
___PPT9
Enables the ALU for addition operation
___PPT9
Flags
___PPT9
1 (Update Flags)
___PPT9
Indicates that flags (Zero, Carry, Overflow, etc.) should be updated
:
___PPT10
___PPT9
The Opcode is a unique binary code that represents the operation type (e.g., ADD, SUB, MUL).
0010 represent the add instruction.
1010 represent the subtract instruction.
1010 represent the multiply instruction.
___PPT10
___PPT9
Each register can be uniquely identified using 4 bits                                Suppose:
0000 represents R1
0001 represents R2
0010 represents R3
In the given example:
Src1 (R2) = 0001 (Binary for R2)
Src2 (R3) = 0010 (Binary for R3)
Dest (R1) = 0000 (Binary for R1)
___PPT10
___PPT9
The ALU Control field tells the ALU what operation to perform.
A predefined binary code is assigned for each ALU operation.
Example:
000 → AND
001 → OR
010 → ADD
011 → SUB
100 → MUL
In this case, 010 is the control code for Addition.
___PPT10
___PPT9
The Flags field determines whether flags                               (Zero, Carry, Overflow) should be updated.
If 1, flags are updated; if 0, flags are ignored.
___PPT10
Stack Organization in Computer Architecture
A stack is a special type of data structure 
used in computer memory organization that 
follows the LIFO (Last In, First Out) principle. 
It is commonly used for function calls, 
expression evaluation, and memory management.
___PPT10
___PPT10
___PPT10
Reverse Polish Notation (RPN) & Stack Operations
___PPT10
___PPT10
___PPT10
___PPT10
___PPT10
Instruction Formats
___PPT10
___PPT10
___PPT10
Addressing Modes in Instruction Formats
___PPT10
___PPT10
___PPT10
___PPT10
___PPT10
___PPT10
Program Control in Computer Architecture
___PPT10
___PPT10
___PPT10
___PPT10
___PPT10
___PPT10
___PPT10
Program Control Flow Diagram
___PPT10
. Real-World Application of Program Control
___PPT10
Interrupts
___PPT10
___PPT10
___PPT10
___PPT10
___PPT10
___PPT9
___PPT10
___PPT9
___PPT9
___PPT10
*
___PPT10
